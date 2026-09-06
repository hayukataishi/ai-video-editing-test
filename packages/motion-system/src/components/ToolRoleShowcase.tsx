import { zColor } from "@remotion/zod-types";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";

const TOOL_ROLE_SHOWCASE_DEFAULTS = {
  eyebrow: "EXPLAINER SYSTEM",
  visual: "timeline",
  backgroundColor: motionSystemTheme.colors.ink,
  accentColor: motionSystemTheme.colors.accent,
  secondaryColor: motionSystemTheme.colors.success,
  textColor: motionSystemTheme.colors.paper,
} as const;

export const toolRoleStepSchema = z.object({
  label: z.string().trim().min(1).max(48),
  detail: z.string().trim().max(96).optional(),
});

export const toolRoleShowcaseSchema = z.object({
  eyebrow: z.string().trim().max(80).default(TOOL_ROLE_SHOWCASE_DEFAULTS.eyebrow),
  toolName: z.string().trim().min(1).max(80),
  role: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(260),
  visual: z.enum(["timeline", "network", "pipeline"]).default(TOOL_ROLE_SHOWCASE_DEFAULTS.visual),
  steps: z.array(toolRoleStepSchema).min(3).max(4),
  beatFrames: z.array(z.number().int().min(0).max(36000)).max(12).default([]),
  backgroundColor: zColor().default(TOOL_ROLE_SHOWCASE_DEFAULTS.backgroundColor),
  accentColor: zColor().default(TOOL_ROLE_SHOWCASE_DEFAULTS.accentColor),
  secondaryColor: zColor().default(TOOL_ROLE_SHOWCASE_DEFAULTS.secondaryColor),
  textColor: zColor().default(TOOL_ROLE_SHOWCASE_DEFAULTS.textColor),
});

export type ToolRoleStep = z.output<typeof toolRoleStepSchema>;
export type ToolRoleShowcaseProps = z.output<typeof toolRoleShowcaseSchema>;

export const toolRoleShowcaseDefaultProps: ToolRoleShowcaseProps = {
  eyebrow: TOOL_ROLE_SHOWCASE_DEFAULTS.eyebrow,
  toolName: "Palmier Pro",
  role: "話す流れを、編集として仕上げる",
  description:
    "音声、字幕、Bロール、図解の配置をひとつのタイムラインで調整し、視聴者が見る最終的なテンポを作ります。",
  visual: TOOL_ROLE_SHOWCASE_DEFAULTS.visual,
  steps: [
    { label: "音声", detail: "話すリズム" },
    { label: "字幕", detail: "理解を補助" },
    { label: "Bロール", detail: "見せ場をつくる" },
    { label: "図解", detail: "意味を可視化" },
  ],
  beatFrames: [0, 72, 156, 252],
  backgroundColor: TOOL_ROLE_SHOWCASE_DEFAULTS.backgroundColor,
  accentColor: TOOL_ROLE_SHOWCASE_DEFAULTS.accentColor,
  secondaryColor: TOOL_ROLE_SHOWCASE_DEFAULTS.secondaryColor,
  textColor: TOOL_ROLE_SHOWCASE_DEFAULTS.textColor,
};

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

