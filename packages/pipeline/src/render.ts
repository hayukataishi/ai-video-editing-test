import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {spawn} from 'node:child_process';
import type {ContentItem} from '@studio/manifest';
import {materializeRenderProps} from './asset-props';
import type {EpisodeContext} from './episode';
import {calculateContentHash} from './content-hash';
import {pathExists, resolveInside} from './paths';

type RenderState = {
  readonly version: 1;
  readonly content: Record<string, {readonly hash: string; readonly outputFile: string}>;
};

export type RenderResult = {
  readonly id: string;
  readonly hash: string;
  readonly outputFile: string;
  readonly action: 'rendered' | 'skipped';
};

const statePath = (episodeDirectory: string): string => resolve(episodeDirectory, 'state', 'palmier-sync.json');

const readState = async (episodeDirectory: string): Promise<RenderState> => {
  try {
    const parsed = JSON.parse(await readFile(statePath(episodeDirectory), 'utf8')) as Partial<RenderState>;
    if (parsed.version === 1 && parsed.content !== undefined) {
      return {version: 1, content: parsed.content};
    }
  } catch {
    // A missing or obsolete local state starts a fresh render cache.
  }

  return {version: 1, content: {}};
};

const writeState = async (episodeDirectory: string, state: RenderState): Promise<void> => {
  const filePath = statePath(episodeDirectory);
  await mkdir(dirname(filePath), {recursive: true});
  await writeFile(filePath, `${JSON.stringify(state, null, 2)}\n`);
};

const renderItem = async ({
  context,
  item,
  hash,
  outputFile,
}: {
  readonly context: EpisodeContext;
  readonly item: ContentItem;
  readonly hash: string;
  readonly outputFile: string;
}): Promise<void> => {
  const propsDirectory = resolve(context.episodeDirectory, 'state', 'props');
  await mkdir(propsDirectory, {recursive: true});
  const propsFile = resolve(propsDirectory, `${item.id}--${hash.slice(0, 12)}.json`);
  await writeFile(propsFile, `${JSON.stringify(await materializeRenderProps(context, item), null, 2)}\n`);
  await mkdir(dirname(outputFile), {recursive: true});

  const argumentsForRender = [
    'exec',
    'remotion',
    'render',
    'src/index.ts',
    item.compositionId,
    outputFile,
    `--props=${propsFile}`,
    `--codec=${item.render.codec}`,
    `--duration=${item.durationFrames}`,
    `--width=${context.content.video.width}`,
    `--height=${context.content.video.height}`,
    `--fps=${context.content.video.frameRate.numerator / context.content.video.frameRate.denominator}`,
  ];

  if (item.render.proresProfile !== undefined) {
    argumentsForRender.push(`--prores-profile=${item.render.proresProfile}`);
  }

  if (item.render.alpha || item.render.container === 'png-sequence') {
    argumentsForRender.push('--image-format=png');
  }

  if (item.render.pixelFormat !== undefined) {
    argumentsForRender.push(`--pixel-format=${item.render.pixelFormat}`);
  } else if (item.render.alpha && item.render.codec === 'prores') {
    // ProRes 4444 alone does not retain alpha when Remotion's default video
    // pixel format is used. Pair its PNG frame capture with an alpha-capable
    // output pixel format for the declared transparent asset.
    argumentsForRender.push('--pixel-format=yuva444p10le');
  }

  if (item.render.container === 'png-sequence') {
    argumentsForRender.push('--sequence');
  }

  if (item.render.audio === false) {
    argumentsForRender.push('--muted');
  }

  if (item.render.overwrite === false) {
    argumentsForRender.push('--overwrite=false');
  }

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn('pnpm', argumentsForRender, {
      cwd: resolve(context.workspaceRoot, 'packages', 'motion-system'),
      stdio: 'inherit',
    });
    child.once('error', rejectPromise);
    child.once('exit', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`Remotion render failed for "${item.id}" with exit code ${code ?? 'unknown'}.`));
      }
    });
  });
};

export const renderEpisode = async (context: EpisodeContext): Promise<readonly RenderResult[]> => {
  const state = await readState(context.episodeDirectory);
  const nextContent = {...state.content};
  const results: RenderResult[] = [];

  for (const item of context.content.items) {
    const hash = await calculateContentHash({
      content: context.content,
      item,
      episodeDirectory: context.episodeDirectory,
      workspaceRoot: context.workspaceRoot,
    });
    const outputFile = resolveInside(
      context.episodeDirectory,
      item.render.outputFile,
      context.episodeDirectory,
      `Render output for "${item.id}"`,
    );
    const previous = state.content[item.id];
    const unchanged = previous?.hash === hash && previous.outputFile === item.render.outputFile && (await pathExists(outputFile));

    if (unchanged) {
      results.push({id: item.id, hash, outputFile: item.render.outputFile, action: 'skipped'});
      continue;
    }

    await renderItem({context, item, hash, outputFile});
    nextContent[item.id] = {hash, outputFile: item.render.outputFile};
    results.push({id: item.id, hash, outputFile: item.render.outputFile, action: 'rendered'});
  }

  await writeState(context.episodeDirectory, {version: 1, content: nextContent});
  return results;
};
