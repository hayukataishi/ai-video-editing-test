import { useId } from "react";

import { zColor } from "@remotion/zod-types";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";

const PAINTED_LOWER_THIRD_DEFAULTS = {
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
} as const;

const paintPaletteSchema = z.object({
  mint: zColor(),
  peach: zColor(),
  yellow: zColor(),
  name: zColor(),
  nameOutline: zColor(),
  roleSurface: zColor(),
  roleText: zColor(),
});

/** Props contract for the stable `PaintedLowerThird` Composition. */
export const paintedLowerThirdSchema = z.object({
  name: z.string().trim().min(1).max(40),
  role: z.string().trim().min(1).max(60),
  variant: z.enum(["standard", "compact"]).default(PAINTED_LOWER_THIRD_DEFAULTS.variant),
  anchor: z
    .enum(["bottom-left", "bottom-right"])
    .default(PAINTED_LOWER_THIRD_DEFAULTS.anchor),
  showOutro: z.boolean().default(PAINTED_LOWER_THIRD_DEFAULTS.showOutro),
  colors: paintPaletteSchema.default(PAINTED_LOWER_THIRD_DEFAULTS.colors),
});

export type PaintedLowerThirdProps = z.output<typeof paintedLowerThirdSchema>;

export const paintedLowerThirdDefaultProps: PaintedLowerThirdProps = {
  name: "山田 花子",
  role: "俳優",
  variant: PAINTED_LOWER_THIRD_DEFAULTS.variant,
  anchor: PAINTED_LOWER_THIRD_DEFAULTS.anchor,
  showOutro: PAINTED_LOWER_THIRD_DEFAULTS.showOutro,
  colors: PAINTED_LOWER_THIRD_DEFAULTS.colors,
};

const REVEAL_BANDS = [
  { y: -24, height: 70, lead: -9 },
  { y: 22, height: 76, lead: 13 },
  { y: 74, height: 72, lead: -4 },
  { y: 122, height: 78, lead: 21 },
  { y: 174, height: 74, lead: -12 },
  { y: 222, height: 78, lead: 15 },
  { y: 274, height: 76, lead: -3 },
  { y: 324, height: 72, lead: 11 },
  { y: 370, height: 74, lead: -10 },
] as const;

const MINT_PATH =
  "M13 214 C38 155 109 109 205 90 C287 74 389 72 432 86 C458 95 450 112 477 127 C513 149 505 196 481 231 C446 280 374 312 287 336 C201 360 91 367 42 323 C18 301 15 257 13 214 Z";
const MINT_WASH =
  "M32 204 C68 149 143 119 230 103 C313 88 390 91 436 108 C391 126 402 156 430 184 C392 222 320 252 245 276 C148 305 76 297 32 255 Z";
const PEACH_PATH =
  "M195 250 C233 190 306 142 393 120 C483 98 593 95 650 116 C683 128 670 147 696 166 C723 187 715 231 688 260 C639 312 537 342 441 361 C349 380 237 382 201 334 C182 309 183 278 195 250 Z";
const PEACH_WASH =
  "M228 245 C274 196 347 163 428 145 C507 128 590 130 645 146 C618 176 628 209 657 235 C608 277 524 300 435 318 C347 335 261 324 218 288 Z";
const YELLOW_PATH =
  "M478 212 C517 159 588 133 679 129 C766 124 858 142 898 171 C920 187 909 203 930 222 C955 245 941 281 910 302 C857 340 760 359 666 363 C587 366 516 350 486 319 C461 293 458 242 478 212 Z";
const YELLOW_WASH =
  "M508 214 C553 174 621 154 699 153 C780 152 850 168 893 190 C866 214 878 242 899 264 C847 298 762 314 684 315 C610 316 542 300 505 273 Z";

type PaintStrokeProps = {
  readonly clipId: string;
  readonly filterId: string;
  readonly color: string;
  readonly path: string;
  readonly washPath: string;
  readonly progress: number;
};

type RevealClipPathProps = Pick<PaintStrokeProps, "clipId" | "progress">;

