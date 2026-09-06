import { zColor } from "@remotion/zod-types";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

import { motionSystemTheme } from "../theme";

const THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS = {
  eyebrow: "AI VIDEO WORKFLOW",
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

const threeToolWorkflowPaletteSchema = z.object({
  background: zColor(),
  ink: zColor(),
  pink: zColor(),
  sky: zColor(),
  mint: zColor(),
  yellow: zColor(),
  lavender: zColor(),
  line: zColor(),
});

export const threeToolWorkflowToolSchema = z.object({
  id: z.string().trim().min(1).max(48).optional(),
  label: z.string().trim().min(1).max(48),
  role: z.string().trim().min(1).max(72),
  tone: z.enum(["sky", "pink", "mint"]).default("sky"),
  kind: z.enum(["editing", "animation", "ai"]).default("editing"),
});

/** Public props for a three-tool, AI-assisted explainer-video workflow. */
export const threeToolVideoWorkflowSchema = z.object({
  eyebrow: z.string().trim().max(72).default(THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS.eyebrow),
  headline: z.string().trim().min(1).max(120),
  tools: z.array(threeToolWorkflowToolSchema).length(3),
  outputLabel: z.string().trim().min(1).max(72),
  summary: z.string().trim().min(1).max(96),
  showOutro: z.boolean().default(THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS.showOutro),
  palette: threeToolWorkflowPaletteSchema.default(THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS.palette),
});

export type ThreeToolWorkflowPalette = z.output<typeof threeToolWorkflowPaletteSchema>;
export type ThreeToolWorkflowTool = z.output<typeof threeToolWorkflowToolSchema>;
export type ThreeToolVideoWorkflowProps = z.output<typeof threeToolVideoWorkflowSchema>;

export const threeToolVideoWorkflowDefaultProps: ThreeToolVideoWorkflowProps = {
  eyebrow: THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS.eyebrow,
  headline: "3つのツールを組み合わせて\nAIで、わかりやすい動画制作へ",
  tools: [
    { id: "palmier-pro", label: "Palmier Pro", role: "編集を整える", tone: "sky", kind: "editing" },
    { id: "remotion", label: "Remotion", role: "図解を動かす", tone: "pink", kind: "animation" },
    { id: "codex", label: "Codex", role: "AIで流れを設計", tone: "mint", kind: "ai" },
  ],
  outputLabel: "わかりやすい解説動画",
  summary: "編集 × AI支援 × アニメーション",
  showOutro: THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS.showOutro,
  palette: THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS.palette,
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

const toneColor = (tone: ThreeToolWorkflowTool["tone"], palette: ThreeToolWorkflowPalette): string => {
  if (tone === "pink") {
    return palette.pink;
  }

  if (tone === "mint") {
    return palette.mint;
  }

  return palette.sky;
};

type ToolIconProps = {
  readonly kind: ThreeToolWorkflowTool["kind"];
  readonly color: string;
  readonly palette: ThreeToolWorkflowPalette;
  readonly canvasScale: number;
};

const ToolIcon = ({ kind, color, palette, canvasScale }: ToolIconProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 1 + interpolate(Math.sin((frame / fps) * Math.PI * 2), [-1, 1], [-0.035, 0.035]);

  if (kind === "editing") {
    const playhead = interpolate(frame, [Math.round(fps * 0.7), Math.round(fps * 4.2)], [0.16, 0.8], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
    return (
      <div
        aria-hidden
        style={{
          position: "relative",
          width: 102 * canvasScale,
          height: 76 * canvasScale,
          padding: 12 * canvasScale,
          boxSizing: "border-box",
          borderRadius: 20 * canvasScale,
          backgroundColor: "rgba(255, 255, 255, 0.74)",
          border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.08)`,
          overflow: "hidden",
        }}
      >
        {[palette.pink, color, palette.mint].map((rowColor, index) => (
          <div
            key={rowColor}
            style={{
              position: "relative",
              height: 12 * canvasScale,
              marginBottom: 7 * canvasScale,
              borderRadius: 999,
              backgroundColor: "rgba(24, 50, 76, 0.07)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${5 + index * 8}%`,
                width: `${53 + index * 9}%`,
                borderRadius: 999,
                backgroundColor: rowColor,
              }}
            />
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            top: 8 * canvasScale,
            bottom: 8 * canvasScale,
            left: `${playhead * 100}%`,
            width: Math.max(2, 3 * canvasScale),
            borderRadius: 999,
            backgroundColor: "#F46F8E",
          }}
        />
      </div>
    );
  }

  if (kind === "animation") {
    const shift = interpolate(frame, [0, Math.max(1, Math.round(fps * 1.1))], [0, 18 * canvasScale], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return (
      <div
        aria-hidden
        style={{
          position: "relative",
          width: 102 * canvasScale,
          height: 76 * canvasScale,
          borderRadius: 20 * canvasScale,
          backgroundColor: "rgba(255, 255, 255, 0.74)",
          border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.08)`,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", width: 38 * canvasScale, height: 38 * canvasScale, left: 17 * canvasScale, top: 20 * canvasScale, borderRadius: 12 * canvasScale, backgroundColor: palette.yellow }} />
        <div style={{ position: "absolute", width: 38 * canvasScale, height: 38 * canvasScale, left: 36 * canvasScale + shift, top: 18 * canvasScale, borderRadius: "50%", backgroundColor: color, opacity: 0.92 }} />
        <div style={{ position: "absolute", width: 10 * canvasScale, height: 10 * canvasScale, left: 76 * canvasScale, top: 33 * canvasScale, borderRadius: "50%", backgroundColor: palette.mint }} />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        display: "grid",
        placeItems: "center",
        width: 102 * canvasScale,
        height: 76 * canvasScale,
        borderRadius: 20 * canvasScale,
        backgroundColor: "rgba(255, 255, 255, 0.74)",
        border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.08)`,
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 48 * canvasScale,
          height: 48 * canvasScale,
          borderRadius: "50%",
          backgroundColor: color,
          color: palette.ink,
          fontSize: 21 * canvasScale,
          fontWeight: 900,
          scale: `${pulse}`,
        }}
      >
        AI
      </span>
      {[
        { left: -8, top: 8 },
        { left: 78, top: 8 },
        { left: -8, top: 58 },
        { left: 78, top: 58 },
      ].map(({ left, top }, index) => (
        <span
          key={index}
          style={{
            position: "absolute",
            left: left * canvasScale,
            top: top * canvasScale,
            width: 8 * canvasScale,
            height: 8 * canvasScale,
            borderRadius: "50%",
            backgroundColor: index % 2 === 0 ? palette.yellow : palette.pink,
            scale: `${pulse}`,
          }}
        />
      ))}
    </div>
  );
};

type ToolCardProps = {
  readonly index: number;
  readonly tool: ThreeToolWorkflowTool;
  readonly palette: ThreeToolWorkflowPalette;
  readonly canvasScale: number;
};

const ToolCard = ({ index, tool, palette, canvasScale }: ToolCardProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const revealAt = Math.round(durationInFrames * (0.12 + index * 0.09));
  const progress = clamp(
    spring({
      frame: Math.max(0, frame - revealAt),
      fps,
      config: { damping: 200, mass: 0.7, stiffness: 125 },
    }),
  );
  const cardColor = toneColor(tool.tone, palette);
  const roleProgress = relativeProgress(frame, durationInFrames, 0.18 + index * 0.08, 0.31 + index * 0.08);

  return (
    <div
      style={{
        width: 480 * canvasScale,
        height: 290 * canvasScale,
        padding: 28 * canvasScale,
        boxSizing: "border-box",
        border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.09)`,
        borderRadius: 30 * canvasScale,
        backgroundColor: "rgba(255, 255, 255, 0.93)",
        boxShadow: `0 ${16 * canvasScale}px ${34 * canvasScale}px rgba(73, 111, 142, 0.13)`,
        opacity: progress,
        translate: `0 ${interpolate(progress, [0, 1], [34, 0]) * canvasScale}px`,
        scale: `${interpolate(progress, [0, 1], [0.94, 1])}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18 * canvasScale }}>
        <ToolIcon kind={tool.kind} color={cardColor} palette={palette} canvasScale={canvasScale} />
        <div
          style={{
            display: "grid",
            placeItems: "center",
            minWidth: 52 * canvasScale,
            height: 34 * canvasScale,
            padding: `0 ${11 * canvasScale}px`,
            boxSizing: "border-box",
            borderRadius: 999,
            backgroundColor: cardColor,
            color: palette.ink,
            fontSize: 17 * canvasScale,
            fontWeight: 900,
          }}
        >
          0{index + 1}
        </div>
      </div>
      <div
        style={{
          marginTop: 24 * canvasScale,
          color: palette.ink,
          fontFamily: motionSystemTheme.fontFamilyRounded,
          fontSize: 36 * canvasScale,
          lineHeight: 1.1,
          fontWeight: 900,
          letterSpacing: "-0.035em",
        }}
      >
        {tool.label}
      </div>
      <div
        style={{
          width: 66 * canvasScale,
          height: 7 * canvasScale,
          marginTop: 17 * canvasScale,
          borderRadius: 999,
          backgroundColor: cardColor,
          opacity: roleProgress,
          scale: `${roleProgress} 1`,
          transformOrigin: "left center",
        }}
      />
      <div
        style={{
          marginTop: 16 * canvasScale,
          color: palette.ink,
          fontSize: 24 * canvasScale,
          lineHeight: 1.35,
          fontWeight: 800,
          opacity: roleProgress,
          translate: `0 ${interpolate(roleProgress, [0, 1], [9, 0]) * canvasScale}px`,
        }}
      >
        {tool.role}
      </div>
    </div>
  );
};

