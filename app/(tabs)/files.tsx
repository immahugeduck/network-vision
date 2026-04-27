import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, SeverityColors } from '../../constants/Colors';
import type { SuspiciousFile } from '../../types';

const DEMO_FILES: SuspiciousFile[] = [
  { id: '1', name: 'tracking-cache.db', location: '/Library/Caches', detail: 'Persistent cache with identifier-like values.', severity: 'medium' },
  { id: '2', name: 'profile.mobileconfig', location: '/Library/Profiles', detail: 'Configuration profile should be reviewed.', severity: 'high' },
  { id: '3', name: 'analytics.plist', location: '/Library/Preferences', detail: 'Analytics preferences file detected.', severity: 'low' },
];

export default function FilesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="folder" size={20} color={Colors.blue} />
        <Text style={styles.title}>Suspicious Files</Text>
        <Text style={styles.badge}>{DEMO_FILES.length}</Text>
      </View>
      <FlatList
        data={DEMO_FILES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <FileCard file={item} />}
      />
    </SafeAreaView>
  );
}

function FileCard({ file }: { file: SuspiciousFile }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="document" size={16} color={SeverityColors[file.severity]} />
        <Text style={styles.name}>{file.name}</Text>
        <Text style={[styles.severity, { color: SeverityColors[file.severity] }]}>
          {file.severity.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.location}>{file.location}</Text>
      <Text style={styles.detail}>{file.detail}</Text>
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
  name: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1, fontFamily: 'monospace' },
  severity: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  location: { fontSize: 12, color: Colors.blue, marginBottom: 6, fontFamily: 'monospace' },
  detail: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
