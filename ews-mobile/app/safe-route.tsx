import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../contexts/AlertContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { triggerHaptic } from '../utils/haptic';

interface NavStep {
  landmark: string;
  landmarkSentence: string;
  egoDir: 'LEFT' | 'RIGHT' | 'FORWARD';
  literalText: string;
  distance: string;
  emoji: string;
  photoBg: string;
}

const STEPS: NavStep[] = [
  {
    landmark: 'the big tree',
    landmarkSentence: 'Walk to the big tree.',
    egoDir: 'LEFT',
    literalText: 'Turn left. Walk to the big tree on your left. It is 50 feet away.',
    distance: '50 ft',
    emoji: '🌳',
    photoBg: '#e2f0d9',
  },
  {
    landmark: 'the red building',
    landmarkSentence: 'Walk past the red building.',
    egoDir: 'FORWARD',
    literalText: 'Go straight. Walk past the red building in front of you. It is 200 feet away.',
    distance: '200 ft',
    emoji: '🏢',
    photoBg: '#fce4d6',
  },
  {
    landmark: 'the school gates',
    landmarkSentence: 'Turn right at the school gates.',
    egoDir: 'RIGHT',
    literalText: 'Turn right. Walk to the school gates on your right. They are 100 feet away.',
    distance: '100 ft',
    emoji: '🏫',
    photoBg: '#fff2cc',
  },
  {
    landmark: 'the community centre',
    landmarkSentence: 'Go inside the community centre. You are safe.',
    egoDir: 'FORWARD',
    literalText: 'Go straight. Walk inside the community centre. This is the safe place.',
    distance: '50 ft',
    emoji: '🏛️',
    photoBg: '#ddebf7',
  },
];

const MCI_CONFIRMATIONS = [
  'Good, keep going!',
  "Great work! You're doing well.",
  'Almost there! Keep going!',
  'You made it! You are safe now.',
];

