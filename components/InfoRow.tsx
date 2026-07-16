import { View, Text, StyleSheet } from "react-native"
import { colors, spacing } from "@/theme/colors"

export function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  label: {
    fontSize: 15,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: "right",
  },
})
