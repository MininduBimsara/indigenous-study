import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../../contexts/AlertContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { triggerHaptic } from '../../utils/haptic';

const SLIDES = [
  {
    icon: 'shield-checkmark' as const,
    title: 'You Are Protected',
    body: 'DEWS sends you simple, clear alerts when there is danger near you.',
    bg: '#1e3a8a', text: '#ffffff', sub: '#bfdbfe',
  },
  {
    icon: 'volume-high' as const,
    title: 'Sound + Vibration',
    body: 'When danger is close, your phone will make noise AND vibrate so you notice.',
    bg: '#14532d', text: '#ffffff', sub: '#bbf7d0',
  },
  {
    icon: 'people' as const,
    title: 'Your Helpers Are Connected',
    body: 'Your helpers will see your status. You can call them with one tap.',
    bg: '#581c87', text: '#ffffff', sub: '#e9d5ff',
  },
  {
    icon: 'hand-left' as const,
    title: 'Simple Buttons',
    body: 'Every button is big and clear. You always have a way to go back home.',
    bg: '#7c2d12', text: '#ffffff', sub: '#fed7aa',
  },
];

export default function WelcomeScreen() {
  const { completeOnboarding, speakMessage } = useAlert();
  const { adaptiveSettings } = useUserPreferences();
  const [step, setStep] = useState(0);

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const handleNext = async () => {
    triggerHaptic('tap');
    if (isLast) {
      await completeOnboarding();
      router.replace('/(tabs)');
    } else {
      setStep(s => s + 1);
      speakMessage(SLIDES[step + 1].title + '. ' + SLIDES[step + 1].body);
    }
  };

  const handleBack = () => {
    if (step > 0) { triggerHaptic('tap'); setStep(s => s - 1); }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={slide.bg} />

      {/* Step indicator */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      {/* Icon */}
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <Ionicons name={slide.icon} size={64} color={slide.bg} />
        </View>
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: slide.text }]}>{slide.title}</Text>
        <Text style={[styles.body, { color: slide.sub }]}>{slide.body}</Text>
      </View>

      {/* G39: Voice button */}
      <TouchableOpacity
        onPress={() => speakMessage(slide.title + '. ' + slide.body)}
        style={[styles.listenBtn, { borderColor: 'rgba(255,255,255,0.4)' }]}
        accessibilityLabel="Hear this read aloud"
      >
        <Ionicons name="volume-high" size={22} color="#fff" />
        <Text style={styles.listenText}>LISTEN</Text>
      </TouchableOpacity>

      {/* Navigation */}
      <View style={styles.navRow}>
        {step > 0 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        ) : <View style={{ width: 56 }} />}

        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextBtn}
          accessibilityLabel={isLast ? 'Start using the app' : 'Next slide'}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>{isLast ? "LET'S START" : 'NEXT'}</Text>
          <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={24} color={slide.bg} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingVertical: 24 },
  dots: { flexDirection: 'row', gap: 8, paddingTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#fff', width: 28 },
  iconWrap: { alignItems: 'center', marginTop: 24 },
  iconCircle: { backgroundColor: 'rgba(255,255,255,0.95)', width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10 },
  textBlock: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, gap: 20 },
  title: { fontSize: 34, fontWeight: '900', textAlign: 'center', lineHeight: 40 },
  body: { fontSize: 20, textAlign: 'center', lineHeight: 30 },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 14, marginBottom: 12 },
  listenText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: 8 },
  backBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  nextBtn: { flex: 1, marginLeft: 16, backgroundColor: '#fff', borderRadius: 24, paddingVertical: 20, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 72 },
  nextText: { fontSize: 22, fontWeight: '900', color: '#1e3a8a' },
});
