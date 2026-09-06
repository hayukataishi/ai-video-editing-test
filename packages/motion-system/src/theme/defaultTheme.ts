export const motionSystemTheme = {
  colors: {
    ink: "#071525",
    inkElevated: "#0f2742",
    paper: "#f8fafc",
    muted: "#b7c5d7",
    accent: "#6ee7f9",
    accentDeep: "#0284c7",
    connector: "#7dd3fc",
    success: "#86efac",
    watercolorMint: "#CBE3D4",
    watercolorPeach: "#FECCB7",
    watercolorYellow: "#FFE7AC",
    charcoal: "#4E4E4D",
    pastelPaper: "#FFFDF9",
    pastelInk: "#18324C",
    pastelPink: "#F8CEDB",
    pastelSky: "#CFE9FF",
    pastelLavender: "#E1DAFF",
    pastelLine: "#9DC3DD",
  },
  fontFamily:
    '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Segoe UI", sans-serif',
  fontFamilyRounded:
    '"M PLUS Rounded 1c", "Hiragino Maru Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif',
} as const;

export type MotionSystemTheme = typeof motionSystemTheme;
