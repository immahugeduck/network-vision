import { useCallback, useEffect, useState } from "react"
import { getFreeDiskStorageAsync, getTotalDiskCapacityAsync } from "expo-file-system/legacy"

// Reads real device storage capacity via expo-file-system. These native APIs
// are unavailable on web, so we report that honestly rather than guessing.

export type StorageInfo = {
  freeBytes: number
  totalBytes: number
  usedBytes: number
  usedFraction: number
}

export function useStorageInfo() {
  const [info, setInfo] = useState<StorageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [free, total] = await Promise.all([getFreeDiskStorageAsync(), getTotalDiskCapacityAsync()])
      if (typeof free !== "number" || typeof total !== "number" || total <= 0) {
        throw new Error("unavailable")
      }
      const used = Math.max(0, total - free)
      setInfo({
        freeBytes: free,
        totalBytes: total,
        usedBytes: used,
        usedFraction: used / total,
      })
      setAvailable(true)
    } catch {
      setAvailable(false)
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { info, loading, available, reload: load }
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}
