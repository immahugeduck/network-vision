import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, SeverityColors } from '../../constants/Colors';
import type { Tracker } from '../../types';

const DEMO_TRACKERS: Tracker[] = [
  { id: '1', name: 'Meta SDK', company: 'Meta', detail: 'Ad attribution and engagement telemetry detected.', severity: 'high' },
  { id: '2', name: 'Crash Reporter', company: 'Third Party', detail: 'Crash analytics framework loaded in app process.', severity: 'medium' },
  { id: '3', name: 'Google Analytics', company: 'Google', detail: 'Usage analytics and session tracking.', severity: 'medium' },
];

export default function TrackersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="eye" size={20} color={Colors.blue} />
        <Text style={styles.title}>Trackers</Text>
        <Text style={styles.badge}>{DEMO_TRACKERS.length}</Text>
      </View>
      <FlatList
        data={DEMO_TRACKERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TrackerCard tracker={item} />}
      />
    </SafeAreaView>
  );
}

function TrackerCard({ tracker }: { tracker: Tracker }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.dot, { backgroundColor: SeverityColors[tracker.severity] }]} />
        <Text style={styles.name}>{tracker.name}</Text>
        <Text style={[styles.severity, { color: SeverityColors[tracker.severity] }]}>
          {tracker.severity.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.company}>{tracker.company}</Text>
      <Text style={styles.detail}>{tracker.detail}</Text>
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
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  severity: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  company: { fontSize: 12, color: Colors.blue, marginBottom: 6 },
  detail: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
