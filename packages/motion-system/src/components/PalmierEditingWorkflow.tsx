import { zColor } from "@remotion/zod-types";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";

const PALMIER_EDITING_WORKFLOW_DEFAULTS = {
  eyebrow: "PALMIER PRO / EDITING",
  showOutro: false,
  palette: {
    background: motionSystemTheme.colors.pastelPaper,
    ink: motionSystemTheme.colors.pastelInk,
    pink: motionSystemTheme.colors.pastelPink,
    sky: motionSystemTheme.colors.pastelSky,
    mint: motionSystemTheme.colors.watercolorMint,
    yellow: motionSystemTheme.colors.watercolorYellow,
    lavender: motionSystemTheme.colors.pastelLavender,
    line: motionSystemTheme.colors.pastelLine,
  },
} as const;

const palmierEditingWorkflowPaletteSchema = z.object({
  background: zColor(),
  ink: zColor(),
  pink: zColor(),
  sky: zColor(),
  mint: zColor(),
  yellow: zColor(),
  lavender: zColor(),
  line: zColor(),
});

export const palmierEditingStageSchema = z.object({
  label: z.string().trim().min(1).max(30),
  detail: z.string().trim().min(1).max(50),
  tone: z.enum(["pink", "sky", "mint", "yellow"]).default("sky"),
});

/** Public props for a pastel explainer about shaping narration into a finished edit. */
export const palmierEditingWorkflowSchema = z.object({
  eyebrow: z.string().trim().max(72).default(PALMIER_EDITING_WORKFLOW_DEFAULTS.eyebrow),
  headline: z.string().trim().min(1).max(120),
  stages: z.array(palmierEditingStageSchema).length(4),
  outcomeLabel: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(120),
  showOutro: z.boolean().default(PALMIER_EDITING_WORKFLOW_DEFAULTS.showOutro),
  palette: palmierEditingWorkflowPaletteSchema.default(PALMIER_EDITING_WORKFLOW_DEFAULTS.palette),
});

export type PalmierEditingWorkflowPalette = z.output<typeof palmierEditingWorkflowPaletteSchema>;
export type PalmierEditingStage = z.output<typeof palmierEditingStageSchema>;
export type PalmierEditingWorkflowProps = z.output<typeof palmierEditingWorkflowSchema>;

export const palmierEditingWorkflowDefaultProps: PalmierEditingWorkflowProps = {
  eyebrow: PALMIER_EDITING_WORKFLOW_DEFAULTS.eyebrow,
  headline: "話す流れを、\n編集として仕上げる",
  stages: [
    { label: "音声", detail: "ナレーションを並べる", tone: "pink" },
    { label: "テンポ", detail: "無音をカットする", tone: "yellow" },
    { label: "字幕", detail: "理解を補助する", tone: "sky" },
    { label: "素材", detail: "Bロール・図解を重ねる", tone: "mint" },
  ],
  outcomeLabel: "視聴者が見る、最終的な流れへ",
  summary: "音声 × テンポ × 字幕 × 素材を、ひとつのタイムラインで整える",
  showOutro: PALMIER_EDITING_WORKFLOW_DEFAULTS.showOutro,
  palette: PALMIER_EDITING_WORKFLOW_DEFAULTS.palette,
};

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

const relativeProgress = (
  frame: number,
  durationInFrames: number,
  from: number,
  to: number,
  easing = Easing.out(Easing.cubic),
): number =>
  interpolate(frame, [Math.round(durationInFrames * from), Math.round(durationInFrames * to)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

type PastelBlobProps = {
  readonly color: string;
  readonly width: number;
  readonly height: number;
  readonly left?: number;
  readonly right?: number;
  readonly top?: number;
  readonly bottom?: number;
  readonly rotation: number;
  readonly opacity: number;
};

const PastelBlob = ({ color, width, height, rotation, opacity, ...position }: PastelBlobProps) => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      width,
      height,
      borderRadius: "48% 52% 55% 45% / 55% 45% 55% 45%",
      backgroundColor: color,
      opacity,
      filter: "blur(1px)",
      transform: `rotate(${rotation}deg)`,
      ...position,
    }}
  />
);

