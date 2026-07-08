import { useCallback, useState } from "react"
import { View, Text, StyleSheet, Pressable, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { Card } from "@/components/Card"
import { usePermissions, type PermissionItem, type PermissionState } from "@/hooks/usePermissions"
import { colors, radius, spacing, statusColor, type StatusLevel } from "@/theme/colors"

function stateToLevel(state: PermissionState): StatusLevel {
  switch (state) {
    case "granted":
      return "caution" // granted access to a sensor is a privacy exposure to review
    case "denied":
      return "secure"
    case "undetermined":
      return "unknown"
    default:
      return "unknown"
  }
}

function stateLabel(state: PermissionState): string {
  switch (state) {
    case "granted":
      return "Allowed"
    case "denied":
      return "Blocked"
    case "undetermined":
      return "Not set"
    default:
      return "Unavailable"
  }
}

function iconFor(key: string): keyof typeof Ionicons.glyphMap {
  switch (key) {
    case "location":
      return "location"
    case "notifications":
      return "notifications"
    case "camera":
      return "camera"
    default:
      return "help-circle"
  }
}

function PermissionCard({ item }: { item: PermissionItem }) {
  const level = stateToLevel(item.state)
  const color = statusColor(level)
  return (
    <Card style={styles.permCard}>
      <View style={styles.permHeader}>
        <View style={[styles.iconWrap, { backgroundColor: color + "1A" }]}>
          <Ionicons name={iconFor(item.key)} size={20} color={color} />
        </View>
        <View style={styles.permTitleWrap}>
          <Text style={styles.permTitle}>{item.title}</Text>
          <Text style={[styles.permState, { color }]}>{stateLabel(item.state)}</Text>
        </View>
      </View>
      <Text style={styles.permDesc}>{item.description}</Text>
    </Card>
  )
}

export default function PrivacyScreen() {
  const { items, reload } = usePermissions()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
    setRefreshing(false)
  }, [reload])

  return (
    <Screen
      title="Privacy"
      subtitle="The real grant status of sensitive sensors on this device."
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {items.map((item) => (
        <PermissionCard key={item.key} item={item} />
      ))}

      <Pressable
        style={({ pressed }) => [styles.settingsBtn, pressed && styles.settingsBtnPressed]}
        onPress={() => Linking.openSettings()}
        accessibilityRole="button"
        accessibilityLabel="Open system settings to change permissions"
      >
        <Ionicons name="settings-outline" size={18} color={colors.background} />
        <Text style={styles.settingsBtnText}>Manage in System Settings</Text>
      </Pressable>

      <View style={styles.footnote}>
        <Text style={styles.footnoteText}>
          {
            "This screen inspects permission status only — it never silently turns anything on. Use System Settings to change what each app can access."
          }
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  permCard: {
    gap: spacing.sm,
  },
  permHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  permTitleWrap: {
    flex: 1,
  },
  permTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  permState: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  permDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  settingsBtnPressed: {
    opacity: 0.85,
  },
  settingsBtnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
  footnote: {
    paddingHorizontal: spacing.xs,
  },
  footnoteText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
})
