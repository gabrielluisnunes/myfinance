export const Colors = {
  primary: "#2B3AF7",
  primaryDark: "#1E2EE0",
  primaryLight: "#EEF2FF",

  success: "#10B981",
  successLight: "#D1FAE5",

  danger: "#EF4444",
  dangerLight: "#FEE2E2",

  warning: "#F59E0B",
  warningLight: "#FEF3C7",

  white: "#FFFFFF",
  black: "#000000",

  gray50: "#F8F9FF",
  gray100: "#F0F2FB",
  gray200: "#E2E5EF",
  gray300: "#C8CEDF",
  gray400: "#9BA5B7",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  background: "#F5F6FA",
  surface: "#FFFFFF",
  border: "#E2E5EF",

  textPrimary: "#1C1F2E",
  textSecondary: "#6B7280",
  textDisabled: "#9BA5B7",

  heroBackground: "#E8ECFF",
  iconBadge: "#EEF2FF",

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
