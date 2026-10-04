import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../../contexts/AlertContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { getAlertColors } from '../../utils/alertColors';
import { getCAPMetadata, CAP_SEVERITY_COLORS } from '../../utils/capSeverity';
import { triggerHaptic } from '../../utils/haptic';
import { StressEscalationTimer } from '../../components/StressEscalationTimer';
import { EasyReadToggle, toEasyRead, getHazardSymbol } from '../../components/EasyReadToggle';

export default function AlertScreen() {
  const { currentAlert, acknowledgeAlert, speakMessage } = useAlert();
  const { adaptiveSettings, impairmentType } = useUserPreferences();
  const [flashState, setFlashState] = useState(false);
  const [easyRead, setEasyRead] = useState(false);
  const [escalationDismissed, setEscalationDismissed] = useState(false);

  const useSimpleLanguage = adaptiveSettings.useSimpleLanguage;
  const needsMemorySupport = impairmentType === 'dementia' || impairmentType === 'mci';
  const noFlash = adaptiveSettings.sensoryFriendly;

  // G127 – auto-escalate to carer
  const handleEscalate = useCallback(() => {
    speakMessage('No response detected. Calling your helper now.');
    router.push('/helpers');
  }, [speakMessage]);

  useEffect(() => {
    if (!currentAlert) {
      return;
    }
    // G118 – Immediately speak alert + trigger haptic
    speakMessage(currentAlert.message + '. ' + currentAlert.instructions);
    triggerHaptic('alert');

    // G41 / C4 – Visual flash for danger, disabled for sensory-friendly
    if (currentAlert.level === 'danger' && !noFlash) {
      const interval = setInterval(() => setFlashState(p => !p), 600);
      return () => clearInterval(interval);
    }
  }, [currentAlert, speakMessage, noFlash]);

  // C3 – G109: re-announce every 60s while the alert is on screen (dementia/MCI)
  useEffect(() => {
    if (!currentAlert || !needsMemorySupport || !adaptiveSettings.repeatInstructions) return;
    const interval = setInterval(() => {
      speakMessage(currentAlert.message + '. ' + currentAlert.instructions);
      triggerHaptic('double');
    }, 60000);
    return () => clearInterval(interval);
  }, [currentAlert, needsMemorySupport, adaptiveSettings.repeatInstructions, speakMessage]);

  if (!currentAlert) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle-outline" size={80} color="#059669" />
        <Text style={styles.emptyText}>No Active Alerts</Text>
        <Text style={styles.emptySub}>You are safe right now.</Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>GO HOME</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleNavigate = () => {
    speakMessage('Starting navigation to safe place.');
    triggerHaptic('tap');
    router.push('/shelter');
  };

  const handleCallHelper = () => {
    speakMessage('Calling your helper now.');
    triggerHaptic('tap');
    router.push('/helpers');
  };

  const handleUnderstand = () => {
    speakMessage('Good. Stay safe. Follow instructions.');
    triggerHaptic('success');
    acknowledgeAlert();
    router.push('/');
  };

  const handleRepeat = () => {
    speakMessage(currentAlert.message + '. ' + currentAlert.instructions);
    triggerHaptic('double');
  };

  const isDanger = currentAlert.level === 'danger';
  const colors = getAlertColors(impairmentType, currentAlert.level);
  const capMeta = getCAPMetadata(currentAlert.level);
  const isExtreme = capMeta.severity === 'Extreme';
  const capColors = CAP_SEVERITY_COLORS[capMeta.severity];

  // Darken bg slightly on flash for danger
  const bgHex = (isDanger && flashState) ? '#dc2626' : colors.bg;
  const textHex = colors.text;

  // G124 – Extreme severity: strip to hazard + single action + call only (W24 / W01)
  if (isExtreme) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgHex }]} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.extremeContent}>
          {/* Top row: CAP badge + C2 REPEAT control beside it */}
          <View style={styles.extremeTopRow}>
            <View style={[styles.extremeBadge, { backgroundColor: capColors.bg }]}>
              <Text style={[styles.extremeBadgeText, { color: capColors.text }]}>
                ⚠ {capMeta.severity.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRepeat}
              style={[styles.repeatBadgeBtn, { borderColor: textHex }]}
              accessibilityLabel="Repeat the alert message"
            >
              <Ionicons name="volume-high" size={20} color={textHex} />
              <Text style={[styles.repeatBadgeText, { color: textHex }]}>REPEAT</Text>
            </TouchableOpacity>
          </View>

          {/* G78: Hazard type topmost */}
          <View style={styles.extremeHeader}>
            <Text style={[styles.extremeTitle, { color: textHex }]}>{currentAlert.type.toUpperCase()}</Text>
            <Text style={styles.extremePictogram} role="img" aria-label={currentAlert.type}>
              {getHazardSymbol(currentAlert.type)}
            </Text>
            <Text style={[styles.extremeMessage, { color: textHex }]}>{currentAlert.message}</Text>
            {/* W01 – G118: instruction text is shown prominently on screen, not audio-only */}
            <Text style={[styles.extremeInstruction, { color: textHex }]}>{currentAlert.instructions}</Text>
          </View>

          {/* Single primary action + call helper */}
          <View style={styles.extremeActions}>
            {isDanger && (
              <TouchableOpacity
                onPress={handleNavigate}
                style={[styles.extremeButton, { backgroundColor: colors.buttonBg, borderColor: 'rgba(0,0,0,0.2)' }]}
                accessibilityLabel="Go to safe place now"
              >
                <Ionicons name="navigate" size={32} color={colors.buttonText} />
                <Text style={[styles.extremeButtonText, { color: colors.buttonText }]}>
                  {useSimpleLanguage ? 'GO TO SAFE PLACE' : 'FIND SHELTER'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleCallHelper}
              style={[styles.extremeButton, { backgroundColor: colors.buttonBg, borderColor: 'rgba(0,0,0,0.2)' }]}
              accessibilityLabel="Call my helper"
            >
              <Ionicons name="call" size={32} color={colors.buttonText} />
              <Text style={[styles.extremeButtonText, { color: colors.buttonText }]}>
                {useSimpleLanguage ? 'CALL HELPER' : 'CALL MY HELPER'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* C1 – G127: Escalation timer placed below actions so it never pushes them off screen */}
          {needsMemorySupport && !escalationDismissed && (
            <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
              <StressEscalationTimer
                seconds={60}
                onEscalate={handleEscalate}
                onDismiss={() => setEscalationDismissed(true)}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Standard alert screen (Severe / Moderate)
  const displayMessage = easyRead ? toEasyRead(currentAlert.message) : currentAlert.message;
  const displayInstruction = easyRead ? toEasyRead(currentAlert.instructions) : currentAlert.instructions;

  // G127: Show escalation timer for dementia/MCI impairment types
  const showEscalation = needsMemorySupport && !escalationDismissed;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgHex }]} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Top bar: CAP badge + REPEAT button + Easy Read toggle */}
        <View style={styles.topBar}>
          <View style={[styles.capBadge, { backgroundColor: capColors.bg }]}>
            <Text style={[styles.capBadgeText, { color: capColors.text }]}>
              CAP: {capMeta.severity}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRepeat}
            style={[styles.repeatBadgeBtn, { borderColor: textHex }]}
            accessibilityLabel="Repeat the alert message"
          >
            <Ionicons name="volume-high" size={18} color={textHex} />
            <Text style={[styles.repeatBadgeText, { color: textHex }]}>REPEAT</Text>
          </TouchableOpacity>

          <EasyReadToggle isActive={easyRead} onToggle={() => setEasyRead(e => !e)} />
        </View>

        {/* G127 – Stress escalation timer */}
        {showEscalation && (
          <StressEscalationTimer
            seconds={60}
            onEscalate={handleEscalate}
            onDismiss={() => setEscalationDismissed(true)}
          />
        )}

        {/* G78: Hazard name MUST be the topmost text */}
        <View style={styles.contentBody}>
          <Text style={[styles.alertType, { color: textHex }]}>{currentAlert.type.toUpperCase()}</Text>

          {/* G120 – FEMA-standard hazard pictogram */}
          <Text style={styles.pictogram} role="img" aria-label={currentAlert.type}>
            {getHazardSymbol(currentAlert.type)}
          </Text>

          {/* G34: Message */}
          <Text style={[styles.alertMessage, { color: textHex }]}>{displayMessage}</Text>
          <Text style={[styles.alertInstruction, { color: textHex }]}>{displayInstruction}</Text>
        </View>

        {/* G128 – UDL: multiple means of representation */}
        <View style={styles.representationBox}>
          <View style={styles.repRow}>
            <TouchableOpacity
              onPress={handleRepeat}
              style={styles.repButton}
              accessibilityLabel="Read aloud"
            >
              <Ionicons name="volume-high" size={24} color={textHex} />
              <Text style={[styles.repButtonText, { color: textHex }]}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setEasyRead(e => !e)}
              style={styles.repButton}
              accessibilityLabel="Symbol view"
            >
              <Ionicons name="book" size={24} color={textHex} />
              <Text style={[styles.repButtonText, { color: textHex }]}>Symbol</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => speakMessage('Sign language video is not yet available.')}
              style={styles.repButton}
              accessibilityLabel="Sign language"
            >
              <Text style={styles.repSignIcon}>🤟</Text>
              <Text style={[styles.repButtonText, { color: textHex }]}>Sign</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/checklist')}
              style={styles.repButton}
              accessibilityLabel="Safe guide"
            >
              <Ionicons name="shield" size={24} color={textHex} />
              <Text style={[styles.repButtonText, { color: textHex }]}>Guide</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions - G124: Single primary evacuation decision under acute stress */}
        <View style={styles.actionsBox}>
          {isDanger && (
            <TouchableOpacity
              onPress={handleNavigate}
              style={[styles.actionBtn, { backgroundColor: colors.buttonBg }]}
              accessibilityLabel="Go to safe place"
            >
              <Ionicons name="navigate" size={28} color={colors.buttonText} />
              <Text style={[styles.actionBtnText, { color: colors.buttonText }]}>
                {useSimpleLanguage ? 'GO TO SAFE PLACE' : 'FIND SHELTER'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleCallHelper}
            style={[styles.actionBtn, { backgroundColor: colors.buttonBg }]}
            accessibilityLabel="Call my helper"
          >
            <Ionicons name="call" size={28} color={colors.buttonText} />
            <Text style={[styles.actionBtnText, { color: colors.buttonText }]}>
              {useSimpleLanguage ? 'CALL HELPER' : 'CALL MY HELPER'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* G15: Safe Exit */}
        <View style={styles.exitBox}>
          <TouchableOpacity
            onPress={handleUnderstand}
            style={styles.exitButton}
            accessibilityLabel="I understand - dismiss alert"
          >
            <Ionicons name="checkmark-circle" size={24} color={textHex} />
            <Text style={[styles.exitButtonText, { color: textHex }]}>I UNDERSTAND</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  emptyText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 20,
  },
  emptySub: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 16,
    marginTop: 32,
    minHeight: 52,
    elevation: 2,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  extremeContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  extremeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  badgeContainer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  extremeBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  extremeBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  repeatBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    gap: 6,
  },
  repeatBadgeText: {
    fontSize: 15,
    fontWeight: '900',
  },
  extremeHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 8,
  },
  extremeTitle: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  extremePictogram: {
    fontSize: 80,
    marginVertical: 8,
  },
  extremeMessage: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 38,
  },
  extremeInstruction: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
    marginTop: 10,
    opacity: 0.95,
  },
  extremeActions: {
    paddingHorizontal: 24,
    gap: 12,
    marginVertical: 12,
  },
  extremeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 4,
    paddingVertical: 18,
    minHeight: 80,
    gap: 14,
  },
  extremeButtonText: {
    fontSize: 22,
    fontWeight: '900',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  capBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  capBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  contentBody: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  alertType: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    opacity: 0.9,
  },
  pictogram: {
    fontSize: 84,
    marginVertical: 12,
  },
  alertMessage: {
    fontSize: 38,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 46,
  },
  alertInstruction: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.9,
    lineHeight: 32,
  },
  representationBox: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  repRow: {
    flexDirection: 'row',
  },
  repButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.15)',
  },
  repButtonText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  repSignIcon: {
    fontSize: 22,
    lineHeight: 24,
  },
  actionsBox: {
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    paddingVertical: 20,
    minHeight: 80,
    gap: 12,
  },
  actionBtnText: {
    fontSize: 22,
    fontWeight: '900',
  },
  repeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    minHeight: 72,
    gap: 10,
  },
  repeatBtnText: {
    fontSize: 20,
    fontWeight: '900',
  },
  exitBox: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 18,
    minHeight: 72,
    gap: 10,
  },
  exitButtonText: {
    fontSize: 18,
    fontWeight: '900',
  },
});
