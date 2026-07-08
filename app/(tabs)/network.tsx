import { useCallback, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Screen } from "@/components/Screen"
import { Card } from "@/components/Card"
import { InfoRow } from "@/components/InfoRow"
import { StatusBadge } from "@/components/StatusBadge"
import { useNetworkInfo } from "@/hooks/useNetworkInfo"
import { colors, spacing } from "@/theme/colors"

function yesNo(v: boolean | null): string {
  if (v === null) return "Unknown"
  return v ? "Yes" : "No"
}

function typeLabel(t: string): string {
  const map: Record<string, string> = {
    WIFI: "Wi-Fi",
    wifi: "Wi-Fi",
    CELLULAR: "Cellular",
    cellular: "Cellular",
    ETHERNET: "Ethernet",
    NONE: "None",
    none: "None",
    vpn: "VPN",
    UNKNOWN: "Unknown",
    unknown: "Unknown",
  }
  return map[t] ?? t
}

export default function NetworkScreen() {
  const { info, reload } = useNetworkInfo()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
    setRefreshing(false)
  }, [reload])

  return (
    <Screen
      title="Network"
      subtitle="Live connectivity details read from your device."
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <Card style={styles.statusCard}>
        <StatusBadge
          level={info.isVpn ? "secure" : info.type === "WIFI" || info.type === "wifi" ? "caution" : "unknown"}
          label={info.isVpn ? "VPN PROTECTED" : "NO VPN"}
        />
        <Text style={styles.statusText}>
          {info.isVpn
            ? "Your traffic is routed through a VPN tunnel."
            : "Your traffic is not going through a VPN. Consider one on untrusted networks."}
        </Text>
      </Card>

      <Card>
        <InfoRow label="Connection type" value={typeLabel(info.type)} />
        <InfoRow
          label="Connected"
          value={yesNo(info.isConnected)}
          valueColor={info.isConnected ? colors.success : colors.textPrimary}
        />
        <InfoRow
          label="Internet reachable"
          value={yesNo(info.isInternetReachable)}
          valueColor={info.isInternetReachable === false ? colors.warning : colors.textPrimary}
        />
        <InfoRow label="IP address" value={info.ipAddress ?? "Unavailable"} />
        <InfoRow label="Wi-Fi network (SSID)" value={info.ssid ?? "Restricted"} />
        <InfoRow label="Airplane mode" value={yesNo(info.isAirplaneMode)} />
        <InfoRow label="Metered / expensive" value={yesNo(info.isExpensive)} />
      </Card>

      <View style={styles.footnote}>
        <Text style={styles.footnoteText}>
          {
            'On iOS the Wi-Fi name is only readable with special entitlements, so it usually shows "Restricted" in Expo Go. That is a platform limit, not a bug.'
          }
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  statusCard: {
    gap: spacing.md,
  },
  statusText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
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
