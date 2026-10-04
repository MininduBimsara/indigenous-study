import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../../contexts/AlertContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { AdaptiveButton } from '../../components/AdaptiveButton';
import { getAlertColors } from '../../utils/alertColors';
import { triggerHaptic } from '../../utils/haptic';

export default function HomeDashboard() {
  const {
    currentAlert, lastAlert, isOnline, batteryLevel, setAlert, endAlert, speakMessage, checkInStatus, updateCheckInStatus
  } = useAlert();
  const { adaptiveSettings, impairmentType } = useUserPreferences();
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // G18/G124: Redirect to alert screen immediately when danger is active
  useEffect(() => {
    if (currentAlert && currentAlert.level === 'danger') {
      router.push('/alert');
    }
  }, [currentAlert]);

  // G109 – Repeat important information every 60 seconds while alert is active (dementia/MCI)
  useEffect(() => {
    const shouldRepeat = adaptiveSettings.repeatInstructions &&
      currentAlert &&
      (impairmentType === 'dementia' || impairmentType === 'mci');

    if (shouldRepeat && currentAlert) {
      repeatIntervalRef.current = setInterval(() => {
        speakMessage(currentAlert.message + '. ' + currentAlert.instructions);
        triggerHaptic('double');
      }, 60000);
    }
    return () => {
      if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);
    };
  }, [currentAlert, impairmentType, adaptiveSettings.repeatInstructions, speakMessage]);

  const statusLevel = currentAlert?.level || 'safe';
  const colors = getAlertColors(impairmentType, statusLevel);

  // G111: Use muted calm tones for safe/warning; only full red for danger
  const safeGreen = { bg: '#d1fae5', text: '#065f46' }; // calm muted green
  const warningAmber = { bg: '#fef3c7', text: '#92400e' }; // amber (not red)
  const statusColors = statusLevel === 'safe'
    ? safeGreen
    : statusLevel === 'warning'
    ? warningAmber
    : colors; // danger: use red from alertColors

  const statusLabels = {
    safe: {
      text: 'SAFE',
      sub: 'No danger right now.',
      icon: <Ionicons name="checkmark-circle" size={80} color={statusColors.text} />
    },
    warning: {
      text: 'WARNING',
      sub: 'Pay attention. Stay ready.',
      icon: <Ionicons name="warning" size={80} color={statusColors.text} />
    },
    danger: {
      text: 'DANGER',
      sub: 'Take action now!',
      icon: <Ionicons name="alert-circle" size={80} color={statusColors.text} />
    },
  };

  const cfg = statusLabels[statusLevel];

  // C6, D12, D28, D41 – G28/G45: how the last alert ended, in plain words
  const endedLabels: Record<string, string> = {
    'arrived': 'You reached the safe place.',
    'acknowledged': 'You said you understood.',
    'all-clear': 'ALL CLEAR. The danger is over.',
    'cancelled': 'FALSE ALARM. There was no danger.',
  };

  const handleVoiceStatus = () => {
    // C5 – G109: read the actual alert, not only the level
    const msg = currentAlert
      ? `${statusLevel === 'danger' ? 'Danger' : 'Warning'}. ${currentAlert.type}. ${currentAlert.message}. ${currentAlert.instructions}`
      : lastAlert
      ? `You are safe. No danger right now. Last alert: ${lastAlert.alert.type}. ${endedLabels[lastAlert.reason] || ''}`
      : 'You are safe. No danger right now.';
    speakMessage(msg);
    triggerHaptic('tap');
  };

  // G126 – Single-tap safe check-in
  const handleIAmSafe = () => {
    triggerHaptic('success');
    speakMessage('You have checked in as safe. Your helpers have been notified.');
    updateCheckInStatus('safe');
    router.push('/check-in');
  };

  const handleTestAlert = (level: 'warning' | 'danger') => {
    const alerts = {
      warning: {
        level: 'warning' as const,
        type: 'Storm Warning',
        message: 'Big storm coming',
        instructions: 'Stay indoors. Close windows.',
        icon: '⛈',
        timestamp: new Date(),
      },
      danger: {
        level: 'danger' as const,
        type: 'Flood Alert',
        message: 'Danger! Flood coming!',
        instructions: 'Go to high place now!',
        icon: '🌊',
        timestamp: new Date(),
      },
    };
    setAlert(alerts[level]);
  };

  const checkInLabel = checkInStatus === 'safe'
    ? '✓ SAFE'
    : checkInStatus === 'moving'
    ? '→ MOVING'
    : checkInStatus === 'help'
    ? '! HELP'
    : null;

  // Spacing options
  const spacingStyle = adaptiveSettings.spacing === 'extra-generous'
    ? styles.spacingExtraGenerous
    : adaptiveSettings.spacing === 'generous'
    ? styles.spacingGenerous
    : styles.spacingComfortable;

  const gapStyle = {
    gap: adaptiveSettings.spacing === 'extra-generous' ? 24 : adaptiveSettings.spacing === 'generous' ? 16 : 12
  };

  // Font size options
  const getFontSize = (type: 'title' | 'sub' | 'body' | 'badge') => {
    if (adaptiveSettings.fontSize === 'huge') {
      if (type === 'title') return 56;
      if (type === 'sub') return 24;
      if (type === 'body') return 24;
      return 22;
    } else if (adaptiveSettings.fontSize === 'extra-large') {
      if (type === 'title') return 46;
      if (type === 'sub') return 20;
      if (type === 'body') return 20;
      return 18;
    } else {
      if (type === 'title') return 36;
      if (type === 'sub') return 16;
      if (type === 'body') return 16;
      return 14;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Status card - G78: Critical info at top */}
        <View style={[styles.statusCard, spacingStyle, { backgroundColor: statusColors.bg }]}>
          <View style={styles.statusHeader}>
            {/* Connectivity */}
            <View style={styles.connectivity}>
              <Ionicons
                name={isOnline ? 'wifi' : 'wifi-outline'}
                size={24}
                color={statusColors.text}
                style={{ opacity: 0.9 }}
              />
              <Text style={[styles.statusHeaderText, { color: statusColors.text }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>

            {/* Battery + Settings */}
            <View style={styles.headerRight}>
              <View style={styles.battery}>
                <Ionicons
                  name={batteryLevel > 20 ? 'battery-full' : 'battery-dead'}
                  size={24}
                  color={statusColors.text}
                  style={{ opacity: 0.9 }}
                />
                <Text style={[styles.statusHeaderText, { color: statusColors.text }]}>
                  {batteryLevel}%
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/settings')}
                style={styles.settingsButton}
                accessibilityLabel="Settings"
                accessibilityRole="button"
              >
                <Ionicons name="settings" size={24} color={statusColors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Status Display */}
          <View style={styles.statusMain}>
            <View style={styles.statusIcon}>{cfg.icon}</View>
            <Text style={[styles.statusTitle, { color: statusColors.text, fontSize: getFontSize('title') }]}>
              {cfg.text}
            </Text>
            <Text style={[styles.statusSub, { color: statusColors.text, fontSize: getFontSize('sub') }]}>
              {cfg.sub}
            </Text>
          </View>

          {/* Check-in badge */}
          {checkInLabel && (
            <View style={styles.checkInBadge}>
              <Text style={[styles.checkInBadgeText, { fontSize: getFontSize('badge') }]}>
                You said: {checkInLabel}
              </Text>
            </View>
          )}

          {/* Voice read aloud */}
          <TouchableOpacity
            onPress={handleVoiceStatus}
            style={styles.listenButton}
            accessibilityLabel="Hear status read aloud"
            accessibilityRole="button"
          >
            <Ionicons name="volume-high" size={24} color={statusColors.text} />
            <Text style={[styles.listenButtonText, { color: statusColors.text, fontSize: getFontSize('body') }]}>
              LISTEN
            </Text>
          </TouchableOpacity>
        </View>

        {/* C6, D12, D28, D41 – G8/G28/G45/G47: last alert stays readable after it ends */}
        {statusLevel === 'safe' && lastAlert && (
          <View style={[styles.lastAlertContainer, { paddingHorizontal: spacingStyle.paddingHorizontal }]}>
            <View style={styles.lastAlertCard} role="status">
              <View style={styles.lastAlertHeader}>
                <Ionicons name="information-circle" size={24} color="#0f172a" />
                <Text style={styles.lastAlertHeaderText}>
                  LAST ALERT · {new Date(lastAlert.endedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.lastAlertReason}>{endedLabels[lastAlert.reason] || 'The alert has ended.'}</Text>
              <Text style={styles.lastAlertDetail}>
                {lastAlert.alert.type}: {lastAlert.alert.message}
              </Text>
              {lastAlert.alert.instructions ? (
                <Text style={styles.lastAlertInstructions}>
                  It said: {lastAlert.alert.instructions}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        {/* G126 – I AM SAFE button: prominent, single-tap */}
        {statusLevel !== 'safe' && (
          <View style={[styles.safeButtonContainer, { paddingHorizontal: spacingStyle.paddingHorizontal }]}>
            <TouchableOpacity
              onPress={handleIAmSafe}
              style={styles.safeButton}
              accessibilityLabel="I am safe - tap to notify helpers"
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-circle" size={32} color="#ffffff" />
              <Text style={styles.safeButtonText}>I AM SAFE</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Primary Action Buttons Container */}
        <View style={[styles.actionsContainer, spacingStyle, gapStyle]}>
          {statusLevel === 'safe' ? (
            <>
              {/* Call Helper */}
              <AdaptiveButton
                onPress={() => router.push('/helpers')}
                variant="primary"
                fullWidth
              >
                <Ionicons name="call" size={32} color="#ffffff" />
                <View style={styles.buttonTextWrapper}>
                  <Text style={[styles.buttonTitle, { fontSize: getFontSize('body') + 2 }]}>
                    {adaptiveSettings.useSimpleLanguage ? 'CALL HELPER' : 'CONTACT HELPERS'}
                  </Text>
                  {!adaptiveSettings.focusMode && (
                    <Text style={styles.buttonSubtitle}>
                      {adaptiveSettings.useSimpleLanguage ? 'Talk to someone who helps you' : 'Contact your caregivers'}
                    </Text>
                  )}
                </View>
              </AdaptiveButton>

              {/* G125 – Family Drill shortcut */}
              {adaptiveSettings.maxButtonsPerScreen >= 2 && (
                <AdaptiveButton
                  onPress={() => router.push('/checklist')}
                  variant="secondary"
                  fullWidth
                >
                  <Ionicons name="clipboard" size={30} color="#ffffff" />
                  <View style={styles.buttonTextWrapper}>
                    <Text style={[styles.buttonTitle, { fontSize: getFontSize('body') }]}>
                      FAMILY DRILL
                    </Text>
                    {!adaptiveSettings.focusMode && (
                      <Text style={styles.buttonSubtitle}>Practice your evacuation plan</Text>
                    )}
                  </View>
                </AdaptiveButton>
              )}
            </>
          ) : (
            <>
              {/* Button 1: INFORM CURRENT SITUATION */}
              <AdaptiveButton
                onPress={() => router.push('/check-in')}
                variant="success"
                fullWidth
              >
                <Ionicons name="shield-checkmark" size={32} color="#ffffff" />
                <View style={styles.buttonTextWrapper}>
                  <Text style={[styles.buttonTitle, { fontSize: getFontSize('body') + 2 }]}>
                    INFORM STATUS
                  </Text>
                  {!adaptiveSettings.focusMode && (
                    <Text style={styles.buttonSubtitle}>
                      {adaptiveSettings.useSimpleLanguage ? 'Tell helpers how you are' : 'Report your current situation'}
                    </Text>
                  )}
                </View>
              </AdaptiveButton>

              {/* Button 2: I NEED HELP */}
              {adaptiveSettings.maxButtonsPerScreen >= 2 && (
                <AdaptiveButton
                  onPress={() => router.push('/sos')}
                  variant="danger"
                  fullWidth
                >
                  <Ionicons name="alert-circle" size={32} color="#ffffff" />
                  <View style={styles.buttonTextWrapper}>
                    <Text style={[styles.buttonTitle, { fontSize: getFontSize('body') + 2 }]}>
                      I NEED HELP
                    </Text>
                    {!adaptiveSettings.focusMode && (
                      <Text style={styles.buttonSubtitle}>
                        {adaptiveSettings.useSimpleLanguage ? 'Get help right now' : 'Request immediate help'}
                      </Text>
                    )}
                  </View>
                </AdaptiveButton>
              )}

              {/* Button 3: Find Shelter */}
              {adaptiveSettings.maxButtonsPerScreen >= 3 && (
                <AdaptiveButton
                  onPress={() => router.push('/shelter')}
                  variant="primary"
                  fullWidth
                >
                  <Ionicons name="map" size={30} color="#ffffff" />
                  <View style={styles.buttonTextWrapper}>
                    <Text style={[styles.buttonTitle, { fontSize: getFontSize('body') }]}>
                      FIND SHELTER
                    </Text>
                    {!adaptiveSettings.focusMode && (
                      <Text style={styles.buttonSubtitle}>
                        {adaptiveSettings.useSimpleLanguage ? 'Go to a safe place' : 'Find nearest shelter'}
                      </Text>
                    )}
                  </View>
                </AdaptiveButton>
              )}
            </>
          )}
        </View>

        {/* Memory Aid - Last action reminder */}
        {adaptiveSettings.memoryAidsEnabled && checkInStatus && statusLevel !== 'safe' && (
          <View style={[styles.memoryAidContainer, { marginHorizontal: spacingStyle.paddingHorizontal }]}>
            <View style={styles.memoryAidCard}>
              <Text style={styles.memoryAidTitle}>
                ✓ You told us: {checkInLabel}
              </Text>
              <Text style={styles.memoryAidTime}>
                Just now
              </Text>
            </View>
          </View>
        )}

        {/* Test Simulator Buttons */}
        {statusLevel !== 'danger' && (
          <View style={styles.simulatorContainer}>
            <TouchableOpacity
              onPress={() => handleTestAlert('warning')}
              style={[styles.simulatorButton, styles.simWarning]}
            >
              <Text style={styles.simulatorText}>⚠ Warning</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTestAlert('danger')}
              style={[styles.simulatorButton, styles.simDanger]}
            >
              <Text style={styles.simulatorText}>🚨 Danger</Text>
            </TouchableOpacity>
            {statusLevel !== 'safe' && (
              <TouchableOpacity
                onPress={() => setAlert(null)}
                style={[styles.simulatorButton, styles.simReset]}
              >
                <Text style={styles.simulatorText}>✓ Safe</Text>
              </TouchableOpacity>
            )}
            {statusLevel !== 'safe' && (
              <TouchableOpacity
                onPress={() => endAlert('cancelled')}
                style={[styles.simulatorButton, styles.simReset]}
              >
                <Text style={styles.simulatorText}>✕ False alarm</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  spacingComfortable: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  spacingGenerous: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  spacingExtraGenerous: {
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  statusCard: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectivity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusHeaderText: {
    fontSize: 16,
    fontWeight: '800',
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusMain: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  statusIcon: {
    marginBottom: 8,
  },
  statusTitle: {
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  statusSub: {
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
  },
  checkInBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 12,
  },
  checkInBadgeText: {
    fontWeight: '800',
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 20,
    minHeight: 52,
    gap: 8,
  },
  listenButtonText: {
    fontWeight: '900',
  },
  safeButtonContainer: {
    marginTop: 24,
  },
  safeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#15803d',
    paddingVertical: 18,
    minHeight: 76,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  safeButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  actionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  buttonTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonTitle: {
    color: '#ffffff',
    fontWeight: '900',
  },
  buttonSubtitle: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  lastAlertContainer: {
    paddingTop: 16,
  },
  lastAlertCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  lastAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastAlertHeaderText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#334155',
  },
  lastAlertReason: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  lastAlertDetail: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  lastAlertInstructions: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 20,
  },
  memoryAidContainer: {
    marginBottom: 20,
  },
  memoryAidCard: {
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  memoryAidTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  memoryAidTime: {
    fontSize: 14,
    color: '#1d4ed8',
    marginTop: 4,
  },
  simulatorContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    gap: 8,
  },
  simulatorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  simWarning: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  simDanger: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  simReset: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  simulatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
