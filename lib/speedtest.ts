// Real network speed test powered by Cloudflare's public speed endpoints
// (the same backend behind speed.cloudflare.com). These endpoints are
// CORS-enabled and require no API key, so the measurements are genuine on
// both device and web.
//
//   Download: https://speed.cloudflare.com/__down?bytes=N
//   Upload:   https://speed.cloudflare.com/__up  (POST body of N bytes)
//   Latency:  repeated tiny downloads, timed round-trip

const DOWN_URL = "https://speed.cloudflare.com/__down"
const UP_URL = "https://speed.cloudflare.com/__up"

export type SpeedPhase = "idle" | "latency" | "download" | "upload" | "done" | "error"

export type SpeedProgress = {
  phase: SpeedPhase
  latencyMs: number | null
  jitterMs: number | null
  downloadMbps: number | null
  uploadMbps: number | null
  // 0..1 progress within the current phase (for the live gauge)
  fraction: number
  error?: string
}

const INITIAL: SpeedProgress = {
  phase: "idle",
  latencyMs: null,
  jitterMs: null,
  downloadMbps: null,
  uploadMbps: null,
  fraction: 0,
}

function now(): number {
  return Date.now()
}

function mbps(bytes: number, ms: number): number {
  if (ms <= 0) return 0
  return (bytes * 8) / (ms / 1000) / 1_000_000
}

async function downloadOnce(bytes: number, signal?: AbortSignal): Promise<number> {
  const res = await fetch(`${DOWN_URL}?bytes=${bytes}`, { cache: "no-store", signal })
  const buf = await res.arrayBuffer()
  return buf.byteLength
}

async function measureLatency(signal?: AbortSignal): Promise<{ latency: number; jitter: number }> {
  const samples: number[] = []
  for (let i = 0; i < 6; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError")
    const start = now()
    await fetch(`${DOWN_URL}?bytes=0`, { cache: "no-store", signal })
    samples.push(now() - start)
  }
  // Drop the first sample (connection warmup) for a fairer reading.
  const useful = samples.slice(1)
  const latency = Math.min(...useful)
  const avg = useful.reduce((a, b) => a + b, 0) / useful.length
  const jitter = useful.reduce((a, b) => a + Math.abs(b - avg), 0) / useful.length
  return { latency, jitter }
}

async function measureDownload(
  onProgress: (mbps: number, fraction: number) => void,
  signal?: AbortSignal,
): Promise<number> {
  // Warmup (not counted) to open TCP/TLS and ramp the window.
  await downloadOnce(1_000_000, signal)

  const sizes = [5_000_000, 10_000_000, 15_000_000, 25_000_000]
  let totalBytes = 0
  let totalMs = 0
  for (let i = 0; i < sizes.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError")
    const start = now()
    const bytes = await downloadOnce(sizes[i], signal)
    totalMs += now() - start
    totalBytes += bytes
    onProgress(mbps(totalBytes, totalMs), (i + 1) / sizes.length)
  }
  return mbps(totalBytes, totalMs)
}

async function measureUpload(
  onProgress: (mbps: number, fraction: number) => void,
  signal?: AbortSignal,
): Promise<number> {
  const sizes = [1_000_000, 2_000_000, 4_000_000, 8_000_000]
  const payload = new Uint8Array(sizes[sizes.length - 1])
  let totalBytes = 0
  let totalMs = 0
  for (let i = 0; i < sizes.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError")
    const chunk = payload.subarray(0, sizes[i])
    const start = now()
    await fetch(UP_URL, { method: "POST", body: chunk, cache: "no-store", signal })
    totalMs += now() - start
    totalBytes += sizes[i]
    onProgress(mbps(totalBytes, totalMs), (i + 1) / sizes.length)
  }
  return mbps(totalBytes, totalMs)
}

// Runs the full test, streaming progress updates through onProgress.
export async function runSpeedTest(
  onProgress: (p: SpeedProgress) => void,
  signal?: AbortSignal,
): Promise<SpeedProgress> {
  let state: SpeedProgress = { ...INITIAL }
  const push = (patch: Partial<SpeedProgress>) => {
    state = { ...state, ...patch }
    onProgress(state)
  }

  try {
    push({ phase: "latency", fraction: 0 })
    const { latency, jitter } = await measureLatency(signal)
    push({ latencyMs: Math.round(latency), jitterMs: Math.round(jitter), fraction: 1 })

    push({ phase: "download", fraction: 0 })
    const down = await measureDownload((m, f) => push({ downloadMbps: m, fraction: f }), signal)
    push({ downloadMbps: down, fraction: 1 })

    push({ phase: "upload", fraction: 0 })
    const up = await measureUpload((m, f) => push({ uploadMbps: m, fraction: f }), signal)
    push({ uploadMbps: up, fraction: 1 })

    push({ phase: "done", fraction: 1 })
    return state
  } catch (err) {
    const aborted = (err as Error)?.name === "AbortError"
    push({
      phase: aborted ? "idle" : "error",
      error: aborted ? undefined : "Speed test failed. Check your connection and try again.",
    })
    return state
  }
}

export function emptyProgress(): SpeedProgress {
  return { ...INITIAL }
}
