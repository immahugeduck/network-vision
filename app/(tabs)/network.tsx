import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, SeverityColors } from '../../constants/Colors';
import type { NetworkDevice } from '../../types';

const DEMO_DEVICES: NetworkDevice[] = [
  { id: '1', name: 'Router', ipAddress: '192.168.1.1', detail: 'Expected gateway device.', severity: 'low' },
  { id: '2', name: 'Unknown Device', ipAddress: '192.168.1.44', detail: 'Unrecognized client observed on LAN.', severity: 'high' },
  { id: '3', name: 'Smart TV', ipAddress: '192.168.1.22', detail: 'Known device — verify if expected.', severity: 'low' },
];

export default function NetworkScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wifi" size={20} color={Colors.blue} />
        <Text style={styles.title}>Network Devices</Text>
        <Text style={styles.badge}>{DEMO_DEVICES.length}</Text>
      </View>
      <FlatList
        data={DEMO_DEVICES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <DeviceCard device={item} />}
      />
    </SafeAreaView>
  );
}

function DeviceCard({ device }: { device: NetworkDevice }) {
  const icon = device.severity === 'high' ? 'warning' : 'checkmark-circle';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={16} color={SeverityColors[device.severity]} />
        <Text style={styles.name}>{device.name}</Text>
        <Text style={[styles.ip, { color: SeverityColors[device.severity] }]}>{device.ipAddress}</Text>
      </View>
      <Text style={styles.detail}>{device.detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  badge: { backgroundColor: Colors.blue, color: '#000', fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 12 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: Colors.surfaceElevated, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  ip: { fontSize: 13, fontFamily: 'monospace', fontWeight: '600' },
  detail: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
