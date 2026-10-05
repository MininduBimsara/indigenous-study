import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserPreferences, ImpairmentType } from '../../contexts/UserPreferencesContext';
import { palette } from '../../theme/colors';

interface ImpairmentOption {
  type: ImpairmentType;
  iconName: string;
  iconLib: 'Ionicons' | 'MaterialCommunityIcons';
  label: string;
  description: string;
  adaptations: string[];
  bg: string;
  accent: string;
}

const OPTIONS: ImpairmentOption[] = [
  {
    type: 'dementia', iconName: 'brain', iconLib: 'MaterialCommunityIcons',
    label: 'Dementia',
    description: 'Memory support with simple, repeated instructions',
    adaptations: ['Extra-large text', 'Max 2 buttons', 'Memory aids', 'Calm colors'],
    bg: palette.blue[50], accent: palette.blue[500],
  },
  {
    type: 'autism', iconName: 'puzzle', iconLib: 'MaterialCommunityIcons',
    label: 'Autism Spectrum',
    description: 'Predictable routines and sensory-friendly design',
    adaptations: ['Routine mode', 'Muted colors', 'Progress steps', 'Confirmations'],
    bg: palette.purple[50], accent: palette.purple[600],
  },
  {
    type: 'mci', iconName: 'heart-handshake', iconLib: 'MaterialCommunityIcons',
    label: 'Mild Cognitive Impairment',
    description: 'Clear labels and confirmation steps',
    adaptations: ['Memory reminders', 'Simple language', 'Clear hierarchy'],
    bg: palette.green[50], accent: palette.green[600],
  },
  {
    type: 'adhd', iconName: 'lightning-bolt', iconLib: 'MaterialCommunityIcons',
    label: 'ADHD',
    description: 'Focus mode with minimal distractions',
    adaptations: ['Focus mode', 'Vibrant colors', 'Short steps', 'Max 2 actions'],
    bg: palette.orange[50], accent: palette.orange[500],
  },
  {
    type: 'schizophrenia', iconName: 'eye', iconLib: 'Ionicons',
    label: 'Schizophrenia',
    description: 'Calm interface with clear, grounded information',
    adaptations: ['Reality anchors', 'Calm design', 'Extra-large text'],
    bg: palette.teal[50], accent: palette.teal[600],
  },
];

export default function ImpairmentScreen() {
  const { setImpairmentType } = useUserPreferences();
  const [expanded, setExpanded] = useState<ImpairmentType | null>(null);

  const handleSelect = async (type: ImpairmentType) => {
    await setImpairmentType(type);
    router.replace('/onboard/welcome');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.slate[50]} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Personalise Your Experience</Text>
        <Text style={styles.subheading}>
          Choose what best describes your needs. This customises the app for you.
        </Text>

        {OPTIONS.map(opt => {
          const isExp = expanded === opt.type;
          const IconComp = opt.iconLib === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
          return (
            <View key={opt.type} style={styles.cardWrap}>
              <TouchableOpacity
                onPress={() => handleSelect(opt.type)}
                style={[styles.card, { backgroundColor: opt.bg, borderColor: opt.accent }]}
                accessibilityLabel={`Select ${opt.label}`}
                activeOpacity={0.85}
              >
                <View style={[styles.iconCircle, { backgroundColor: opt.accent }]}>
                  <IconComp name={opt.iconName as any} size={32} color={palette.white} />
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, { color: palette.slate[900] }]}>{opt.label}</Text>
                  <Text style={[styles.cardDesc]}>{opt.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={opt.accent} />
              </TouchableOpacity>

              {/* Info toggle */}
              <TouchableOpacity
                onPress={() => setExpanded(isExp ? null : opt.type)}
                style={[styles.infoBtn, { borderColor: opt.accent }]}
                accessibilityLabel={`Learn more about ${opt.label}`}
              >
                <Ionicons name={isExp ? 'chevron-up' : 'information-circle-outline'} size={18} color={opt.accent} />
                <Text style={[styles.infoBtnText, { color: opt.accent }]}>{isExp ? 'Less' : 'Learn more'}</Text>
              </TouchableOpacity>

              {isExp && (
                <View style={[styles.details, { borderColor: opt.accent }]}>
                  {opt.adaptations.map((a, i) => (
                    <View key={i} style={styles.adaptRow}>
                      <Ionicons name="checkmark-circle" size={16} color={opt.accent} />
                      <Text style={styles.adaptText}>{a}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Skip */}
        <TouchableOpacity onPress={() => handleSelect(null)} style={styles.skipBtn} accessibilityLabel="Skip, use default settings">
          <Text style={styles.skipText}>Skip — Use default settings</Text>
        </TouchableOpacity>

        <Text style={styles.privacy}>
          Your selection is stored only on this device and can be changed later in Settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.slate[50] },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '900', color: palette.slate[900], marginBottom: 10 },
  subheading: { fontSize: 16, color: palette.slate[600], lineHeight: 24, marginBottom: 28 },
  cardWrap: { marginBottom: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20,
    borderWidth: 2, gap: 14, minHeight: 80,
  },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 3 },
  cardDesc: { fontSize: 13, color: palette.slate[600], lineHeight: 18 },
  infoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderRadius: 12, alignSelf: 'flex-start', marginTop: 6,
  },
  infoBtnText: { fontSize: 13, fontWeight: '700' },
  details: { marginTop: 8, padding: 14, borderWidth: 1, borderRadius: 14, gap: 8 },
  adaptRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adaptText: { fontSize: 14, color: palette.slate[700], flex: 1 },
  skipBtn: { marginTop: 24, alignItems: 'center', paddingVertical: 14 },
  skipText: { color: palette.slate[500], fontSize: 15, textDecorationLine: 'underline' },
  privacy: { fontSize: 12, color: palette.slate[400], textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
