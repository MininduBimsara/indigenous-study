import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme/colors';

// Splash screen - auto-advances to impairment selection after 3s
export default function SplashScreen() {
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Progress bar animation
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        router.replace('/onboard/impairment');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      router.replace('/onboard/impairment');
    });
  };

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.blue[900]} />

      {/* Logo */}
      <View style={styles.logoWrap}>
        <View style={styles.logoBg}>
          <Ionicons name="shield-checkmark" size={72} color={palette.blue[600]} />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>DEWS</Text>
      <Text style={styles.subtitle}>Disaster Early Warning System</Text>

      {/* Tagline */}
      <View style={styles.tagline}>
        <Ionicons name="heart" size={18} color={palette.blue[200]} />
        <Text style={styles.taglineText}>Designed for everyone</Text>
        <Ionicons name="people" size={18} color={palette.blue[200]} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <Animated.View
          style={[styles.progressBar, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
        />
      </View>

      {/* Skip */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} accessibilityLabel="Skip loading">
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: palette.blue[900],
  },
  logoWrap: { marginBottom: 28 },
  logoBg: {
    backgroundColor: palette.white, borderRadius: 999,
    padding: 28, shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25,
    shadowRadius: 16, elevation: 10,
  },
  title: { fontSize: 56, fontWeight: '900', color: palette.white, letterSpacing: 2 },
  subtitle: { fontSize: 20, color: palette.blue[200], fontWeight: '600', marginTop: 6, textAlign: 'center' },
  tagline: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 40 },
  taglineText: { color: palette.blue[100], fontSize: 16 },
  progressBg: { width: 180, height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' },
  progressBar: { height: 6, backgroundColor: palette.white, borderRadius: 999 },
  skipBtn: { marginTop: 24, paddingHorizontal: 16, paddingVertical: 10 },
  skipText: { color: palette.blue[200], fontSize: 14, textDecorationLine: 'underline' },
});
