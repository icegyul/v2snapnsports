export const tokens = {
  color: {
    bg: { base: "#121416", surface: "#1C2023", elevated: "#282D31", floating: "#353C41" },
    text: { primary: "#F7F8F8", secondary: "#C5CBD0", muted: "#9AA4AA", inverse: "#0D160F" },
    accent: { primary: "#72DD7A", pitch: "#62D36D", focus: "#A0F0A6", pressed: "#55C85F" }
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 12, lg: 18, pill: 999 },
  touch: { minimum: 44, bottomNav: 64 }
} as const;
