import { zColor } from "@remotion/zod-types";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";

const FLOW_DIAGRAM_DEFAULTS = {
  variant: "three-stage",
  backgroundColor: motionSystemTheme.colors.ink,
  accentColor: motionSystemTheme.colors.accent,
  connectorColor: motionSystemTheme.colors.connector,
  textColor: motionSystemTheme.colors.paper,
} as const;

export const flowDiagramNodeSchema = z.object({
  id: z.string().trim().min(1).max(80).optional(),
  label: z.string().trim().min(1).max(80),
  caption: z.string().trim().max(150).optional(),
  tone: z.enum(["accent", "neutral", "success"]).default("accent"),
});

export const flowDiagramSchema = z.object({
  title: z.string().trim().min(1).max(120),
  nodes: z.array(flowDiagramNodeSchema).min(2).max(5),
  variant: z.enum(["three-stage", "compact"]).default(FLOW_DIAGRAM_DEFAULTS.variant),
  backgroundColor: zColor().default(FLOW_DIAGRAM_DEFAULTS.backgroundColor),
  accentColor: zColor().default(FLOW_DIAGRAM_DEFAULTS.accentColor),
  connectorColor: zColor().default(FLOW_DIAGRAM_DEFAULTS.connectorColor),
  textColor: zColor().default(FLOW_DIAGRAM_DEFAULTS.textColor),
});

export type FlowDiagramNode = z.output<typeof flowDiagramNodeSchema>;
export type FlowDiagramProps = z.output<typeof flowDiagramSchema>;

export const flowDiagramDefaultProps: FlowDiagramProps = {
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
  variant: FLOW_DIAGRAM_DEFAULTS.variant,
  backgroundColor: FLOW_DIAGRAM_DEFAULTS.backgroundColor,
  accentColor: FLOW_DIAGRAM_DEFAULTS.accentColor,
  connectorColor: FLOW_DIAGRAM_DEFAULTS.connectorColor,
  textColor: FLOW_DIAGRAM_DEFAULTS.textColor,
};

const toneColor = (
  tone: FlowDiagramNode["tone"],
  accentColor: string,
): string => {
  if (tone === "success") {
    return motionSystemTheme.colors.success;
  }

  if (tone === "neutral") {
    return motionSystemTheme.colors.muted;
  }

  return accentColor;
};

/**
 * A frame-driven explainer diagram. Node and connector timing uses only the
 * current frame, which keeps sequential reveals deterministic across renders.
 */
