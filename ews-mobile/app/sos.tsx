import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../contexts/AlertContext';
import { triggerHaptic } from '../utils/haptic';
import { palette } from '../theme/colors';

interface SOSOption {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  speak: string;
}

const SOS_OPTIONS: SOSOption[] = [
  { id: 'hurt', label: 'I AM HURT', iconName: 'medical', color: 'red', speak: 'I am hurt. I need medical help.' },
  { id: 'lost', label: 'I AM LOST', iconName: 'pin', color: 'orange', speak: 'I am lost. I do not know where I am.' },
  { id: 'scared', label: 'I AM SCARED', iconName: 'heart', color: 'purple', speak: 'I am scared. Please help me stay calm.' },
  { id: 'medicine', label: 'I NEED MEDICINE', iconName: 'medkit', color: 'blue', speak: 'I need my medicine urgently.' },
];

const COLOR_STYLES: Record<string, { active: any; inactive: any; iconActive: string; iconInactive: string }> = {
  red: {
    active: { backgroundColor: palette.red[600], borderColor: palette.red[800] },
    inactive: { backgroundColor: palette.red[50], borderColor: palette.red[400] },
    iconActive: palette.white,
    iconInactive: palette.red[800],
  },
  orange: {
    active: { backgroundColor: palette.orange[600], borderColor: palette.orange[800] },
    inactive: { backgroundColor: palette.orange[50], borderColor: palette.orange[400] },
    iconActive: palette.white,
    iconInactive: palette.orange[800],
  },
  purple: {
    active: { backgroundColor: palette.purple[600], borderColor: palette.purple[800] },
    inactive: { backgroundColor: palette.purple[50], borderColor: palette.purple[400] },
    iconActive: palette.white,
    iconInactive: palette.purple[800],
  },
  blue: {
    active: { backgroundColor: palette.blue[600], borderColor: palette.blue[800] },
    inactive: { backgroundColor: palette.blue[50], borderColor: palette.blue[400] },
    iconActive: palette.white,
    iconInactive: palette.blue[800],
  },
};

export default function SOSDetailScreen() {
  const { speakMessage } = useAlert();
  const [selected, setSelected] = useState<string | null>(null);
  const [showScreen, setShowScreen] = useState(false);

  const handleSelect = (opt: SOSOption) => {
    setSelected(opt.id);
    speakMessage(opt.speak);
    triggerHaptic('tap');
  };

  const handleCallHelper = () => {
    speakMessage('Calling your helper now.');
    triggerHaptic('tap');
    router.push('/helpers');
  };

  // Guideline #49: "Show this screen to the person in the vest" (Helper communication overlay)
  if (showScreen) {
    const opt = SOS_OPTIONS.find(o => o.id === selected);
    return (
      <SafeAreaView style={styles.helperScreenContainer} edges={['top', 'left', 'right', 'bottom']}>
        <Ionicons name="warning" size={96} color={palette.white} style={styles.helperWarnIcon} />
        <Text style={styles.helperTitle}>PLEASE HELP ME</Text>
        {opt && (
          <View style={styles.helperCard}>
            <Ionicons name={opt.iconName} size={84} color={palette.red[600]} />
            <Text style={styles.helperCardText}>{opt.label}</Text>
          </View>
        )}
        <Text style={styles.helperInstructions}>Show this screen to get help</Text>
        <TouchableOpacity
          onPress={() => { triggerHaptic('tap'); setShowScreen(false); }}
          style={styles.helperBackBtn}
          accessibilityLabel="Go back to choices"
        >
          <Text style={styles.helperBackBtnText}>GO BACK</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WHAT IS WRONG?</Text>
        <Text style={styles.headerSubtitle}>Pick the best answer</Text>
      </View>

      {/* Listen instructions */}
      <View style={styles.listenContainer}>
        <TouchableOpacity
          onPress={() => speakMessage('What is wrong? Choose: I am hurt. I am lost. I am scared. I need medicine.')}
          style={styles.listenBtn}
          accessibilityLabel="Hear choices read aloud"
          accessibilityRole="button"
        >
          <Ionicons name="volume-high" size={24} color={palette.slate[600]} />
          <Text style={styles.listenBtnText}>LISTEN</Text>
        </TouchableOpacity>
      </View>

      {/* Options grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {SOS_OPTIONS.map(opt => {
            const stylesConfig = COLOR_STYLES[opt.color];
            const isSelected = selected === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => handleSelect(opt)}
                style={[
                  styles.gridItem,
                  isSelected ? stylesConfig.active : stylesConfig.inactive,
                  isSelected && styles.selectedScale
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <Ionicons
                  name={opt.iconName}
                  size={48}
                  color={isSelected ? stylesConfig.iconActive : stylesConfig.iconInactive}
                />
                <Text style={[
                  styles.gridItemText,
                  { color: isSelected ? palette.white : stylesConfig.iconInactive }
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        {/* Helper Screen trigger */}
        {selected && (
          <TouchableOpacity
            onPress={() => { triggerHaptic('success'); setShowScreen(true); }}
            style={styles.showHelperBtn}
            accessibilityLabel="Show this screen to get help"
          >
            <Ionicons name="phone-portrait" size={24} color={palette.white} />
            <Text style={styles.showHelperBtnText}>SHOW TO HELPER</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleCallHelper}
          style={styles.callHelperBtn}
          accessibilityLabel="Call my caregiver now"
        >
          <Ionicons name="call" size={24} color={palette.white} />
          <Text style={styles.callHelperBtnText}>CALL MY HELPER</Text>
        </TouchableOpacity>

        {/* Safe Exit */}
        <TouchableOpacity
          onPress={() => { triggerHaptic('tap'); router.push('/'); }}
          style={styles.cancelBtn}
          accessibilityLabel="Cancel and go home"
        >
          <Ionicons name="home" size={20} color={palette.slate[600]} />
          <Text style={styles.cancelBtnText}>CANCEL</Text>
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
    backgroundColor: palette.red[600],
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
    color: palette.red[100],
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: '47%',
    aspectRatio: 1.1,
    borderRadius: 24,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedScale: {
    transform: [{ scale: 1.03 }],
  },
  gridItemText: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  showHelperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.red[600],
    borderRadius: 20,
    paddingVertical: 18,
    minHeight: 72,
    gap: 10,
  },
  showHelperBtnText: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '900',
  },
  callHelperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.slate[900],
    borderRadius: 20,
    paddingVertical: 18,
    minHeight: 72,
    gap: 10,
  },
  callHelperBtnText: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '900',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.slate[100],
    borderRadius: 20,
    paddingVertical: 14,
    minHeight: 56,
    gap: 8,
  },
  cancelBtnText: {
    color: palette.slate[600],
    fontSize: 18,
    fontWeight: '800',
  },
  helperScreenContainer: {
    flex: 1,
    backgroundColor: palette.red[600],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  helperWarnIcon: {
    marginBottom: 16,
  },
  helperTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: palette.white,
    textAlign: 'center',
  },
  helperCard: {
    backgroundColor: palette.white,
    borderRadius: 32,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 16,
  },
  helperCardText: {
    fontSize: 32,
    fontWeight: '900',
    color: palette.red[600],
    textAlign: 'center',
  },
  helperInstructions: {
    fontSize: 22,
    color: palette.red[100],
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '700',
  },
  helperBackBtn: {
    backgroundColor: palette.white,
    borderRadius: 20,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    minHeight: 72,
  },
  helperBackBtnText: {
    color: palette.red[600],
    fontSize: 20,
    fontWeight: '900',
  },
});
