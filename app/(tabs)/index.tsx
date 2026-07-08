import { useCallback, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { Card } from "@/components/Card"
import { StatusBadge } from "@/components/StatusBadge"
import { useNetworkInfo } from "@/hooks/useNetworkInfo"
import { usePermissions } from "@/hooks/usePermissions"
import { buildFindings, overallLevel, levelLabel } from "@/lib/assessment"
import { colors, radius, spacing, statusColor } from "@/theme/colors"

export default function ScanScreen() {
  const { info, loading: netLoading, reload: reloadNet } = useNetworkInfo()
  const { items, loading: permLoading, reload: reloadPerms } = usePermissions()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([reloadNet(), reloadPerms()])
    setRefreshing(false)
  }, [reloadNet, reloadPerms])

  const loading = netLoading || permLoading
  const findings = buildFindings(info, items)
  const level = overallLevel(findings)
  const color = statusColor(level)

  return (
    <Screen
      title="Phone Invasion"
      subtitle="A privacy scan built only on signals your device actually exposes."
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <Card style={styles.hero}>
        <View style={[styles.ring, { borderColor: color }]}>
          <Ionicons name="shield-checkmark" size={40} color={color} />
        </View>
        <Text style={styles.heroLevel}>{levelLabel(level)}</Text>
        <StatusBadge level={level} label={level.toUpperCase()} />
        <Text style={styles.heroHint}>Pull down to re-run the scan.</Text>
      </Card>

      {loading && findings.length === 0 ? (
        <Card>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Reading device signals…</Text>
          </View>
        </Card>
      ) : (
        <View style={styles.findings}>
          <Text style={styles.sectionTitle}>Findings</Text>
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

      <Card style={styles.note}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.noteText}>
          {
            "Deep features like cell-tower or RF analysis require hardware access Apple does not expose to apps, so they are intentionally omitted rather than faked."
          }
        </Text>
      </Card>
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
  note: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
})
