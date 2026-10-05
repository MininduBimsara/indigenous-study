import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../../contexts/AlertContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { FocusModeOverlay } from '../../components/FocusModeOverlay';
import { triggerHaptic } from '../../utils/haptic';
import { palette } from '../../theme/colors';

interface ChecklistItem {
  id: number;
  icon: string;
  title: string;
  detail: string;
  estimatedMinutes: number;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 1, icon: '💊', title: 'PACK MEDICINE', detail: 'Get your pills and put them in your bag.', estimatedMinutes: 2 },
  { id: 2, icon: '📄', title: 'GRAB ID', detail: 'Take your ID card or wallet.', estimatedMinutes: 1 },
  { id: 3, icon: '📱', title: 'CHARGE PHONE', detail: 'Plug in your phone for 1 minute. Or take the charger.', estimatedMinutes: 2 },
  { id: 4, icon: '🥤', title: 'TAKE WATER', detail: 'Grab a bottle of water.', estimatedMinutes: 1 },
  { id: 5, icon: '🧥', title: 'PUT ON SHOES', detail: 'Wear comfortable closed-toe shoes.', estimatedMinutes: 2 },
  { id: 6, icon: '🚪', title: 'LEAVE NOW', detail: 'Go to the shelter. Follow the signs.', estimatedMinutes: 3 },
];

