import { zColor } from "@remotion/zod-types";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";

const CAPTION_DIAGRAM_PLACEMENT_DEFAULTS = {
  eyebrow: "PALMIER PRO / EDITABLE LAYERS",
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

const captionDiagramPaletteSchema = z.object({
  background: zColor(),
  ink: zColor(),
  pink: zColor(),
  sky: zColor(),
  mint: zColor(),
  yellow: zColor(),
  lavender: zColor(),
  line: zColor(),
});

export const captionDiagramItemSchema = z.object({
  label: z.string().trim().min(1).max(36),
  detail: z.string().trim().max(48).optional(),
  tone: z.enum(["pink", "sky", "mint"]).default("sky"),
});

/** Public props for turning a spoken claim into a subtitle and an inserted diagram. */
export const captionDiagramPlacementSchema = z.object({
  eyebrow: z.string().trim().max(72).default(CAPTION_DIAGRAM_PLACEMENT_DEFAULTS.eyebrow),
  headline: z.string().trim().min(1).max(120),
  editorLabel: z.string().trim().min(1).max(48),
  speakerLabel: z.string().trim().min(1).max(48),
  spokenQuote: z.string().trim().min(1).max(120),
  captionText: z.string().trim().min(1).max(80),
  diagramTitle: z.string().trim().min(1).max(80),
  diagramItems: z.array(captionDiagramItemSchema).length(3),
  insertionLabel: z.string().trim().min(1).max(80),
  editabilityLabel: z.string().trim().min(1).max(100),
  showOutro: z.boolean().default(CAPTION_DIAGRAM_PLACEMENT_DEFAULTS.showOutro),
  palette: captionDiagramPaletteSchema.default(CAPTION_DIAGRAM_PLACEMENT_DEFAULTS.palette),
});

export type CaptionDiagramPalette = z.output<typeof captionDiagramPaletteSchema>;
export type CaptionDiagramItem = z.output<typeof captionDiagramItemSchema>;
export type CaptionDiagramPlacementProps = z.output<typeof captionDiagramPlacementSchema>;

export const captionDiagramPlacementDefaultProps: CaptionDiagramPlacementProps = {
  eyebrow: CAPTION_DIAGRAM_PLACEMENT_DEFAULTS.eyebrow,
  headline: "話した内容を、\n字幕と図解に変える",
  editorLabel: "Palmier Pro",
  speakerLabel: "話し手のひと言",
  spokenQuote: "「売上が伸びた理由は\n3つあります」",
  captionText: "売上が伸びた理由は3つ",
  diagramTitle: "3つの理由を、図解で見せる",
  diagramItems: [
    { label: "理由 1", detail: "ポイントを整理", tone: "pink" },
    { label: "理由 2", detail: "順番に伝える", tone: "sky" },
    { label: "理由 3", detail: "理解を補助", tone: "mint" },
  ],
  insertionLabel: "ここに図解を入れる",
  editabilityLabel: "短いテロップは、あとから直しやすい",
  showOutro: CAPTION_DIAGRAM_PLACEMENT_DEFAULTS.showOutro,
  palette: CAPTION_DIAGRAM_PLACEMENT_DEFAULTS.palette,
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

const toneColor = (tone: CaptionDiagramItem["tone"], palette: CaptionDiagramPalette): string => {
  if (tone === "pink") {
    return palette.pink;
  }

  if (tone === "mint") {
    return palette.mint;
  }

  return palette.sky;
};

type ConnectorProps = {
  readonly color: string;
  readonly progress: number;
  readonly width: number;
  readonly canvasScale: number;
  readonly vertical?: boolean;
};

const Connector = ({ color, progress, width, canvasScale, vertical = false }: ConnectorProps) => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      width: vertical ? Math.max(3, 5 * canvasScale) : width * canvasScale,
      height: vertical ? width * canvasScale : Math.max(3, 5 * canvasScale),
      borderRadius: 999,
      backgroundColor: color,
      opacity: progress,
      transform: vertical
        ? `scaleY(${interpolate(progress, [0, 1], [0.08, 1])})`
        : `scaleX(${interpolate(progress, [0, 1], [0.08, 1])})`,
      transformOrigin: "left top",
    }}
  />
);

