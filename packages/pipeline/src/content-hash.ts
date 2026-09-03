import {createHash} from 'node:crypto';
import {readdir, readFile} from 'node:fs/promises';
import {relative, resolve} from 'node:path';
import type {ContentItem, ContentManifest} from '@studio/manifest';
import {pathExists, resolveInside} from './paths';

const normalize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      const item = record[key];
      if (item !== undefined) {
        normalized[key] = normalize(item);
      }
    }
    return normalized;
  }

  return Object.is(value, -0) ? 0 : value;
};

export const stableStringify = (value: unknown): string => JSON.stringify(normalize(value));

const hashFile = async (filePath: string): Promise<string> =>
  createHash('sha256').update(await readFile(filePath)).digest('hex');

const motionSystemHashCache = new Map<string, Promise<string>>();

const hashMotionSystemSource = async (workspaceRoot: string): Promise<string> => {
  const cached = motionSystemHashCache.get(workspaceRoot);
  if (cached !== undefined) {
    return cached;
  }

  const task = (async (): Promise<string> => {
    const motionSystemDirectory = resolve(workspaceRoot, 'packages', 'motion-system');
    const digest = createHash('sha256');

    const appendDirectory = async (directory: string): Promise<void> => {
      const entries = await readdir(directory, {withFileTypes: true});
      for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
        const filePath = resolve(directory, entry.name);
        if (entry.isDirectory()) {
          await appendDirectory(filePath);
        } else if (entry.isFile()) {
          digest.update(relative(motionSystemDirectory, filePath));
          digest.update(await readFile(filePath));
        }
      }
    };

    for (const directoryName of ['src', 'public']) {
      const directory = resolve(motionSystemDirectory, directoryName);
      if (await pathExists(directory)) {
        await appendDirectory(directory);
      }
    }

    return digest.digest('hex');
  })();

  motionSystemHashCache.set(workspaceRoot, task);
  return task;
};

export const calculateContentHash = async ({
  content,
  item,
  episodeDirectory,
  workspaceRoot,
}: {
  readonly content: ContentManifest;
  readonly item: ContentItem;
  readonly episodeDirectory: string;
  readonly workspaceRoot: string;
}): Promise<string> => {
  const assetHashes: Record<string, string> = {};

  for (const assetId of item.dependencies ?? []) {
    const asset = content.assets?.[assetId];
    if (asset === undefined) {
      throw new Error(`Content item "${item.id}" references missing asset "${assetId}".`);
    }

    const assetPath = resolveInside(episodeDirectory, asset.path, workspaceRoot, `Asset "${assetId}"`);
    assetHashes[assetId] = asset.sha256 ?? (await hashFile(assetPath));
  }

  const normalizedInput = stableStringify({
    catalog: content.catalog,
    motionSystemSourceHash: await hashMotionSystemSource(workspaceRoot),
    themeId: content.themeId ?? null,
    compositionId: item.compositionId,
    variant: item.variant ?? null,
    durationFrames: item.durationFrames,
    props: item.props,
    render: item.render,
    assetHashes,
  });

  return createHash('sha256').update(normalizedInput).digest('hex');
};
