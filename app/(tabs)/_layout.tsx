import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "@/theme/colors"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: "Network",
          tabBarIcon: ({ color, size }) => <Ionicons name="wifi" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          title: "Privacy",
          tabBarIcon: ({ color, size }) => <Ionicons name="lock-closed" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="device"
        options={{
          title: "Device",
          tabBarIcon: ({ color, size }) => <Ionicons name="phone-portrait" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
