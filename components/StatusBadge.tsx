import { View, Text, StyleSheet } from "react-native"
import { colors, radius, spacing, statusColor, type StatusLevel } from "@/theme/colors"

export function StatusBadge({ level, label }: { level: StatusLevel; label: string }) {
  const color = statusColor(level)
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + "1A" }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
})