export const FlowDiagram = (props: FlowDiagramProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, height, width } = useVideoConfig();
  const {
    title,
    nodes,
    variant = FLOW_DIAGRAM_DEFAULTS.variant,
    backgroundColor = FLOW_DIAGRAM_DEFAULTS.backgroundColor,
    accentColor = FLOW_DIAGRAM_DEFAULTS.accentColor,
    connectorColor = FLOW_DIAGRAM_DEFAULTS.connectorColor,
    textColor = FLOW_DIAGRAM_DEFAULTS.textColor,
  } = props;

  const canvasScale = Math.min(width / 1920, height / 1080);
  const isCompact = variant === "compact";
  const horizontalPadding = Math.max(40, width * (isCompact ? 0.07 : 0.09));
  const availableWidth = width - horizontalPadding * 2;
  const connectorWidth = Math.max(
    20 * canvasScale,
    Math.min(88 * canvasScale, availableWidth * 0.07),
  );
  const nodeWidth = Math.max(
    86 * canvasScale,
    (availableWidth - connectorWidth * (nodes.length - 1)) / nodes.length,
  );
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.75, stiffness: 110 },
  });
  const outroStart = Math.max(0, durationInFrames - Math.round(fps * 0.42));
  const sceneOpacity = interpolate(frame, [outroStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const nodeStart = Math.round(fps * 0.36);
  const nodeStagger = Math.max(4, Math.round(fps * 0.16));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: `${Math.max(46, 86 * canvasScale)}px ${horizontalPadding}px`,
        boxSizing: "border-box",
        color: textColor,
        fontFamily: motionSystemTheme.fontFamily,
        background: `radial-gradient(circle at 50% 100%, color-mix(in srgb, ${accentColor} 17%, transparent) 0%, transparent 45%), linear-gradient(160deg, ${backgroundColor} 0%, ${motionSystemTheme.colors.inkElevated} 100%)`,
        opacity: sceneOpacity,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.15,
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.42) 1px, transparent 1px)",
          backgroundSize: `${Math.max(18, 34 * canvasScale)}px ${Math.max(18, 34 * canvasScale)}px`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          marginBottom: Math.max(58, 104 * canvasScale),
          opacity: titleProgress,
          translate: `0 ${interpolate(titleProgress, [0, 1], [-24, 0]) * canvasScale}px`,
        }}
      >
        <div
          style={{
            color: accentColor,
            fontSize: Math.max(15, 24 * canvasScale),
            fontWeight: 700,
            letterSpacing: "0.14em",
            marginBottom: Math.max(16, 26 * canvasScale),
          }}
        >
          HOW IT FLOWS
        </div>
        <div
          style={{
            fontSize: Math.max(38, 76 * canvasScale),
            lineHeight: 1.18,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            textWrap: "balance",
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {nodes.map((node, index) => {
          const revealedAt = nodeStart + nodeStagger * index;
          const nodeProgress = spring({
            frame: Math.max(0, frame - revealedAt),
            fps,
            config: { damping: 200, mass: 0.72, stiffness: 125 },
          });
          const nodeColor = toneColor(node.tone, accentColor);
          const nextNodeAt = nodeStart + nodeStagger * (index + 1);
          const connectorProgress = interpolate(
            frame,
            [nextNodeAt - Math.round(fps * 0.1), nextNodeAt + Math.round(fps * 0.24)],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          );

          return (
            <div
              key={`${node.id ?? node.label}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: nodeWidth,
                  minHeight: isCompact
                    ? Math.max(138, 190 * canvasScale)
                    : Math.max(178, 252 * canvasScale),
                  padding: isCompact
                    ? `${Math.max(18, 28 * canvasScale)}px ${Math.max(16, 26 * canvasScale)}px`
                    : `${Math.max(24, 40 * canvasScale)}px ${Math.max(20, 34 * canvasScale)}px`,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  border: `${Math.max(1, 2 * canvasScale)}px solid ${nodeColor}`,
                  borderRadius: Math.max(18, 30 * canvasScale),
                  backgroundColor: "rgba(7, 21, 37, 0.68)",
                  boxShadow: `0 ${18 * canvasScale}px ${48 * canvasScale}px rgba(0, 0, 0, 0.24), 0 0 ${30 * canvasScale}px color-mix(in srgb, ${nodeColor} 18%, transparent)`,
                  opacity: nodeProgress,
                  translate: `0 ${interpolate(nodeProgress, [0, 1], [38, 0]) * canvasScale}px`,
                  scale: `${interpolate(nodeProgress, [0, 1], [0.93, 1])}`,
                }}
              >
                <div
                  style={{
                    width: Math.max(32, 50 * canvasScale),
                    height: Math.max(5, 8 * canvasScale),
                    marginBottom: Math.max(18, 30 * canvasScale),
                    borderRadius: 999,
                    backgroundColor: nodeColor,
                  }}
                />
                <div
                  style={{
                    fontSize: isCompact
                      ? Math.max(22, 34 * canvasScale)
                      : Math.max(25, 42 * canvasScale),
                    lineHeight: 1.2,
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    overflowWrap: "anywhere",
                  }}
                >
                  {node.label}
                </div>
                {node.caption ? (
                  <div
                    style={{
                      marginTop: Math.max(12, 19 * canvasScale),
                      color: "rgba(248, 250, 252, 0.68)",
                      fontSize: isCompact
                        ? Math.max(14, 20 * canvasScale)
                        : Math.max(16, 24 * canvasScale),
                      lineHeight: 1.45,
                      fontWeight: 500,
                      opacity: interpolate(nodeProgress, [0.35, 1], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    {node.caption}
                  </div>
                ) : null}
              </div>

              {index < nodes.length - 1 ? (
                <div
                  aria-hidden
                  style={{
                    position: "relative",
                    width: connectorWidth,
                    height: Math.max(2, 3 * canvasScale),
                    margin: `0 ${Math.max(5, 9 * canvasScale)}px`,
                    borderRadius: 999,
                    backgroundColor: connectorColor,
                    opacity: connectorProgress,
                    scale: `${connectorProgress} 1`,
                    transformOrigin: "left center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: -Math.max(3, 5 * canvasScale),
                      width: Math.max(9, 16 * canvasScale),
                      height: Math.max(9, 16 * canvasScale),
                      borderTop: `${Math.max(2, 3 * canvasScale)}px solid ${connectorColor}`,
                      borderRight: `${Math.max(2, 3 * canvasScale)}px solid ${connectorColor}`,
                      translate: "0 -50%",
                      rotate: "45deg",
                    }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
