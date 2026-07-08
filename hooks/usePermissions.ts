import { useCallback, useEffect, useState } from "react"
import * as Location from "expo-location"
import * as Notifications from "expo-notifications"
import { Camera } from "expo-camera"

export type PermissionState = "granted" | "denied" | "undetermined" | "unavailable"

export type PermissionItem = {
  key: string
  title: string
  description: string
  state: PermissionState
}

function normalize(status: string | undefined): PermissionState {
  switch (status) {
    case "granted":
      return "granted"
    case "denied":
      return "denied"
    case "undetermined":
      return "undetermined"
    default:
      return "unavailable"
  }
}

// Reads the REAL permission grant status for sensors this app can query.
// It never requests access silently — it only inspects current status, which
// is exactly what a privacy audit should do.
export function usePermissions() {
  const [items, setItems] = useState<PermissionItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [loc, notif, cam] = await Promise.all([
        Location.getForegroundPermissionsAsync().catch(() => null),
        Notifications.getPermissionsAsync().catch(() => null),
        Camera.getCameraPermissionsAsync().catch(() => null),
      ])

      setItems([
        {
          key: "location",
          title: "Location",
          description: "Apps with this permission can read where you are.",
          state: normalize(loc?.status),
        },
        {
          key: "notifications",
          title: "Notifications",
          description: "Controls whether apps can send you alerts.",
          state: normalize(notif?.status),
        },
        {
          key: "camera",
          title: "Camera",
          description: "Apps with this permission can capture photos and video.",
          state: normalize(cam?.status),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { items, loading, reload: load }
}
