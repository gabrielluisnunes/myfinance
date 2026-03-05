export const Colors = {
  primary: "#6C63FF",
  primaryDark: "#4F46E5",
  primaryLight: "#A5B4FC",

  success: "#10B981",
  successLight: "#D1FAE5",

  danger: "#EF4444",
  dangerLight: "#FEE2E2",

  warning: "#F59E0B",
  warningLight: "#FEF3C7",

  white: "#FFFFFF",
  black: "#000000",

  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  background: "#F3F4F6",
  surface: "#FFFFFF",
  border: "#E5E7EB",

  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textDisabled: "#9CA3AF",

  income: "#10B981",
  expense: "#EF4444",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const Typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;
