import { useCallback, useEffect, useState } from "react"

// Fetches the device's public (WAN) IP plus ISP / geolocation from ipwho.is,
// a free, key-less, HTTPS + CORS-enabled service. All values are real; nothing
// is fabricated. If the lookup fails (offline, rate limit) we surface an error
// instead of inventing data.

export type PublicIpInfo = {
  ip: string
  type: string
  city: string
  region: string
  country: string
  countryCode: string
  isp: string
  org: string
  asn: string
  timezone: string
}

export function usePublicIp() {
  const [info, setInfo] = useState<PublicIpInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("https://ipwho.is/", { cache: "no-store" })
      const j = await res.json()
      if (!j || j.success === false) {
        throw new Error(j?.message ?? "Lookup failed")
      }
      setInfo({
        ip: j.ip ?? "Unknown",
        type: j.type ?? "Unknown",
        city: j.city ?? "Unknown",
        region: j.region ?? "Unknown",
        country: j.country ?? "Unknown",
        countryCode: j.country_code ?? "",
        isp: j.connection?.isp ?? "Unknown",
        org: j.connection?.org ?? j.connection?.isp ?? "Unknown",
        asn: j.connection?.asn ? `AS${j.connection.asn}` : "Unknown",
        timezone: j.timezone?.id ?? "Unknown",
      })
    } catch {
      setError("Couldn't reach the IP lookup service. Check your connection.")
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { info, loading, error, reload: load }
}
