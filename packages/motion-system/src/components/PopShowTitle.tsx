import { zColor } from "@remotion/zod-types";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";

const POP_SHOW_TITLE_DEFAULTS = {
  lines: ["がんばれ!", "はゆかしゃちょう!"],
  variant: "corner-bug",
  anchor: "top-left",
  showIntro: false,
  palette: {
    mainFill: "#FFFDFB",
    secondFill: "#F047A9",
    innerOutline: "#742351",
    outerOutline: "#31D957",
    shadow: "#3D2636",
    plaque: "#20D448",
    plaqueOutline: "#196B36",
    backdrop: "#F8DD6C",
    decoration: "#F2A4C8",
  },
} as const;

const popShowTitlePaletteSchema = z.object({
  mainFill: zColor(),
  secondFill: zColor(),
  innerOutline: zColor(),
  outerOutline: zColor(),
  shadow: zColor(),
  plaque: zColor(),
  plaqueOutline: zColor(),
  backdrop: zColor(),
  decoration: zColor(),
});

/** Props contract for the stable `PopShowTitle` Composition. */
export const popShowTitleSchema = z.object({
  lines: z.array(z.string().trim().min(1).max(40)).min(1).max(3),
  variant: z
    .enum(["corner-bug", "title-card"])
    .default(POP_SHOW_TITLE_DEFAULTS.variant),
  anchor: z.enum(["top-left", "top-right"]).default(POP_SHOW_TITLE_DEFAULTS.anchor),
  showIntro: z.boolean().default(POP_SHOW_TITLE_DEFAULTS.showIntro),
  palette: popShowTitlePaletteSchema.default(POP_SHOW_TITLE_DEFAULTS.palette),
});

export type PopShowTitleProps = z.output<typeof popShowTitleSchema>;

export const popShowTitleDefaultProps: PopShowTitleProps = {
  lines: [...POP_SHOW_TITLE_DEFAULTS.lines],
  variant: POP_SHOW_TITLE_DEFAULTS.variant,
  anchor: POP_SHOW_TITLE_DEFAULTS.anchor,
  showIntro: POP_SHOW_TITLE_DEFAULTS.showIntro,
  palette: POP_SHOW_TITLE_DEFAULTS.palette,
};

type OutlinedTextProps = {
  readonly text: string;
  readonly fontSize: number;
  readonly fill: string;
  readonly innerOutline: string;
  readonly outerOutline: string;
  readonly shadow: string;
  readonly rotate: number;
};

const OutlinedText = ({
  text,
  fontSize,
  fill,
  innerOutline,
  outerOutline,
  shadow,
  rotate,
}: OutlinedTextProps) => {
  const innerStroke = Math.max(2, Math.round(fontSize * 0.04));
  const outerStroke = Math.max(innerStroke + 3, Math.round(fontSize * 0.105));
  const shadowStroke = outerStroke + Math.max(2, Math.round(fontSize * 0.02));
  const baseTextStyle = {
    display: "block",
    color: fill,
    fontFamily: motionSystemTheme.fontFamilyRounded,
    fontSize,
    fontWeight: 700,
    fontSynthesis: "none",
    letterSpacing: "0.01em",
    lineHeight: 1,
    whiteSpace: "nowrap",
  } as const;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "center",
      }}
    >
      <span
        aria-hidden
        style={{
          ...baseTextStyle,
          position: "absolute",
          inset: 0,
          zIndex: 0,
          color: shadow,
          WebkitTextStroke: `${shadowStroke}px ${shadow}`,
          translate: `${Math.max(2, fontSize * 0.025)}px ${Math.max(3, fontSize * 0.035)}px`,
        }}
      >
        {text}
      </span>
      <span
        aria-hidden
        style={{
          ...baseTextStyle,
          position: "absolute",
          inset: 0,
          zIndex: 1,
          color: outerOutline,
          WebkitTextStroke: `${outerStroke}px ${outerOutline}`,
        }}
      >
        {text}
      </span>
      <span
        aria-hidden
        style={{
          ...baseTextStyle,
          position: "absolute",
          inset: 0,
          zIndex: 2,
          color: fill,
          WebkitTextStroke: `${innerStroke}px ${innerOutline}`,
        }}
      >
        {text}
      </span>
      <span style={{ ...baseTextStyle, position: "relative", zIndex: 3 }}>{text}</span>
    </span>
  );
};

const fittedFontSize = (
  nominalSize: number,
  availableWidth: number,
  text: string,
): number => {
  const characterCount = Math.max(1, Array.from(text).length);
  const estimatedCharacterWidth = 0.98;
  return Math.min(
    nominalSize,
    availableWidth / (characterCount * estimatedCharacterWidth + 0.2),
  );
};

