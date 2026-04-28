import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import type { RFTower } from '../../types';

const DEMO_TOWERS: RFTower[] = [
  { id: '1', carrier: 'Carrier A', band: 'LTE B12', signalStrength: -79, status: 'Normal' },
  { id: '2', carrier: 'Carrier A', band: 'LTE B66', signalStrength: -52, status: 'Review' },
  { id: '3', carrier: 'Unknown', band: 'GSM 850', signalStrength: -95, status: 'Suspicious' },
];

const statusColor = (status: string) => {
  if (status === 'Normal') return Colors.green;
  if (status === 'Review') return Colors.orange;
  return Colors.red;
};

const signalBars = (strength: number) => {
  if (strength > -60) return 5;
  if (strength > -70) return 4;
  if (strength > -80) return 3;
  if (strength > -90) return 2;
  return 1;
};

export default function RFScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="radio" size={20} color={Colors.blue} />
        <Text style={styles.title}>RF Shield</Text>
        <Text style={styles.subtitle}>Cell Tower Analysis</Text>
      </View>
      <FlatList
        data={DEMO_TOWERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TowerCard tower={item} />}
      />
    </SafeAreaView>
  );
}

function TowerCard({ tower }: { tower: RFTower }) {
  const bars = signalBars(tower.signalStrength);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="radio" size={16} color={statusColor(tower.status)} />
        <Text style={styles.carrier}>{tower.carrier}</Text>
        <Text style={[styles.status, { color: statusColor(tower.status) }]}>{tower.status.toUpperCase()}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.band}>{tower.band}</Text>
        <Text style={styles.signal}>{tower.signalStrength} dBm</Text>
      </View>
      <View style={styles.barsRow}>
        {Array.from({ length: 5 }, (_, i) => (
          <View
            key={i}
            style={[styles.bar, { height: 6 + i * 4, backgroundColor: i < bars ? statusColor(tower.status) : Colors.border }]}
          />
        ))}
        <Text style={styles.barsLabel}>{bars}/5 bars</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: 12, color: Colors.textSecondary },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: Colors.surfaceElevated, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  carrier: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  status: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  band: { fontSize: 13, color: Colors.blue, fontFamily: 'monospace' },
  signal: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'monospace' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 10, borderRadius: 2 },
  barsLabel: { fontSize: 12, color: Colors.textSecondary, marginLeft: 8 },
});
