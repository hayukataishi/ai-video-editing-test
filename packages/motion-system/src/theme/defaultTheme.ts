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
  },
  fontFamily:
    '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Segoe UI", sans-serif',
} as const;

export type MotionSystemTheme = typeof motionSystemTheme;