export default function EvacuationChecklist() {
  const { speakMessage } = useAlert();
  const { adaptiveSettings } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // G114: countdown timer per step (seconds)
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // G112: focus mode state
  const [focusMode, setFocusMode] = useState(adaptiveSettings.focusMode);

  const item = CHECKLIST_ITEMS[currentStep];
  const progress = Math.round((currentStep / CHECKLIST_ITEMS.length) * 100);

  // G48: Electronic Prompting – read step aloud automatically
  useEffect(() => {
    if (!done) {
      speakMessage(`Step ${currentStep + 1} of ${CHECKLIST_ITEMS.length}. ${item.title}. ${item.detail}`);
      // G114: Start countdown for this step
      setCountdown(item.estimatedMinutes * 60);
    }
  }, [currentStep, done, item]);

  // G114: Countdown timer
  useEffect(() => {
    if (countdown === null || done) return;
    if (countdown <= 0) {
      setCountdown(0);
      return;
    }
    const id = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(id);
  }, [countdown, done]);

  // G116: Positive reinforcement celebration
  const showCelebrationBriefly = useCallback(() => {
    setShowCelebration(true);
    triggerHaptic('success');
    speakMessage('Step complete! Well done.');
    setTimeout(() => setShowCelebration(false), 1500);
  }, [speakMessage]);

  const handleDone = () => {
    showCelebrationBriefly();
    if (currentStep < CHECKLIST_ITEMS.length - 1) {
      setTimeout(() => setCurrentStep(s => s + 1), 1600);
    } else {
      setTimeout(() => {
        setDone(true);
        speakMessage('All done! You are ready. Go to the shelter now.');
      }, 1600);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.doneContainer} edges={['top', 'left', 'right', 'bottom']}>
        <Ionicons name="checkmark-circle" size={140} color={palette.white} style={styles.doneIcon} />
        <Text style={styles.doneTitle}>ALL DONE!</Text>
        <Text style={styles.doneSub}>You are ready to go.</Text>
        <View style={styles.doneActions}>
          <TouchableOpacity
            onPress={() => router.push('/shelter')}
            style={styles.doneBtnPrimary}
            accessibilityLabel="Find shelter now"
          >
            <Text style={styles.doneBtnPrimaryText}>FIND SHELTER NOW</Text>
            <Ionicons name="chevron-forward" size={28} color={palette.green[800]} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.doneBtnSecondary}
            accessibilityLabel="Go home"
          >
            <Ionicons name="home" size={24} color={palette.white} />
            <Text style={styles.doneBtnSecondaryText}>HOME</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // G116: Celebration flash overlay
  if (showCelebration) {
    return (
      <SafeAreaView style={styles.celebrationContainer} edges={['top', 'left', 'right', 'bottom']}>
        <Ionicons name="star" size={96} color={palette.white} style={styles.starIcon} />
        <Text style={styles.celebrationTitle}>WELL DONE! ✓</Text>
        <Text style={styles.celebrationSub}>Step {currentStep + 1} complete</Text>
      </SafeAreaView>
    );
  }

  // G112: Focus Mode for ADHD
  if (focusMode) {
    return (
      <FocusModeOverlay
        stepLabel={`Step ${currentStep + 1} of ${CHECKLIST_ITEMS.length}`}
        onExit={() => setFocusMode(false)}
      >
        <View style={styles.focusWrapper}>
          <Text style={styles.focusIcon}>{item.icon}</Text>
          <Text style={styles.focusTitle}>{item.title}</Text>
          <Text style={styles.focusDetail}>{item.detail}</Text>

          {countdown !== null && countdown > 0 && (
            <View style={styles.focusTimer}>
              <Ionicons name="timer" size={24} color={palette.amber[400]} />
              <Text style={styles.focusTimerText}>
                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleDone}
            style={styles.focusDoneBtn}
            accessibilityLabel="Mark step as complete"
          >
            <Ionicons name="checkmark-circle" size={32} color={palette.white} />
            <Text style={styles.focusDoneBtnText}>
              {currentStep < CHECKLIST_ITEMS.length - 1 ? 'DONE' : 'FINISH'}
            </Text>
          </TouchableOpacity>
        </View>
      </FocusModeOverlay>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Progress – G110 */}
      <View style={styles.progressHeader}>
        <View style={styles.progressRow}>
          <Text style={styles.progressStepText}>STEP {currentStep + 1} OF {CHECKLIST_ITEMS.length}</Text>
          <View style={styles.progressRight}>
            <Text style={styles.progressPctText}>{progress}%</Text>
            {adaptiveSettings.focusMode && (
              <TouchableOpacity
                onPress={() => setFocusMode(true)}
                style={styles.focusModeBtn}
                accessibilityLabel="Enable focus mode"
              >
                <Text style={styles.focusModeBtnText}>Focus</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Big icon */}
        <Text style={styles.mainIcon} role="img" aria-label={item.title}>
          {item.icon}
        </Text>

        {/* G78: Critical info */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>{item.title}</Text>
          {/* G22: Separate instructions */}
          <Text style={styles.instructionDetail}>{item.detail}</Text>
        </View>

        {/* G114: Time estimate + countdown */}
        {countdown !== null && (
          <View style={styles.timerCard}>
            <Ionicons name="timer" size={24} color={palette.amber[700]} />
            <Text style={styles.timerText}>
              About {item.estimatedMinutes} min
              {countdown > 0 && (
                <Text style={styles.countdownText}>
                  {' '}({Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')} left)
                </Text>
              )}
            </Text>
          </View>
        )}

        {/* Big visual reinforcement checkmark container */}
        <View style={styles.checkmarkWrapper}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark-circle" size={80} color={palette.green[600]} />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => speakMessage(`${item.title}. ${item.detail}`)}
            style={styles.repeatButton}
            accessibilityLabel="Repeat this step aloud"
          >
            <Ionicons name="volume-high" size={24} color={palette.slate[600]} />
            <Text style={styles.repeatButtonText}>REPEAT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDone}
            style={styles.doneButton}
            accessibilityLabel={currentStep < CHECKLIST_ITEMS.length - 1 ? 'Mark done and go to next step' : 'Finish checklist'}
          >
            <Ionicons name="checkmark-circle" size={28} color={palette.white} />
            <Text style={styles.doneButtonText}>
              {currentStep < CHECKLIST_ITEMS.length - 1 ? 'DONE — NEXT STEP' : 'ALL DONE!'}
            </Text>
          </TouchableOpacity>

          {/* G15: Safe exit */}
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.exitButton}
            accessibilityLabel="Exit checklist and go home"
          >
            <Ionicons name="home" size={20} color={palette.slate[600]} />
            <Text style={styles.exitButtonText}>EXIT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  progressHeader: {
    backgroundColor: palette.slate[900],
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressStepText: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  progressRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressPctText: {
    color: palette.slate[400],
    fontSize: 18,
    fontWeight: '700',
  },
  focusModeBtn: {
    backgroundColor: palette.blue[600],
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  focusModeBtnText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: palette.slate[700],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.green[400],
    borderRadius: 4,
  },
  mainIcon: {
    fontSize: 100,
    marginVertical: 24,
    textAlign: 'center',
  },
  instructionCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: palette.slate[900],
    textAlign: 'center',
  },
  instructionDetail: {
    fontSize: 22,
    fontWeight: '600',
    color: palette.slate[600],
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 28,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.amber[50],
    borderWidth: 2,
    borderColor: palette.amber[200],
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 24,
    gap: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.amber[800],
  },
  countdownText: {
    color: palette.amber[700],
  },
  checkmarkWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
    borderColor: palette.green[600],
    backgroundColor: palette.green[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  repeatButton: {
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
  repeatButtonText: {
    color: palette.slate[600],
    fontSize: 18,
    fontWeight: '800',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green[600],
    borderRadius: 24,
    paddingVertical: 20,
    minHeight: 76,
    gap: 10,
  },
  doneButtonText: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '900',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.slate[100],
    borderRadius: 20,
    paddingVertical: 14,
    minHeight: 56,
    gap: 8,
  },
  exitButtonText: {
    color: palette.slate[600],
    fontSize: 18,
    fontWeight: '800',
  },
  doneContainer: {
    flex: 1,
    backgroundColor: palette.green[600],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  doneIcon: {
    marginBottom: 20,
  },
  doneTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: palette.white,
    textAlign: 'center',
  },
  doneSub: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.white,
    textAlign: 'center',
    marginTop: 8,
  },
  doneActions: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  doneBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    borderRadius: 24,
    paddingVertical: 20,
    minHeight: 76,
    gap: 10,
  },
  doneBtnPrimaryText: {
    color: palette.green[800],
    fontSize: 20,
    fontWeight: '900',
  },
  doneBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green[700],
    borderRadius: 20,
    paddingVertical: 16,
    minHeight: 64,
    gap: 8,
  },
  doneBtnSecondaryText: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  celebrationContainer: {
    flex: 1,
    backgroundColor: palette.green[600],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  starIcon: {
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: palette.white,
    textAlign: 'center',
  },
  celebrationSub: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  focusWrapper: {
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  focusIcon: {
    fontSize: 110,
    textAlign: 'center',
  },
  focusTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: palette.white,
    textAlign: 'center',
  },
  focusDetail: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 30,
  },
  focusTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  focusTimerText: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  focusDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.green[500],
    borderRadius: 24,
    paddingVertical: 20,
    width: '100%',
    minHeight: 76,
    gap: 12,
    marginTop: 16,
  },
  focusDoneBtnText: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '900',
  },
});
