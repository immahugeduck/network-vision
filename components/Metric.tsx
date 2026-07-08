import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing } from "@/theme/colors"

export function Metric({
  icon,
  label,
  value,
  unit,
  active,
  color = colors.textPrimary,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
  unit?: string
  active?: boolean
  color?: string
}) {
  return (
    <View style={[styles.wrap, active ? styles.active : null]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={16} color={active ? colors.primary : colors.textMuted} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: {
    borderColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
})
