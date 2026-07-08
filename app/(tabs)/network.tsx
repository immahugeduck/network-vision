import { useCallback, useState } from "react"
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Screen } from "@/components/Screen"
import { Card } from "@/components/Card"
import { InfoRow } from "@/components/InfoRow"
import { StatusBadge } from "@/components/StatusBadge"
import { PrimaryButton } from "@/components/PrimaryButton"
import { useNetworkInfo } from "@/hooks/useNetworkInfo"
import { usePublicIp } from "@/hooks/usePublicIp"
import { dnsLookup, probeHost, type DnsResult, type ProbeResult } from "@/lib/netcheck"
import { colors, radius, spacing } from "@/theme/colors"

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
  }
  return map[t] ?? (t ? t.charAt(0).toUpperCase() + t.slice(1) : "Unknown")
}

export default function NetworkScreen() {
  const { info, reload: reloadNet } = useNetworkInfo()
  const { info: pub, loading: pubLoading, error: pubError, reload: reloadPub } = usePublicIp()
  const [refreshing, setRefreshing] = useState(false)

  // DNS lookup tool state
  const [dnsHost, setDnsHost] = useState("cloudflare.com")
  const [dnsResult, setDnsResult] = useState<DnsResult | null>(null)
  const [dnsBusy, setDnsBusy] = useState(false)
  const [dnsError, setDnsError] = useState<string | null>(null)

  // Host reachability tool state
  const [pingHost, setPingHost] = useState("google.com")
  const [pingResult, setPingResult] = useState<ProbeResult | null>(null)
  const [pingBusy, setPingBusy] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([reloadNet(), reloadPub()])
    setRefreshing(false)
  }, [reloadNet, reloadPub])

  const runDns = useCallback(async () => {
    if (!dnsHost.trim()) return
    setDnsBusy(true)
    setDnsError(null)
    setDnsResult(null)
    try {
      const result = await dnsLookup(dnsHost)
      setDnsResult(result)
      if (!result.resolved) setDnsError("No A/AAAA records found for that hostname.")
    } catch {
      setDnsError("Lookup failed. Check the hostname and your connection.")
    } finally {
      setDnsBusy(false)
    }
  }, [dnsHost])

  const runPing = useCallback(async () => {
    if (!pingHost.trim()) return
    setPingBusy(true)
    setPingResult(null)
    const result = await probeHost(pingHost)
    setPingResult(result)
    setPingBusy(false)
  }, [pingHost])

  return (
    <Screen
      title="Network"
      subtitle="Your connection, public address, and live lookup tools."
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {/* Public IP + ISP / geo */}
      <Card style={styles.section}>
        <View style={styles.sectionHead}>
          <Ionicons name="globe-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>Public Address</Text>
        </View>
        {pubLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Looking up your public IP…</Text>
          </View>
        ) : pubError ? (
          <Text style={styles.errorText}>{pubError}</Text>
        ) : pub ? (
          <View>
            <InfoRow label="Public IP" value={pub.ip} />
            <InfoRow label="IP version" value={pub.type} />
            <InfoRow label="ISP" value={pub.isp} />
            <InfoRow label="Organization" value={pub.org} />
            <InfoRow label="ASN" value={pub.asn} />
            <InfoRow label="Location" value={`${pub.city}, ${pub.region}`} />
            <InfoRow label="Country" value={`${pub.country}${pub.countryCode ? ` (${pub.countryCode})` : ""}`} />
            <InfoRow label="Timezone" value={pub.timezone} />
          </View>
        ) : null}
      </Card>

      {/* VPN status */}
      <Card style={styles.statusCard}>
        <StatusBadge
          level={info.isVpn ? "secure" : info.type === "WIFI" || info.type === "wifi" ? "caution" : "unknown"}
          label={info.isVpn ? "VPN PROTECTED" : "NO VPN"}
        />
        <Text style={styles.statusText}>
          {info.isVpn
            ? "Traffic is routed through a VPN tunnel on this device."
            : "No VPN tunnel detected. On public Wi-Fi a VPN adds meaningful privacy."}
        </Text>
      </Card>

      {/* Local connection */}
      <Card style={styles.section}>
        <View style={styles.sectionHead}>
          <Ionicons name="hardware-chip-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>Connection</Text>
        </View>
        <InfoRow label="Type" value={typeLabel(info.type)} />
        <InfoRow
          label="Internet reachable"
          value={info.isInternetReachable === null ? "Unknown" : info.isInternetReachable ? "Yes" : "No"}
          valueColor={info.isInternetReachable === false ? colors.warning : colors.textPrimary}
        />
        <InfoRow label="Local IP" value={info.ipAddress ?? "Unavailable"} />
        <InfoRow label="Metered connection" value={info.isExpensive === null ? "Unknown" : info.isExpensive ? "Yes" : "No"} />
      </Card>

      {/* DNS lookup tool */}
      <Card style={styles.section}>
        <View style={styles.sectionHead}>
          <Ionicons name="search-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>DNS Lookup</Text>
        </View>
        <Text style={styles.toolHint}>Resolve a hostname to its IP addresses via secure DNS-over-HTTPS.</Text>
        <TextInput
          style={styles.input}
          value={dnsHost}
          onChangeText={setDnsHost}
          placeholder="example.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onSubmitEditing={runDns}
          returnKeyType="search"
        />
        <PrimaryButton label="Resolve" onPress={runDns} loading={dnsBusy} icon="arrow-forward" />
        {dnsError ? <Text style={styles.errorText}>{dnsError}</Text> : null}
        {dnsResult && dnsResult.resolved ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultMeta}>
              {dnsResult.records.length} record{dnsResult.records.length === 1 ? "" : "s"} · {dnsResult.ms} ms
            </Text>
            {dnsResult.records.map((r, i) => (
              <View key={`${r.type}-${r.data}-${i}`} style={styles.recordRow}>
                <View style={styles.recordType}>
                  <Text style={styles.recordTypeText}>{r.type}</Text>
                </View>
                <Text style={styles.recordData} numberOfLines={1}>
                  {r.data}
                </Text>
                <Text style={styles.recordTtl}>{r.ttl}s</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      {/* Host reachability tool */}
      <Card style={styles.section}>
        <View style={styles.sectionHead}>
          <Ionicons name="pulse-outline" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>Host Reachability</Text>
        </View>
        <Text style={styles.toolHint}>Check whether a host responds and how long the round-trip takes.</Text>
        <TextInput
          style={styles.input}
          value={pingHost}
          onChangeText={setPingHost}
          placeholder="google.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onSubmitEditing={runPing}
          returnKeyType="go"
        />
        <PrimaryButton label="Check Host" onPress={runPing} loading={pingBusy} icon="paper-plane" />
        {pingResult ? (
          <View style={styles.resultBox}>
            <View style={styles.pingResultRow}>
              <StatusBadge
                level={pingResult.reachable ? "secure" : "risk"}
                label={pingResult.reachable ? "REACHABLE" : "NO RESPONSE"}
              />
              <Text style={[styles.pingMs, { color: pingResult.reachable ? colors.success : colors.danger }]}>
                {pingResult.ms === null ? pingResult.error ?? "—" : `${pingResult.ms} ms`}
              </Text>
            </View>
            {pingResult.reachable && pingResult.status ? (
              <Text style={styles.resultMeta}>HTTP status {pingResult.status}</Text>
            ) : null}
          </View>
        ) : null}
      </Card>

      <View style={styles.footnote}>
        <Text style={styles.footnoteText}>
          {
            "Host reachability uses an HTTPS request. On a phone it reaches any host; in a web browser it is limited by each site's CORS policy."
          }
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statusCard: {
    gap: spacing.md,
  },
  statusText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  toolHint: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  resultBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  resultMeta: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  recordType: {
    minWidth: 44,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
  },
  recordTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  recordData: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: "monospace",
  },
  recordTtl: {
    fontSize: 12,
    color: colors.textMuted,
  },
  pingResultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pingMs: {
    fontSize: 18,
    fontWeight: "800",
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
