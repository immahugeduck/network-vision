import { useCallback, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { Card } from "@/components/Card"
import { InfoRow } from "@/components/InfoRow"
import { ProgressBar } from "@/components/ProgressBar"
import { useDeviceInfo } from "@/hooks/useDeviceInfo"
import { useStorageInfo, formatBytes } from "@/hooks/useStorageInfo"
import { colors, radius, spacing } from "@/theme/colors"

export default function DeviceScreen() {
  const device = useDeviceInfo()
  const { info: storage, available: storageAvailable, reload } = useStorageInfo()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
    setRefreshing(false)
  }, [reload])

  const usedPct = storage ? Math.round(storage.usedFraction * 100) : 0
  const barColor = usedPct >= 90 ? colors.danger : usedPct >= 75 ? colors.warning : colors.success

  return (
    <Screen
      title="Device"
      subtitle="Hardware, OS, and storage reported by your phone."
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <Card style={styles.hero}>
        <View style={styles.iconWrap}>
          <Ionicons name="phone-portrait" size={32} color={colors.primary} />
        </View>
        <Text style={styles.model}>{device.modelName}</Text>
        <Text style={styles.os}>
          {device.osName} {device.osVersion}
        </Text>
      </Card>

      {/* Storage */}
      <Card style={styles.storageCard}>
        <View style={styles.sectionHead}>
          <Ionicons name="save-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>Storage</Text>
        </View>
        {storageAvailable && storage ? (
          <View style={styles.storageBody}>
            <View style={styles.storageNumbers}>
              <Text style={styles.storageUsed}>{formatBytes(storage.usedBytes)}</Text>
              <Text style={styles.storageTotal}>of {formatBytes(storage.totalBytes)} used</Text>
            </View>
            <ProgressBar fraction={storage.usedFraction} color={barColor} />
            <View style={styles.storageFooter}>
              <Text style={styles.storagePct}>{usedPct}% full</Text>
              <Text style={styles.storageFree}>{formatBytes(storage.freeBytes)} free</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.unavailable}>
            {"Storage stats come from a native API that isn't available in the web preview. They'll appear on your phone."}
          </Text>
        )}
      </Card>

      {/* Hardware / OS */}
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
          {"All values are read directly from the operating system via Expo's device and file-system APIs."}
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
  storageCard: {
    gap: spacing.md,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  storageBody: {
    gap: spacing.sm,
  },
  storageNumbers: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  storageUsed: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  storageTotal: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  storageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  storagePct: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
  storageFree: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  unavailable: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
