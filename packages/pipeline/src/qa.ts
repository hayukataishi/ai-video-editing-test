import type {EpisodeContext} from './episode';
import {pathExists, resolveInside} from './paths';

export type QaPreview = {
  readonly inspectionFrames: readonly number[];
  readonly expectedArtifacts: readonly {readonly id: string; readonly exists: boolean}[];
  readonly note: string;
};

export const createQaPreview = async (context: EpisodeContext): Promise<QaPreview> => ({
  inspectionFrames: context.edit.inspectionFrames ?? [],
  expectedArtifacts: await Promise.all(
    context.content.items.map(async (item) => ({
      id: item.id,
      exists: await pathExists(
        resolveInside(
          context.episodeDirectory,
          item.render.outputFile,
          context.episodeDirectory,
          `Render output for "${item.id}"`,
        ),
      ),
    })),
  ),
  note: 'Phase 1 QA confirms declared artifacts and inspection frames. Palmier frame inspection requires a connected adapter.',
});