/** The uneven leading edge makes the left-to-right reveal resemble a wet brush. */
const RevealClipPath = ({ clipId, progress }: RevealClipPathProps) => {
  const reveal = progress * 1_050;

  return (
    <clipPath id={clipId}>
      {REVEAL_BANDS.map((band) => (
        <rect
          key={band.y}
          x={-24}
          y={band.y}
          width={progress === 0 ? 0 : Math.max(0, reveal + band.lead)}
          height={band.height}
        />
      ))}
    </clipPath>
  );
};

/** A fixed-seed SVG brush layer with watercolor wash and a rough outer edge. */
const PaintStroke = ({
  clipId,
  filterId,
  color,
  path,
  washPath,
}: PaintStrokeProps) => {
  return (
    <g clipPath={`url(#${clipId})`}>
      <g filter={`url(#${filterId})`}>
        <path d={path} fill={color} opacity={0.9} />
        <path d={washPath} fill={motionSystemTheme.colors.paper} opacity={0.16} />
        <path d={washPath} fill={color} opacity={0.3} transform="translate(12 8)" />
      </g>
      <path
        d={path}
        fill="none"
        stroke={motionSystemTheme.colors.paper}
        strokeOpacity={0.16}
        strokeWidth={7}
        strokeLinecap="round"
      />
    </g>
  );
};

/**
 * A transparent 1920×1080 lower third inspired by layered watercolor strokes.
 *
 * Recommended duration is 150 frames at 30fps. Important text remains inside
 * the 8% side and bottom safe zones; it has no audio and is suitable for an
 * alpha-enabled render (for example, ProRes 4444) over Palmier footage.
 */
