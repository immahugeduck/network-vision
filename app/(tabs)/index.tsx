import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import type { ScanPhase, ScanLogEntry, Tracker, SuspiciousFile, NetworkDevice, RFTower } from '../../types';

function uuid() {
  return Math.random().toString(36).slice(2);
}

export default function ScanScreen() {
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<ScanLogEntry[]>([]);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [files, setFiles] = useState<SuspiciousFile[]>([]);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [towers, setTowers] = useState<RFTower[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const riskLevel = (): string => {
    const allSeverities = [
      ...trackers.map((t) => t.severity),
      ...files.map((f) => f.severity),
      ...devices.map((d) => d.severity),
    ];
    if (allSeverities.includes('critical')) return 'Critical';
    if (allSeverities.includes('high')) return 'High';
    if (allSeverities.includes('medium')) return 'Moderate';
    if (allSeverities.length > 0) return 'Low';
    return '—';
  };

  const riskColor = () => {
    const r = riskLevel();
    if (r === 'Critical') return Colors.purple;
    if (r === 'High') return Colors.red;
    if (r === 'Moderate') return Colors.orange;
    if (r === 'Low') return Colors.green;
    return Colors.textMuted;
  };

  const startScan = async () => {
    setPhase('scanning');
    setProgress(0);
    setLogs([{ id: uuid(), message: 'Initializing scan…', timestamp: new Date() }]);
    setTrackers([]);
    setFiles([]);
    setDevices([]);
    setTowers([]);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    const phases = [
      'Scanning for trackers…',
      'Auditing file system…',
      'Mapping local network…',
      'Analysing RF environment…',
      'Generating risk report…',
    ];

    for (let i = 0; i < phases.length; i++) {
      await delay(600);
      setProgress((i + 1) * 20);
      setLogs((prev) => [...prev, { id: uuid(), message: phases[i], timestamp: new Date() }]);
    }

    setTrackers([
      { id: uuid(), name: 'Meta SDK', company: 'Meta', detail: 'Ad attribution and engagement telemetry detected.', severity: 'high' },
      { id: uuid(), name: 'Crash Reporter', company: 'Third Party', detail: 'Crash analytics framework loaded in app process.', severity: 'medium' },
    ]);
    setFiles([
      { id: uuid(), name: 'tracking-cache.db', location: '/Library/Caches', detail: 'Persistent cache with identifier-like values.', severity: 'medium' },
      { id: uuid(), name: 'profile.mobileconfig', location: '/Library/Profiles', detail: 'Configuration profile should be reviewed.', severity: 'high' },
    ]);
    setDevices([
      { id: uuid(), name: 'Router', ipAddress: '192.168.1.1', detail: 'Expected gateway.', severity: 'low' },
      { id: uuid(), name: 'Unknown Device', ipAddress: '192.168.1.44', detail: 'Unrecognized client observed on LAN.', severity: 'high' },
    ]);
    setTowers([
      { id: uuid(), carrier: 'Carrier A', band: 'LTE B12', signalStrength: -79, status: 'Normal' },
      { id: uuid(), carrier: 'Carrier A', band: 'LTE B66', signalStrength: -52, status: 'Review' },
    ]);

    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    setPhase('complete');
    setLogs((prev) => [...prev, { id: uuid(), message: 'Scan complete. Review findings by tab.', timestamp: new Date() }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>PHONE INVASION</Text>
        <Text style={styles.subtitle}>Mobile Threat Scanner</Text>

        <View style={styles.shieldWrapper}>
          <Animated.View style={[styles.shieldRing, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.shieldIcon}>
            <Ionicons name="shield" size={64} color={phase === 'complete' ? riskColor() : Colors.blue} />
          </View>
        </View>

        {phase === 'complete' && (
          <View style={styles.riskBadge}>
            <Text style={styles.riskLabel}>Risk Level</Text>
            <Text style={[styles.riskValue, { color: riskColor() }]}>{riskLevel()}</Text>
          </View>
        )}

        {phase !== 'idle' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, phase === 'scanning' && styles.buttonDisabled]}
          onPress={startScan}
          disabled={phase === 'scanning'}
          activeOpacity={0.8}
        >
          <Ionicons name={phase === 'complete' ? 'refresh' : 'play'} size={18} color="#000" />
          <Text style={styles.buttonText}>
            {phase === 'idle' ? 'Start Scan' : phase === 'scanning' ? 'Scanning…' : 'Scan Again'}
          </Text>
        </TouchableOpacity>

        {logs.length > 0 && (
          <View style={styles.logBox}>
            {logs.map((entry) => (
              <Text key={entry.id} style={styles.logLine}>
                {'>'} {entry.message}
              </Text>
            ))}
          </View>
        )}

        {phase === 'complete' && (
          <View style={styles.summaryGrid}>
            <SummaryCard label="Trackers" count={trackers.length} icon="eye" color={Colors.red} />
            <SummaryCard label="Files" count={files.length} icon="folder" color={Colors.orange} />
            <SummaryCard label="Devices" count={devices.length} icon="wifi" color={Colors.blue} />
            <SummaryCard label="RF Towers" count={towers.length} icon="radio" color={Colors.purple} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ label, count, icon, color }: { label: string; count: number; icon: string; color: string }) {
  return (
    <View style={summaryStyles.card}>
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={summaryStyles.count}>{count}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 24, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: Colors.blue, letterSpacing: 4, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, letterSpacing: 2, marginBottom: 32 },
  shieldWrapper: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  shieldRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: Colors.blue + '44',
  },
  shieldIcon: { alignItems: 'center', justifyContent: 'center' },
  riskBadge: { alignItems: 'center', marginBottom: 20 },
  riskLabel: { fontSize: 12, color: Colors.textSecondary, letterSpacing: 2, marginBottom: 4 },
  riskValue: { fontSize: 28, fontWeight: '700', letterSpacing: 2 },
  progressContainer: { width: '100%', marginBottom: 20 },
  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.blue, borderRadius: 2 },
  progressText: { color: Colors.textSecondary, fontSize: 12, marginTop: 6, textAlign: 'right' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  logBox: {
    width: '100%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logLine: { color: Colors.green, fontSize: 12, fontFamily: 'monospace', marginBottom: 3 },
  summaryGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});

const summaryStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  count: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  label: { fontSize: 12, color: Colors.textSecondary },
});
