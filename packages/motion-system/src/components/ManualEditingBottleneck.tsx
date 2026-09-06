import { zColor } from "@remotion/zod-types";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";

const MANUAL_EDITING_BOTTLENECK_DEFAULTS = {
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

const manualEditingPaletteSchema = z.object({
  background: zColor(),
  ink: zColor(),
  pink: zColor(),
  sky: zColor(),
  mint: zColor(),
  yellow: zColor(),
  lavender: zColor(),
  line: zColor(),
});

/** Public props for a full-frame explainer about a manual editing bottleneck. */
export const manualEditingBottleneckSchema = z.object({
  headline: z.string().trim().min(1).max(100),
  softwareLabel: z.string().trim().min(1).max(60),
  tasks: z.array(z.string().trim().min(1).max(40)).min(3).max(5),
  conclusion: z.string().trim().min(1).max(120),
  showOutro: z.boolean().default(MANUAL_EDITING_BOTTLENECK_DEFAULTS.showOutro),
  palette: manualEditingPaletteSchema.default(MANUAL_EDITING_BOTTLENECK_DEFAULTS.palette),
});

export type ManualEditingBottleneckPalette = z.output<typeof manualEditingPaletteSchema>;
export type ManualEditingBottleneckProps = z.output<typeof manualEditingBottleneckSchema>;

export const manualEditingBottleneckDefaultProps: ManualEditingBottleneckProps = {
  headline: "解説動画を\n動画編集ソフトだけで作ると…",
  softwareLabel: "動画編集ソフト",
  tasks: ["台本を読む", "素材を探す", "図をつくる", "タイミング調整", "修正を重ねる"],
  conclusion: "手作業が積み上がって、\n時間がめっちゃかかる",
  showOutro: MANUAL_EDITING_BOTTLENECK_DEFAULTS.showOutro,
  palette: MANUAL_EDITING_BOTTLENECK_DEFAULTS.palette,
};

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

const scaleProgress = (frame: number, durationInFrames: number, from: number, to: number): number =>
  interpolate(frame, [Math.round(durationInFrames * from), Math.round(durationInFrames * to)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

type BlobProps = {
  readonly color: string;
  readonly left?: number;
  readonly right?: number;
  readonly top?: number;
  readonly bottom?: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;
  readonly opacity: number;
};

const PastelBlob = ({ color, width, height, rotation, opacity, ...position }: BlobProps) => (
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

type EditorMockupProps = {
  readonly progress: number;
  readonly softwareLabel: string;
  readonly palette: ManualEditingBottleneckPalette;
  readonly canvasScale: number;
};

const EditorMockup = ({ progress, softwareLabel, palette, canvasScale }: EditorMockupProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const playheadProgress = interpolate(frame, [Math.round(fps * 1.3), Math.round(fps * 4.4)], [0.12, 0.84], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const rows = [palette.pink, palette.sky, palette.mint];

  return (
    <div
      style={{
        position: "absolute",
        left: 152 * canvasScale,
        top: 340 * canvasScale,
        width: 620 * canvasScale,
        height: 424 * canvasScale,
        border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.12)`,
        borderRadius: 30 * canvasScale,
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        boxShadow: `0 ${20 * canvasScale}px ${42 * canvasScale}px rgba(73, 111, 142, 0.16)`,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [34, 0]) * canvasScale}px) scale(${interpolate(progress, [0, 1], [0.96, 1])})`,
        transformOrigin: "bottom left",
      }}
    >
      <div
        style={{
          height: 56 * canvasScale,
          display: "flex",
          alignItems: "center",
          gap: 10 * canvasScale,
          padding: `0 ${22 * canvasScale}px`,
          backgroundColor: palette.sky,
          color: palette.ink,
          fontFamily: motionSystemTheme.fontFamilyRounded,
          fontSize: 22 * canvasScale,
          fontWeight: 800,
        }}
      >
        <span style={{ width: 14 * canvasScale, height: 14 * canvasScale, borderRadius: "50%", backgroundColor: palette.pink }} />
        <span style={{ width: 14 * canvasScale, height: 14 * canvasScale, borderRadius: "50%", backgroundColor: palette.yellow }} />
        <span style={{ width: 14 * canvasScale, height: 14 * canvasScale, borderRadius: "50%", backgroundColor: palette.mint }} />
        <span style={{ marginLeft: 10 * canvasScale }}>{softwareLabel}</span>
      </div>
      <div style={{ display: "flex", height: 214 * canvasScale }}>
        <div
          style={{
            width: 92 * canvasScale,
            padding: `${20 * canvasScale}px ${16 * canvasScale}px`,
            boxSizing: "border-box",
            borderRight: `${Math.max(1, canvasScale)}px solid rgba(24, 50, 76, 0.1)`,
          }}
        >
          {[palette.pink, palette.sky, palette.mint, palette.lavender].map((color, index) => (
            <div
              key={color}
              style={{
                width: 44 * canvasScale,
                height: 28 * canvasScale,
                marginBottom: 16 * canvasScale,
                borderRadius: 8 * canvasScale,
                backgroundColor: color,
                opacity: 0.9 - index * 0.12,
              }}
            />
          ))}
        </div>
        <div style={{ flex: 1, padding: 18 * canvasScale, boxSizing: "border-box" }}>
          <div
            style={{
              position: "relative",
              height: 160 * canvasScale,
              borderRadius: 16 * canvasScale,
              overflow: "hidden",
              background: `linear-gradient(135deg, ${palette.lavender} 0%, ${palette.sky} 100%)`,
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                width: 100 * canvasScale,
                height: 100 * canvasScale,
                left: 70 * canvasScale,
                top: 28 * canvasScale,
                borderRadius: "50%",
                backgroundColor: palette.yellow,
                opacity: 0.82,
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                width: 196 * canvasScale,
                height: 56 * canvasScale,
                right: 28 * canvasScale,
                bottom: 22 * canvasScale,
                borderRadius: 999,
                backgroundColor: palette.mint,
                opacity: 0.9,
                transform: "rotate(-8deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 28 * canvasScale,
                bottom: 20 * canvasScale,
                color: palette.ink,
                fontSize: 18 * canvasScale,
                fontWeight: 800,
              }}
            >
              素材を並べる
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          height: 154 * canvasScale,
          padding: `${18 * canvasScale}px ${22 * canvasScale}px`,
          boxSizing: "border-box",
          borderTop: `${Math.max(1, canvasScale)}px solid rgba(24, 50, 76, 0.1)`,
          backgroundColor: "rgba(247, 251, 255, 0.86)",
        }}
      >
        {rows.map((color, index) => (
          <div
            key={color}
            style={{
              position: "relative",
              height: 26 * canvasScale,
              marginBottom: 10 * canvasScale,
              borderRadius: 7 * canvasScale,
              backgroundColor: "rgba(24, 50, 76, 0.07)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${7 + index * 6}%`,
                width: `${46 + index * 10}%`,
                top: 0,
                bottom: 0,
                borderRadius: 7 * canvasScale,
                backgroundColor: color,
              }}
            />
          </div>
        ))}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 12 * canvasScale,
            bottom: 10 * canvasScale,
            left: `${playheadProgress * 100}%`,
            width: Math.max(2, 3 * canvasScale),
            borderRadius: 999,
            backgroundColor: "#F46F8E",
            boxShadow: `0 0 ${10 * canvasScale}px rgba(244, 111, 142, 0.6)`,
          }}
        />
      </div>
    </div>
  );
};

