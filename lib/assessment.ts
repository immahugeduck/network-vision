import type { NetworkInfo } from "@/hooks/useNetworkInfo"
import type { PublicIpInfo } from "@/hooks/usePublicIp"
import type { PingResult } from "@/lib/netcheck"
import type { StatusLevel } from "@/theme/colors"

export type Finding = {
  id: string
  title: string
  detail: string
  level: StatusLevel
}

// Derives an honest connection health summary purely from real signals:
// live connectivity, the public IP lookup, and a measured latency check.
export function buildFindings(net: NetworkInfo, pub: PublicIpInfo | null, ping: PingResult): Finding[] {
  const findings: Finding[] = []

  // Connectivity
  if (net.isConnected === false) {
    findings.push({
      id: "offline",
      title: "No connection",
      detail: "This device is not connected to any network right now.",
      level: "risk",
    })
    return findings
  }

  if (net.isInternetReachable === false) {
    findings.push({
      id: "no-internet",
      title: "Connected, but no internet",
      detail: "You're on a network but the internet isn't reachable — a captive portal or outage may be to blame.",
      level: "caution",
    })
  } else {
    findings.push({
      id: "online",
      title: "Internet reachable",
      detail: "Your device has a working internet connection.",
      level: "secure",
    })
  }

  // Latency quality
  if (ping) {
    const level: StatusLevel = ping.latencyMs < 60 ? "secure" : ping.latencyMs < 150 ? "caution" : "risk"
    findings.push({
      id: "latency",
      title: `Latency ${ping.latencyMs} ms · jitter ${ping.jitterMs} ms`,
      detail:
        level === "secure"
          ? "Responsive connection — great for calls, gaming, and streaming."
          : level === "caution"
            ? "Moderate latency. Usable, but real-time apps may feel slightly laggy."
            : "High latency. Video calls and gaming may struggle.",
      level,
    })
  }

  // VPN posture (context dependent — only a caution on Wi-Fi)
  findings.push(
    net.isVpn
      ? {
          id: "vpn-on",
          title: "VPN active",
          detail: "Traffic is routed through a VPN tunnel.",
          level: "secure",
        }
      : {
          id: "vpn-off",
          title: "No VPN detected",
          detail:
            net.type === "WIFI" || net.type === "wifi"
              ? "You're on Wi-Fi without a VPN. On untrusted networks a VPN adds privacy."
              : "No VPN tunnel is active.",
          level: net.type === "WIFI" || net.type === "wifi" ? "caution" : "unknown",
        },
  )

  // ISP / location context
  if (pub) {
    findings.push({
      id: "isp",
      title: pub.isp,
      detail: `Public IP ${pub.ip} · ${pub.city}, ${pub.country}`,
      level: "secure",
    })
  }

  return findings
}

export function overallLevel(findings: Finding[]): StatusLevel {
  if (findings.some((f) => f.level === "risk")) return "risk"
  if (findings.some((f) => f.level === "caution")) return "caution"
  if (findings.length > 0) return "secure"
  return "unknown"
}

export function levelLabel(level: StatusLevel): string {
  switch (level) {
    case "secure":
      return "Healthy"
    case "caution":
      return "Needs attention"
    case "risk":
      return "Problem detected"
    default:
      return "Checking"
  }
}
