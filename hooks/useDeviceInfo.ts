import { useMemo } from "react"
import * as Device from "expo-device"
import { Platform } from "react-native"

export type DeviceInfo = {
  brand: string
  modelName: string
  osName: string
  osVersion: string
  deviceType: string
  isDevice: boolean
}

function deviceTypeLabel(type: Device.DeviceType | null): string {
  switch (type) {
    case Device.DeviceType.PHONE:
      return "Phone"
    case Device.DeviceType.TABLET:
      return "Tablet"
    case Device.DeviceType.DESKTOP:
      return "Desktop"
    case Device.DeviceType.TV:
      return "TV"
    default:
      return "Unknown"
  }
}

// Reads real device metadata exposed by expo-device.
export function useDeviceInfo(): DeviceInfo {
  return useMemo(
    () => ({
      brand: Device.brand ?? Device.manufacturer ?? "Unknown",
      modelName: Device.modelName ?? "Unknown",
      osName: Device.osName ?? Platform.OS,
      osVersion: Device.osVersion ?? String(Platform.Version),
      deviceType: deviceTypeLabel(Device.deviceType ?? null),
      isDevice: Device.isDevice,
    }),
    [],
  )
}