/**
 * A pop-logo lockup for a reusable show title. It supports a transparent
 * corner bug (alpha-capable ProRes 4444) and an opaque title-card preview.
 * The important logo area stays within the conventional 8% safe zone on a
 * 16:9 canvas; it has no audio. The recommended duration is 300 frames at
 * 30fps, although a static corner bug can be rendered for a longer placement.
 */
export const PopShowTitle = (props: PopShowTitleProps) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const {
    lines,
    variant = POP_SHOW_TITLE_DEFAULTS.variant,
    anchor = POP_SHOW_TITLE_DEFAULTS.anchor,
    showIntro = POP_SHOW_TITLE_DEFAULTS.showIntro,
    palette = POP_SHOW_TITLE_DEFAULTS.palette,
  } = props;
  const isTitleCard = variant === "title-card";
  const isRightAligned = anchor === "top-right";
  const canvasScale = Math.min(width / 1920, height / 1080);
  const safeSideInset = Math.max(32, width * 0.08);
  const safeTopInset = Math.max(32, height * 0.08);
  const lockupWidth = isTitleCard
    ? Math.min(width * 0.8, 1_460 * canvasScale)
    : Math.min(width * 0.38, 720 * canvasScale);
  const primaryFontSize = fittedFontSize(
    (isTitleCard ? 184 : 116) * canvasScale,
    lockupWidth * 0.88,
    lines[0] ?? "",
  );
  const introProgress = spring({
    frame: showIntro ? frame : Math.round(fps * 2),
    fps,
    config: { damping: 18, mass: 0.62, stiffness: 155 },
  });
  const introScale = interpolate(introProgress, [0, 1], [0.84, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const introOffset = interpolate(introProgress, [0, 1], [-34, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: isTitleCard ? palette.backdrop : "transparent",
      }}
    >
      {isTitleCard ? (
        <>
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "13%",
              left: "-4%",
              width: "28%",
              aspectRatio: "1",
              borderRadius: "46% 54% 48% 52% / 62% 44% 56% 38%",
              backgroundColor: palette.decoration,
              opacity: 0.48,
              rotate: "-14deg",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: "-7%",
              bottom: "8%",
              width: "31%",
              aspectRatio: "1",
              borderRadius: "54% 46% 58% 42% / 38% 62% 40% 60%",
              backgroundColor: palette.decoration,
              opacity: 0.42,
              rotate: "22deg",
            }}
          />
        </>
      ) : null}

      <div
        style={{
          position: "absolute",
          zIndex: 1,
          width: lockupWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: isRightAligned && !isTitleCard ? "flex-end" : "center",
          textAlign: isRightAligned && !isTitleCard ? "right" : "center",
          opacity: introProgress,
          scale: `${introScale}`,
          translate: isTitleCard
            ? `-50% calc(-50% + ${introOffset * canvasScale}px)`
            : `0 ${introOffset * canvasScale}px`,
          ...(isTitleCard
            ? { left: "50%", top: "50%" }
            : isRightAligned
              ? { right: safeSideInset, top: safeTopInset }
              : { left: safeSideInset, top: safeTopInset }),
        }}
      >
        <OutlinedText
          text={lines[0] ?? ""}
          fontSize={primaryFontSize}
          fill={palette.mainFill}
          innerOutline={palette.innerOutline}
          outerOutline={palette.outerOutline}
          shadow={palette.shadow}
          rotate={-3}
        />
        {lines.slice(1).map((line, index) => (
          <div
            key={`${line}-${index}`}
            style={{
              marginTop: Math.max(10, 18 * canvasScale),
              padding: `${Math.max(4, 9 * canvasScale)}px ${Math.max(14, 24 * canvasScale)}px`,
              border: `${Math.max(2, 4 * canvasScale)}px solid ${palette.plaqueOutline}`,
              borderRadius: Math.max(16, 28 * canvasScale),
              backgroundColor: palette.plaque,
              boxShadow: `0 ${Math.max(5, 10 * canvasScale)}px 0 ${palette.shadow}`,
              rotate: `${index % 2 === 0 ? 1.6 : -1.2}deg`,
            }}
          >
            <OutlinedText
              text={line}
              fontSize={fittedFontSize(
                (isTitleCard ? 132 : 78) * canvasScale,
                lockupWidth * 0.84,
                line,
              )}
              fill={palette.secondFill}
              innerOutline={palette.mainFill}
              outerOutline={palette.innerOutline}
              shadow={palette.shadow}
              rotate={0}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
