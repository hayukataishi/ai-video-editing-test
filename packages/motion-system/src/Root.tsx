import { Composition } from "remotion";

import {
  FlowDiagram,
  flowDiagramSchema,
  TitleCard,
  titleCardSchema,
} from "./components";

/** Registers the stable, publicly addressable Motion System compositions. */
export const RemotionRoot = () => {
  return (
    <>
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
    </>
  );
};
