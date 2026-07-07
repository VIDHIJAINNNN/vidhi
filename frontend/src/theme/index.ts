export const colors = {
  primary: "#2563EB",
  primaryDark: "#1E40AF",
  primaryLight: "#DBEAFE",
  bg: "#FFFFFF",
  bg2: "#F8F9FA",
  bg3: "#F3F4F6",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  green: "#10B981",
  greenLight: "#D1FAE5",
  gold: "#F59E0B",
  goldLight: "#FEF3C7",
  orange: "#F97316",
  orangeLight: "#FFEDD5",
  purple: "#8B5CF6",
  purpleLight: "#EDE9FE",
  red: "#EF4444",
  dark: "#0A0F24",
  darkBlue: "#0B1437",
  darkStar: "#1E3A8A",
  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.4)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const shadow = {
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  glow: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 10,
  },
} as const;

export const font = {
  h1: { fontSize: 32, fontWeight: "700" as const, letterSpacing: -0.8, color: colors.text },
  h2: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.5, color: colors.text },
  h3: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3, color: colors.text },
  h4: { fontSize: 17, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.text, lineHeight: 22 },
  bodyMed: { fontSize: 15, fontWeight: "500" as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: "500" as const, color: colors.textSecondary },
  overline: { fontSize: 11, fontWeight: "700" as const, color: colors.textSecondary, letterSpacing: 1.2, textTransform: "uppercase" as const },
} as const;
