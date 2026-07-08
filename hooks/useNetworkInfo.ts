import { useCallback, useEffect, useState } from "react"
import * as Network from "expo-network"
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo"

export type NetworkInfo = {
  isConnected: boolean | null
  isInternetReachable: boolean | null
  type: string
  ipAddress: string | null
  isAirplaneMode: boolean | null
  ssid: string | null
  isVpn: boolean
  isExpensive: boolean | null
}

const EMPTY: NetworkInfo = {
  isConnected: null,
  isInternetReachable: null,
  type: "unknown",
  ipAddress: null,
  isAirplaneMode: null,
  ssid: null,
  isVpn: false,
  isExpensive: null,
}

// Reads real connectivity data. On iOS the Wi-Fi SSID is only available with
// special entitlements, so it is frequently null in Expo Go — that is expected
// and reported honestly rather than faked.
export function useNetworkInfo() {
  const [info, setInfo] = useState<NetworkInfo>(EMPTY)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [expoState, ip, airplane] = await Promise.all([
        Network.getNetworkStateAsync(),
        Network.getIpAddressAsync().catch(() => null),
        Network.isAirplaneModeEnabledAsync().catch(() => null),
      ])

      const netState: NetInfoState = await NetInfo.fetch()
      const details = netState.details as Record<string, unknown> | null
      const ssid =
        details && typeof details.ssid === "string" ? (details.ssid as string) : null
      const isVpn = netState.type === "vpn"
      const isExpensive =
        details && typeof details.isConnectionExpensive === "boolean"
          ? (details.isConnectionExpensive as boolean)
          : null

      setInfo({
        isConnected: expoState.isConnected ?? netState.isConnected ?? null,
        isInternetReachable: expoState.isInternetReachable ?? netState.isInternetReachable ?? null,
        type: String(expoState.type ?? netState.type ?? "unknown"),
        ipAddress: ip,
        isAirplaneMode: airplane,
        ssid,
        isVpn,
        isExpensive,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const unsub = NetInfo.addEventListener(() => {
      load()
    })
    return () => unsub()
  }, [load])

  return { info, loading, reload: load }
}