type TaskStackProps = {
  readonly tasks: readonly string[];
  readonly palette: ManualEditingBottleneckPalette;
  readonly canvasScale: number;
};

const TaskStack = ({ tasks, palette, canvasScale }: TaskStackProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const colors = [palette.pink, palette.sky, palette.mint, palette.yellow, palette.lavender];
  const baseStart = Math.round(durationInFrames * 0.25);
  const interval = Math.max(8, Math.round(durationInFrames * 0.085));
  const stackProgress = scaleProgress(frame, durationInFrames, 0.22, 0.34);

  return (
    <div
      style={{
        position: "absolute",
        left: 806 * canvasScale,
        top: 335 * canvasScale,
        width: 486 * canvasScale,
        opacity: stackProgress,
        transform: `translateY(${interpolate(stackProgress, [0, 1], [18, 0]) * canvasScale}px)`,
      }}
    >
      <div
        style={{
          marginBottom: 16 * canvasScale,
          color: palette.ink,
          fontSize: 25 * canvasScale,
          fontWeight: 800,
          letterSpacing: "0.03em",
        }}
      >
        手作業がひとつずつ増える
      </div>
      {tasks.map((task, index) => {
        const revealAt = baseStart + interval * index;
        const progress = clamp(
          spring({
            frame: Math.max(0, frame - revealAt),
            fps,
            config: { damping: 200, mass: 0.6, stiffness: 125 },
          }),
        );
        const cardColor = colors[index % colors.length] ?? palette.sky;
        return (
          <div
            key={task}
            style={{
              height: 64 * canvasScale,
              marginBottom: 11 * canvasScale,
              padding: `0 ${20 * canvasScale}px`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              gap: 15 * canvasScale,
              border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.08)`,
              borderRadius: 18 * canvasScale,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: `0 ${8 * canvasScale}px ${18 * canvasScale}px rgba(73, 111, 142, 0.1)`,
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [44, 0]) * canvasScale}px) scale(${interpolate(progress, [0, 1], [0.92, 1])})`,
              transformOrigin: "left center",
            }}
          >
            <div
              style={{
                width: 34 * canvasScale,
                height: 34 * canvasScale,
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
                borderRadius: "50%",
                backgroundColor: cardColor,
                color: palette.ink,
                fontSize: 17 * canvasScale,
                fontWeight: 900,
              }}
            >
              {index + 1}
            </div>
            <div style={{ flex: 1, color: palette.ink, fontSize: 24 * canvasScale, fontWeight: 800 }}>{task}</div>
            <div
              aria-hidden
              style={{
                color: palette.line,
                fontSize: 26 * canvasScale,
                fontWeight: 900,
              }}
            >
              +
            </div>
          </div>
        );
      })}
    </div>
  );
};

