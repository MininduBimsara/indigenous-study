import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../contexts/AlertContext';
import { triggerHaptic } from '../utils/haptic';
import { palette } from '../theme/colors';

type Status = 'safe' | 'moving' | 'help';

export default function CheckInScreen() {
  const { updateCheckInStatus, speakMessage } = useAlert();
  const [selected, setSelected] = useState<Status | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Guideline #76: Keep success message visible for 15 seconds
  useEffect(() => {
    if (confirmed) {
      speakMessage(`Message sent. Your helpers know you are ${selected === 'safe' ? 'safe' : 'moving'}.`);
      const timer = setTimeout(() => {
        router.replace('/');
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [confirmed]);

  const handleSelect = (status: Status) => {
    setSelected(status);
    triggerHaptic('tap');
    if (status === 'safe') speakMessage('I am safe. Tap SEND to confirm.');
    if (status === 'moving') speakMessage('I am moving. Tap SEND to confirm.');
    if (status === 'help') speakMessage('I need help. Tap SEND to confirm.');
  };

  const handleSend = () => {
    if (!selected) return;
    triggerHaptic('success');
    if (selected === 'help') {
      updateCheckInStatus('help');
      router.push('/sos');
      return;
    }
    updateCheckInStatus(selected);
    setConfirmed(true);
  };

  // Guideline #42: Bold visual confirmation - green screen with SENT checkmark
  if (confirmed) {
    return (
      <SafeAreaView style={styles.confirmedContainer} edges={['top', 'left', 'right', 'bottom']}>
        <Ionicons name="checkmark-circle" size={140} color={palette.white} style={styles.confirmedIcon} />
        <Text style={styles.confirmedTitle}>SENT!</Text>
        <Text style={styles.confirmedSub}>
          Your helpers know you are {selected === 'safe' ? 'SAFE' : 'MOVING'}.
        </Text>
        <Text style={styles.confirmedTimerHint}>Going home in a moment...</Text>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={styles.confirmedHomeBtn}
          accessibilityLabel="Go home"
          accessibilityRole="button"
        >
          <Ionicons name="home" size={28} color={palette.green[800]} />
          <Text style={styles.confirmedHomeBtnText}>HOME</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header - G78: Critical at top */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HOW ARE YOU?</Text>
        <Text style={styles.headerSubtitle}>Tell your helpers right now</Text>
      </View>

      {/* G39: Read aloud instructions */}
      <View style={styles.listenContainer}>
        <TouchableOpacity
          onPress={() => speakMessage('How are you? Choose: I am safe. I am moving. I need help.')}
          style={styles.listenBtn}
          accessibilityLabel="Hear this question read aloud"
          accessibilityRole="button"
        >
          <Ionicons name="volume-high" size={24} color={palette.slate[600]} />
          <Text style={styles.listenBtnText}>LISTEN</Text>
        </TouchableOpacity>
      </View>

      {/* 3 options (G5: Safe at top, Help at bottom to prevent wrong press) */}
      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {/* SAFE - top */}
        <TouchableOpacity
          onPress={() => handleSelect('safe')}
          style={[
            styles.optionBtn,
            styles.safeBtnBorder,
            selected === 'safe' ? styles.safeSelected : styles.safeUnselected
          ]}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === 'safe' }}
        >
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={selected === 'safe' ? palette.white : palette.green[800]}
          />
          <Text style={[styles.optionText, selected === 'safe' ? styles.textWhite : styles.textSafe]}>
            I AM SAFE
          </Text>
        </TouchableOpacity>

        {/* MOVING - middle */}
        <TouchableOpacity
          onPress={() => handleSelect('moving')}
          style={[
            styles.optionBtn,
            styles.movingBtnBorder,
            selected === 'moving' ? styles.movingSelected : styles.movingUnselected
          ]}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === 'moving' }}
        >
          <Ionicons
            name="arrow-forward-circle"
            size={48}
            color={selected === 'moving' ? palette.white : palette.amber[700]}
          />
          <Text style={[styles.optionText, selected === 'moving' ? styles.textWhite : styles.textMoving]}>
            I AM MOVING
          </Text>
        </TouchableOpacity>

        {/* HELP - bottom */}
        <TouchableOpacity
          onPress={() => handleSelect('help')}
          style={[
            styles.optionBtn,
            styles.helpBtnBorder,
            selected === 'help' ? styles.helpSelected : styles.helpUnselected
          ]}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === 'help' }}
        >
          <Ionicons
            name="warning"
            size={48}
            color={selected === 'help' ? palette.white : palette.red[800]}
          />
          <Text style={[styles.optionText, selected === 'help' ? styles.textWhite : styles.textHelp]}>
            I NEED HELP
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Send + Cancel buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!selected}
          style={[
            styles.sendBtn,
            selected ? styles.sendBtnActive : styles.sendBtnDisabled
          ]}
          accessibilityLabel="Send my status"
        >
          <Text style={[styles.sendBtnText, selected ? styles.textWhite : styles.textDisabled]}>
            SEND
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.cancelBtn}
          accessibilityLabel="Cancel and go home"
        >
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
    backgroundColor: palette.slate[900],
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: palette.white,
    fontSize: 32,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: palette.slate[300],
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
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
  optionsContainer: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
    justifyContent: 'center',
  },
  optionBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 4,
    paddingVertical: 24,
    minHeight: 130,
    justifyContent: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  safeBtnBorder: { borderColor: palette.green[600] },
  movingBtnBorder: { borderColor: palette.amber[500] },
  helpBtnBorder: { borderColor: palette.red[600] },
  
  safeSelected: { backgroundColor: palette.green[600] },
  safeUnselected: { backgroundColor: palette.green[50] },
  
  movingSelected: { backgroundColor: palette.amber[500] },
  movingUnselected: { backgroundColor: palette.amber[50] },
  
  helpSelected: { backgroundColor: palette.red[600] },
  helpUnselected: { backgroundColor: palette.red[50] },

  optionText: {
    fontSize: 26,
    fontWeight: '900',
  },
  textWhite: { color: palette.white },
  textSafe: { color: palette.green[900] },
  textMoving: { color: palette.amber[900] },
  textHelp: { color: palette.red[900] },

  footer: {
    padding: 20,
    gap: 12,
  },
  sendBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 20,
    minHeight: 72,
  },
  sendBtnActive: {
    backgroundColor: palette.slate[900],
  },
  sendBtnDisabled: {
    backgroundColor: palette.slate[200],
  },
  sendBtnText: {
    fontSize: 22,
    fontWeight: '900',
  },
  textDisabled: {
    color: palette.slate[400],
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.slate[100],
    borderRadius: 20,
    paddingVertical: 14,
    minHeight: 56,
  },
  cancelBtnText: {
    color: palette.slate[600],
    fontSize: 18,
    fontWeight: '800',
  },
  confirmedContainer: {
    flex: 1,
    backgroundColor: palette.green[600],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  confirmedIcon: {
    marginBottom: 20,
  },
  confirmedTitle: {
    fontSize: 54,
    fontWeight: '900',
    color: palette.white,
    textAlign: 'center',
  },
  confirmedSub: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.white,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 34,
  },
  confirmedTimerHint: {
    fontSize: 18,
    color: palette.emerald[100],
    textAlign: 'center',
    marginTop: 16,
  },
  confirmedHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    borderRadius: 20,
    paddingVertical: 18,
    width: '100%',
    minHeight: 72,
    gap: 10,
    marginTop: 40,
  },
  confirmedHomeBtnText: {
    color: palette.green[800],
    fontSize: 22,
    fontWeight: '900',
  },
});