const toneColor = (tone: PalmierEditingStage["tone"], palette: PalmierEditingWorkflowPalette): string => {
  if (tone === "pink") {
    return palette.pink;
  }

  if (tone === "mint") {
    return palette.mint;
  }

  if (tone === "yellow") {
    return palette.yellow;
  }

  return palette.sky;
};

type StageCardProps = {
  readonly index: number;
  readonly stage: PalmierEditingStage;
  readonly progress: number;
  readonly palette: PalmierEditingWorkflowPalette;
  readonly canvasScale: number;
};

const StageCard = ({ index, stage, progress, palette, canvasScale }: StageCardProps) => {
  const color = toneColor(stage.tone, palette);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 16 * canvasScale,
        width: 410 * canvasScale,
        height: 90 * canvasScale,
        padding: `0 ${18 * canvasScale}px`,
        boxSizing: "border-box",
        border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, ${interpolate(progress, [0, 1], [0.07, 0.17])})`,
        borderRadius: 22 * canvasScale,
        backgroundColor: `rgba(255, 255, 255, ${interpolate(progress, [0, 1], [0.78, 0.96])})`,
        boxShadow: `0 ${10 * canvasScale}px ${22 * canvasScale}px rgba(73, 111, 142, ${interpolate(progress, [0, 1], [0.04, 0.13])})`,
        opacity: interpolate(progress, [0, 0.12, 1], [0, 0.45, 1]),
        transform: `translateX(${interpolate(progress, [0, 1], [30, 0]) * canvasScale}px) scale(${interpolate(progress, [0, 1], [0.96, 1])})`,
        transformOrigin: "right center",
      }}
    >
      <div
        style={{
          display: "grid",
          placeItems: "center",
          width: 48 * canvasScale,
          height: 48 * canvasScale,
          borderRadius: 16 * canvasScale,
          backgroundColor: color,
          color: palette.ink,
          fontFamily: motionSystemTheme.fontFamilyRounded,
          fontSize: 22 * canvasScale,
          fontWeight: 900,
        }}
      >
        0{index + 1}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: palette.ink,
            fontFamily: motionSystemTheme.fontFamilyRounded,
            fontSize: 25 * canvasScale,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.03em",
          }}
        >
          {stage.label}
        </div>
        <div
          style={{
            marginTop: 7 * canvasScale,
            color: palette.ink,
            fontSize: 17 * canvasScale,
            lineHeight: 1.2,
            fontWeight: 700,
            opacity: 0.7,
            whiteSpace: "nowrap",
          }}
        >
          {stage.detail}
        </div>
      </div>
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: 18 * canvasScale,
          top: 16 * canvasScale,
          width: 10 * canvasScale,
          height: 10 * canvasScale,
          borderRadius: "50%",
          backgroundColor: color,
          opacity: interpolate(progress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(progress, [0, 1], [0.4, 1])})`,
        }}
      />
    </div>
  );
};

type WaveformProps = {
  readonly color: string;
  readonly width: number;
  readonly height: number;
  readonly opacity: number;
};

const waveformHeights = [0.31, 0.55, 0.76, 0.44, 0.68, 0.92, 0.52, 0.38, 0.77, 0.61, 0.97, 0.49, 0.36, 0.8, 0.65, 0.46, 0.9, 0.62, 0.33, 0.72, 0.54, 0.82, 0.41, 0.69, 0.95, 0.56, 0.37, 0.74, 0.47, 0.66, 0.88, 0.51];

