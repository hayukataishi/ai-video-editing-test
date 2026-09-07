import { registerRoot } from "remotion";

import {
  semanticExplainerDefaultProps,
  semanticExplainerSchema,
  flowDiagramDefaultProps,
  flowDiagramSchema,
  manualEditingBottleneckDefaultProps,
  manualEditingBottleneckSchema,
  paintedLowerThirdDefaultProps,
  paintedLowerThirdSchema,
  popShowTitleDefaultProps,
  popShowTitleSchema,
  toolRoleShowcaseDefaultProps,
  toolRoleShowcaseSchema,
  threeToolVideoWorkflowDefaultProps,
  threeToolVideoWorkflowSchema,
  palmierEditingWorkflowDefaultProps,
  palmierEditingWorkflowSchema,
  captionDiagramPlacementDefaultProps,
  captionDiagramPlacementSchema,
  titleCardDefaultProps,
  titleCardSchema,
} from "./components";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);

/** Stable Composition IDs consumed by content manifests and the render pipeline. */
export const compositionRegistry = {
  SemanticExplainer: {
    compositionId: "SemanticExplainer",
    kind: "video",
    schema: semanticExplainerSchema,
    defaultProps: semanticExplainerDefaultProps,
    defaultDurationInFrames: 641,
    fps: 30,
    width: 1920,
    height: 1080,
  },
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
  PopShowTitle: {
    compositionId: "PopShowTitle",
    kind: "video",
    schema: popShowTitleSchema,
    defaultProps: popShowTitleDefaultProps,
    defaultDurationInFrames: 300,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  ToolRoleShowcase: {
    compositionId: "ToolRoleShowcase",
    kind: "video",
    schema: toolRoleShowcaseSchema,
    defaultProps: toolRoleShowcaseDefaultProps,
    defaultDurationInFrames: 360,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  ManualEditingBottleneck: {
    compositionId: "ManualEditingBottleneck",
    kind: "video",
    schema: manualEditingBottleneckSchema,
    defaultProps: manualEditingBottleneckDefaultProps,
    defaultDurationInFrames: 202,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  ThreeToolVideoWorkflow: {
    compositionId: "ThreeToolVideoWorkflow",
    kind: "video",
    schema: threeToolVideoWorkflowSchema,
    defaultProps: threeToolVideoWorkflowDefaultProps,
    defaultDurationInFrames: 226,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  PalmierEditingWorkflow: {
    compositionId: "PalmierEditingWorkflow",
    kind: "video",
    schema: palmierEditingWorkflowSchema,
    defaultProps: palmierEditingWorkflowDefaultProps,
    defaultDurationInFrames: 359,
    fps: 30,
    width: 1920,
    height: 1080,
  },
  CaptionDiagramPlacement: {
    compositionId: "CaptionDiagramPlacement",
    kind: "video",
    schema: captionDiagramPlacementSchema,
    defaultProps: captionDiagramPlacementDefaultProps,
    defaultDurationInFrames: 433,
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