type DiagramItemCardProps = {
  readonly index: number;
  readonly item: CaptionDiagramItem;
  readonly progress: number;
  readonly palette: CaptionDiagramPalette;
  readonly canvasScale: number;
};

const DiagramItemCard = ({ index, item, progress, palette, canvasScale }: DiagramItemCardProps) => {
  const color = toneColor(item.tone, palette);

  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        height: 122 * canvasScale,
        padding: 18 * canvasScale,
        boxSizing: "border-box",
        border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.09)`,
        borderRadius: 20 * canvasScale,
        backgroundColor: "rgba(255, 255, 255, 0.87)",
        boxShadow: `0 ${9 * canvasScale}px ${18 * canvasScale}px rgba(73, 111, 142, 0.1)`,
        opacity: interpolate(progress, [0, 0.14, 1], [0, 0.5, 1]),
        transform: `translateY(${interpolate(progress, [0, 1], [28, 0]) * canvasScale}px) scale(${interpolate(progress, [0, 1], [0.93, 1])})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 * canvasScale }}>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 31 * canvasScale,
            height: 31 * canvasScale,
            borderRadius: 10 * canvasScale,
            backgroundColor: color,
            color: palette.ink,
            fontFamily: motionSystemTheme.fontFamilyRounded,
            fontSize: 16 * canvasScale,
            fontWeight: 900,
          }}
        >
          0{index + 1}
        </span>
        <span
          style={{
            minWidth: 0,
            color: palette.ink,
            fontFamily: motionSystemTheme.fontFamilyRounded,
            fontSize: 23 * canvasScale,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.035em",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </span>
      </div>
      {item.detail ? (
        <div
          style={{
            marginTop: 13 * canvasScale,
            color: palette.ink,
            fontSize: 16 * canvasScale,
            lineHeight: 1.2,
            fontWeight: 700,
            opacity: 0.68,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.detail}
        </div>
      ) : null}
    </div>
  );
};

const waveformHeights = [0.44, 0.74, 0.53, 0.86, 0.38, 0.67, 0.93, 0.57, 0.45, 0.82, 0.62, 0.97, 0.41, 0.76, 0.54, 0.68, 0.9, 0.5, 0.35, 0.79, 0.59, 0.88, 0.47, 0.72, 0.61, 0.94, 0.4, 0.69, 0.55, 0.83];

type WaveformProps = {
  readonly color: string;
  readonly width: number;
  readonly height: number;
  readonly opacity: number;
};

const Waveform = ({ color, width, height, opacity }: WaveformProps) => (
  <div
    aria-hidden
    style={{
      display: "flex",
      alignItems: "center",
      gap: Math.max(2, width / 112),
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
          width: Math.max(2, width / 112),
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
  readonly label: string;
  readonly progress: number;
  readonly canvasScale: number;
};

const TimelineClip = ({ left, width, color, label, progress, canvasScale }: TimelineClipProps) => (
  <div
    style={{
      position: "absolute",
      left: left * canvasScale,
      top: 0,
      width: width * canvasScale,
      height: 27 * canvasScale,
      padding: `0 ${10 * canvasScale}px`,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      borderRadius: 8 * canvasScale,
      backgroundColor: color,
      color: "rgba(24, 50, 76, 0.8)",
      fontSize: 14 * canvasScale,
      lineHeight: 1,
      fontWeight: 900,
      whiteSpace: "nowrap",
      opacity: interpolate(progress, [0, 0.14, 1], [0, 0.46, 1]),
      transform: `translateY(${interpolate(progress, [0, 1], [11, 0]) * canvasScale}px) scaleX(${interpolate(progress, [0, 1], [0.72, 1])})`,
      transformOrigin: "left center",
    }}
  >
    {label}
  </div>
);

/**
 * Opaque 1920×1080 pastel explainer. It uses a spoken claim, a caption, and a
 * three-part diagram to show an editable placement decision. It has no audio or alpha.
 */
export const CaptionDiagramPlacement = (props: CaptionDiagramPlacementProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const {
    eyebrow = CAPTION_DIAGRAM_PLACEMENT_DEFAULTS.eyebrow,
    headline,
    editorLabel,
    speakerLabel,
    spokenQuote,
    captionText,
    diagramTitle,
    diagramItems,
    insertionLabel,
    editabilityLabel,
    showOutro = CAPTION_DIAGRAM_PLACEMENT_DEFAULTS.showOutro,
    palette = CAPTION_DIAGRAM_PLACEMENT_DEFAULTS.palette,
  } = props;
  const canvasScale = Math.min(width / 1920, height / 1080);
  const headlineMaxCharacters = Math.max(...headline.split("\n").map((line) => line.length));
  const headlineFontSize = headlineMaxCharacters > 27 ? 48 : 58;
  const headingProgress = clamp(
    spring({ frame, fps, config: { damping: 200, mass: 0.76, stiffness: 118 } }),
  );
  const speechProgress = clamp(
    spring({
      frame: Math.max(0, frame - Math.round(durationInFrames * 0.08)),
      fps,
      config: { damping: 200, mass: 0.73, stiffness: 124 },
    }),
  );
  const speechAccent = relativeProgress(frame, durationInFrames, 0.2, 0.32);
  const captionProgress = clamp(
    spring({
      frame: Math.max(0, frame - Math.round(durationInFrames * 0.34)),
      fps,
      config: { damping: 200, mass: 0.7, stiffness: 128 },
    }),
  );
  const captionConnectorProgress = relativeProgress(frame, durationInFrames, 0.29, 0.39);
  const diagramProgress = relativeProgress(frame, durationInFrames, 0.48, 0.7);
  const firstDiagramProgress = relativeProgress(frame, durationInFrames, 0.49, 0.58);
  const secondDiagramProgress = relativeProgress(frame, durationInFrames, 0.55, 0.64);
  const thirdDiagramProgress = relativeProgress(frame, durationInFrames, 0.61, 0.7);
  const diagramItemProgresses = [firstDiagramProgress, secondDiagramProgress, thirdDiagramProgress] as const;
  const timelineProgress = relativeProgress(frame, durationInFrames, 0.61, 0.78);
  const markerProgress = relativeProgress(frame, durationInFrames, 0.67, 0.8);
  const editabilityProgress = clamp(
    spring({
      frame: Math.max(0, frame - Math.round(durationInFrames * 0.79)),
      fps,
      config: { damping: 200, mass: 0.68, stiffness: 132 },
    }),
  );
  const playheadProgress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0.11, 0.88], {
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
      <PastelBlob color={palette.pink} left={-145 * canvasScale} top={-120 * canvasScale} width={400 * canvasScale} height={260 * canvasScale} rotation={-13} opacity={0.55} />
      <PastelBlob color={palette.sky} right={-140 * canvasScale} top={-150 * canvasScale} width={438 * canvasScale} height={316 * canvasScale} rotation={18} opacity={0.6} />
      <PastelBlob color={palette.yellow} left={-122 * canvasScale} bottom={-175 * canvasScale} width={350 * canvasScale} height={276 * canvasScale} rotation={12} opacity={0.45} />
      <PastelBlob color={palette.mint} right={-115 * canvasScale} bottom={-168 * canvasScale} width={410 * canvasScale} height={304 * canvasScale} rotation={-20} opacity={0.43} />

      <div
        style={{
          position: "absolute",
          left: 150 * canvasScale,
          top: 76 * canvasScale,
          maxWidth: 1_280 * canvasScale,
          opacity: headingProgress,
          transform: `translateY(${interpolate(headingProgress, [0, 1], [-24, 0]) * canvasScale}px)`,
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
          <span style={{ width: 48 * canvasScale, height: 8 * canvasScale, borderRadius: 999, backgroundColor: palette.pink }} />
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 14 * canvasScale,
            color: palette.ink,
            fontSize: headlineFontSize * canvasScale,
            lineHeight: 1.15,
            letterSpacing: "-0.045em",
            fontWeight: 900,
            whiteSpace: "pre-line",
          }}
        >
          {headline}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 150 * canvasScale,
          top: 312 * canvasScale,
          width: 572 * canvasScale,
          height: 382 * canvasScale,
          padding: 28 * canvasScale,
          boxSizing: "border-box",
          overflow: "hidden",
          border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.1)`,
          borderRadius: 30 * canvasScale,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: `0 ${18 * canvasScale}px ${38 * canvasScale}px rgba(73, 111, 142, 0.14)`,
          opacity: speechProgress,
          transform: `translateY(${interpolate(speechProgress, [0, 1], [32, 0]) * canvasScale}px) scale(${interpolate(speechProgress, [0, 1], [0.96, 1])})`,
          transformOrigin: "bottom left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 * canvasScale }}>
          <div
            aria-hidden
            style={{
              display: "grid",
              placeItems: "center",
              width: 48 * canvasScale,
              height: 48 * canvasScale,
              borderRadius: 17 * canvasScale,
              backgroundColor: palette.pink,
            }}
          >
            <div style={{ width: 13 * canvasScale, height: 22 * canvasScale, border: `${Math.max(2, 3 * canvasScale)}px solid ${palette.ink}`, borderRadius: 999 }} />
          </div>
          <div>
            <div style={{ color: palette.ink, fontFamily: motionSystemTheme.fontFamilyRounded, fontSize: 25 * canvasScale, lineHeight: 1, fontWeight: 900 }}>{speakerLabel}</div>
            <div style={{ marginTop: 7 * canvasScale, color: palette.ink, fontSize: 16 * canvasScale, fontWeight: 800, opacity: 0.62 }}>ナレーション</div>
          </div>
          <div aria-hidden style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 * canvasScale }}>
            {[0.45, 0.8, 0.62, 0.95, 0.52].map((unit, index) => (
              <span key={index} style={{ width: 5 * canvasScale, height: 24 * unit * canvasScale, borderRadius: 999, backgroundColor: index % 2 === 0 ? palette.pink : palette.line }} />
            ))}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 34 * canvasScale,
            minHeight: 208 * canvasScale,
            padding: `${28 * canvasScale}px ${26 * canvasScale}px`,
            boxSizing: "border-box",
            borderRadius: 24 * canvasScale,
            background: `linear-gradient(135deg, ${palette.lavender} 0%, ${palette.sky} 100%)`,
            color: palette.ink,
          }}
        >
          <div
            style={{
              whiteSpace: "pre-line",
              fontFamily: motionSystemTheme.fontFamilyRounded,
              fontSize: 43 * canvasScale,
              lineHeight: 1.25,
              fontWeight: 900,
              letterSpacing: "-0.045em",
            }}
          >
            {spokenQuote}
          </div>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 30 * canvasScale,
              bottom: 24 * canvasScale,
              width: interpolate(speechAccent, [0, 1], [46, 205]) * canvasScale,
              height: 11 * canvasScale,
              borderRadius: 999,
              backgroundColor: palette.yellow,
              opacity: 0.82,
            }}
          />
        </div>
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 729 * canvasScale,
          top: 477 * canvasScale,
          width: 18 * canvasScale,
          height: 18 * canvasScale,
          borderTop: `${Math.max(2, 4 * canvasScale)}px solid ${palette.line}`,
          borderRight: `${Math.max(2, 4 * canvasScale)}px solid ${palette.line}`,
          opacity: captionConnectorProgress,
          transform: `rotate(45deg) scale(${interpolate(captionConnectorProgress, [0, 1], [0.7, 1])})`,
        }}
      />
      <div style={{ position: "absolute", left: 708 * canvasScale, top: 477 * canvasScale }}>
        <Connector color={palette.line} progress={captionConnectorProgress} width={68} canvasScale={canvasScale} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 790 * canvasScale,
          top: 312 * canvasScale,
          width: 980 * canvasScale,
          height: 114 * canvasScale,
          padding: `20px ${24 * canvasScale}px`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 22 * canvasScale,
          border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.1)`,
          borderRadius: 25 * canvasScale,
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          boxShadow: `0 ${14 * canvasScale}px ${28 * canvasScale}px rgba(73, 111, 142, 0.12)`,
          opacity: captionProgress,
          transform: `translateX(${interpolate(captionProgress, [0, 1], [32, 0]) * canvasScale}px) scale(${interpolate(captionProgress, [0, 1], [0.95, 1])})`,
          transformOrigin: "left center",
        }}
      >
        <div
          style={{
            flex: "0 0 auto",
            padding: `9px ${14 * canvasScale}px`,
            borderRadius: 999,
            backgroundColor: palette.yellow,
            color: palette.ink,
            fontSize: 16 * canvasScale,
            fontWeight: 900,
          }}
        >
          字幕
        </div>
        <div
          style={{
            minWidth: 0,
            color: palette.ink,
            fontFamily: motionSystemTheme.fontFamilyRounded,
            fontSize: 34 * canvasScale,
            lineHeight: 1.1,
            fontWeight: 900,
            letterSpacing: "-0.035em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {captionText}
        </div>
        <span aria-hidden style={{ marginLeft: "auto", width: 13 * canvasScale, height: 13 * canvasScale, borderRadius: "50%", backgroundColor: palette.pink }} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 1_266 * canvasScale,
          top: 430 * canvasScale,
          zIndex: 1,
        }}
      >
        <Connector color={palette.mint} progress={diagramProgress} width={45} canvasScale={canvasScale} vertical />
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 1_255 * canvasScale,
          top: 459 * canvasScale,
          width: 18 * canvasScale,
          height: 18 * canvasScale,
          borderBottom: `${Math.max(2, 4 * canvasScale)}px solid ${palette.mint}`,
          borderRight: `${Math.max(2, 4 * canvasScale)}px solid ${palette.mint}`,
          opacity: diagramProgress,
          transform: `rotate(45deg) scale(${interpolate(diagramProgress, [0, 1], [0.7, 1])})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 790 * canvasScale,
          top: 472 * canvasScale,
          width: 980 * canvasScale,
          height: 222 * canvasScale,
          padding: 21 * canvasScale,
          boxSizing: "border-box",
          border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.1)`,
          borderRadius: 28 * canvasScale,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          boxShadow: `0 ${16 * canvasScale}px ${32 * canvasScale}px rgba(73, 111, 142, 0.12)`,
          opacity: interpolate(diagramProgress, [0, 0.14, 1], [0, 0.55, 1]),
          transform: `translateY(${interpolate(diagramProgress, [0, 1], [30, 0]) * canvasScale}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 * canvasScale }}>
          <span style={{ width: 12 * canvasScale, height: 12 * canvasScale, borderRadius: "50%", backgroundColor: palette.mint }} />
          <span style={{ color: palette.ink, fontFamily: motionSystemTheme.fontFamilyRounded, fontSize: 25 * canvasScale, lineHeight: 1, fontWeight: 900 }}>{diagramTitle}</span>
          <span style={{ marginLeft: "auto", padding: `7px ${12 * canvasScale}px`, borderRadius: 999, backgroundColor: palette.lavender, color: palette.ink, fontSize: 14 * canvasScale, fontWeight: 900 }}>図解</span>
        </div>
        <div style={{ display: "flex", gap: 15 * canvasScale, marginTop: 18 * canvasScale }}>
          {diagramItems.map((item, index) => (
            <DiagramItemCard
              key={`${item.label}-${index}`}
              index={index}
              item={item}
              progress={diagramItemProgresses[index] ?? 0}
              palette={palette}
              canvasScale={canvasScale}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 150 * canvasScale,
          top: 748 * canvasScale,
          width: 1_620 * canvasScale,
          height: 204 * canvasScale,
          padding: `18px ${22 * canvasScale}px`,
          boxSizing: "border-box",
          overflow: "hidden",
          border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.1)`,
          borderRadius: 28 * canvasScale,
          backgroundColor: "rgba(255, 255, 255, 0.91)",
          boxShadow: `0 ${16 * canvasScale}px ${32 * canvasScale}px rgba(73, 111, 142, 0.12)`,
          opacity: timelineProgress,
          transform: `translateY(${interpolate(timelineProgress, [0, 1], [24, 0]) * canvasScale}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ color: palette.ink, fontFamily: motionSystemTheme.fontFamilyRounded, fontSize: 22 * canvasScale, fontWeight: 900 }}>{editorLabel} Timeline</div>
          <div
            style={{
              marginLeft: "auto",
              padding: `9px ${15 * canvasScale}px`,
              borderRadius: 999,
              backgroundColor: palette.pink,
              color: palette.ink,
              fontSize: 16 * canvasScale,
              fontWeight: 900,
              opacity: editabilityProgress,
              transform: `scale(${interpolate(editabilityProgress, [0, 1], [0.88, 1])})`,
              transformOrigin: "right center",
            }}
          >
            {editabilityLabel}
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 14 * canvasScale, height: 119 * canvasScale }}>
          {[
            { label: "ナレーション", y: 0 },
            { label: "字幕", y: 38 },
            { label: "図解", y: 76 },
          ].map(({ label, y }) => (
            <div key={label} style={{ position: "absolute", left: 0, top: y * canvasScale, width: 1_561 * canvasScale, height: 28 * canvasScale }}>
              <span style={{ display: "inline-flex", alignItems: "center", width: 170 * canvasScale, height: 28 * canvasScale, color: palette.ink, fontSize: 16 * canvasScale, fontWeight: 900, opacity: 0.62 }}>{label}</span>
              <span style={{ position: "absolute", left: 174 * canvasScale, right: 0, top: 0, bottom: 0, borderRadius: 8 * canvasScale, backgroundColor: "rgba(24, 50, 76, 0.06)" }} />
            </div>
          ))}
          <div style={{ position: "absolute", left: 178 * canvasScale, top: 0, width: 1_378 * canvasScale, height: 28 * canvasScale, overflow: "hidden", borderRadius: 8 * canvasScale }}>
            <TimelineClip left={10} width={1_160} color={palette.pink} label="話し手のひと言" progress={timelineProgress} canvasScale={canvasScale} />
            <div style={{ position: "absolute", left: 28 * canvasScale, top: 5 * canvasScale }}>
              <Waveform color="rgba(24, 50, 76, 0.4)" width={1_055 * canvasScale} height={18 * canvasScale} opacity={timelineProgress} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 178 * canvasScale, top: 38 * canvasScale, width: 1_378 * canvasScale, height: 28 * canvasScale, overflow: "hidden", borderRadius: 8 * canvasScale }}>
            <TimelineClip left={455} width={352} color={palette.sky} label="字幕" progress={captionProgress} canvasScale={canvasScale} />
          </div>
          <div style={{ position: "absolute", left: 178 * canvasScale, top: 76 * canvasScale, width: 1_378 * canvasScale, height: 28 * canvasScale, overflow: "hidden", borderRadius: 8 * canvasScale }}>
            <TimelineClip left={668} width={412} color={palette.mint} label="図解" progress={diagramProgress} canvasScale={canvasScale} />
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: (178 + playheadProgress * 1_378) * canvasScale,
              top: -6 * canvasScale,
              bottom: 10 * canvasScale,
              width: Math.max(2, 3 * canvasScale),
              borderRadius: 999,
              backgroundColor: "#F46F8E",
              boxShadow: `0 0 ${9 * canvasScale}px rgba(244, 111, 142, 0.42)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 780 * canvasScale,
              top: -31 * canvasScale,
              display: "flex",
              alignItems: "center",
              gap: 8 * canvasScale,
              padding: `7px ${12 * canvasScale}px`,
              borderRadius: 999,
              backgroundColor: palette.yellow,
              color: palette.ink,
              fontSize: 15 * canvasScale,
              lineHeight: 1,
              fontWeight: 900,
              opacity: markerProgress,
              transform: `translateY(${interpolate(markerProgress, [0, 1], [-10, 0]) * canvasScale}px)`,
            }}
          >
            <span aria-hidden style={{ width: 8 * canvasScale, height: 8 * canvasScale, borderRadius: "50%", backgroundColor: palette.pink }} />
            {insertionLabel}
          </div>
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 882 * canvasScale,
              top: -6 * canvasScale,
              width: Math.max(2, 3 * canvasScale),
              height: 26 * canvasScale,
              borderRadius: 999,
              backgroundColor: palette.yellow,
              opacity: markerProgress,
            }}
          />
        </div>
      </div>
    </div>
  );
};
