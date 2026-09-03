import type {EpisodeContext} from './episode';

export type OfflinePalmierPlan = {
  readonly status: 'offline-preview';
  readonly target: {
    readonly project: string;
    readonly timeline: string;
  };
  readonly managedTracks: readonly string[];
  readonly imports: readonly string[];
  readonly placementsToAdd: readonly string[];
  readonly warnings: readonly string[];
};

export const createOfflinePalmierPlan = (context: EpisodeContext): OfflinePalmierPlan => ({
  status: 'offline-preview',
  target: {
    project: context.edit.target.palmierProject,
    timeline: context.edit.target.timeline,
  },
  managedTracks: context.edit.tracks.filter((track) => track.managed).map((track) => track.palmierName),
  imports: context.content.items.map((item) => item.id),
  placementsToAdd: context.edit.placements
    .filter((placement) => context.edit.tracks.find((track) => track.id === placement.trackId)?.managed)
    .map((placement) => placement.id),
  warnings: [
    'Palmier MCP adapter is not configured in Phase 1. No Palmier project, media library, or timeline was read.',
    'This is a Manifest-derived preview only; it is not an executable sync plan.',
  ],
});

export const refuseLivePalmierSync = (): never => {
  throw new Error(
    'Palmier sync is intentionally disabled: implement and verify the Palmier MCP adapter, read the current timeline, and approve a dry-run before enabling writes.',
  );
};
