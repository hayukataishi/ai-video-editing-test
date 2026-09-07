import { Composition } from "remotion";

import {
  ProductionThumbnail,
  productionThumbnailSchema,
  productionThumbnailDefaultProps,
  SemanticExplainer,
  semanticExplainerDefaultProps,
  semanticExplainerSchema,
  FlowDiagram,
  ManualEditingBottleneck,
  manualEditingBottleneckDefaultProps,
  manualEditingBottleneckSchema,
  flowDiagramSchema,
  PaintedLowerThird,
  paintedLowerThirdSchema,
  PopShowTitle,
  popShowTitleDefaultProps,
  popShowTitleSchema,
  TitleCard,
  titleCardSchema,
  ToolRoleShowcase,
  toolRoleShowcaseDefaultProps,
  toolRoleShowcaseSchema,
  ThreeToolVideoWorkflow,
  threeToolVideoWorkflowDefaultProps,
  threeToolVideoWorkflowSchema,
  PalmierEditingWorkflow,
  palmierEditingWorkflowDefaultProps,
  palmierEditingWorkflowSchema,
  CaptionDiagramPlacement,
  captionDiagramPlacementDefaultProps,
  captionDiagramPlacementSchema,
} from "./components";
import { motionSystemTheme } from "./theme";

/** Registers the stable, publicly addressable Motion System compositions. */
export const RemotionRoot = () => {
  return (
    <>
      <Composition id="ProductionThumbnail" component={ProductionThumbnail} durationInFrames={1} fps={30} width={1920} height={1080} schema={productionThumbnailSchema} defaultProps={productionThumbnailDefaultProps} />
      <Composition id="SemanticExplainer" component={SemanticExplainer} durationInFrames={641} fps={30} width={1920} height={1080} schema={semanticExplainerSchema} defaultProps={semanticExplainerDefaultProps} />
      <Composition
        id="TitleCard"
        component={TitleCard}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={titleCardSchema}
        defaultProps={{
          title: "AI時代の動画制作基盤",
          subtitle: "Remotion + Palmier Pro + Codex",
          eyebrow: "MOTION DESIGN SYSTEM",
          variant: "hero",
          logoAssetId: "brand-logo",
          backgroundColor: "#071525",
          accentColor: "#6ee7f9",
          textColor: "#f8fafc",
        }}
      />
      <Composition
        id="FlowDiagram"
        component={FlowDiagram}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={flowDiagramSchema}
        defaultProps={{
          title: "動画制作パイプライン",
          nodes: [
            {
              id: "remotion",
              label: "Remotion",
              caption: "コンポーネントをレンダリング",
              tone: "accent",
            },
            {
              id: "codex",
              label: "Codex",
              caption: "全体を制御し差分同期",
              tone: "neutral",
            },
            {
              id: "palmier",
              label: "Palmier Pro",
              caption: "編集・レイアウトを仕上げる",
              tone: "success",
            },
          ],
          variant: "three-stage",
          backgroundColor: "#071525",
          accentColor: "#6ee7f9",
          connectorColor: "#7dd3fc",
          textColor: "#f8fafc",
        }}
      />
      <Composition
        id="PaintedLowerThird"
        component={PaintedLowerThird}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={paintedLowerThirdSchema}
        defaultProps={{
          name: "山田 花子",
          role: "俳優",
          variant: "standard",
          anchor: "bottom-left",
          showOutro: true,
          colors: {
            mint: motionSystemTheme.colors.watercolorMint,
            peach: motionSystemTheme.colors.watercolorPeach,
            yellow: motionSystemTheme.colors.watercolorYellow,
            name: motionSystemTheme.colors.charcoal,
            nameOutline: motionSystemTheme.colors.paper,
            roleSurface: motionSystemTheme.colors.paper,
            roleText: motionSystemTheme.colors.charcoal,
          },
        }}
      />
      <Composition
        id="PopShowTitle"
        component={PopShowTitle}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        schema={popShowTitleSchema}
        defaultProps={popShowTitleDefaultProps}
      />
      <Composition
        id="ToolRoleShowcase"
        component={ToolRoleShowcase}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
        schema={toolRoleShowcaseSchema}
        defaultProps={toolRoleShowcaseDefaultProps}
      />
      <Composition
        id="ManualEditingBottleneck"
        component={ManualEditingBottleneck}
        durationInFrames={202}
        fps={30}
        width={1920}
        height={1080}
        schema={manualEditingBottleneckSchema}
        defaultProps={manualEditingBottleneckDefaultProps}
      />
      <Composition
        id="ThreeToolVideoWorkflow"
        component={ThreeToolVideoWorkflow}
        durationInFrames={226}
        fps={30}
        width={1920}
        height={1080}
        schema={threeToolVideoWorkflowSchema}
        defaultProps={threeToolVideoWorkflowDefaultProps}
      />
      <Composition
        id="PalmierEditingWorkflow"
        component={PalmierEditingWorkflow}
        durationInFrames={359}
        fps={30}
        width={1920}
        height={1080}
        schema={palmierEditingWorkflowSchema}
        defaultProps={palmierEditingWorkflowDefaultProps}
      />
      <Composition
        id="CaptionDiagramPlacement"
        component={CaptionDiagramPlacement}
        durationInFrames={433}
        fps={30}
        width={1920}
        height={1080}
        schema={captionDiagramPlacementSchema}
        defaultProps={captionDiagramPlacementDefaultProps}
      />
    </>
  );
};
