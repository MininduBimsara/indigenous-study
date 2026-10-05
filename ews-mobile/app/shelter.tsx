import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../contexts/AlertContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { triggerHaptic } from '../utils/haptic';
import { palette } from '../theme/colors';

interface Shelter {
  id: string;
  name: string;
  tag: string;
  distance: string;
  walkTime: string;
  capacity: string;
  bus: string;
  icon: string;
  tagBg: string;
  tagText: string;
  desc: string;
}

const SHELTERS: Shelter[] = [
  {
    id: 'a',
    name: 'COMMUNITY CENTER',
    tag: 'QUIET SHELTER',
    distance: '0.3 miles',
    walkTime: '6 min walk',
    capacity: 'Has space',
    bus: 'Bus 12 stops here',
    icon: '🏫',
    tagBg: palette.blue[100],
    tagText: palette.blue[900],
    desc: 'Calm and quiet. Good for families.',
  },
  {
    id: 'b',
    name: 'CITY HALL',
    tag: 'NEAR FOOD',
    distance: '0.7 miles',
    walkTime: '14 min walk',
    capacity: 'Has space',
    bus: 'Bus 5 stops here',
    icon: '🏛️',
    tagBg: palette.emerald[100],
    tagText: palette.emerald[800],
    desc: 'Hot food and water available.',
  },
  {
    id: 'c',
    name: 'HIGH SCHOOL GYM',
    tag: 'LARGEST',
    distance: '1.2 miles',
    walkTime: '24 min walk',
    capacity: 'Has space',
    bus: 'Shuttle every 15 min',
    icon: '🏟️',
    tagBg: palette.orange[100],
    tagText: palette.orange[900],
    desc: 'Most room. Medical staff on site.',
  },
];