export const PaintedLowerThird = (props: PaintedLowerThirdProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, height, width } = useVideoConfig();
  const rawInstanceId = useId();
  const instanceId = rawInstanceId.replace(/[^a-zA-Z0-9_-]/g, "");
  const {
    name,
    role,
    variant = PAINTED_LOWER_THIRD_DEFAULTS.variant,
    anchor = PAINTED_LOWER_THIRD_DEFAULTS.anchor,
    showOutro = PAINTED_LOWER_THIRD_DEFAULTS.showOutro,
    colors = PAINTED_LOWER_THIRD_DEFAULTS.colors,
  } = props;
  const isCompact = variant === "compact";
  const isRightAligned = anchor === "bottom-right";
  const canvasScale = Math.min(width / 1920, height / 1080);
  const safeSide = Math.max(32, width * 0.08);
  const safeBottom = Math.max(32, height * 0.08);
  const brushOverflow = Math.max(34, 94 * canvasScale);
  const lowerThirdWidth = (isCompact ? 760 : 920) * canvasScale;
  const lowerThirdHeight = (isCompact ? 298 : 340) * canvasScale;
  const textInset = (isCompact ? 88 : 100) * canvasScale;
  const nameCharacters = Array.from(name);
  const nominalNameFontSize = (isCompact ? 86 : 108) * canvasScale;
  const maxNameWidth = (isCompact ? 540 : 650) * canvasScale;
  const nameFontSize = Math.max(
    50 * canvasScale,
    Math.min(
      nominalNameFontSize,
      maxNameWidth / Math.max(4, nameCharacters.length * 0.88),
    ),
  );
  const brushProgresses = [
    interpolate(frame, [0, 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
    interpolate(frame, [5, 17], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
    interpolate(frame, [10, 22], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  ] as const;
  const roleProgress = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 200, mass: 0.58, stiffness: 145 },
  });
  const outroStart = Math.max(42, durationInFrames - Math.max(12, Math.round(fps * 0.4)));
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
        position: "absolute",
        width: lowerThirdWidth,
        height: lowerThirdHeight,
        bottom: safeBottom,
        ...(isRightAligned
          ? { right: Math.max(0, safeSide - brushOverflow) }
          : { left: Math.max(0, safeSide - brushOverflow) }),
        opacity: sceneOpacity,
        overflow: "visible",
      }}
    >
      <svg
        aria-hidden
        viewBox="0 0 1000 420"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          scale: isRightAligned ? "-1 1" : "1 1",
        }}
      >
        <defs>
          <filter
            id={`${instanceId}-mint-texture`}
            x="-8%"
            y="-12%"
            width="116%"
            height="124%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.075"
              numOctaves="2"
              seed="17"
              result="mintNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="mintNoise"
              scale="10"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter
            id={`${instanceId}-peach-texture`}
            x="-8%"
            y="-12%"
            width="116%"
            height="124%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.08"
              numOctaves="2"
              seed="29"
              result="peachNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="peachNoise"
              scale="9"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter
            id={`${instanceId}-yellow-texture`}
            x="-8%"
            y="-12%"
            width="116%"
            height="124%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014 0.07"
              numOctaves="2"
              seed="41"
              result="yellowNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="yellowNoise"
              scale="10"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <RevealClipPath
            clipId={`${instanceId}-mint-reveal`}
            progress={brushProgresses[0]}
          />
          <RevealClipPath
            clipId={`${instanceId}-peach-reveal`}
            progress={brushProgresses[1]}
          />
          <RevealClipPath
            clipId={`${instanceId}-yellow-reveal`}
            progress={brushProgresses[2]}
          />
        </defs>
        <PaintStroke
          clipId={`${instanceId}-mint-reveal`}
          filterId={`${instanceId}-mint-texture`}
          color={colors.mint}
          path={MINT_PATH}
          washPath={MINT_WASH}
          progress={brushProgresses[0]}
        />
        <PaintStroke
          clipId={`${instanceId}-peach-reveal`}
          filterId={`${instanceId}-peach-texture`}
          color={colors.peach}
          path={PEACH_PATH}
          washPath={PEACH_WASH}
          progress={brushProgresses[1]}
        />
        <PaintStroke
          clipId={`${instanceId}-yellow-reveal`}
          filterId={`${instanceId}-yellow-texture`}
          color={colors.yellow}
          path={YELLOW_PATH}
          washPath={YELLOW_WASH}
          progress={brushProgresses[2]}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          zIndex: 1,
          bottom: 0,
          ...(isRightAligned ? { right: textInset, alignItems: "flex-end" } : { left: textInset, alignItems: "flex-start" }),
          maxWidth: maxNameWidth,
          display: "flex",
          flexDirection: "column",
          color: colors.name,
          fontFamily: motionSystemTheme.fontFamilyRounded,
          textAlign: isRightAligned ? "right" : "left",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: isRightAligned ? "flex-end" : "flex-start",
            whiteSpace: "pre",
            fontSize: nameFontSize,
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: "0.04em",
            WebkitTextStroke: `${Math.max(3, 8 * canvasScale)}px ${colors.nameOutline}`,
            paintOrder: "stroke fill",
            textShadow: `0 ${Math.max(2, 4 * canvasScale)}px ${Math.max(3, 7 * canvasScale)}px rgba(34, 34, 34, 0.12)`,
          }}
        >
          {nameCharacters.map((character, index) => {
            const characterProgress = spring({
              frame: Math.max(0, frame - 16 - index * 3),
              fps,
              config: { damping: 200, mass: 0.48, stiffness: 156 },
            });

            return (
              <span
                key={`${character}-${index}`}
                style={{
                  display: "inline-block",
                  opacity: characterProgress,
                  translate: `0 ${interpolate(characterProgress, [0, 1], [20, 0]) * canvasScale}px`,
                  scale: `${interpolate(characterProgress, [0, 1], [0.9, 1])}`,
                }}
              >
                {character === " " ? "\u00A0" : character}
              </span>
            );
          })}
        </div>

        <div
          style={{
            marginTop: Math.max(10, 16 * canvasScale),
            padding: `${Math.max(8, 12 * canvasScale)}px ${Math.max(22, 34 * canvasScale)}px`,
            borderRadius: 999,
            backgroundColor: colors.roleSurface,
            color: colors.roleText,
            fontSize: Math.max(22, (isCompact ? 32 : 40) * canvasScale),
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            opacity: roleProgress,
            scale: `${roleProgress} 1`,
            transformOrigin: isRightAligned ? "right center" : "left center",
            boxShadow: `0 ${Math.max(3, 6 * canvasScale)}px ${Math.max(8, 16 * canvasScale)}px rgba(34, 34, 34, 0.1)`,
          }}
        >
          <span
            style={{
              display: "inline-block",
              opacity: interpolate(roleProgress, [0.35, 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: `0 ${interpolate(roleProgress, [0, 1], [8, 0]) * canvasScale}px`,
            }}
          >
            {role}
          </span>
        </div>
      </div>
    </div>
  );
};
