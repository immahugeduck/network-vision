// Real network diagnostic tools.
//
//  - dnsLookup: resolves a hostname using Google's DNS-over-HTTPS JSON API
//    (https://dns.google/resolve). This performs an actual DNS resolution and
//    returns the A / AAAA records the resolver hands back. CORS-enabled + no key.
//
//  - probeHost: measures reachability + round-trip latency to a host by timing
//    an HTTPS request. On a real device this reaches any host; in a browser it
//    is subject to the site's CORS policy, which is a web-only limitation.

export type DnsRecord = { type: "A" | "AAAA"; data: string; ttl: number }

export type DnsResult = {
  host: string
  records: DnsRecord[]
  ms: number
  resolved: boolean
}

export type ProbeResult = {
  host: string
  reachable: boolean
  ms: number | null
  status?: number
  error?: string
}

function cleanHost(input: string): string {
  return input
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/\s+/g, "")
}

const DNS_TYPE_CODE: Record<number, "A" | "AAAA"> = { 1: "A", 28: "AAAA" }

export async function dnsLookup(input: string, signal?: AbortSignal): Promise<DnsResult> {
  const host = cleanHost(input)
  const start = Date.now()
  const records: DnsRecord[] = []

  for (const type of ["A", "AAAA"] as const) {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=${type}`, {
      headers: { accept: "application/dns-json" },
      cache: "no-store",
      signal,
    })
    const json = (await res.json()) as { Answer?: { type: number; data: string; TTL: number }[] }
    for (const ans of json.Answer ?? []) {
      const mapped = DNS_TYPE_CODE[ans.type]
      if (mapped) records.push({ type: mapped, data: ans.data, ttl: ans.TTL })
    }
  }

  return { host, records, ms: Date.now() - start, resolved: records.length > 0 }
}

export type PingResult = { latencyMs: number; jitterMs: number } | null

// Lightweight latency + jitter check against Cloudflare's edge, used for the
// at-a-glance health summary on the home screen.
export async function quickPing(samples = 4, signal?: AbortSignal): Promise<PingResult> {
  const times: number[] = []
  try {
    for (let i = 0; i < samples; i++) {
      if (signal?.aborted) return null
      const start = Date.now()
      await fetch("https://speed.cloudflare.com/__down?bytes=0", { cache: "no-store", signal })
      times.push(Date.now() - start)
    }
  } catch {
    return null
  }
  if (times.length === 0) return null
  const useful = times.length > 1 ? times.slice(1) : times
  const avg = useful.reduce((a, b) => a + b, 0) / useful.length
  const jitter = useful.reduce((a, b) => a + Math.abs(b - avg), 0) / useful.length
  return { latencyMs: Math.round(Math.min(...useful)), jitterMs: Math.round(jitter) }
}

export async function probeHost(input: string, timeoutMs = 8000): Promise<ProbeResult> {
  const host = cleanHost(input)
  const url = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${host}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const start = Date.now()

  try {
    const res = await fetch(url, { method: "GET", cache: "no-store", signal: controller.signal })
    return { host, reachable: true, ms: Date.now() - start, status: res.status }
  } catch {
    const aborted = controller.signal.aborted
    return {
      host,
      reachable: false,
      ms: aborted ? null : Date.now() - start,
      error: aborted ? "Timed out" : "No response",
    }
  } finally {
    clearTimeout(timer)
  }
}