const Waveform = ({ color, width, height, opacity }: WaveformProps) => (
  <div
    aria-hidden
    style={{
      display: "flex",
      alignItems: "center",
      gap: Math.max(2, width / 115),
      width,
      height,
      opacity,
      overflow: "hidden",
    }}
  >
    {waveformHeights.map((unit, index) => (
      <span
        key={index}
        style={{
          flex: "0 0 auto",
          width: Math.max(2, width / 115),
          height: Math.max(3, height * unit),
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
    ))}
  </div>
);

type TimelineClipProps = {
  readonly left: number;
  readonly width: number;
  readonly color: string;
  readonly label?: string;
  readonly opacity: number;
  readonly canvasScale: number;
  readonly verticalOffset?: number;
};

const TimelineClip = ({ left, width, color, label, opacity, canvasScale, verticalOffset = 0 }: TimelineClipProps) => (
  <div
    style={{
      position: "absolute",
      left: left * canvasScale,
      top: verticalOffset * canvasScale,
      width: width * canvasScale,
      height: 24 * canvasScale,
      padding: `0 ${9 * canvasScale}px`,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      borderRadius: 7 * canvasScale,
      backgroundColor: color,
      color: "rgba(24, 50, 76, 0.78)",
      fontSize: 13 * canvasScale,
      lineHeight: 1,
      fontWeight: 800,
      whiteSpace: "nowrap",
      opacity,
    }}
  >
    {label}
  </div>
);

/**
 * Opaque 1920×1080 pastel editing diagram. The scene follows narration through
 * audio placement, silence trimming, captions, and layered visual support.
 */
export const PalmierEditingWorkflow = (props: PalmierEditingWorkflowProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const {
    eyebrow = PALMIER_EDITING_WORKFLOW_DEFAULTS.eyebrow,
    headline,
    stages,
    outcomeLabel,
    summary,
    showOutro = PALMIER_EDITING_WORKFLOW_DEFAULTS.showOutro,
    palette = PALMIER_EDITING_WORKFLOW_DEFAULTS.palette,
  } = props;
  const canvasScale = Math.min(width / 1920, height / 1080);
  const maxHeadlineCharacters = Math.max(...headline.split("\n").map((line) => line.length));
  const hasLongHeadline = headline.split("\n").length > 2 || maxHeadlineCharacters > 24;
  const headlineFontSize = maxHeadlineCharacters > 30 ? 42 : maxHeadlineCharacters > 24 ? 48 : 58;
  const editorTop = hasLongHeadline ? 330 : 300;
  const headlineProgress = clamp(
    spring({ frame, fps, config: { damping: 200, mass: 0.76, stiffness: 118 } }),
  );
  const editorProgress = clamp(
    spring({
      frame: Math.max(0, frame - Math.round(durationInFrames * 0.08)),
      fps,
      config: { damping: 200, mass: 0.74, stiffness: 122 },
    }),
  );
  const audioProgress = relativeProgress(frame, durationInFrames, 0.16, 0.27);
  const trimStageProgress = relativeProgress(frame, durationInFrames, 0.31, 0.43);
  const captionStageProgress = relativeProgress(frame, durationInFrames, 0.47, 0.59);
  const visualStageProgress = relativeProgress(frame, durationInFrames, 0.63, 0.76);
  const stageProgresses = [audioProgress, trimStageProgress, captionStageProgress, visualStageProgress] as const;
  const trimProgress = relativeProgress(frame, durationInFrames, 0.34, 0.48);
  const captionProgress = relativeProgress(frame, durationInFrames, 0.49, 0.64);
  const visualProgress = relativeProgress(frame, durationInFrames, 0.64, 0.8);
  const outcomeProgress = clamp(
    spring({
      frame: Math.max(0, frame - Math.round(durationInFrames * 0.76)),
      fps,
      config: { damping: 200, mass: 0.7, stiffness: 126 },
    }),
  );
  const playhead = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0.08, 0.89], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const outroStart = Math.max(0, durationInFrames - Math.max(10, Math.round(fps * 0.35)));
  const sceneOpacity = showOutro
    ? interpolate(frame, [outroStart, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.cubic),
      })
    : 1;

  const pauseOpacity = interpolate(trimProgress, [0, 0.58, 1], [0.92, 0.92, 0]);
  const pauseScale = interpolate(trimProgress, [0, 0.58, 1], [1, 1, 0.08]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: palette.background,
        color: palette.ink,
        fontFamily: motionSystemTheme.fontFamily,
        opacity: sceneOpacity,
      }}
    >
      <PastelBlob color={palette.pink} left={-150 * canvasScale} top={-120 * canvasScale} width={400 * canvasScale} height={260 * canvasScale} rotation={-13} opacity={0.54} />
      <PastelBlob color={palette.sky} right={-140 * canvasScale} top={-145 * canvasScale} width={435 * canvasScale} height={315 * canvasScale} rotation={18} opacity={0.6} />
      <PastelBlob color={palette.mint} right={-125 * canvasScale} bottom={-165 * canvasScale} width={410 * canvasScale} height={310 * canvasScale} rotation={-20} opacity={0.44} />
      <PastelBlob color={palette.yellow} left={-115 * canvasScale} bottom={-175 * canvasScale} width={345 * canvasScale} height={275 * canvasScale} rotation={14} opacity={0.46} />

      <div
        style={{
          position: "absolute",
          left: 150 * canvasScale,
          top: 76 * canvasScale,
          maxWidth: 1_220 * canvasScale,
          opacity: headlineProgress,
          transform: `translateY(${interpolate(headlineProgress, [0, 1], [-24, 0]) * canvasScale}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14 * canvasScale,
            color: palette.ink,
            fontSize: 21 * canvasScale,
            fontWeight: 800,
            letterSpacing: "0.12em",
          }}
        >
          <span style={{ width: 48 * canvasScale, height: 8 * canvasScale, borderRadius: 999, backgroundColor: palette.sky }} />
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 14 * canvasScale,
            whiteSpace: "pre-line",
            color: palette.ink,
            fontSize: headlineFontSize * canvasScale,
            lineHeight: 1.15,
            letterSpacing: "-0.045em",
            fontWeight: 900,
          }}
        >
          {headline}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 150 * canvasScale,
          top: editorTop * canvasScale,
          width: 1_120 * canvasScale,
          height: 526 * canvasScale,
          overflow: "hidden",
          border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.11)`,
          borderRadius: 32 * canvasScale,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: `0 ${20 * canvasScale}px ${42 * canvasScale}px rgba(73, 111, 142, 0.15)`,
          opacity: editorProgress,
          transform: `translateY(${interpolate(editorProgress, [0, 1], [34, 0]) * canvasScale}px) scale(${interpolate(editorProgress, [0, 1], [0.97, 1])})`,
          transformOrigin: "bottom left",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 58 * canvasScale,
            padding: `0 ${23 * canvasScale}px`,
            boxSizing: "border-box",
            borderBottom: `${Math.max(1, canvasScale)}px solid rgba(24, 50, 76, 0.1)`,
            backgroundColor: "rgba(207, 233, 255, 0.72)",
          }}
        >
          {[palette.pink, palette.yellow, palette.mint].map((color) => (
            <span key={color} aria-hidden style={{ width: 13 * canvasScale, height: 13 * canvasScale, marginRight: 9 * canvasScale, borderRadius: "50%", backgroundColor: color }} />
          ))}
          <span style={{ marginLeft: 14 * canvasScale, color: palette.ink, fontFamily: motionSystemTheme.fontFamilyRounded, fontSize: 22 * canvasScale, fontWeight: 900 }}>Palmier Pro</span>
          <span style={{ marginLeft: "auto", color: palette.ink, fontSize: 15 * canvasScale, fontWeight: 800, opacity: 0.55 }}>TIMELINE</span>
        </div>

        <div style={{ position: "relative", height: 267 * canvasScale, padding: 22 * canvasScale, boxSizing: "border-box" }}>
          <div
            style={{
              position: "relative",
              width: 600 * canvasScale,
              height: 223 * canvasScale,
              overflow: "hidden",
              borderRadius: 22 * canvasScale,
              background: `linear-gradient(135deg, ${palette.lavender} 0%, ${palette.sky} 100%)`,
            }}
          >
            <div aria-hidden style={{ position: "absolute", left: 70 * canvasScale, top: 38 * canvasScale, width: 114 * canvasScale, height: 114 * canvasScale, borderRadius: "50%", backgroundColor: palette.yellow, opacity: 0.85 }} />
            <div aria-hidden style={{ position: "absolute", right: 60 * canvasScale, bottom: 26 * canvasScale, width: 190 * canvasScale, height: 55 * canvasScale, borderRadius: 999, backgroundColor: palette.mint, opacity: 0.86, transform: "rotate(-8deg)" }} />
            <div
              style={{
                position: "absolute",
                left: 28 * canvasScale,
                top: 26 * canvasScale,
                display: "inline-flex",
                alignItems: "center",
                gap: 8 * canvasScale,
                padding: `8px ${13 * canvasScale}px`,
                borderRadius: 999,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                color: palette.ink,
                fontSize: 16 * canvasScale,
                fontWeight: 900,
              }}
            >
              <span style={{ width: 8 * canvasScale, height: 8 * canvasScale, borderRadius: "50%", backgroundColor: palette.pink }} />
              プレビュー
            </div>
            <div
              style={{
                position: "absolute",
                left: 28 * canvasScale,
                bottom: 23 * canvasScale,
                color: palette.ink,
                fontFamily: motionSystemTheme.fontFamilyRounded,
                fontSize: 27 * canvasScale,
                fontWeight: 900,
                letterSpacing: "-0.035em",
              }}
            >
              素材を、伝わる画面に
            </div>
            <div
              style={{
                position: "absolute",
                left: 56 * canvasScale,
                bottom: 60 * canvasScale,
                padding: `7px ${14 * canvasScale}px`,
                borderRadius: 10 * canvasScale,
                backgroundColor: "rgba(24, 50, 76, 0.84)",
                color: "white",
                fontSize: 17 * canvasScale,
                fontWeight: 800,
                opacity: captionProgress,
                transform: `translateY(${interpolate(captionProgress, [0, 1], [18, 0]) * canvasScale}px)`,
              }}
            >
              大事なポイントを、ひと目で
            </div>
            <div
              style={{
                position: "absolute",
                right: 30 * canvasScale,
                top: 31 * canvasScale,
                width: 136 * canvasScale,
                height: 88 * canvasScale,
                padding: 12 * canvasScale,
                boxSizing: "border-box",
                borderRadius: 17 * canvasScale,
                backgroundColor: "rgba(255, 255, 255, 0.83)",
                border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.09)`,
                opacity: visualProgress,
                transform: `translateX(${interpolate(visualProgress, [0, 1], [24, 0]) * canvasScale}px) rotate(${interpolate(visualProgress, [0, 1], [5, 0])}deg)`,
              }}
            >
              <div style={{ width: 62 * canvasScale, height: 9 * canvasScale, borderRadius: 999, backgroundColor: palette.pink }} />
              <div style={{ width: 96 * canvasScale, height: 9 * canvasScale, marginTop: 10 * canvasScale, borderRadius: 999, backgroundColor: palette.sky }} />
              <div style={{ width: 76 * canvasScale, height: 9 * canvasScale, marginTop: 10 * canvasScale, borderRadius: 999, backgroundColor: palette.mint }} />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              right: 23 * canvasScale,
              top: 22 * canvasScale,
              width: 428 * canvasScale,
              height: 223 * canvasScale,
              padding: 22 * canvasScale,
              boxSizing: "border-box",
              borderRadius: 22 * canvasScale,
              backgroundColor: "rgba(255, 253, 249, 0.92)",
              border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.08)`,
            }}
          >
            <div style={{ color: palette.ink, fontFamily: motionSystemTheme.fontFamilyRounded, fontSize: 23 * canvasScale, fontWeight: 900 }}>編集の中心でできること</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 * canvasScale, marginTop: 20 * canvasScale }}>
              {[
                { label: "音声", color: palette.pink, progress: audioProgress },
                { label: "無音カット", color: palette.yellow, progress: trimStageProgress },
                { label: "字幕", color: palette.sky, progress: captionStageProgress },
                { label: "Bロール", color: palette.mint, progress: visualStageProgress },
                { label: "図解", color: palette.lavender, progress: visualProgress },
              ].map(({ label, color, progress }) => (
                <span
                  key={label}
                  style={{
                    padding: `${9 * canvasScale}px ${13 * canvasScale}px`,
                    borderRadius: 999,
                    backgroundColor: color,
                    color: palette.ink,
                    fontSize: 16 * canvasScale,
                    fontWeight: 900,
                    opacity: interpolate(progress, [0, 0.2, 1], [0.22, 0.7, 1]),
                    transform: `scale(${interpolate(progress, [0, 1], [0.86, 1])})`,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                left: 23 * canvasScale,
                right: 23 * canvasScale,
                bottom: 19 * canvasScale,
                height: 40 * canvasScale,
                overflow: "hidden",
                borderRadius: 12 * canvasScale,
                backgroundColor: "rgba(24, 50, 76, 0.06)",
              }}
            >
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${interpolate(outcomeProgress, [0, 1], [13, 100])}%`, borderRadius: 12 * canvasScale, background: `linear-gradient(90deg, ${palette.pink} 0%, ${palette.sky} 48%, ${palette.mint} 100%)` }} />
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            height: 201 * canvasScale,
            padding: `${19 * canvasScale}px ${22 * canvasScale}px`,
            boxSizing: "border-box",
            borderTop: `${Math.max(1, canvasScale)}px solid rgba(24, 50, 76, 0.1)`,
            backgroundColor: "rgba(247, 251, 255, 0.9)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 * canvasScale, color: palette.ink, fontSize: 15 * canvasScale, fontWeight: 900, opacity: 0.6 }}>
            <span style={{ width: 74 * canvasScale }}>音声</span>
            <span>ナレーション</span>
          </div>
          <div style={{ position: "relative", marginLeft: 82 * canvasScale, width: 965 * canvasScale, height: 28 * canvasScale, overflow: "hidden", borderRadius: 8 * canvasScale, backgroundColor: "rgba(24, 50, 76, 0.07)" }}>
            <TimelineClip left={9} width={865} color={palette.pink} opacity={audioProgress} canvasScale={canvasScale} />
            <Waveform color="rgba(24, 50, 76, 0.45)" width={750 * canvasScale} height={18 * canvasScale} opacity={audioProgress} />
            {[334, 663].map((left) => (
              <span
                key={left}
                aria-hidden
                style={{
                  position: "absolute",
                  left: left * canvasScale,
                  top: 0,
                  width: 52 * canvasScale,
                  height: 28 * canvasScale,
                  borderRadius: 6 * canvasScale,
                  backgroundColor: "#DF7E92",
                  opacity: pauseOpacity,
                  transform: `scaleX(${pauseScale})`,
                  transformOrigin: "center",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 11 * canvasScale, color: palette.ink, fontSize: 15 * canvasScale, fontWeight: 900, opacity: 0.6 }}>
            <span style={{ width: 74 * canvasScale }}>字幕</span>
            <span>要点を表示</span>
          </div>
          <div style={{ position: "relative", marginLeft: 82 * canvasScale, width: 965 * canvasScale, height: 28 * canvasScale, overflow: "hidden", borderRadius: 8 * canvasScale, backgroundColor: "rgba(24, 50, 76, 0.07)" }}>
            <TimelineClip left={80} width={300} color={palette.sky} label="要点テロップ" opacity={captionProgress} canvasScale={canvasScale} />
            <TimelineClip left={431} width={244} color={palette.sky} label="わかりやすく" opacity={captionProgress} canvasScale={canvasScale} />
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 11 * canvasScale, color: palette.ink, fontSize: 15 * canvasScale, fontWeight: 900, opacity: 0.6 }}>
            <span style={{ width: 74 * canvasScale }}>素材</span>
            <span>Bロール・図解</span>
          </div>
          <div style={{ position: "relative", marginLeft: 82 * canvasScale, width: 965 * canvasScale, height: 28 * canvasScale, overflow: "hidden", borderRadius: 8 * canvasScale, backgroundColor: "rgba(24, 50, 76, 0.07)" }}>
            <TimelineClip left={133} width={228} color={palette.mint} label="Bロール" opacity={visualProgress} canvasScale={canvasScale} />
            <TimelineClip left={494} width={211} color={palette.lavender} label="図解" opacity={visualProgress} canvasScale={canvasScale} />
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: (104 + playhead * 965) * canvasScale,
              top: 13 * canvasScale,
              bottom: 16 * canvasScale,
              width: Math.max(2, 3 * canvasScale),
              borderRadius: 999,
              backgroundColor: "#F46F8E",
              boxShadow: `0 0 ${9 * canvasScale}px rgba(244, 111, 142, 0.42)`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1_330 * canvasScale,
          top: editorTop * canvasScale,
          display: "flex",
          flexDirection: "column",
          gap: 18 * canvasScale,
        }}
      >
        {stages.map((stage, index) => (
          <StageCard key={stage.label} index={index} stage={stage} progress={stageProgresses[index] ?? 0} palette={palette} canvasScale={canvasScale} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 266 * canvasScale,
          top: 877 * canvasScale,
          width: 1_388 * canvasScale,
          minHeight: 120 * canvasScale,
          padding: `${20 * canvasScale}px ${28 * canvasScale}px`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 24 * canvasScale,
          border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.09)`,
          borderRadius: 28 * canvasScale,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: `0 ${15 * canvasScale}px ${32 * canvasScale}px rgba(73, 111, 142, 0.14)`,
          opacity: outcomeProgress,
          transform: `translateY(${interpolate(outcomeProgress, [0, 1], [28, 0]) * canvasScale}px) scale(${interpolate(outcomeProgress, [0, 1], [0.95, 1])})`,
        }}
      >
        <div
          aria-hidden
          style={{
            display: "grid",
            placeItems: "center",
            width: 78 * canvasScale,
            height: 78 * canvasScale,
            borderRadius: 22 * canvasScale,
            background: `linear-gradient(135deg, ${palette.sky} 0%, ${palette.mint} 100%)`,
          }}
        >
          <div style={{ width: 0, height: 0, marginLeft: 6 * canvasScale, borderTop: `${14 * canvasScale}px solid transparent`, borderBottom: `${14 * canvasScale}px solid transparent`, borderLeft: `${23 * canvasScale}px solid ${palette.ink}` }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: palette.ink, fontFamily: motionSystemTheme.fontFamilyRounded, fontSize: 34 * canvasScale, lineHeight: 1.15, fontWeight: 900, letterSpacing: "-0.035em" }}>{outcomeLabel}</div>
          <div style={{ marginTop: 8 * canvasScale, color: palette.ink, fontSize: 20 * canvasScale, lineHeight: 1.2, fontWeight: 700, opacity: 0.68 }}>{summary}</div>
        </div>
        <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 8 * canvasScale }}>
          {[palette.pink, palette.yellow, palette.sky, palette.mint].map((color) => (
            <span key={color} style={{ width: 17 * canvasScale, height: 17 * canvasScale, borderRadius: "50%", backgroundColor: color }} />
          ))}
        </div>
      </div>
    </div>
  );
};
