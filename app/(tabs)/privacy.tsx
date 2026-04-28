import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface PermissionItem {
  id: string;
  name: string;
  icon: string;
  status: 'granted' | 'denied' | 'not-determined';
  risk: string;
}

const PERMISSIONS: PermissionItem[] = [
  { id: '1', name: 'Camera', icon: 'camera', status: 'granted', risk: 'High — can capture photos/video' },
  { id: '2', name: 'Microphone', icon: 'mic', status: 'denied', risk: 'High — can record audio' },
  { id: '3', name: 'Location', icon: 'location', status: 'granted', risk: 'High — reveals physical location' },
  { id: '4', name: 'Contacts', icon: 'people', status: 'denied', risk: 'Medium — access to address book' },
  { id: '5', name: 'Local Network', icon: 'wifi', status: 'granted', risk: 'Medium — scans local devices' },
  { id: '6', name: 'Notifications', icon: 'notifications', status: 'granted', risk: 'Low — can deliver alerts' },
];

const statusColor = (status: PermissionItem['status']) => {
  if (status === 'granted') return Colors.orange;
  if (status === 'denied') return Colors.green;
  return Colors.textMuted;
};

const statusLabel = (status: PermissionItem['status']) => {
  if (status === 'granted') return 'GRANTED';
  if (status === 'denied') return 'DENIED';
  return 'UNKNOWN';
};

export default function PrivacyScreen() {
  const granted = PERMISSIONS.filter((p) => p.status === 'granted').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={20} color={Colors.blue} />
        <Text style={styles.title}>Privacy Audit</Text>
        <Text style={[styles.badge, { backgroundColor: granted > 3 ? Colors.orange : Colors.green }]}>
          {granted} active
        </Text>
      </View>
      <FlatList
        data={PERMISSIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PermissionCard item={item} />}
      />
    </SafeAreaView>
  );
}

function PermissionCard({ item }: { item: PermissionItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={item.icon as any} size={18} color={statusColor(item.status)} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.status, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
      </View>
      <Text style={styles.risk}>{item.risk}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  badge: { color: '#000', fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 12 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: Colors.surfaceElevated, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  status: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  risk: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
