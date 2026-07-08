// Central theme for Phone Invasion.
// Dark security-console aesthetic: near-black base, cyan primary accent,
// plus semantic status colors. Kept intentionally small (brand + neutrals + status).

export const colors = {
  // Base / neutrals
  background: "#0A0E14",
  surface: "#121820",
  surfaceElevated: "#1A222E",
  border: "#232E3C",

  // Text
  textPrimary: "#E8EDF2",
  textSecondary: "#8B97A6",
  textMuted: "#5A6675",

  // Brand accent
  primary: "#22D3EE",
  primaryDim: "#0E7490",

  // Status
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  info: "#60A5FA",
} as const

export type StatusLevel = "secure" | "caution" | "risk" | "unknown"

export function statusColor(level: StatusLevel): string {
  switch (level) {
    case "secure":
      return colors.success
    case "caution":
      return colors.warning
    case "risk":
      return colors.danger
    default:
      return colors.textMuted
  }
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const
