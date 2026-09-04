import { registerRoot } from "remotion";

import {
  flowDiagramDefaultProps,
  flowDiagramSchema,
  paintedLowerThirdDefaultProps,
  paintedLowerThirdSchema,
  titleCardDefaultProps,
  titleCardSchema,
} from "./components";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);

/** Stable Composition IDs consumed by content manifests and the render pipeline. */
export const compositionRegistry = {
  TitleCard: {
    compositionId: "TitleCard",
    kind: "video",
    schema: titleCardSchema,
    defaultProps: titleCardDefaultProps,
    defaultDurationInFrames: 150,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  FlowDiagram: {
    compositionId: "FlowDiagram",
    kind: "video",
    schema: flowDiagramSchema,
    defaultProps: flowDiagramDefaultProps,
    defaultDurationInFrames: 240,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  PaintedLowerThird: {
    compositionId: "PaintedLowerThird",
    kind: "video",
    schema: paintedLowerThirdSchema,
    defaultProps: paintedLowerThirdDefaultProps,
    defaultDurationInFrames: 150,
    fps: 30,
    width: 1920,
    height: 1080,
  },
} as const;

export type CompositionId = keyof typeof compositionRegistry;
export type CompositionDefinition =
  (typeof compositionRegistry)[CompositionId];

/** Returns `undefined` for unknown public Composition IDs. */
export const getCompositionDefinition = (
  compositionId: string,
): CompositionDefinition | undefined => {
  if (!Object.prototype.hasOwnProperty.call(compositionRegistry, compositionId)) {
    return undefined;
  }

  return compositionRegistry[compositionId as CompositionId];
};

export const isCompositionId = (value: string): value is CompositionId =>
  getCompositionDefinition(value) !== undefined;

export { RemotionRoot } from "./Root";
export * from "./components";
export * from "./theme";