type ConnectorLineProps = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly rotation: number;
  readonly color: string;
  readonly progress: number;
  readonly canvasScale: number;
};

const ConnectorLine = ({ left, top, width, rotation, color, progress, canvasScale }: ConnectorLineProps) => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      left: left * canvasScale,
      top: top * canvasScale,
      width: width * canvasScale,
      height: Math.max(3, 5 * canvasScale),
      borderRadius: 999,
      backgroundColor: color,
      opacity: progress,
      transform: `rotate(${rotation}deg) scaleX(${progress})`,
      transformOrigin: "left center",
    }}
  >
    <div
      style={{
        position: "absolute",
        right: -Math.max(4, 7 * canvasScale),
        top: "50%",
        width: Math.max(10, 18 * canvasScale),
        height: Math.max(10, 18 * canvasScale),
        borderTop: `${Math.max(2, 3 * canvasScale)}px solid ${color}`,
        borderRight: `${Math.max(2, 3 * canvasScale)}px solid ${color}`,
        translate: "0 -50%",
        rotate: "45deg",
      }}
    />
  </div>
);

/**
 * Opaque 1920×1080 pastel workflow diagram. Recommended duration is 210+ frames;
 * important copy remains inside the 8% safe zone. It has no audio and no alpha output.
 */
