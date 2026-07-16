import AsyncStorage from "@react-native-async-storage/async-storage"

// A single saved speed-test run, enriched with the network context at the time
// so the AI report can reason about *why* results look the way they do.
export type SpeedRun = {
  id: string
  timestamp: number
  downloadMbps: number
  uploadMbps: number
  pingMs: number
  jitterMs: number
  connectionType: string
  isp: string | null
  countryCode: string | null
  isVpn: boolean | null
}

const KEY = "pi.history.speedruns.v1"
const MAX_RUNS = 50

export async function loadRuns(): Promise<SpeedRun[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as SpeedRun[]
  } catch {
    return []
  }
}

export async function saveRun(run: Omit<SpeedRun, "id" | "timestamp">): Promise<SpeedRun[]> {
  const record: SpeedRun = {
    ...run,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  }
  const existing = await loadRuns()
  // Newest first, capped so storage never grows unbounded.
  const next = [record, ...existing].slice(0, MAX_RUNS)
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Non-fatal: history is a convenience, not critical state.
  }
  return next
}

export async function clearRuns(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

// Simple aggregate stats used by the report header and passed to the AI.
export function summarize(runs: SpeedRun[]) {
  if (runs.length === 0) return null
  const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length
  return {
    count: runs.length,
    avgDownload: Number(avg(runs.map((r) => r.downloadMbps)).toFixed(1)),
    avgUpload: Number(avg(runs.map((r) => r.uploadMbps)).toFixed(1)),
    avgPing: Math.round(avg(runs.map((r) => r.pingMs))),
    avgJitter: Math.round(avg(runs.map((r) => r.jitterMs))),
    bestDownload: Number(Math.max(...runs.map((r) => r.downloadMbps)).toFixed(1)),
    worstDownload: Number(Math.min(...runs.map((r) => r.downloadMbps)).toFixed(1)),
    latest: runs[0],
  }
}