const fadeOut = (frame: number, durationInFrames: number, fps: number): number => {
  const outroStart = Math.max(0, durationInFrames - Math.round(fps * 0.45));
  return interpolate(frame, [outroStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
};

type VisualProps = {
  readonly steps: readonly ToolRoleStep[];
  readonly beatFrames: readonly number[];
  readonly accentColor: string;
  readonly secondaryColor: string;
  readonly textColor: string;
  readonly canvasScale: number;
};

const activeStepIndex = (
  frame: number,
  beatFrames: readonly number[],
  stepCount: number,
): number => {
  if (stepCount === 0 || beatFrames.length === 0) {
    return 0;
  }

  let index = 0;
  for (const [beatIndex, beatFrame] of beatFrames.entries()) {
    if (frame < beatFrame) {
      break;
    }
    index = beatIndex;
  }

  return index % stepCount;
};

const TimelineVisual = ({
  steps,
  beatFrames,
  accentColor,
  secondaryColor,
  textColor,
  canvasScale,
}: VisualProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const trackHeight = Math.max(48, 78 * canvasScale);
  const highlightedStep = activeStepIndex(frame, beatFrames, steps.length);
  const playhead = interpolate(frame % Math.max(1, Math.round(fps * 4)), [0, fps * 4], [0.06, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: Math.max(20, 30 * canvasScale),
        border: `${Math.max(1, 2 * canvasScale)}px solid rgba(255, 255, 255, 0.16)`,
        background:
          "linear-gradient(145deg, rgba(16, 36, 62, 0.94) 0%, rgba(7, 17, 31, 0.94) 100%)",
        overflow: "hidden",
        boxShadow: `0 ${22 * canvasScale}px ${62 * canvasScale}px rgba(0, 0, 0, 0.3)`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.16,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: `${Math.max(20, 44 * canvasScale)}px ${Math.max(20, 44 * canvasScale)}px`,
        }}
      />
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: `${Math.max(84, 138 * canvasScale)}px 1fr`,
          gap: Math.max(12, 20 * canvasScale),
          padding: Math.max(22, 34 * canvasScale),
          boxSizing: "border-box",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            color: "rgba(247, 250, 255, 0.64)",
            fontSize: Math.max(13, 19 * canvasScale),
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {steps.map((step) => (
            <div key={step.label}>{step.label}</div>
          ))}
        </div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
          {steps.map((step, index) => {
            const revealAt = Math.round(fps * (0.25 + index * 0.16));
            const progress = spring({
              frame: Math.max(0, frame - revealAt),
              fps,
              config: { damping: 200, mass: 0.65, stiffness: 125 },
            });
            const widthProgress = clamp(progress);
            const blockWidth = 42 + ((index * 19) % 27);
            const blockOffset = 3 + ((index * 13) % 19);
            const isHighlighted = index === highlightedStep;

            return (
              <div
                key={`${step.label}-${index}`}
                style={{
                  position: "relative",
                  height: trackHeight,
                  borderRadius: Math.max(8, 12 * canvasScale),
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: Math.max(6, 10 * canvasScale),
                    bottom: Math.max(6, 10 * canvasScale),
                    left: `${blockOffset}%`,
                    width: `${blockWidth}%`,
                    borderRadius: Math.max(6, 10 * canvasScale),
                    background: index % 2 === 0
                      ? `linear-gradient(90deg, ${accentColor}, ${secondaryColor})`
                      : `linear-gradient(90deg, ${secondaryColor}, ${accentColor})`,
                    opacity: isHighlighted ? 1 : 0.72,
                    boxShadow: isHighlighted
                      ? `0 0 ${20 * canvasScale}px color-mix(in srgb, ${accentColor} 64%, transparent)`
                      : undefined,
                    scale: `${widthProgress} 1`,
                    transformOrigin: "left center",
                  }}
                />
                {index === 0 ? (
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: Math.max(3, 5 * canvasScale),
                      padding: `0 ${Math.max(10, 16 * canvasScale)}px`,
                      opacity: 0.72,
                    }}
                  >
                    {Array.from({ length: 30 }, (_, waveformIndex) => {
                      const amplitude = 0.22 + Math.abs(Math.sin((frame + waveformIndex * 13) * 0.12)) * 0.72;
                      return (
                        <div
                          key={waveformIndex}
                          style={{
                            flex: 1,
                            minWidth: 1,
                            height: `${amplitude * 68}%`,
                            borderRadius: 999,
                            backgroundColor: textColor,
                          }}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${playhead * 100}%`,
              width: Math.max(2, 3 * canvasScale),
              borderRadius: 999,
              backgroundColor: "#ffffff",
              boxShadow: `0 0 ${18 * canvasScale}px ${accentColor}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const NetworkVisual = ({
  steps,
  beatFrames,
  accentColor,
  secondaryColor,
  textColor,
  canvasScale,
}: VisualProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nodePositions = [
    { x: 20, y: 68 },
    { x: 50, y: 27 },
    { x: 80, y: 68 },
    { x: 50, y: 82 },
  ];
  const highlightedStep = activeStepIndex(frame, beatFrames, steps.length);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: Math.max(20, 30 * canvasScale),
        border: `${Math.max(1, 2 * canvasScale)}px solid color-mix(in srgb, ${accentColor} 38%, rgba(255, 255, 255, 0.18))`,
        background: `radial-gradient(circle at 50% 46%, color-mix(in srgb, ${accentColor} 22%, transparent), transparent 46%), linear-gradient(145deg, rgba(16, 36, 62, 0.94) 0%, rgba(7, 17, 31, 0.96) 100%)`,
        overflow: "hidden",
        boxShadow: `0 ${22 * canvasScale}px ${62 * canvasScale}px rgba(0, 0, 0, 0.3)`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "60%",
          aspectRatio: "1",
          borderRadius: "50%",
          border: `${Math.max(1, 2 * canvasScale)}px solid color-mix(in srgb, ${accentColor} 38%, transparent)`,
          opacity: 0.56,
          translate: "-50% -50%",
          scale: `${1 + Math.sin(frame / Math.max(1, fps) * 1.5) * 0.035}`,
        }}
      />
      {steps.map((step, index) => {
        const position =
          nodePositions[index] ??
          nodePositions[index % nodePositions.length] ??
          { x: 50, y: 52 };
        const revealAt = Math.round(fps * (0.2 + index * 0.23));
        const progress = spring({
          frame: Math.max(0, frame - revealAt),
          fps,
          config: { damping: 200, mass: 0.68, stiffness: 120 },
        });
        const connectorProgress = interpolate(frame, [revealAt - Math.round(fps * 0.08), revealAt + Math.round(fps * 0.28)], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const nodeColor = index % 2 === 0 ? accentColor : secondaryColor;
        const isHighlighted = index === highlightedStep;

        return (
          <div key={`${step.label}-${index}`}>
            {index > 0 ? (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "52%",
                  width: `${Math.abs(position.x - 50)}%`,
                  height: Math.max(2, 3 * canvasScale),
                  borderRadius: 999,
                  backgroundColor: nodeColor,
                  opacity: 0.72 * connectorProgress,
                  transformOrigin: position.x < 50 ? "right center" : "left center",
                  rotate: `${Math.atan2(position.y - 52, position.x - 50) * (180 / Math.PI)}deg`,
                  scale: `${connectorProgress} 1`,
                }}
              />
            ) : null}
            <div
              style={{
                position: "absolute",
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: Math.max(104, 178 * canvasScale),
                minHeight: Math.max(82, 126 * canvasScale),
                padding: `${Math.max(12, 20 * canvasScale)}px ${Math.max(14, 24 * canvasScale)}px`,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                borderRadius: Math.max(18, 28 * canvasScale),
                border: `${Math.max(1, 2 * canvasScale)}px solid ${nodeColor}`,
                backgroundColor: "rgba(7, 17, 31, 0.78)",
                color: textColor,
                boxShadow: `0 0 ${(isHighlighted ? 52 : 34) * canvasScale}px color-mix(in srgb, ${nodeColor} ${isHighlighted ? 44 : 26}%, transparent)`,
                opacity: progress,
                translate: "-50% -50%",
                scale: `${interpolate(progress, [0, 1], [0.86, 1])}`,
              }}
            >
              <div style={{ fontSize: Math.max(17, 28 * canvasScale), fontWeight: 800, lineHeight: 1.16 }}>
                {step.label}
              </div>
              {step.detail ? (
                <div
                  style={{
                    marginTop: Math.max(5, 9 * canvasScale),
                    color: "rgba(247, 250, 255, 0.68)",
                    fontSize: Math.max(11, 16 * canvasScale),
                    lineHeight: 1.35,
                  }}
                >
                  {step.detail}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PipelineVisual = ({
  steps,
  beatFrames,
  accentColor,
  secondaryColor,
  textColor,
  canvasScale,
}: VisualProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nodeHeight = Math.max(58, 88 * canvasScale);
  const arrowHeight = Math.max(26, 38 * canvasScale);
  const highlightedStep = activeStepIndex(frame, beatFrames, steps.length);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: Math.max(20, 30 * canvasScale),
        border: `${Math.max(1, 2 * canvasScale)}px solid color-mix(in srgb, ${secondaryColor} 38%, rgba(255, 255, 255, 0.18))`,
        background: `linear-gradient(145deg, rgba(16, 36, 62, 0.94) 0%, rgba(7, 17, 31, 0.96) 100%)`,
        overflow: "hidden",
        boxShadow: `0 ${22 * canvasScale}px ${62 * canvasScale}px rgba(0, 0, 0, 0.3)`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage: `radial-gradient(${secondaryColor} 1px, transparent 1px)`,
          backgroundSize: `${Math.max(16, 30 * canvasScale)}px ${Math.max(16, 30 * canvasScale)}px`,
        }}
      />
      <div
        style={{
          position: "relative",
          height: "100%",
          padding: `${Math.max(20, 34 * canvasScale)}px ${Math.max(28, 50 * canvasScale)}px`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: Math.max(6, 10 * canvasScale),
        }}
      >
        {steps.map((step, index) => {
          const revealAt = Math.round(fps * (0.18 + index * 0.2));
          const progress = spring({
            frame: Math.max(0, frame - revealAt),
            fps,
            config: { damping: 200, mass: 0.66, stiffness: 120 },
          });
          const nodeColor = index % 2 === 0 ? accentColor : secondaryColor;
          const isHighlighted = index === highlightedStep;

          return (
            <div key={`${step.label}-${index}`} style={{ display: "contents" }}>
              <div
                style={{
                  minHeight: nodeHeight,
                  padding: `0 ${Math.max(16, 28 * canvasScale)}px`,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: Math.max(14, 24 * canvasScale),
                  borderRadius: Math.max(12, 20 * canvasScale),
                  border: `${Math.max(1, 2 * canvasScale)}px solid ${nodeColor}`,
                  backgroundColor: "rgba(7, 17, 31, 0.74)",
                  color: textColor,
                  boxShadow: isHighlighted
                    ? `0 0 ${26 * canvasScale}px color-mix(in srgb, ${nodeColor} 34%, transparent)`
                    : undefined,
                  opacity: progress,
                  translate: `${interpolate(progress, [0, 1], [34, 0]) * canvasScale}px 0`,
                }}
              >
                <div
                  style={{
                    width: Math.max(26, 42 * canvasScale),
                    height: Math.max(26, 42 * canvasScale),
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    backgroundColor: nodeColor,
                    color: TOOL_ROLE_SHOWCASE_DEFAULTS.backgroundColor,
                    fontSize: Math.max(13, 19 * canvasScale),
                    fontWeight: 800,
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontSize: Math.max(17, 28 * canvasScale), fontWeight: 800, lineHeight: 1.12 }}>
                    {step.label}
                  </div>
                  {step.detail ? (
                    <div
                      style={{
                        marginTop: Math.max(4, 7 * canvasScale),
                        color: "rgba(247, 250, 255, 0.68)",
                        fontSize: Math.max(11, 16 * canvasScale),
                        lineHeight: 1.32,
                      }}
                    >
                      {step.detail}
                    </div>
                  ) : null}
                </div>
              </div>
              {index < steps.length - 1 ? (
                <div
                  aria-hidden
                  style={{
                    height: arrowHeight,
                    display: "grid",
                    placeItems: "center",
                    color: nodeColor,
                    fontSize: Math.max(18, 26 * canvasScale),
                    opacity: interpolate(frame, [revealAt + 2, revealAt + Math.round(fps * 0.22)], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  ↓
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Opaque 16:9 explainer card for a tool's role in a workflow.
 *
 * Recommended duration is 180+ frames. Important text stays within the
 * normalized 8% safe zone. The component has no audio and no alpha output.
 */
export const ToolRoleShowcase = (props: ToolRoleShowcaseProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, height, width } = useVideoConfig();
  const {
    eyebrow = TOOL_ROLE_SHOWCASE_DEFAULTS.eyebrow,
    toolName,
    role,
    description,
    visual = TOOL_ROLE_SHOWCASE_DEFAULTS.visual,
    steps,
    beatFrames = [],
    backgroundColor = TOOL_ROLE_SHOWCASE_DEFAULTS.backgroundColor,
    accentColor = TOOL_ROLE_SHOWCASE_DEFAULTS.accentColor,
    secondaryColor = TOOL_ROLE_SHOWCASE_DEFAULTS.secondaryColor,
    textColor = TOOL_ROLE_SHOWCASE_DEFAULTS.textColor,
  } = props;
  const canvasScale = Math.min(width / 1920, height / 1080);
  const safeHorizontal = Math.max(44, 154 * canvasScale);
  const safeVertical = Math.max(44, 86 * canvasScale);
  const headingProgress = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.78, stiffness: 120 },
  });
  const roleProgress = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.14)),
    fps,
    config: { damping: 200, mass: 0.78, stiffness: 118 },
  });
  const descriptionProgress = spring({
    frame: Math.max(0, frame - Math.round(fps * 0.26)),
    fps,
    config: { damping: 200, mass: 0.78, stiffness: 114 },
  });
  const sceneOpacity = fadeOut(frame, durationInFrames, fps);
  const visualProps = { steps, beatFrames, accentColor, secondaryColor, textColor, canvasScale };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        padding: `${safeVertical}px ${safeHorizontal}px`,
        color: textColor,
        fontFamily: motionSystemTheme.fontFamily,
        background: `radial-gradient(circle at 88% 18%, color-mix(in srgb, ${accentColor} 24%, transparent) 0%, transparent 34%), radial-gradient(circle at 16% 88%, color-mix(in srgb, ${secondaryColor} 16%, transparent) 0%, transparent 38%), linear-gradient(140deg, ${backgroundColor} 0%, ${motionSystemTheme.colors.inkElevated} 100%)`,
        opacity: sceneOpacity,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: `${Math.max(26, 56 * canvasScale)}px ${Math.max(26, 56 * canvasScale)}px`,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.88fr) minmax(0, 1.12fr)",
          gap: Math.max(36, 68 * canvasScale),
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: Math.max(10, 16 * canvasScale),
              color: accentColor,
              fontSize: Math.max(14, 22 * canvasScale),
              fontWeight: 800,
              letterSpacing: "0.13em",
              opacity: headingProgress,
              translate: `0 ${interpolate(headingProgress, [0, 1], [-16, 0]) * canvasScale}px`,
            }}
          >
            <span
              style={{
                width: Math.max(26, 42 * canvasScale),
                height: Math.max(4, 6 * canvasScale),
                borderRadius: 999,
                backgroundColor: accentColor,
              }}
            />
            {eyebrow}
          </div>
          <div
            style={{
              marginTop: Math.max(22, 36 * canvasScale),
              fontSize: Math.max(50, 104 * canvasScale),
              lineHeight: 1,
              letterSpacing: "-0.045em",
              fontWeight: 800,
              textWrap: "balance",
              opacity: headingProgress,
              translate: `0 ${interpolate(headingProgress, [0, 1], [30, 0]) * canvasScale}px`,
            }}
          >
            {toolName}
          </div>
          <div
            style={{
              marginTop: Math.max(22, 38 * canvasScale),
              maxWidth: 680 * canvasScale,
              color: textColor,
              fontSize: Math.max(28, 54 * canvasScale),
              lineHeight: 1.25,
              letterSpacing: "-0.028em",
              fontWeight: 800,
              textWrap: "balance",
              opacity: roleProgress,
              translate: `0 ${interpolate(roleProgress, [0, 1], [26, 0]) * canvasScale}px`,
            }}
          >
            {role}
          </div>
          <div
            style={{
              marginTop: Math.max(22, 34 * canvasScale),
              maxWidth: 650 * canvasScale,
              color: "rgba(247, 250, 255, 0.74)",
              fontSize: Math.max(17, 28 * canvasScale),
              lineHeight: 1.54,
              fontWeight: 500,
              textWrap: "pretty",
              opacity: descriptionProgress,
              translate: `0 ${interpolate(descriptionProgress, [0, 1], [18, 0]) * canvasScale}px`,
            }}
          >
            {description}
          </div>
        </div>
        <div
          style={{
            minWidth: 0,
            height: Math.min(680 * canvasScale, height - safeVertical * 2),
            opacity: descriptionProgress,
            translate: `${interpolate(descriptionProgress, [0, 1], [42, 0]) * canvasScale}px 0`,
          }}
        >
          {visual === "timeline" ? <TimelineVisual {...visualProps} /> : null}
          {visual === "network" ? <NetworkVisual {...visualProps} /> : null}
          {visual === "pipeline" ? <PipelineVisual {...visualProps} /> : null}
        </div>
      </div>
    </div>
  );
};