type ClockProps = {
  readonly palette: ManualEditingBottleneckPalette;
  readonly canvasScale: number;
};

const TimeClock = ({ palette, canvasScale }: ClockProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const enterProgress = scaleProgress(frame, durationInFrames, 0.5, 0.64);
  const fastProgress = scaleProgress(frame, durationInFrames, 0.63, 0.88);
  const minuteAngle = interpolate(fastProgress, [0, 1], [0, 760], { easing: Easing.in(Easing.cubic) });
  const hourAngle = interpolate(fastProgress, [0, 1], [0, 260], { easing: Easing.in(Easing.cubic) });

  return (
    <div
      style={{
        position: "absolute",
        right: 152 * canvasScale,
        top: 366 * canvasScale,
        width: 376 * canvasScale,
        color: palette.ink,
        opacity: enterProgress,
        transform: `translateY(${interpolate(enterProgress, [0, 1], [28, 0]) * canvasScale}px) scale(${interpolate(enterProgress, [0, 1], [0.88, 1])})`,
      }}
    >
      <div style={{ textAlign: "center", fontSize: 24 * canvasScale, fontWeight: 800 }}>作業時間</div>
      <div
        style={{
          position: "relative",
          width: 250 * canvasScale,
          height: 250 * canvasScale,
          margin: `${16 * canvasScale}px auto 0`,
          border: `${Math.max(4, 7 * canvasScale)}px solid ${palette.ink}`,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.78)",
          boxShadow: `0 ${14 * canvasScale}px ${28 * canvasScale}px rgba(73, 111, 142, 0.14)`,
        }}
      >
        {[0, 90, 180, 270].map((angle) => (
          <div
            key={angle}
            style={{
              position: "absolute",
              left: "50%",
              top: 12 * canvasScale,
              width: 4 * canvasScale,
              height: 16 * canvasScale,
              borderRadius: 999,
              backgroundColor: palette.ink,
              transformOrigin: `50% ${113 * canvasScale}px`,
              transform: `translateX(-50%) rotate(${angle}deg)`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 8 * canvasScale,
            height: 82 * canvasScale,
            borderRadius: 999,
            backgroundColor: "#F46F8E",
            transformOrigin: `50% 0%`,
            transform: `translate(-50%, 0) rotate(${minuteAngle}deg)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 10 * canvasScale,
            height: 60 * canvasScale,
            borderRadius: 999,
            backgroundColor: palette.ink,
            transformOrigin: `50% 0%`,
            transform: `translate(-50%, 0) rotate(${hourAngle}deg)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 20 * canvasScale,
            height: 20 * canvasScale,
            borderRadius: "50%",
            backgroundColor: palette.yellow,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 20 * canvasScale,
          padding: `${12 * canvasScale}px ${16 * canvasScale}px`,
          borderRadius: 16 * canvasScale,
          backgroundColor: palette.pink,
          textAlign: "center",
          fontSize: 21 * canvasScale,
          fontWeight: 800,
        }}
      >
        時間だけ進んでいく…
      </div>
    </div>
  );
};

/**
 * Opaque 1920×1080 pastel explainer for showing a manual editing bottleneck.
 * It is duration-responsive (recommended 180+ frames), keeps important copy inside
 * the normalized 8% safe zone, and has no audio or alpha output.
 */
export const ManualEditingBottleneck = (props: ManualEditingBottleneckProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const {
    headline,
    softwareLabel,
    tasks,
    conclusion,
    showOutro = MANUAL_EDITING_BOTTLENECK_DEFAULTS.showOutro,
    palette = MANUAL_EDITING_BOTTLENECK_DEFAULTS.palette,
  } = props;
  const canvasScale = Math.min(width / 1920, height / 1080);
  const headingProgress = clamp(
    spring({ frame, fps, config: { damping: 200, mass: 0.76, stiffness: 118 } }),
  );
  const editorProgress = scaleProgress(frame, durationInFrames, 0.1, 0.26);
  const conclusionProgress = clamp(
    spring({
      frame: Math.max(0, frame - Math.round(durationInFrames * 0.74)),
      fps,
      config: { damping: 200, mass: 0.72, stiffness: 120 },
    }),
  );
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
      <PastelBlob color={palette.pink} left={-150 * canvasScale} top={-115 * canvasScale} width={410 * canvasScale} height={250 * canvasScale} rotation={-12} opacity={0.56} />
      <PastelBlob color={palette.sky} right={-130 * canvasScale} top={-140 * canvasScale} width={420 * canvasScale} height={300 * canvasScale} rotation={18} opacity={0.62} />
      <PastelBlob color={palette.mint} right={-80 * canvasScale} bottom={-150 * canvasScale} width={400 * canvasScale} height={290 * canvasScale} rotation={-20} opacity={0.44} />
      <PastelBlob color={palette.yellow} left={-110 * canvasScale} bottom={-170 * canvasScale} width={360 * canvasScale} height={280 * canvasScale} rotation={12} opacity={0.44} />

      <div
        style={{
          position: "absolute",
          left: 154 * canvasScale,
          top: 94 * canvasScale,
          maxWidth: 1_300 * canvasScale,
          opacity: headingProgress,
          transform: `translateY(${interpolate(headingProgress, [0, 1], [-28, 0]) * canvasScale}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14 * canvasScale,
            color: palette.ink,
            fontSize: 23 * canvasScale,
            fontWeight: 800,
            letterSpacing: "0.12em",
          }}
        >
          <span style={{ width: 48 * canvasScale, height: 8 * canvasScale, borderRadius: 999, backgroundColor: palette.pink }} />
          MANUAL WORKFLOW
        </div>
        <div
          style={{
            marginTop: 18 * canvasScale,
            whiteSpace: "pre-line",
            fontSize: 64 * canvasScale,
            lineHeight: 1.17,
            letterSpacing: "-0.035em",
            fontWeight: 900,
          }}
        >
          {headline}
        </div>
      </div>

      <EditorMockup progress={editorProgress} softwareLabel={softwareLabel} palette={palette} canvasScale={canvasScale} />
      <TaskStack tasks={tasks} palette={palette} canvasScale={canvasScale} />
      <TimeClock palette={palette} canvasScale={canvasScale} />

      <div
        style={{
          position: "absolute",
          left: 812 * canvasScale,
          bottom: 98 * canvasScale,
          width: 952 * canvasScale,
          minHeight: 126 * canvasScale,
          padding: `${22 * canvasScale}px ${34 * canvasScale}px`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          borderRadius: 26 * canvasScale,
          backgroundColor: palette.pink,
          boxShadow: `0 ${14 * canvasScale}px ${28 * canvasScale}px rgba(244, 111, 142, 0.17)`,
          opacity: conclusionProgress,
          transform: `translateY(${interpolate(conclusionProgress, [0, 1], [26, 0]) * canvasScale}px) scale(${interpolate(conclusionProgress, [0, 1], [0.96, 1])})`,
          transformOrigin: "bottom center",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "grid",
            placeItems: "center",
            width: 64 * canvasScale,
            height: 64 * canvasScale,
            flex: "0 0 auto",
            marginRight: 20 * canvasScale,
            borderRadius: "50%",
            backgroundColor: palette.yellow,
            fontSize: 35 * canvasScale,
          }}
        >
          ⏱
        </span>
        <span
          style={{
            whiteSpace: "pre-line",
            color: palette.ink,
            fontSize: 34 * canvasScale,
            lineHeight: 1.23,
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}
        >
          {conclusion}
        </span>
      </div>
    </div>
  );
};
