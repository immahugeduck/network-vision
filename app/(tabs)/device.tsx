import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { Card } from "@/components/Card"
import { InfoRow } from "@/components/InfoRow"
import { useDeviceInfo } from "@/hooks/useDeviceInfo"
import { colors, radius, spacing } from "@/theme/colors"

export default function DeviceScreen() {
  const device = useDeviceInfo()

  return (
    <Screen title="Device" subtitle="Hardware and OS details reported by your phone.">
      <Card style={styles.hero}>
        <View style={styles.iconWrap}>
          <Ionicons name="phone-portrait" size={32} color={colors.primary} />
        </View>
        <Text style={styles.model}>{device.modelName}</Text>
        <Text style={styles.os}>
          {device.osName} {device.osVersion}
        </Text>
      </Card>

      <Card>
        <InfoRow label="Manufacturer" value={device.brand} />
        <InfoRow label="Model" value={device.modelName} />
        <InfoRow label="Operating system" value={device.osName} />
        <InfoRow label="OS version" value={device.osVersion} />
        <InfoRow label="Device type" value={device.deviceType} />
        <InfoRow
          label="Physical device"
          value={device.isDevice ? "Yes" : "Simulator"}
          valueColor={device.isDevice ? colors.success : colors.warning}
        />
      </Card>

      <View style={styles.footnote}>
        <Text style={styles.footnoteText}>
          {"All values here are read directly from the operating system via Expo's device APIs."}
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  model: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  os: {
    fontSize: 15,
    color: colors.textSecondary,
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
