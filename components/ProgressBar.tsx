import { View, StyleSheet } from "react-native"
import { colors } from "@/theme/colors"

export function ProgressBar({
  fraction,
  color = colors.primary,
}: {
  fraction: number
  color?: string
}) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(pct), min: 0, max: 100 }}
    >
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceElevated,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
})