export const ThreeToolVideoWorkflow = (props: ThreeToolVideoWorkflowProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const {
    eyebrow = THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS.eyebrow,
    headline,
    tools,
    outputLabel,
    summary,
    showOutro = THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS.showOutro,
    palette = THREE_TOOL_VIDEO_WORKFLOW_DEFAULTS.palette,
  } = props;
  const canvasScale = Math.min(width / 1920, height / 1080);
  const headlineLineCount = headline.split("\n").length;
  const longHeadlineLayout = headlineLineCount > 2;
  const cardTop = longHeadlineLayout ? 384 : 326;
  const flowOffset = longHeadlineLayout ? 58 : 0;
  const outputTop = longHeadlineLayout ? 818 : 782;
  const headingProgress = clamp(
    spring({ frame, fps, config: { damping: 200, mass: 0.76, stiffness: 118 } }),
  );
  const connectorProgress = relativeProgress(frame, durationInFrames, 0.45, 0.63);
  const outputProgress = clamp(
    spring({
      frame: Math.max(0, frame - Math.round(durationInFrames * 0.61)),
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
          top: (longHeadlineLayout ? 62 : 82) * canvasScale,
          maxWidth: 1_430 * canvasScale,
          opacity: headingProgress,
          translate: `0 ${interpolate(headingProgress, [0, 1], [-28, 0]) * canvasScale}px`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14 * canvasScale,
            color: palette.ink,
            fontSize: 22 * canvasScale,
            fontWeight: 800,
            letterSpacing: "0.12em",
          }}
        >
          <span style={{ width: 48 * canvasScale, height: 8 * canvasScale, borderRadius: 999, backgroundColor: palette.pink }} />
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 16 * canvasScale,
            whiteSpace: "pre-line",
            color: palette.ink,
            fontSize: (longHeadlineLayout ? 46 : 60) * canvasScale,
            lineHeight: 1.18,
            letterSpacing: "-0.04em",
            fontWeight: 900,
          }}
        >
          {headline}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 154 * canvasScale,
          top: cardTop * canvasScale,
          display: "flex",
          gap: 86 * canvasScale,
        }}
      >
        {tools.map((tool, index) => (
          <ToolCard key={tool.id ?? tool.label} index={index} tool={tool} palette={palette} canvasScale={canvasScale} />
        ))}
      </div>

      <ConnectorLine left={394} top={630 + flowOffset} width={572} rotation={8.8} color={palette.sky} progress={connectorProgress} canvasScale={canvasScale} />
      <ConnectorLine left={960} top={718 + flowOffset} width={572} rotation={-8.8} color={palette.mint} progress={connectorProgress} canvasScale={canvasScale} />
      <ConnectorLine left={960} top={630 + flowOffset} width={88} rotation={90} color={palette.pink} progress={connectorProgress} canvasScale={canvasScale} />

      <div
        style={{
          position: "absolute",
          left: 887 * canvasScale,
          top: (674 + flowOffset) * canvasScale,
          display: "grid",
          placeItems: "center",
          width: 146 * canvasScale,
          height: 56 * canvasScale,
          borderRadius: 999,
          backgroundColor: palette.yellow,
          color: palette.ink,
          fontSize: 21 * canvasScale,
          fontWeight: 900,
          letterSpacing: "0.03em",
          opacity: connectorProgress,
          scale: `${interpolate(connectorProgress, [0, 1], [0.82, 1])}`,
        }}
      >
        AIでつなぐ
      </div>

      <div
        style={{
          position: "absolute",
          left: 430 * canvasScale,
          top: outputTop * canvasScale,
          width: 1_060 * canvasScale,
          minHeight: 150 * canvasScale,
          padding: `${22 * canvasScale}px ${28 * canvasScale}px`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 24 * canvasScale,
          border: `${Math.max(1, 2 * canvasScale)}px solid rgba(24, 50, 76, 0.09)`,
          borderRadius: 28 * canvasScale,
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          boxShadow: `0 ${16 * canvasScale}px ${32 * canvasScale}px rgba(73, 111, 142, 0.14)`,
          opacity: outputProgress,
          translate: `0 ${interpolate(outputProgress, [0, 1], [34, 0]) * canvasScale}px`,
          scale: `${interpolate(outputProgress, [0, 1], [0.94, 1])}`,
        }}
      >
        <div
          aria-hidden
          style={{
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
            width: 94 * canvasScale,
            height: 94 * canvasScale,
            borderRadius: 24 * canvasScale,
            background: `linear-gradient(135deg, ${palette.sky} 0%, ${palette.lavender} 100%)`,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              marginLeft: 7 * canvasScale,
              borderTop: `${17 * canvasScale}px solid transparent`,
              borderBottom: `${17 * canvasScale}px solid transparent`,
              borderLeft: `${28 * canvasScale}px solid ${palette.ink}`,
            }}
          />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: palette.ink, fontFamily: motionSystemTheme.fontFamilyRounded, fontSize: 38 * canvasScale, lineHeight: 1.12, fontWeight: 900, letterSpacing: "-0.035em" }}>{outputLabel}</div>
          <div style={{ marginTop: 12 * canvasScale, color: palette.ink, fontSize: 23 * canvasScale, fontWeight: 800, opacity: 0.7 }}>{summary}</div>
        </div>
        <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 9 * canvasScale }}>
          {[palette.sky, palette.pink, palette.mint].map((color) => (
            <span key={color} style={{ width: 20 * canvasScale, height: 20 * canvasScale, borderRadius: "50%", backgroundColor: color }} />
          ))}
        </div>
      </div>
    </div>
  );
};
