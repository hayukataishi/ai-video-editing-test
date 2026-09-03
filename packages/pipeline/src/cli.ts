import {loadEpisode} from './episode';
import {createOfflinePalmierPlan, refuseLivePalmierSync} from './palmier-plan';
import {createQaPreview} from './qa';
import {renderEpisode} from './render';
import {validateEpisode} from './validate';

const readOption = (argumentsList: readonly string[], name: string): string | undefined => {
  const exact = argumentsList.find((argument) => argument.startsWith(`${name}=`));
  if (exact !== undefined) {
    return exact.slice(name.length + 1);
  }

  const index = argumentsList.indexOf(name);
  if (index >= 0) {
    return argumentsList[index + 1];
  }

  return undefined;
};

const requireEpisode = (argumentsList: readonly string[]): string => {
  const episode = readOption(argumentsList, '--episode');
  if (episode === undefined || episode.length === 0) {
    throw new Error('Pass an Episode directory: --episode shows/<show>/episodes/<episode>.');
  }
  return episode;
};

const requireValidEpisode = async (episodeArgument: string) => {
  const context = await loadEpisode(episodeArgument);
  const validation = await validateEpisode(context);
  if (!validation.valid) {
    console.error(JSON.stringify({status: 'invalid', issues: validation.issues}, null, 2));
    throw new Error(`Episode validation failed with ${validation.issues.length} issue(s).`);
  }
  return context;
};

const main = async (): Promise<void> => {
  const [command, ...argumentsList] = process.argv.slice(2);
  if (command === undefined) {
    throw new Error('Expected one of: validate, render, palmier:plan, palmier:sync, qa, build.');
  }

  const episodeArgument = requireEpisode(argumentsList);

  if (command === 'validate') {
    const context = await loadEpisode(episodeArgument);
    const validation = await validateEpisode(context);
    console.log(JSON.stringify({status: validation.valid ? 'valid' : 'invalid', issues: validation.issues}, null, 2));
    if (!validation.valid) {
      process.exitCode = 1;
    }
    return;
  }

  const context = await requireValidEpisode(episodeArgument);

  if (command === 'render') {
    console.log(JSON.stringify({status: 'rendered', results: await renderEpisode(context)}, null, 2));
    return;
  }

  if (command === 'palmier:plan') {
    console.log(JSON.stringify(createOfflinePalmierPlan(context), null, 2));
    return;
  }

  if (command === 'palmier:sync') {
    refuseLivePalmierSync();
  }

  if (command === 'qa') {
    console.log(JSON.stringify(await createQaPreview(context), null, 2));
    return;
  }

  if (command === 'build') {
    const rendered = await renderEpisode(context);
    const plan = createOfflinePalmierPlan(context);
    const qa = await createQaPreview(context);
    console.log(JSON.stringify({status: 'not-synced', rendered, plan, qa}, null, 2));
    throw new Error('build:episode stops before Palmier sync until a verified MCP adapter is implemented.');
  }

  throw new Error(`Unknown command: ${command}`);
};

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
