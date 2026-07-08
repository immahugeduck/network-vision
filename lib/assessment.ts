import type { NetworkInfo } from "@/hooks/useNetworkInfo"
import type { PermissionItem } from "@/hooks/usePermissions"
import type { StatusLevel } from "@/theme/colors"

export type Finding = {
  id: string
  title: string
  detail: string
  level: StatusLevel
}

// Derives an honest assessment purely from real signals we can actually read.
// No invented threats — every finding maps to observable device/network state.
export function buildFindings(net: NetworkInfo, perms: PermissionItem[]): Finding[] {
  const findings: Finding[] = []

  // Connectivity
  if (net.isConnected === false) {
    findings.push({
      id: "offline",
      title: "Offline",
      detail: "No active network connection detected.",
      level: "secure",
    })
  } else if (net.isInternetReachable === false) {
    findings.push({
      id: "no-internet",
      title: "Connected, no internet",
      detail: "You are on a network but the internet is not reachable. Captive portals can intercept traffic.",
      level: "caution",
    })
  }

  // VPN
  findings.push(
    net.isVpn
      ? {
          id: "vpn-on",
          title: "VPN active",
          detail: "Traffic is routed through a VPN interface.",
          level: "secure",
        }
      : {
          id: "vpn-off",
          title: "No VPN detected",
          detail: "Traffic is not routed through a VPN. On public Wi-Fi this reduces privacy.",
          level: net.type === "WIFI" || net.type === "wifi" ? "caution" : "unknown",
        },
  )

  // Location permission is the most privacy-sensitive
  const loc = perms.find((p) => p.key === "location")
  if (loc?.state === "granted") {
    findings.push({
      id: "location-granted",
      title: "Location access granted",
      detail: "At least one app permission for location is currently allowed.",
      level: "caution",
    })
  }

  const granted = perms.filter((p) => p.state === "granted").length
  if (perms.length > 0) {
    findings.push({
      id: "perms-summary",
      title: `${granted} of ${perms.length} sensitive permissions granted`,
      detail: "Review the Privacy tab to see exactly which sensors are exposed.",
      level: granted === 0 ? "secure" : granted >= perms.length ? "risk" : "caution",
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
      return "Looking good"
    case "caution":
      return "Needs attention"
    case "risk":
      return "Action recommended"
    default:
      return "Scanning"
  }
}
