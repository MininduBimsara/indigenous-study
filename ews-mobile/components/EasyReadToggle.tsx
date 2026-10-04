import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptic';

// G121 – Easy Read toggle
interface EasyReadToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export function EasyReadToggle({ isActive, onToggle }: EasyReadToggleProps) {
  return (
    <TouchableOpacity
      onPress={() => { triggerHaptic('tap'); onToggle(); }}
      style={[styles.btn, isActive ? styles.active : styles.inactive]}
      accessibilityLabel={isActive ? 'Switch to standard view' : 'Switch to Easy Read'}
      accessibilityRole="switch"
      accessibilityState={{ checked: isActive }}
    >
      <Ionicons name="book-outline" size={18} color={isActive ? '#fff' : 'rgba(255,255,255,0.85)'} />
      <Text style={[styles.label, { color: isActive ? '#fff' : 'rgba(255,255,255,0.9)' }]}>Easy Read</Text>
    </TouchableOpacity>
  );
}

export function toEasyRead(text: string): string {
  const replacements: [RegExp, string][] = [
    [/evacuate/gi, 'leave your home'],
    [/evacuation/gi, 'leaving your home'],
    [/hazard/gi, 'danger'],
    [/shelter/gi, 'safe place'],
    [/immediately/gi, 'right now'],
    [/initiate/gi, 'start'],
    [/procedure/gi, 'steps'],
    [/remain/gi, 'stay'],
  ];
  let out = text;
  for (const [pat, rep] of replacements) out = out.replace(pat, rep);
  return out;
}

export function getHazardSymbol(type: string): string {
  const l = type.toLowerCase();
  if (l.includes('flood')) return '🌊';
  if (l.includes('tornado') || l.includes('cyclone')) return '🌪️';
  if (l.includes('fire')) return '🔥';
  if (l.includes('earthquake')) return '🪨';
  if (l.includes('storm') || l.includes('thunder')) return '⛈️';
  if (l.includes('tsunami')) return '🌊';
  return '⚠️';
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    minHeight: 44, borderWidth: 2,
  },
  active: { backgroundColor: '#1e40af', borderColor: '#1e40af' },
  inactive: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)' },
  label: { fontWeight: '700', fontSize: 14 },
});
