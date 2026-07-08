import { useCallback, useRef, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { Card } from "@/components/Card"
import { Metric } from "@/components/Metric"
import { ProgressBar } from "@/components/ProgressBar"
import { PrimaryButton } from "@/components/PrimaryButton"
import { runSpeedTest, emptyProgress, type SpeedProgress, type SpeedPhase } from "@/lib/speedtest"
import { useNetworkInfo } from "@/hooks/useNetworkInfo"
import { usePublicIp } from "@/hooks/usePublicIp"
import { saveRun } from "@/lib/history"
import { colors, radius, spacing } from "@/theme/colors"

const PHASE_LABEL: Record<SpeedPhase, string> = {
  idle: "Ready to test",
  latency: "Measuring latency…",
  download: "Testing download…",
  upload: "Testing upload…",
  done: "Test complete",
  error: "Test failed",
}

function fmt(n: number | null, digits = 1): string {
  if (n === null) return "—"
  return n.toFixed(digits)
}

export default function SpeedTestScreen() {
  const [progress, setProgress] = useState<SpeedProgress>(emptyProgress())
  const [running, setRunning] = useState(false)
  const [saved, setSaved] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const { info: net } = useNetworkInfo()
  const { info: pub } = usePublicIp()

  const start = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setSaved(false)
    setProgress({ ...emptyProgress(), phase: "latency" })
    const result = await runSpeedTest(setProgress, controller.signal)
    setRunning(false)

    // Persist the completed run with its network context for the AI report.
    if (
      result.phase === "done" &&
      result.downloadMbps !== null &&
      result.uploadMbps !== null &&
      result.latencyMs !== null &&
      result.jitterMs !== null
    ) {
      await saveRun({
        downloadMbps: Number(result.downloadMbps.toFixed(1)),
        uploadMbps: Number(result.uploadMbps.toFixed(1)),
        pingMs: result.latencyMs,
        jitterMs: result.jitterMs,
        connectionType: net.type,
        isp: pub?.isp ?? null,
        countryCode: pub?.countryCode ?? null,
        isVpn: net.isVpn ?? null,
      })
      setSaved(true)
    }
  }, [net.type, net.isVpn, pub])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setRunning(false)
    setProgress((p) => ({ ...p, phase: "idle" }))
  }, [])

  const isDownloadActive = progress.phase === "download"
  const isUploadActive = progress.phase === "upload"
  const dialColor =
    progress.phase === "error" ? colors.danger : progress.phase === "done" ? colors.success : colors.primary

  const bigValue = isUploadActive
    ? fmt(progress.uploadMbps)
    : progress.phase === "done"
      ? fmt(progress.downloadMbps)
      : fmt(progress.downloadMbps)

  return (
    <Screen title="Speed Test" subtitle="Real throughput measured against Cloudflare's global network.">
      <Card style={styles.dial}>
        <View style={[styles.ring, { borderColor: dialColor }]}>
          <Text style={[styles.bigValue, { color: dialColor }]}>{bigValue}</Text>
          <Text style={styles.bigUnit}>Mbps</Text>
        </View>
        <Text style={styles.phase}>{PHASE_LABEL[progress.phase]}</Text>
        {running ? (
          <View style={styles.progressWrap}>
            <ProgressBar fraction={progress.fraction} color={dialColor} />
          </View>
        ) : null}
      </Card>

      <View style={styles.metricsRow}>
        <Metric
          icon="arrow-down-circle"
          label="Download"
          value={fmt(progress.downloadMbps)}
          unit="Mbps"
          active={isDownloadActive}
          color={colors.info}
        />
        <Metric
          icon="arrow-up-circle"
          label="Upload"
          value={fmt(progress.uploadMbps)}
          unit="Mbps"
          active={isUploadActive}
          color={colors.success}
        />
      </View>

      <View style={styles.metricsRow}>
        <Metric
          icon="pulse"
          label="Ping"
          value={progress.latencyMs === null ? "—" : String(progress.latencyMs)}
          unit="ms"
          active={progress.phase === "latency"}
        />
        <Metric
          icon="git-compare"
          label="Jitter"
          value={progress.jitterMs === null ? "—" : String(progress.jitterMs)}
          unit="ms"
        />
      </View>

      {progress.phase === "error" && progress.error ? (
        <Card style={styles.errorCard}>
          <Ionicons name="warning" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{progress.error}</Text>
        </Card>
      ) : null}

      {saved && !running ? (
        <Card style={styles.savedCard}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.savedText}>Saved to history — view trends and AI insights in the Report tab.</Text>
        </Card>
      ) : null}

      {running ? (
        <PrimaryButton label="Stop" onPress={stop} variant="outline" icon="stop-circle" />
      ) : (
        <PrimaryButton
          label={progress.phase === "done" ? "Run Again" : "Start Test"}
          onPress={start}
          icon="speedometer"
        />
      )}

      <Card style={styles.note}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.noteText}>
          {
            "Results reflect the throughput between your device and Cloudflare's nearest edge. Actual speeds to other services may vary."
          }
        </Text>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  dial: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  ring: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  bigValue: {
    fontSize: 52,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  bigUnit: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: -4,
  },
  phase: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  progressWrap: {
    width: "100%",
    paddingHorizontal: spacing.md,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.md,
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
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderColor: colors.success,
  },
  savedText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
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
