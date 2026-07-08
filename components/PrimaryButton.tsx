import { Pressable, Text, StyleSheet, ActivityIndicator, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, radius, spacing } from "@/theme/colors"

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  variant = "primary",
}: {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  variant?: "primary" | "outline"
}) {
  const isOutline = variant === "outline"
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={isOutline ? colors.primary : colors.background} size="small" />
        ) : icon ? (
          <Ionicons name={icon} size={20} color={isOutline ? colors.primary : colors.background} />
        ) : null}
        <Text style={[styles.label, isOutline ? styles.labelOutline : styles.labelPrimary]}>{label}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  labelPrimary: {
    color: colors.background,
  },
  labelOutline: {
    color: colors.primary,
  },
})