// ─── Dementia Nav layout ───
function DementiaNav({ step, stepNum, total, isLast, onNext, onRepeat }: {
  step: NavStep; stepNum: number; total: number;
  isLast: boolean; onNext: () => void; onRepeat: () => void;
}) {
  return (
    <View style={styles.dementiaRoot}>
      {/* Top strip */}
      <View style={styles.dementiaHeader}>
        <Text style={styles.dementiaHeaderText}>
          STEP {stepNum + 1} <Text style={styles.fontWeightNormal}>of</Text> {total}
        </Text>
        <TouchableOpacity
          onPress={onRepeat}
          style={styles.dementiaListenBtn}
          accessibilityLabel="Hear instruction again"
        >
          <Ionicons name="volume-high" size={22} color="#475569" />
          <Text style={styles.dementiaListenText}>LISTEN</Text>
        </TouchableOpacity>
      </View>

      {/* Landmark photo */}
      <View style={[styles.dementiaPhotoCard, { backgroundColor: step.photoBg }]}>
        <Text style={styles.dementiaEmoji}>{step.emoji}</Text>
        <Text style={styles.dementiaLandmarkName}>{step.landmark.toUpperCase()}</Text>
      </View>

      {/* Instruction sentence */}
      <View style={styles.dementiaTextContainer}>
        <Text style={styles.dementiaInstructionText}>{step.landmarkSentence}</Text>
      </View>

      {/* Single primary action */}
      <View style={styles.dementiaFooter}>
        <TouchableOpacity
          onPress={onNext}
          style={styles.dementiaBtn}
          accessibilityLabel={isLast ? 'Arrived at shelter' : 'I see it, next step'}
        >
          <Text style={styles.dementiaBtnText}>
            {isLast ? 'ARRIVED AT SHELTER  ✓' : 'I SEE IT  →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Autism Nav layout ───
function ASDNav({ steps, currentStep, isLast, onNext }: {
  steps: NavStep[]; currentStep: number;
  isLast: boolean; onNext: () => void;
}) {
  const step = steps[currentStep];
  return (
    <View style={styles.asdRoot}>
      {/* Route checklist */}
      <View style={styles.asdHeader}>
        <Text style={styles.asdHeaderTitle}>YOUR SAFE ROUTE</Text>
        <View style={styles.asdStepsList}>
          {steps.map((s, i) => (
            <View
              key={i}
              style={[
                styles.asdStepRow,
                i === currentStep ? styles.asdRowActive : i < currentStep ? styles.asdRowCompleted : styles.asdRowPending
              ]}
            >
              <View style={[
                styles.asdStepNumberCircle,
                i < currentStep ? styles.asdCircleCompleted : i === currentStep ? styles.asdCircleActive : styles.asdCirclePending
              ]}>
                {i < currentStep ? (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                ) : (
                  <Text style={[styles.asdCircleText, i === currentStep ? styles.textWhite : styles.textGrey]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.asdStepText,
                i === currentStep ? styles.asdTextActive : styles.asdTextInactive
              ]}>
                {s.landmarkSentence}
              </Text>
              <Text style={styles.asdStepEmoji}>{s.emoji}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Current step card */}
      <View style={styles.asdContent}>
        <View style={styles.asdStepCard}>
          <Text style={styles.asdCardLabel}>STEP {currentStep + 1} — DO THIS NOW</Text>
          <Text style={styles.asdCardInstruction}>{step.literalText}</Text>
          <View style={styles.asdDistanceTag}>
            <Text style={styles.asdDistanceText}>Distance: {step.distance}</Text>
          </View>
        </View>
      </View>

      {/* Action button */}
      <View style={styles.asdFooter}>
        <TouchableOpacity
          onPress={onNext}
          style={styles.asdBtn}
          accessibilityLabel={isLast ? 'Arrived at shelter' : 'Done, next step'}
        >
          <Text style={styles.asdBtnText}>
            {isLast ? 'ARRIVED AT SHELTER  ✓' : 'DONE  →  NEXT STEP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── MCI Nav layout ───
function MCINav({ step, stepNum, total, isLast, progress, showConfirmation, confirmation, onNext, onRepeat }: {
  step: NavStep; stepNum: number; total: number;
  isLast: boolean; progress: number; showConfirmation: boolean; confirmation: string;
  onNext: () => void; onRepeat: () => void;
}) {
  return (
    <View style={styles.mciRoot}>
      {/* Progress header */}
      <View style={styles.mciHeader}>
        <View style={styles.mciProgressRow}>
          <Text style={styles.mciProgressStepText}>Step {stepNum + 1} of {total}</Text>
          <Text style={styles.mciProgressPctText}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.mciProgressBarBg}>
          <View style={[styles.mciProgressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Listen buttons */}
      <View style={styles.mciListenContainer}>
        <TouchableOpacity
          onPress={onRepeat}
          style={styles.mciListenBtn}
          accessibilityLabel="Hear directions aloud"
        >
          <Ionicons name="volume-high" size={26} color="#ffffff" />
          <Text style={styles.mciListenBtnText}>LISTEN NOW</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation flash */}
      {showConfirmation && (
        <View style={styles.mciConfirmCard}>
          <Text style={styles.mciConfirmCardText}>{confirmation}</Text>
        </View>
      )}

      {/* Landmark card */}
      <View style={styles.mciContent}>
        <View style={styles.mciCard}>
          <Text style={styles.mciCardLabel}>LOOK FOR</Text>
          <Text style={styles.mciCardEmoji}>{step.emoji}</Text>
          <Text style={styles.mciCardTitle}>{step.landmark}</Text>
          <Text style={styles.mciCardDistance}>{step.distance} away</Text>
        </View>

        <Text style={styles.mciInstructionDetail}>{step.landmarkSentence}</Text>
      </View>

      {/* Action button */}
      <View style={styles.mciFooter}>
        <TouchableOpacity
          onPress={onNext}
          style={styles.mciBtn}
          accessibilityLabel={isLast ? 'Arrived at shelter' : 'Next step'}
        >
          <Text style={styles.mciBtnText}>
            {isLast ? 'ARRIVED AT SHELTER  ✓' : 'NEXT STEP  →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── ADHD Nav layout ───
function ADHDNav({ step, stepNum, total, isLast, progress, onNext, onRepeat }: {
  step: NavStep; stepNum: number; total: number;
  isLast: boolean; progress: number; onNext: () => void; onRepeat: () => void;
}) {
  const egoDirIcons = {
    LEFT: { name: 'arrow-back' as const, label: 'LEFT' },
    RIGHT: { name: 'arrow-forward' as const, label: 'RIGHT' },
    FORWARD: { name: 'arrow-up' as const, label: 'FORWARD' },
  };
  const config = egoDirIcons[step.egoDir];

  return (
    <View style={styles.adhdRoot}>
      {/* Banner */}
      <View style={styles.adhdBanner}>
        <View style={styles.adhdBannerRow}>
          <Ionicons name="notifications" size={18} color="#f97316" />
          <Text style={styles.adhdBannerTitle}>CURRENT STEP — ALWAYS VISIBLE</Text>
        </View>
        <View style={styles.adhdBannerMainRow}>
          <Text style={styles.adhdBannerLabel}>GO {config.label}</Text>
          <Text style={styles.adhdBannerStepText}>{stepNum + 1} / {total}</Text>
        </View>
        <View style={styles.adhdProgressBarBg}>
          <View style={[styles.adhdProgressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Direction Guide */}
      <View style={styles.adhdContent}>
        <View style={styles.adhdArrowBg}>
          <Ionicons name={config.name} size={110} color="#ffffff" />
        </View>
        <Text style={styles.adhdDirectionLabel}>{config.label}</Text>
        <Text style={styles.adhdDistance}>{step.distance}</Text>
        {/* W11 – G53: what to look for, not only which way */}
        <Text style={styles.adhdLandmark}>{step.emoji} {step.landmark}</Text>
      </View>

      {/* Two equal bottom buttons */}
      <View style={styles.adhdFooter}>
        <TouchableOpacity
          onPress={onRepeat}
          style={styles.adhdBtnSecondary}
          accessibilityLabel="Repeat directions"
        >
          <Ionicons name="volume-high" size={24} color="#1e293b" />
          <Text style={styles.adhdBtnSecondaryText}>REPEAT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          style={styles.adhdBtnPrimary}
          accessibilityLabel={isLast ? 'Arrived at shelter' : 'Done next step'}
        >
          <Text style={styles.adhdBtnPrimaryText}>
            {isLast ? 'ARRIVED AT SHELTER ✓' : 'DONE → NEXT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Schizophrenia Nav layout ───
function SchizophreniaNav({ step, stepNum, total, isLast, onNext, onShare }: {
  step: NavStep; stepNum: number; total: number;
  isLast: boolean; onNext: () => void; onShare: () => void;
}) {
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    setShared(true);
    triggerHaptic('success');
    onShare();
  };

  return (
    <View style={styles.schRoot}>
      {/* Minimal Header */}
      <View style={styles.schHeader}>
        <Text style={styles.schHeaderText}>{stepNum + 1} of {total}</Text>
        <TouchableOpacity
          onPress={handleShare}
          disabled={shared}
          style={[styles.schShareBtn, shared && styles.schShareBtnShared]}
          accessibilityLabel="Share location with caregiver"
        >
          <Ionicons name="share-social" size={20} color={shared ? '#0f766e' : '#475569'} />
          <Text style={[styles.schShareText, { color: shared ? '#0f766e' : '#475569' }]}>
            {shared ? 'Shared ✓' : 'Share location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grounded Centered Object View */}
      <View style={styles.schContent}>
        <Text style={styles.schEmoji}>{step.emoji}</Text>
        <View style={styles.schTitleContainer}>
          <Text style={styles.schWalkTo}>Walk to</Text>
          <Text style={styles.schLandmark}>{step.landmark}.</Text>
        </View>
        <Text style={styles.schDistance}>{step.distance} away</Text>
      </View>

      {/* Next actions */}
      <View style={styles.schFooter}>
        <TouchableOpacity
          onPress={onNext}
          style={styles.schBtn}
          accessibilityLabel={isLast ? 'Arrived at shelter' : 'I found it, next'}
        >
          <Text style={styles.schBtnText}>
            {isLast ? 'ARRIVED AT SHELTER  ✓' : 'I FOUND IT  →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Default Nav layout ───
function DefaultNav({ step, stepNum, total, isLast, progress, onNext, onRepeat }: {
  step: NavStep; stepNum: number; total: number;
  isLast: boolean; progress: number; onNext: () => void; onRepeat: () => void;
}) {
  const egoDirIcons = {
    LEFT: 'arrow-back' as const,
    RIGHT: 'arrow-forward' as const,
    FORWARD: 'arrow-up' as const,
  };
  const iconName = egoDirIcons[step.egoDir];

  return (
    <View style={styles.defRoot}>
      {/* Header progress */}
      <View style={styles.defHeader}>
        <View style={styles.defProgressRow}>
          <Text style={styles.defHeaderText}>Step {stepNum + 1} of {total}</Text>
          <Text style={styles.defHeaderText}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.defProgressBarBg}>
          <View style={[styles.defProgressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Centered actions */}
      <View style={styles.defContent}>
        <View style={styles.defIconCircle}>
          <Ionicons name={iconName} size={84} color="#ffffff" />
        </View>
        <View style={styles.defCard}>
          <Text style={styles.defDirText}>{step.egoDir}</Text>
          <Text style={styles.defInstructionText}>{step.landmarkSentence}</Text>
          <Text style={styles.defDistanceText}>{step.distance}</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.defFooter}>
        <TouchableOpacity
          onPress={onNext}
          style={styles.defBtnPrimary}
        >
          <Text style={styles.defBtnPrimaryText}>
            {isLast ? 'ARRIVED AT SHELTER  ✓' : 'NEXT STEP  →'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRepeat}
          style={styles.defBtnSecondary}
          accessibilityLabel="Repeat aloud"
        >
          <Ionicons name="volume-high" size={24} color="#ffffff" />
          <Text style={styles.defBtnSecondaryText}>Repeat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Shared hazard banner (D05, D06, D07 – G109) ──────────────────────────
function HazardBanner({ alertType }: { alertType?: string }) {
  return (
    <View style={styles.hazardBanner}>
      <Ionicons name="warning" size={20} color="#b91c1c" />
      <Text style={styles.hazardBannerText}>
        {alertType ? `${alertType.toUpperCase()} — EVACUATION IN PROGRESS` : 'EMERGENCY EVACUATION IN PROGRESS'}
      </Text>
    </View>
  );
}

// ─── Shared route bar (v2 W09/W10, D18, D19, D21 – G28, G52) ───────────────────
// Same two controls in the same place on every step and every profile (G85).
function RouteBar({ onBack, onHelp, isFirst, disabled }: {
  onBack: () => void;
  onHelp: () => void;
  isFirst: boolean;
  disabled: boolean;
}) {
  return (
    <View style={styles.routeBar}>
      <TouchableOpacity
        onPress={onBack}
        disabled={disabled}
        style={[styles.routeBarBtn, disabled && styles.routeBarBtnDisabled]}
        accessibilityLabel={isFirst ? 'Back to the list of safe places' : 'Go back one step'}
      >
        <Ionicons name="arrow-back" size={22} color="#0f172a" />
        <Text style={styles.routeBarBtnText}>{isFirst ? 'OTHER PLACE' : 'BACK'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onHelp}
        style={styles.routeBarBtn}
        accessibilityLabel="Call my helper"
      >
        <Ionicons name="call" size={22} color="#0f172a" />
        <Text style={styles.routeBarBtnText}>CALL HELPER</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main SafeRoute Component ───
export default function SafeRouteScreen() {
  const { speakMessage, endAlert, currentAlert } = useAlert();
  const { impairmentType } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Speak directions on step transition
  useEffect(() => {
    if (impairmentType !== 'autism') {
      speakMessage(step.landmarkSentence);
    }
  }, [currentStep, impairmentType]);

  // ADHD idle read speaker
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      speakMessage(`Go ${step.egoDir}. ${step.landmarkSentence}`);
    }, 15000);
  }, [step, speakMessage]);

  useEffect(() => {
    if (impairmentType === 'adhd') {
      resetIdleTimer();
      return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
    }
  }, [impairmentType, resetIdleTimer]);

  const advance = useCallback(() => {
    if (isLast) {
      speakMessage('You have arrived. You are safe now.');
      endAlert('arrived');
      router.replace('/');
    } else {
      setCurrentStep(s => s + 1);
    }
  }, [isLast, speakMessage, endAlert]);

  const handleNext = () => {
    triggerHaptic('tap');
    if (impairmentType === 'mci' && !isLast) {
      setShowConfirmation(true);
      speakMessage(MCI_CONFIRMATIONS[currentStep]);
      setTimeout(() => {
        setShowConfirmation(false);
        advance();
      }, 2000);
    } else {
      advance();
    }
    if (impairmentType === 'adhd') resetIdleTimer();
  };

  const handleRepeat = () => {
    triggerHaptic('tap');
    const msg = impairmentType === 'adhd'
      ? `Go ${step.egoDir}. ${step.landmarkSentence}`
      : step.literalText;
    speakMessage(msg);
    if (impairmentType === 'adhd') resetIdleTimer();
  };

  const handleShare = () => {
    speakMessage('Sharing your location with your caregiver.');
  };

  // W09 – G28: step back, or from the first step back to the shelter list
  const handleBack = () => {
    triggerHaptic('tap');
    if (currentStep === 0) {
      router.push('/shelter');
    } else {
      setCurrentStep(s => s - 1);
    }
    if (impairmentType === 'adhd') resetIdleTimer();
  };

  // W10 – G52: help reachable from every step
  const handleHelp = () => {
    speakMessage('Calling your helper now.');
    triggerHaptic('tap');
    router.push('/helpers');
  };

  const common = { step, stepNum: currentStep, total: STEPS.length, isLast, progress };

  let nav = <DefaultNav {...common} onNext={handleNext} onRepeat={handleRepeat} />;
  if (impairmentType === 'dementia') {
    nav = <DementiaNav {...common} onNext={handleNext} onRepeat={handleRepeat} />;
  } else if (impairmentType === 'autism') {
    nav = <ASDNav steps={STEPS} currentStep={currentStep} isLast={isLast} onNext={handleNext} />;
  } else if (impairmentType === 'mci') {
    nav = (
      <MCINav
        {...common}
        showConfirmation={showConfirmation}
        confirmation={MCI_CONFIRMATIONS[currentStep]}
        onNext={handleNext}
        onRepeat={handleRepeat}
      />
    );
  } else if (impairmentType === 'adhd') {
    nav = <ADHDNav {...common} onNext={handleNext} onRepeat={handleRepeat} />;
  } else if (impairmentType === 'schizophrenia') {
    nav = <SchizophreniaNav {...common} onNext={handleNext} onShare={handleShare} />;
  }

  return (
    <SafeAreaView style={styles.screenWrapper} edges={['top', 'left', 'right', 'bottom']}>
      <HazardBanner alertType={currentAlert?.type} />
      <View style={styles.navContainer}>{nav}</View>
      <RouteBar
        onBack={handleBack}
        onHelp={handleHelp}
        isFirst={currentStep === 0}
        disabled={showConfirmation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textWhite: { color: '#ffffff' },
  textGrey: { color: '#64748b' },
  fontWeightNormal: { fontWeight: 'normal' },

  screenWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navContainer: {
    flex: 1,
  },
  hazardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderBottomWidth: 2,
    borderColor: '#fca5a5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  hazardBannerText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  routeBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderColor: '#e2e8f0',
  },
  routeBarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 18,
    paddingVertical: 12,
    minHeight: 56,
    gap: 8,
  },
  routeBarBtnDisabled: {
    opacity: 0.5,
  },
  routeBarBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  adhdLandmark: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginTop: 6,
  },

  // Dementia layout styles
  dementiaRoot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  dementiaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dementiaHeaderText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#94a3b8',
  },
  dementiaListenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
    gap: 6,
  },
  dementiaListenText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
  dementiaPhotoCard: {
    marginHorizontal: 20,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
    flex: 0.8,
  },
  dementiaEmoji: {
    fontSize: 108,
  },
  dementiaLandmarkName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#334155',
    letterSpacing: 1,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  dementiaTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dementiaInstructionText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 44,
  },
  dementiaFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  dementiaBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    minHeight: 88,
  },
  dementiaBtnText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },

  // Autism layout styles
  asdRoot: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  asdHeader: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  asdHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  asdStepsList: {
    gap: 8,
  },
  asdStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    gap: 12,
  },
  asdRowActive: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  asdRowCompleted: {
    backgroundColor: '#f1f5f9',
    opacity: 0.6,
  },
  asdRowPending: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  asdStepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  asdCircleCompleted: {
    backgroundColor: '#16a34a',
  },
  asdCircleActive: {
    backgroundColor: '#0f172a',
  },
  asdCirclePending: {
    backgroundColor: '#cbd5e1',
  },
  asdCircleText: {
    fontSize: 12,
    fontWeight: '900',
  },
  asdStepText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 18,
  },
  asdTextActive: {
    fontWeight: '900',
    color: '#0f172a',
  },
  asdTextInactive: {
    fontWeight: '600',
    color: '#64748b',
  },
  asdStepEmoji: {
    fontSize: 18,
  },
  asdContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  asdStepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0f172a',
    padding: 24,
    elevation: 2,
  },
  asdCardLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 10,
  },
  asdCardInstruction: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 34,
  },
  asdDistanceTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 16,
  },
  asdDistanceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  asdFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  asdBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    minHeight: 76,
  },
  asdBtnText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },

  // MCI layout styles
  mciRoot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mciHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  mciProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mciProgressStepText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#334155',
  },
  mciProgressPctText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563eb',
  },
  mciProgressBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 99,
    overflow: 'hidden',
  },
  mciProgressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 99,
  },
  mciListenContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  mciListenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 18,
    paddingVertical: 14,
    minHeight: 64,
    gap: 8,
  },
  mciListenBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  mciConfirmCard: {
    marginHorizontal: 20,
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  mciConfirmCardText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#065f46',
  },
  mciContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 20,
  },
  mciCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  mciCardLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#3b82f6',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  mciCardEmoji: {
    fontSize: 68,
    marginVertical: 4,
  },
  mciCardTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1e3a8a',
  },
  mciCardDistance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
  },
  mciInstructionDetail: {
    fontSize: 22,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  mciFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  mciBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    minHeight: 76,
  },
  mciBtnText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },

  // ADHD layout styles
  adhdRoot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  adhdBanner: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  adhdBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  adhdBannerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  adhdBannerMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  adhdBannerLabel: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
  },
  adhdBannerStepText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94a3b8',
  },
  adhdProgressBarBg: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 99,
    overflow: 'hidden',
  },
  adhdProgressBarFill: {
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 99,
  },
  adhdContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  adhdArrowBg: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  adhdDirectionLabel: {
    fontSize: 64,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 1,
  },
  adhdDistance: {
    fontSize: 28,
    fontWeight: '800',
    color: '#94a3b8',
  },
  adhdHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 12,
  },
  adhdHintText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c2410c',
  },
  adhdFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  adhdBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    minHeight: 68,
    gap: 8,
  },
  adhdBtnSecondaryText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  adhdBtnPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    borderRadius: 20,
    minHeight: 68,
  },
  adhdBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },

  // Schizophrenia layout styles
  schRoot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  schHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  schHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#94a3b8',
  },
  schShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    gap: 6,
  },
  schShareBtnShared: {
    backgroundColor: '#f0fdfa',
    borderColor: '#2dd4bf',
  },
  schShareText: {
    fontSize: 14,
    fontWeight: '800',
  },
  schContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  schEmoji: {
    fontSize: 110,
  },
  schTitleContainer: {
    alignItems: 'center',
  },
  schWalkTo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0f172a',
  },
  schLandmark: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0d9488',
    marginTop: 4,
    textAlign: 'center',
  },
  schDistance: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94a3b8',
  },
  schFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  schBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    minHeight: 80,
  },
  schBtnText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },

  // Default layout styles
  defRoot: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
  defHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  defProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  defHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  defProgressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  defProgressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 99,
  },
  defContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 24,
  },
  defIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  defDirText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  defInstructionText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '700',
  },
  defDistanceText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    fontWeight: '700',
  },
  defFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  defBtnPrimary: {
    backgroundColor: '#22c55e',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    minHeight: 76,
  },
  defBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  defBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 14,
    minHeight: 56,
    gap: 8,
  },
  defBtnSecondaryText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
});
