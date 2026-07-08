# Phone Invasion

A privacy and network scanner for iOS/Android built with **Expo** (React Native).
It runs on your own phone through **Expo Go** — no paid Apple Developer license required.

## What it does (all from real device signals)

- **Scan** — an overall privacy assessment derived from live signals (no fake threats).
- **Network** — connection type, IP, internet reachability, VPN detection, airplane mode.
- **Privacy** — the real grant status of Location, Notifications, and Camera permissions.
- **Device** — manufacturer, model, OS, and whether it's a physical device.

## Why some features were removed

The original native Swift version tried to do cell-tower / RF / deep file scanning.
Apple does not expose baseband, RF, or cross-app file access to third-party apps,
so those features cannot work in Expo Go (or any App Store app). Rather than fake
them, they were removed. Every value in this app is read directly from the OS.

## Run it on your phone

1. Install the **Expo Go** app from the App Store / Play Store.
2. In this project folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code in the terminal with your phone's camera (iOS) or the Expo Go app (Android).

## Tech

- Expo SDK 57 + Expo Router (file-based routing in `app/`)
- `expo-network`, `@react-native-community/netinfo` — connectivity
- `expo-device` — device metadata
- `expo-location`, `expo-notifications`, `expo-camera` — permission status only
