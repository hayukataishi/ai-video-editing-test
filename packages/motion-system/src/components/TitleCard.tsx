import { zColor } from "@remotion/zod-types";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";

const TITLE_CARD_DEFAULTS = {
  eyebrow: "MOTION DESIGN SYSTEM",
  variant: "hero",
  backgroundColor: motionSystemTheme.colors.ink,
  accentColor: motionSystemTheme.colors.accent,
  textColor: motionSystemTheme.colors.paper,
} as const;

/** Props contract for the stable `TitleCard` Composition. */
export const titleCardSchema = z.object({
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(180).optional(),
  eyebrow: z.string().trim().max(80).default(TITLE_CARD_DEFAULTS.eyebrow),
  variant: z.enum(["hero", "minimal"]).default(TITLE_CARD_DEFAULTS.variant),
  logoSrc: z.string().trim().min(1).max(500).optional(),
  // A logical asset ID is resolved by the render pipeline. The component keeps
  // rendering the built-in logo until a concrete URL is supplied as `logoSrc`.
  logoAssetId: z.string().trim().min(1).max(128).optional(),
  backgroundColor: zColor().default(TITLE_CARD_DEFAULTS.backgroundColor),
  accentColor: zColor().default(TITLE_CARD_DEFAULTS.accentColor),
  textColor: zColor().default(TITLE_CARD_DEFAULTS.textColor),
});

export type TitleCardProps = z.output<typeof titleCardSchema>;

export const titleCardDefaultProps: TitleCardProps = {
  title: "AI時代の動画制作基盤",
  subtitle: "Remotion + Palmier Pro + Codex",
  eyebrow: TITLE_CARD_DEFAULTS.eyebrow,
  variant: TITLE_CARD_DEFAULTS.variant,
  logoAssetId: "brand-logo",
  backgroundColor: TITLE_CARD_DEFAULTS.backgroundColor,
  accentColor: TITLE_CARD_DEFAULTS.accentColor,
  textColor: TITLE_CARD_DEFAULTS.textColor,
};

/**
 * A deterministic opening/title primitive. Every visual change is derived from
 * the current frame, so the output is stable in Studio, Storybook and renders.
 */
export const TitleCard = (props: TitleCardProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, height, width } = useVideoConfig();
  const {
    title,
    subtitle,
    logoSrc,
    logoAssetId,
    eyebrow = TITLE_CARD_DEFAULTS.eyebrow,
    variant = TITLE_CARD_DEFAULTS.variant,
    backgroundColor = TITLE_CARD_DEFAULTS.backgroundColor,
    accentColor = TITLE_CARD_DEFAULTS.accentColor,
    textColor = TITLE_CARD_DEFAULTS.textColor,
  } = props;

  const canvasScale = Math.min(width / 1920, height / 1080);
  const safePadding = Math.max(44, 144 * canvasScale);
  const titleDelay = Math.round(fps * 0.2);
  const subtitleDelay = Math.round(fps * 0.38);
  const outroStart = Math.max(0, durationInFrames - Math.round(fps * 0.45));
  const sceneOpacity = interpolate(frame, [outroStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 120 },
  });
  const titleProgress = spring({
    frame: Math.max(0, frame - titleDelay),
    fps,
    config: { damping: 200, mass: 0.8, stiffness: 120 },
  });
  const subtitleProgress = spring({
    frame: Math.max(0, frame - subtitleDelay),
    fps,
    config: { damping: 200, mass: 0.9, stiffness: 110 },
  });
  const accentProgress = interpolate(frame, [0, Math.round(fps * 0.7)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const isMinimal = variant === "minimal";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: isMinimal ? "center" : "space-between",
        padding: safePadding,
        boxSizing: "border-box",
        color: textColor,
        fontFamily: motionSystemTheme.fontFamily,
        background: `radial-gradient(circle at 82% 18%, color-mix(in srgb, ${accentColor} 22%, transparent) 0%, transparent 31%), linear-gradient(135deg, ${backgroundColor} 0%, ${motionSystemTheme.colors.inkElevated} 100%)`,
        opacity: sceneOpacity,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.16,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.16) 1px, transparent 1px)",
          backgroundSize: `${Math.max(28, 64 * canvasScale)}px ${Math.max(28, 64 * canvasScale)}px`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: Math.max(16, 28 * canvasScale),
          opacity: logoProgress,
          translate: `0 ${interpolate(logoProgress, [0, 1], [-18, 0]) * canvasScale}px`,
        }}
      >
        <div
          style={{
            width: Math.max(42, 76 * canvasScale),
            height: Math.max(42, 76 * canvasScale),
            borderRadius: Math.max(12, 20 * canvasScale),
            overflow: "hidden",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            boxShadow: `0 0 ${36 * canvasScale}px color-mix(in srgb, ${accentColor} 30%, transparent)`,
          }}
        >
          <Img
            src={logoSrc ?? staticFile("brand/logo.svg")}
            alt={logoAssetId ? `Logo asset: ${logoAssetId}` : "Motion system logo"}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
        <div
          style={{
            fontSize: Math.max(15, 24 * canvasScale),
            letterSpacing: "0.12em",
            fontWeight: 700,
            color: accentColor,
          }}
        >
          {eyebrow}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: isMinimal ? 1320 * canvasScale : 1500 * canvasScale,
          marginTop: isMinimal ? 0 : Math.max(56, 116 * canvasScale),
          marginBottom: isMinimal ? 0 : Math.max(48, 108 * canvasScale),
          textAlign: isMinimal ? "center" : "left",
        }}
      >
        <div
          style={{
            width: isMinimal ? "18%" : Math.max(96, 230 * canvasScale),
            height: Math.max(5, 9 * canvasScale),
            borderRadius: 999,
            backgroundColor: accentColor,
            margin: isMinimal ? `0 auto ${Math.max(24, 42 * canvasScale)}px` : `0 0 ${Math.max(24, 42 * canvasScale)}px`,
            scale: `${accentProgress} 1`,
            transformOrigin: isMinimal ? "center" : "left",
          }}
        />
        <div
          style={{
            fontSize: Math.max(42, 112 * canvasScale),
            lineHeight: 1.16,
            letterSpacing: "-0.035em",
            fontWeight: 800,
            textWrap: "balance",
            opacity: titleProgress,
            translate: `0 ${interpolate(titleProgress, [0, 1], [34, 0]) * canvasScale}px`,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              maxWidth: isMinimal ? undefined : 1120 * canvasScale,
              marginTop: Math.max(18, 34 * canvasScale),
              fontSize: Math.max(22, 42 * canvasScale),
              lineHeight: 1.45,
              letterSpacing: "0.01em",
              fontWeight: 500,
              color: "rgba(248, 250, 252, 0.78)",
              opacity: subtitleProgress,
              translate: `0 ${interpolate(subtitleProgress, [0, 1], [20, 0]) * canvasScale}px`,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {!isMinimal ? (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: Math.max(12, 20 * canvasScale),
            color: "rgba(248, 250, 252, 0.64)",
            fontSize: Math.max(15, 24 * canvasScale),
            opacity: subtitleProgress,
          }}
        >
          <span
            style={{
              width: Math.max(28, 52 * canvasScale),
              height: 1,
              backgroundColor: accentColor,
            }}
          />
          FRAME-DRIVEN / DETERMINISTIC
        </div>
      ) : null}
    </div>
  );
};
