import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert, FeedbackModality } from '../../contexts/AlertContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { triggerHaptic } from '../../utils/haptic';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { settings, updateSettings, speakMessage } = useAlert();
  const { impairmentType } = useUserPreferences();

  // G115 – DND state (local, persisted)
  const [dndStart, setDndStart] = useState('22:00');
  const [dndEnd, setDndEnd] = useState('07:00');
  const [dndEnabled, setDndEnabled] = useState(false);

  useEffect(() => {
    const loadDnd = async () => {
      try {
        const enabled = await AsyncStorage.getItem('dews_dnd_enabled');
        const start = await AsyncStorage.getItem('dews_dnd_start');
        const end = await AsyncStorage.getItem('dews_dnd_end');
        if (enabled !== null) setDndEnabled(enabled === 'true');
        if (start !== null) setDndStart(start);
        if (end !== null) setDndEnd(end);
      } catch {}
    };
    loadDnd();
  }, []);

  const toggleDnd = async () => {
    const next = !dndEnabled;
    setDndEnabled(next);
    try {
      await AsyncStorage.setItem('dews_dnd_enabled', String(next));
    } catch {}
    speakMessage(next ? 'Do not disturb is now on.' : 'Do not disturb is now off.');
    triggerHaptic('tap');
  };

  const saveDndTime = async (key: 'start' | 'end', val: string) => {
    if (key === 'start') {
      setDndStart(val);
      try { await AsyncStorage.setItem('dews_dnd_start', val); } catch {}
    } else {
      setDndEnd(val);
      try { await AsyncStorage.setItem('dews_dnd_end', val); } catch {}
    }
  };

  const handleVolumeChange = (volume: number) => {
    updateSettings({ volume });
    if (settings.feedbackModality !== 'visual') {
      speakMessage(`Volume set to ${volume * 100} percent`);
    }
    triggerHaptic('tap');
  };

  const handleVibrationChange = (strength: number) => {
    updateSettings({ vibrationStrength: strength });
    if (strength > 0) {
      triggerHaptic('success');
    }
    triggerHaptic('tap');
  };

  const handleModalityChange = (modality: FeedbackModality) => {
    updateSettings({ feedbackModality: modality });
    if (modality !== 'visual') {
      const labels: Record<FeedbackModality, string> = {
        both: 'Sound and pictures',
        audio: 'Sound only',
        visual: 'Pictures only',
      };
      speakMessage(`Alert type set to ${labels[modality]}`);
    }
    triggerHaptic('tap');
  };

  const handleLanguageChange = (language: string) => {
    updateSettings({ voiceLanguage: language });
    speakMessage('Language changed');
    triggerHaptic('tap');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.homeButton}
          accessibilityLabel="Go home"
          accessibilityRole="button"
        >
          <Ionicons name="home" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <Text style={styles.headerSubtitle}>Make the app work for you</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Adaptive Mode Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#a855f7' }]}>
              <Ionicons name="options" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>ADAPTIVE MODE</Text>
              <Text style={styles.sectionSubtitle}>Personalized for your needs</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/onboard/impairment')}
            style={styles.selectableButton}
            accessibilityLabel="Modify adaptive mode"
          >
            <View>
              <Text style={styles.selectableText}>
                {impairmentType ? impairmentType.toUpperCase().replace('-', ' ') : 'NOT SET'}
              </Text>
              <Text style={styles.selectableSubtext}>Tap to change</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* How to alert me selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#3b82f6' }]}>
              <Ionicons name="notifications" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>HOW TO ALERT ME</Text>
              <Text style={styles.sectionSubtitle}>Choose your alert style</Text>
            </View>
          </View>
          
          <View style={styles.optionsList}>
            {/* Sound + Pictures */}
            <TouchableOpacity
              onPress={() => handleModalityChange('both')}
              style={[
                styles.optionRow,
                settings.feedbackModality === 'both' ? styles.optionSelected : styles.optionUnselected
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.feedbackModality === 'both' }}
            >
              <Ionicons name="volume-high" size={24} color={settings.feedbackModality === 'both' ? '#ffffff' : '#475569'} />
              <Ionicons name="eye" size={24} color={settings.feedbackModality === 'both' ? '#ffffff' : '#475569'} style={{ marginLeft: -6 }} />
              <View style={styles.optionDetails}>
                <Text style={[styles.optionTitle, settings.feedbackModality === 'both' ? styles.textWhite : styles.textDark]}>
                  SOUND + PICTURES
                </Text>
                <Text style={[styles.optionDesc, settings.feedbackModality === 'both' ? styles.textMutedWhite : styles.textMuted]}>
                  All alert types
                </Text>
              </View>
              {settings.feedbackModality === 'both' && <Ionicons name="checkmark-circle" size={28} color="#ffffff" />}
            </TouchableOpacity>

            {/* Sound Only */}
            <TouchableOpacity
              onPress={() => handleModalityChange('audio')}
              style={[
                styles.optionRow,
                settings.feedbackModality === 'audio' ? styles.optionSelected : styles.optionUnselected
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.feedbackModality === 'audio' }}
            >
              <Ionicons name="volume-high" size={26} color={settings.feedbackModality === 'audio' ? '#ffffff' : '#475569'} />
              <View style={styles.optionDetails}>
                <Text style={[styles.optionTitle, settings.feedbackModality === 'audio' ? styles.textWhite : styles.textDark]}>
                  SOUND ONLY
                </Text>
                <Text style={[styles.optionDesc, settings.feedbackModality === 'audio' ? styles.textMutedWhite : styles.textMuted]}>
                  Voice and vibration
                </Text>
              </View>
              {settings.feedbackModality === 'audio' && <Ionicons name="checkmark-circle" size={28} color="#ffffff" />}
            </TouchableOpacity>

            {/* Visual Only */}
            <TouchableOpacity
              onPress={() => handleModalityChange('visual')}
              style={[
                styles.optionRow,
                settings.feedbackModality === 'visual' ? styles.optionSelected : styles.optionUnselected
              ]}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.feedbackModality === 'visual' }}
            >
              <Ionicons name="eye" size={26} color={settings.feedbackModality === 'visual' ? '#ffffff' : '#475569'} />
              <View style={styles.optionDetails}>
                <Text style={[styles.optionTitle, settings.feedbackModality === 'visual' ? styles.textWhite : styles.textDark]}>
                  PICTURES ONLY
                </Text>
                <Text style={[styles.optionDesc, settings.feedbackModality === 'visual' ? styles.textMutedWhite : styles.textMuted]}>
                  Screen and vibration
                </Text>
              </View>
              {settings.feedbackModality === 'visual' && <Ionicons name="checkmark-circle" size={28} color="#ffffff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Volume Level Controls */}
        {settings.feedbackModality !== 'visual' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="volume-high" size={24} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>VOLUME</Text>
                <Text style={styles.sectionSubtitle}>How loud alerts sound</Text>
              </View>
            </View>
            <View style={styles.horizontalOptions}>
              {([
                { val: 0.25, label: 'QUIET' },
                { val: 0.5, label: 'MEDIUM' },
                { val: 1.0, label: 'LOUD' }
              ] as const).map(({ val, label }) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => handleVolumeChange(val)}
                  style={[
                    styles.horizontalBtn,
                    settings.volume === val ? styles.horizontalBtnSelected : styles.horizontalBtnUnselected
                  ]}
                >
                  <Text style={[
                    styles.horizontalBtnText,
                    settings.volume === val ? styles.textWhite : styles.textDark
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Vibration controls */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="phone-portrait" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>VIBRATION</Text>
              <Text style={styles.sectionSubtitle}>Phone shaking</Text>
            </View>
          </View>
          <View style={styles.horizontalOptions}>
            {([
              { val: 0, label: 'OFF' },
              { val: 50, label: 'GENTLE' },
              { val: 100, label: 'STRONG' }
            ] as const).map(({ val, label }) => (
              <TouchableOpacity
                key={val}
                onPress={() => handleVibrationChange(val)}
                style={[
                  styles.horizontalBtn,
                  settings.vibrationStrength === val ? styles.horizontalBtnSelected : styles.horizontalBtnUnselected
                ]}
              >
                <Text style={[
                  styles.horizontalBtnText,
                  settings.vibrationStrength === val ? styles.textWhite : styles.textDark
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Important alerts only toggle */}
        <TouchableOpacity
          onPress={() => {
            updateSettings({ criticalAlertsOnly: !settings.criticalAlertsOnly });
            triggerHaptic('tap');
          }}
          style={[
            styles.toggleCard,
            settings.criticalAlertsOnly ? styles.optionSelected : styles.optionUnselected
          ]}
        >
          <Ionicons
            name={settings.criticalAlertsOnly ? 'notifications-sharp' : 'notifications-off-sharp'}
            size={32}
            color={settings.criticalAlertsOnly ? '#ffffff' : '#0f172a'}
          />
          <View style={styles.toggleCardDetails}>
            <Text style={[styles.toggleCardTitle, settings.criticalAlertsOnly ? styles.textWhite : styles.textDark]}>
              IMPORTANT ALERTS ONLY
            </Text>
            <Text style={[styles.toggleCardDesc, settings.criticalAlertsOnly ? styles.textMutedWhite : styles.textMuted]}>
              {settings.criticalAlertsOnly ? 'Only danger alerts. Minor warnings muted.' : 'All alerts on.'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Language Selection */}
        {settings.feedbackModality !== 'visual' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: '#f97316' }]}>
                <Ionicons name="globe" size={24} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>LANGUAGE</Text>
                <Text style={styles.sectionSubtitle}>Voice readout language</Text>
              </View>
            </View>
            <View style={styles.optionsList}>
              {[
                { code: 'en-US', name: 'ENGLISH' },
                { code: 'si-LK', name: 'SINHALA (සිංහල)' },   // G20, G38, G121
                { code: 'ta-LK', name: 'TAMIL (தமிழ்)' },      // G20, G38, G121
                { code: 'es-ES', name: 'SPANISH' },
                { code: 'fr-FR', name: 'FRENCH' },
              ].map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => handleLanguageChange(lang.code)}
                  style={[
                    styles.optionRowSmall,
                    settings.voiceLanguage === lang.code ? styles.optionSelected : styles.optionUnselected
                  ]}
                >
                  <Text style={[styles.optionTitleSmall, settings.voiceLanguage === lang.code ? styles.textWhite : styles.textDark]}>
                    {lang.name}
                  </Text>
                  {settings.voiceLanguage === lang.code && <Ionicons name="checkmark-circle" size={22} color="#ffffff" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Do Not Disturb configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#4f46e5' }]}>
              <Ionicons name="moon" size={24} color="#ffffff" />
            </View>
            <View style={styles.headerToggleWrapper}>
              <View>
                <Text style={styles.sectionTitle}>DO NOT DISTURB</Text>
                <Text style={styles.sectionSubtitle}>Mute non-urgent alerts at night</Text>
              </View>
              <Switch
                value={dndEnabled}
                onValueChange={toggleDnd}
                trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                thumbColor={dndEnabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>

          {dndEnabled && (
            <View style={styles.dndTimes}>
              <Text style={styles.dndLabel}>Quiet hours (only extreme alerts allowed):</Text>
              <View style={styles.dndInputsRow}>
                <View style={styles.timeInputBox}>
                  <Text style={styles.timeLabel}>From (HH:MM)</Text>
                  <TextInput
                    value={dndStart}
                    onChangeText={val => saveDndTime('start', val)}
                    style={styles.timeInput}
                    keyboardType="default"
                    placeholder="22:00"
                  />
                </View>
                <View style={styles.timeInputBox}>
                  <Text style={styles.timeLabel}>Until (HH:MM)</Text>
                  <TextInput
                    value={dndEnd}
                    onChangeText={val => saveDndTime('end', val)}
                    style={styles.timeInput}
                    keyboardType="default"
                    placeholder="07:00"
                  />
                </View>
              </View>
              <Text style={styles.dndHint}>Extreme Danger alerts will always sound.</Text>
            </View>
          )}
        </View>

        {/* Caregiver setup */}
        <TouchableOpacity
          onPress={() => {
            router.push('/helpers');
            triggerHaptic('tap');
          }}
          style={styles.caregiverSetupBtn}
          accessibilityLabel="Go to caregiver setup"
        >
          <Ionicons name="people" size={32} color="#475569" />
          <View style={styles.caregiverSetupDetails}>
            <Text style={styles.caregiverSetupTitle}>CAREGIVER SETUP</Text>
            <Text style={styles.caregiverSetupSubtitle}>Let a helper configure this app for you</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
        </TouchableOpacity>

        {/* Always on High Contrast indicator */}
        <View style={styles.infoBox}>
          <Ionicons name="eye" size={28} color="#475569" />
          <View style={styles.infoBoxTextWrapper}>
            <Text style={styles.infoBoxTitle}>HIGH CONTRAST: ALWAYS ON</Text>
            <Text style={styles.infoBoxDesc}>Best visibility for all users.</Text>
          </View>
        </View>

        {/* G42: All 128 Design Guidelines reference */}
        <TouchableOpacity
          onPress={() => {
            router.push('/guidelines');
            triggerHaptic('tap');
          }}
          style={styles.caregiverSetupBtn}
          accessibilityLabel="View all 128 design guidelines"
          accessibilityRole="button"
        >
          <Ionicons name="library" size={32} color="#475569" />
          <View style={styles.caregiverSetupDetails}>
            <Text style={styles.caregiverSetupTitle}>ALL 128 DESIGN GUIDELINES</Text>
            <Text style={styles.caregiverSetupSubtitle}>Searchable reference — COGA, WCAG, Dementia, ASD, MCI, ADHD</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
        </TouchableOpacity>
      </ScrollView>

      {/* Persistent bottom home exit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.footerHomeButton}
          accessibilityLabel="Go home"
          accessibilityRole="button"
        >
          <Ionicons name="home" size={24} color="#ffffff" />
          <Text style={styles.footerHomeText}>HOME</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
  },
  homeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  selectableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 3,
    borderColor: '#cbd5e1',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 68,
  },
  selectableText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  selectableSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  optionsList: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 76,
    gap: 12,
  },
  optionRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  optionSelected: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  optionUnselected: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  optionTitleSmall: {
    fontSize: 16,
    fontWeight: '900',
  },
  optionDesc: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  textWhite: {
    color: '#ffffff',
  },
  textDark: {
    color: '#0f172a',
  },
  textMutedWhite: {
    color: '#94a3b8',
  },
  textMuted: {
    color: '#64748b',
  },
  horizontalOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  horizontalBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 3,
    paddingVertical: 14,
    minHeight: 56,
  },
  horizontalBtnSelected: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  horizontalBtnUnselected: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  horizontalBtnText: {
    fontSize: 14,
    fontWeight: '900',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 4,
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 88,
    gap: 16,
  },
  toggleCardDetails: {
    flex: 1,
  },
  toggleCardTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  toggleCardDesc: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  headerToggleWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dndTimes: {
    marginTop: 12,
    borderTopWidth: 2,
    borderColor: '#e2e8f0',
    paddingTop: 12,
    gap: 10,
  },
  dndLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  dndInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputBox: {
    flex: 1,
    gap: 4,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  timeInput: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  dndHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },
  caregiverSetupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 88,
    gap: 16,
  },
  caregiverSetupDetails: {
    flex: 1,
  },
  caregiverSetupTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  caregiverSetupSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#cbd5e1',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  infoBoxTextWrapper: {
    flex: 1,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
  },
  infoBoxDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 4,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  footerHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingVertical: 18,
    minHeight: 72,
    gap: 10,
  },
  footerHomeText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
});
