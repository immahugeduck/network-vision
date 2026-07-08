import { useCallback, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native"
import { useFocusEffect, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { Card } from "@/components/Card"
import { PrimaryButton } from "@/components/PrimaryButton"
import { loadRuns, clearRuns, summarize, type SpeedRun } from "@/lib/history"
import type { ConnectionReport, Grade } from "@/lib/report"
import { colors, radius, spacing } from "@/theme/colors"

const GRADE_COLOR: Record<Grade, string> = {
  excellent: colors.success,
  good: colors.info,
  fair: colors.warning,
  poor: colors.danger,
}

const SEVERITY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  positive: "checkmark-circle",
  info: "information-circle",
  warning: "warning",
}

const SEVERITY_COLOR: Record<string, string> = {
  positive: colors.success,
  info: colors.info,
  warning: colors.warning,
}

function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 60) return "just now"
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export default function ReportScreen() {
  const router = useRouter()
  const [runs, setRuns] = useState<SpeedRun[]>([])
  const [report, setReport] = useState<ConnectionReport | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refresh history every time the tab gains focus.
  useFocusEffect(
    useCallback(() => {
      let active = true
      loadRuns().then((r) => {
        if (active) setRuns(r)
      })
      return () => {
        active = false
      }
    }, []),
  )

  const stats = summarize(runs)

  const analyze = useCallback(async () => {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runs }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error ?? "Analysis failed.")
      }
      setReport(data.report as ConnectionReport)
    } catch (err) {
      setError((err as Error)?.message ?? "Something went wrong.")
    } finally {
      setAnalyzing(false)
    }
  }, [runs])

  const onClear = useCallback(async () => {
    await clearRuns()
    setRuns([])
    setReport(null)
    setError(null)
  }, [])

  // Empty state — no data to analyze yet.
  if (runs.length === 0) {
    return (
      <Screen title="AI Report" subtitle="Insights from your saved speed tests.">
        <Card style={styles.empty}>
          <Ionicons name="sparkles-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptyText}>
            Run a speed test and it will be saved here. Once you have one or more results, the AI can analyze your
            connection and spot trends.
          </Text>
          <PrimaryButton label="Run a Speed Test" icon="speedometer" onPress={() => router.push("/speedtest")} />
        </Card>
      </Screen>
    )
  }

  const maxDownload = Math.max(...runs.map((r) => r.downloadMbps))

  return (
    <Screen title="AI Report" subtitle="Insights from your saved speed tests.">
      {/* History summary */}
      {stats ? (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.avgDownload}</Text>
            <Text style={styles.statLabel}>Avg Mbps ↓</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.avgPing}</Text>
            <Text style={styles.statLabel}>Avg ping</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.count}</Text>
            <Text style={styles.statLabel}>Runs</Text>
          </View>
        </View>
      ) : null}

      {/* Mini history bars */}
      <Card>
        <Text style={styles.sectionTitle}>Recent runs</Text>
        <View style={styles.history}>
          {runs.slice(0, 8).map((r) => (
            <View key={r.id} style={styles.histRow}>
              <Text style={styles.histTime}>{timeAgo(r.timestamp)}</Text>
              <View style={styles.histBarTrack}>
                <View
                  style={[
                    styles.histBarFill,
                    { width: `${Math.max(6, (r.downloadMbps / maxDownload) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.histValue}>{r.downloadMbps.toFixed(0)}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* AI action */}
      {!report ? (
        <PrimaryButton
          label={analyzing ? "Analyzing…" : "Analyze with AI"}
          icon="sparkles"
          onPress={analyze}
          disabled={analyzing}
        />
      ) : null}

      {analyzing ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>The AI is reviewing your {runs.length} run(s)…</Text>
        </Card>
      ) : null}

      {error ? (
        <Card style={styles.errorCard}>
          <Ionicons name="warning" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      ) : null}

      {/* The report */}
      {report && !analyzing ? (
        <>
          <Card style={[styles.gradeCard, { borderColor: GRADE_COLOR[report.grade] }]}>
            <View style={[styles.gradePill, { backgroundColor: GRADE_COLOR[report.grade] }]}>
              <Text style={styles.gradePillText}>{report.grade.toUpperCase()}</Text>
            </View>
            <Text style={styles.headline}>{report.headline}</Text>
            <Text style={styles.summary}>{report.summary}</Text>
          </Card>

          {report.trend ? (
            <Card style={styles.trendCard}>
              <Ionicons name="trending-up" size={18} color={colors.primary} />
              <Text style={styles.trendText}>{report.trend}</Text>
            </Card>
          ) : null}

          {report.findings.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.sectionTitle}>What we found</Text>
              {report.findings.map((f, i) => (
                <Card key={i} style={styles.finding}>
                  <View style={styles.findingHeader}>
                    <Ionicons
                      name={SEVERITY_ICON[f.severity] ?? "ellipse"}
                      size={18}
                      color={SEVERITY_COLOR[f.severity] ?? colors.textMuted}
                    />
                    <Text style={styles.findingTitle}>{f.title}</Text>
                  </View>
                  <Text style={styles.findingDetail}>{f.detail}</Text>
                </Card>
              ))}
            </View>
          ) : null}

          {report.recommendations.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              <Card>
                {report.recommendations.map((rec, i) => (
                  <View key={i} style={styles.recRow}>
                    <Ionicons name="arrow-forward-circle" size={18} color={colors.primary} />
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </Card>
            </View>
          ) : null}

          <PrimaryButton label="Re-analyze" icon="refresh" variant="outline" onPress={analyze} />
        </>
      ) : null}

      {/* Disclaimer + clear */}
      <Card style={styles.note}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.noteText}>
          The AI only interprets the real measurements saved on this device. It never invents data.
        </Text>
      </Card>

      <Pressable onPress={onClear} style={styles.clearBtn} accessibilityRole="button">
        <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
        <Text style={styles.clearText}>Clear history</Text>
      </Pressable>
    </Screen>
  )
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  history: {
    gap: spacing.sm,
  },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  histTime: {
    width: 64,
    fontSize: 12,
    color: colors.textMuted,
  },
  histBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    overflow: "hidden",
  },
  histBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  histValue: {
    width: 40,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderColor: colors.danger,
  },
  errorText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  gradeCard: {
    gap: spacing.sm,
    borderWidth: 1.5,
  },
  gradePill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  gradePillText: {
    color: colors.background,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
  },
  headline: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 24,
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  trendCard: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  trendText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  block: {
    gap: spacing.sm,
  },
  finding: {
    gap: spacing.xs,
  },
  findingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  findingTitle: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  findingDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  recRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    paddingVertical: spacing.xs,
  },
  recText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  note: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    backgroundColor: colors.surfaceElevated,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  clearBtn: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  clearText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
})
