import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const tabs: { name: string; title: string; icon: IconName; iconFocused: IconName }[] = [
  { name: 'index', title: 'Scan', icon: 'shield-outline', iconFocused: 'shield' },
  { name: 'trackers', title: 'Trackers', icon: 'eye-outline', iconFocused: 'eye' },
  { name: 'files', title: 'Files', icon: 'folder-outline', iconFocused: 'folder' },
  { name: 'network', title: 'Network', icon: 'wifi-outline', iconFocused: 'wifi' },
  { name: 'privacy', title: 'Privacy', icon: 'lock-closed-outline', iconFocused: 'lock-closed' },
  { name: 'rf', title: 'RF Shield', icon: 'radio-outline', iconFocused: 'radio' },
  { name: 'report', title: 'AI Report', icon: 'document-text-outline', iconFocused: 'document-text' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? tab.iconFocused : tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
