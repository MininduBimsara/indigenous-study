import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptic';
import { palette } from '../theme/colors';

interface StressEscalationTimerProps {
  seconds?: number;
  onEscalate: () => void;
  onDismiss?: () => void;
}

// G127 – Stress-aware fallback to human help
export function StressEscalationTimer({ seconds = 60, onEscalate, onDismiss }: StressEscalationTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [escalated, setEscalated] = useState(false);

  const handleEscalate = useCallback(() => {
    setEscalated(true);
    triggerHaptic('alert');
    onEscalate();
  }, [onEscalate]);

  useEffect(() => {
    if (escalated) return;
    if (remaining <= 0) { handleEscalate(); return; }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, escalated, handleEscalate]);

  useEffect(() => {
    if (remaining === 40 || remaining === 20) triggerHaptic('double');
  }, [remaining]);

  if (escalated) return null;

  const pct = remaining / seconds;
  const isUrgent = remaining <= 15;
  const barColor = isUrgent ? palette.red[500] : palette.amber[500];

  return (
    <View style={[styles.container, { borderColor: barColor }]}>
      {/* Progress bar */}
      <View style={styles.barBg}>
        <View style={[styles.bar, { width: `${pct * 100}%` as any, backgroundColor: barColor }]} />
      </View>

      <View style={styles.row}>
        <Ionicons name="call" size={28} color={barColor} />
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: isUrgent ? palette.red[800] : palette.amber[800] }]}>
            Auto-calling your helper in{' '}
            <Text style={styles.countdown}>{remaining}</Text>s
          </Text>
          <Text style={[styles.sub, { color: isUrgent ? palette.red[700] : palette.yellow[700] }]}>
            Tap below to handle it yourself.
          </Text>
        </View>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            style={[styles.cancelBtn, { backgroundColor: barColor }]}
            accessibilityLabel="Cancel auto-call"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16,
    borderWidth: 2, overflow: 'hidden', backgroundColor: palette.amber[50],
  },
  barBg: { height: 6, backgroundColor: palette.gray[200] },
  bar: { height: 6 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  textBlock: { flex: 1 },
  title: { fontWeight: '800', fontSize: 14, lineHeight: 20 },
  countdown: { fontSize: 18, fontVariant: ['tabular-nums'] },
  sub: { fontSize: 12, marginTop: 2 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minWidth: 70, alignItems: 'center' },
  cancelText: { color: palette.white, fontWeight: '800', fontSize: 13 },
});
