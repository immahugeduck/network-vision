import { useCallback, useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { Card } from "@/components/Card"
import { StatusBadge } from "@/components/StatusBadge"
import { useNetworkInfo } from "@/hooks/useNetworkInfo"
import { usePublicIp } from "@/hooks/usePublicIp"
import { quickPing, type PingResult } from "@/lib/netcheck"
import { buildFindings, overallLevel, levelLabel } from "@/lib/assessment"
import { colors, radius, spacing, statusColor } from "@/theme/colors"

function typeLabel(t: string): string {
  const map: Record<string, string> = {
    WIFI: "Wi-Fi",
    wifi: "Wi-Fi",
    CELLULAR: "Cellular",
    cellular: "Cellular",
    ETHERNET: "Ethernet",
    NONE: "None",
    none: "None",
  }
  return map[t] ?? (t ? t.charAt(0).toUpperCase() + t.slice(1) : "Unknown")
}

export default function DiagnosticsScreen() {
  const router = useRouter()
  const { info, loading: netLoading, reload: reloadNet } = useNetworkInfo()
  const { info: pub, loading: pubLoading, reload: reloadPub } = usePublicIp()
  const [ping, setPing] = useState<PingResult>(null)
  const [pinging, setPinging] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const runPing = useCallback(async () => {
    setPinging(true)
    const result = await quickPing()
    setPing(result)
    setPinging(false)
  }, [])

  useEffect(() => {
    runPing()
  }, [runPing])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([reloadNet(), reloadPub(), runPing()])
    setRefreshing(false)
  }, [reloadNet, reloadPub, runPing])

  const busy = netLoading || pubLoading || pinging
  const findings = buildFindings(info, pub, ping)
  const level = overallLevel(findings)
  const color = statusColor(level)

  return (
    <Screen
      title="Diagnostics"
      subtitle="A live snapshot of your connection health."
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <Card style={styles.hero}>
        <View style={[styles.ring, { borderColor: color }]}>
          <Ionicons
            name={level === "risk" ? "alert-circle" : level === "caution" ? "warning" : "checkmark-circle"}
            size={44}
            color={color}
          />
        </View>
        <Text style={styles.heroLevel}>{busy && findings.length === 0 ? "Checking…" : levelLabel(level)}</Text>
        <StatusBadge level={level} label={typeLabel(info.type)} />
        <Text style={styles.heroHint}>Pull down to re-run the check.</Text>
      </Card>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="pulse" size={18} color={colors.primary} />
          <Text style={styles.statValue}>{ping ? `${ping.latencyMs}` : pinging ? "…" : "—"}</Text>
          <Text style={styles.statLabel}>Ping (ms)</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="git-compare" size={18} color={colors.primary} />
          <Text style={styles.statValue}>{ping ? `${ping.jitterMs}` : pinging ? "…" : "—"}</Text>
          <Text style={styles.statLabel}>Jitter (ms)</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="globe-outline" size={18} color={colors.primary} />
          <Text style={styles.statValue} numberOfLines={1}>
            {pub ? pub.countryCode || "?" : "…"}
          </Text>
          <Text style={styles.statLabel}>Region</Text>
        </View>
      </View>

      {/* Findings */}
      {busy && findings.length === 0 ? (
        <Card>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Running checks…</Text>
          </View>
        </Card>
      ) : (
        <View style={styles.findings}>
          <Text style={styles.sectionTitle}>Summary</Text>
          {findings.map((f) => (
            <Card key={f.id} style={styles.finding}>
              <View style={styles.findingHeader}>
                <View style={[styles.findingDot, { backgroundColor: statusColor(f.level) }]} />
                <Text style={styles.findingTitle}>{f.title}</Text>
              </View>
              <Text style={styles.findingDetail}>{f.detail}</Text>
            </Card>
          ))}
        </View>
      )}

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Run a test</Text>
      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          onPress={() => router.push("/speedtest")}
          accessibilityRole="button"
        >
          <Ionicons name="speedometer" size={26} color={colors.primary} />
          <Text style={styles.actionTitle}>Speed Test</Text>
          <Text style={styles.actionSub}>Download & upload</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          onPress={() => router.push("/network")}
          accessibilityRole="button"
        >
          <Ionicons name="git-network" size={26} color={colors.primary} />
          <Text style={styles.actionTitle}>Network Tools</Text>
          <Text style={styles.actionSub}>DNS & reachability</Text>
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  ring: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  heroLevel: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  heroHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  findings: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  finding: {
    gap: spacing.sm,
  },
  findingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  findingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  findingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    flexShrink: 1,
  },
  findingDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  action: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPressed: {
    opacity: 0.7,
    borderColor: colors.primary,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  actionSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
})