export default function ShelterScreen() {
  const { speakMessage } = useAlert();
  const { adaptiveSettings } = useUserPreferences();
  const [showOthers, setShowOthers] = useState(false);

  // W07/W08 (G74, G110): nearest shelter first; 2-action profiles see others only on request; focus mode hides clutter
  const compact = adaptiveSettings.maxButtonsPerScreen <= 2;
  const hideDetails = adaptiveSettings.focusMode;
  const [nearest, ...others] = SHELTERS;
  const visible = compact && !showOthers ? [nearest] : SHELTERS;

  const handleChooseShelter = (shelter: Shelter) => {
    speakMessage(`Going to ${shelter.name}. It is ${shelter.distance} away. ${shelter.walkTime}.`);
    triggerHaptic('success');
    router.push('/safe-route');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FIND SHELTER</Text>
        <Text style={styles.headerSubtitle}>Choose one near you</Text>
      </View>

      {/* Read aloud instructions */}
      <View style={styles.listenContainer}>
        <TouchableOpacity
          onPress={() => speakMessage('Find shelter. Three shelters are nearby. Community Center is 6 minutes walk. City Hall is 14 minutes walk. High School Gym is 24 minutes walk.')}
          style={styles.listenBtn}
          accessibilityLabel="Hear shelter choices read aloud"
          accessibilityRole="button"
        >
          <Ionicons name="volume-high" size={24} color={palette.slate[600]} />
          <Text style={styles.listenBtnText}>LISTEN</Text>
        </TouchableOpacity>
      </View>

      {/* Shelters list */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {visible.map((shelter, i) => (
          <View key={shelter.id} style={styles.shelterItemWrapper}>
            {/* Section label for first and second group */}
            {i === 0 && (
              <Text style={styles.sectionHeader}>NEAREST SAFE PLACE</Text>
            )}
            {i === 1 && (
              <Text style={styles.sectionHeader}>OTHER SAFE PLACES</Text>
            )}

            <TouchableOpacity
              onPress={() => handleChooseShelter(shelter)}
              style={[styles.card, i === 0 && styles.nearestCard]}
              accessibilityLabel={`Go to ${shelter.name}, ${shelter.distance}, ${shelter.walkTime}`}
            >
              {/* Emoji icon */}
              <Text style={styles.shelterEmoji}>{shelter.icon}</Text>

              {/* Info details */}
              <View style={styles.shelterDetails}>
                <View style={styles.titleRow}>
                  <Text style={styles.shelterName}>{shelter.name}</Text>
                  <View style={[styles.tag, { backgroundColor: shelter.tagBg }]}>
                    <Text style={[styles.tagText, { color: shelter.tagText }]}>{shelter.tag}</Text>
                  </View>
                </View>
                
                <Text style={styles.shelterDesc}>{shelter.desc}</Text>
                
                {/* Distance and travel stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="pin" size={16} color={palette.slate[600]} />
                    <Text style={styles.statText}>{shelter.distance}</Text>
                  </View>
                  <Text style={styles.bulletDot}>·</Text>
                  <Text style={styles.statText}>{shelter.walkTime}</Text>
                </View>

                {/* Capacity and Bus routes - hidden in focus mode to prevent decision paralysis (G110/G124) */}
                {!hideDetails && (
                  <View style={styles.extraStatsRow}>
                    <View style={styles.extraStatItem}>
                      <Ionicons name="people" size={14} color={palette.slate[500]} />
                      <Text style={styles.extraStatText}>{shelter.capacity}</Text>
                    </View>
                    <View style={styles.extraStatItem}>
                      <Ionicons name="bus" size={14} color={palette.slate[500]} />
                      <Text style={styles.extraStatText}>{shelter.bus}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Navigation indicator */}
              <Ionicons name="chevron-forward" size={28} color={palette.slate[400]} style={styles.chevron} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Expand others button when in compact view */}
        {compact && !showOthers && others.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowOthers(true)}
            style={styles.otherPlacesBtn}
            accessibilityLabel="Show other safe places"
          >
            <Text style={styles.otherPlacesBtnText}>OTHER SAFE PLACES ({others.length})</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Persistent bottom home exit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.homeBtn}
          accessibilityLabel="Go home"
          accessibilityRole="button"
        >
          <Ionicons name="home" size={22} color={palette.slate[600]} />
          <Text style={styles.homeBtnText}>HOME</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  header: {
    backgroundColor: palette.slate[900],
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: palette.white,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: palette.slate[300],
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  listenContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.slate[100],
    borderWidth: 2,
    borderColor: palette.slate[300],
    borderRadius: 16,
    paddingVertical: 12,
    minHeight: 48,
    gap: 8,
  },
  listenBtnText: {
    color: palette.slate[600],
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  shelterItemWrapper: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: palette.slate[700],
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: palette.slate[300],
    backgroundColor: palette.white,
    padding: 16,
    gap: 12,
    alignItems: 'flex-start',
    minHeight: 120,
  },
  nearestCard: {
    borderColor: palette.slate[900],
    borderWidth: 4,
    backgroundColor: palette.white,
    elevation: 4,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  otherPlacesBtn: {
    backgroundColor: palette.slate[50],
    borderRadius: 20,
    borderWidth: 3,
    borderColor: palette.slate[300],
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    marginTop: 8,
  },
  otherPlacesBtnText: {
    color: palette.slate[800],
    fontSize: 18,
    fontWeight: '900',
  },
  shelterEmoji: {
    fontSize: 48,
    marginTop: 2,
  },
  shelterDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  shelterName: {
    fontSize: 20,
    fontWeight: '900',
    color: palette.slate[900],
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '900',
  },
  shelterDesc: {
    fontSize: 15,
    color: palette.slate[600],
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.slate[700],
  },
  bulletDot: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.slate[700],
  },
  extraStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  extraStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  extraStatText: {
    fontSize: 13,
    color: palette.slate[500],
    fontWeight: '700',
  },
  chevron: {
    alignSelf: 'center',
  },
  footer: {
    padding: 20,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.slate[100],
    borderRadius: 20,
    paddingVertical: 14,
    minHeight: 56,
    gap: 8,
  },
  homeBtnText: {
    color: palette.slate[600],
    fontSize: 18,
    fontWeight: '800',
  },
});
