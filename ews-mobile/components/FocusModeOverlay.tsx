import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme/colors';

// G112 – Focus mode: hides secondary tasks, one-thing-at-a-time overlay
interface FocusModeOverlayProps {
  children: React.ReactNode;
  onExit: () => void;
  stepLabel?: string;
}

export function FocusModeOverlay({ children, onExit, stepLabel }: FocusModeOverlayProps) {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={palette.slate[900]} />
      {/* Top bar */}
      <View style={styles.topBar}>
        {stepLabel && <Text style={styles.stepLabel}>{stepLabel}</Text>}
        <TouchableOpacity onPress={onExit} style={styles.exitBtn} accessibilityLabel="Exit focus mode">
          <Ionicons name="close" size={22} color={palette.white} />
          <Text style={styles.exitText}>Exit Focus</Text>
        </TouchableOpacity>
      </View>

      {/* Gradient accent bar */}
      <View style={styles.accentBar} />

      {/* Content */}
      <View style={styles.content}>{children}</View>

      <Text style={styles.footerNote}>Focus Mode — all other tasks are hidden</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.slate[900] },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  stepLabel: { color: palette.white, fontWeight: '900', fontSize: 20, letterSpacing: 1 },
  exitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 14, minHeight: 48,
  },
  exitText: { color: palette.white, fontWeight: '700', fontSize: 14 },
  accentBar: {
    height: 3,
    backgroundColor: palette.blue[500],
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  footerNote: { color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', paddingBottom: 24, paddingHorizontal: 20 },
});
