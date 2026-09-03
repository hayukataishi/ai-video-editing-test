import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import type {ContentManifest, EditManifest} from '@studio/manifest';
import {findWorkspaceRoot, resolveEpisodeDirectory} from './paths';

export type EpisodeContext = {
  readonly workspaceRoot: string;
  readonly episodeDirectory: string;
  readonly content: ContentManifest;
  readonly edit: EditManifest;
};

const readJson = async (filePath: string): Promise<unknown> => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not parse ${filePath}: ${message}`, {cause: error});
  }
};

export const loadEpisode = async (episodeArgument: string): Promise<EpisodeContext> => {
  const workspaceRoot = await findWorkspaceRoot(process.cwd());
  const episodeDirectory = resolveEpisodeDirectory(workspaceRoot, episodeArgument);
  const [content, edit] = await Promise.all([
    readJson(resolve(episodeDirectory, 'content.json')),
    readJson(resolve(episodeDirectory, 'edit.json')),
  ]);

  return {
    workspaceRoot,
    episodeDirectory,
    content: content as ContentManifest,
    edit: edit as EditManifest,
  };
};
