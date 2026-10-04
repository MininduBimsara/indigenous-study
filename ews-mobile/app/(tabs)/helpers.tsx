import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../../contexts/AlertContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { triggerHaptic } from '../../utils/haptic';

interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  initials: string;
  color: string;
}

const mockCaregivers: Caregiver[] = [
  { id: '1', name: 'Sarah Johnson', relationship: 'PRIMARY HELPER', phone: '555-0101', initials: 'SJ', color: '#2563eb' },
  { id: '2', name: 'Michael Chen', relationship: 'FAMILY MEMBER', phone: '555-0102', initials: 'MC', color: '#16a34a' },
  { id: '3', name: 'Emergency Services', relationship: 'EMERGENCY', phone: '911', initials: '!!', color: '#dc2626' },
];

export default function CaregiverScreen() {
  const { speakMessage, currentAlert } = useAlert();
  const { adaptiveSettings, impairmentType } = useUserPreferences();
  const [showAll, setShowAll] = React.useState(false);

  // W16/W17 (G74, G103): One large CALL button for primary helper; 2-action profiles see others on request
  const compact = adaptiveSettings.maxButtonsPerScreen <= 2;
  const primary = mockCaregivers[0];
  const listVisible = !compact || showAll;

  const handleCall = (caregiver: Caregiver) => {
    speakMessage(`Calling ${caregiver.name}`);
    triggerHaptic('tap');
    Alert.alert('Calling Helper', `Connecting call to ${caregiver.name} (${caregiver.phone})...`);
  };

  const handleMessage = (caregiver: Caregiver) => {
    speakMessage(`Sending message to ${caregiver.name}`);
    triggerHaptic('tap');
    Alert.alert('Message Sent', `Message sent to ${caregiver.name}: "I need help. Please check on me."`);
  };

  const handleShareLocation = (caregiver: Caregiver) => {
    speakMessage(`Sharing your location with ${caregiver.name}`);
    triggerHaptic('success');
    Alert.alert('Location Shared', `Your current location has been shared with ${caregiver.name}.`);
  };

  const handleEmergencyBroadcast = () => {
    speakMessage('Sending emergency alert to all helpers now');
    triggerHaptic('alert');
    Alert.alert('Emergency Broadcast', 'Emergency broadcast sent to all helpers and emergency services.');
  };

  // Font size options
  const getFontSize = (type: 'title' | 'sub' | 'body') => {
    if (adaptiveSettings.fontSize === 'huge') {
      if (type === 'title') return 28;
      if (type === 'sub') return 20;
      return 18;
    } else if (adaptiveSettings.fontSize === 'extra-large') {
      if (type === 'title') return 24;
      if (type === 'sub') return 18;
      return 16;
    } else {
      if (type === 'title') return 20;
      if (type === 'sub') return 16;
      return 14;
    }
  };

  const handleReturn = () => {
    triggerHaptic('tap');
    if (currentAlert) {
      router.push('/alert');
    } else {
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleReturn}
          style={[styles.homeButton, currentAlert && styles.returnHeaderBtn]}
          accessibilityLabel={currentAlert ? "Return to emergency alert" : "Go home"}
          accessibilityRole="button"
        >
          <Ionicons name={currentAlert ? "arrow-back" : "home"} size={22} color="#ffffff" />
          {currentAlert && <Text style={styles.returnHeaderBtnText}>BACK</Text>}
        </TouchableOpacity>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerTitle}>MY HELPERS</Text>
          <Text style={styles.headerSubtitle}>People who can help you</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* W19/W20, D10, D39 – G73/G109/G110: persistent hazard banner while alert is active */}
        {currentAlert && (
          <View style={styles.activeAlertBanner} role="status">
            <Ionicons name="warning" size={26} color="#991b1b" />
            <View style={styles.activeAlertTextWrapper}>
              <Text style={styles.activeAlertTitle}>{currentAlert.type.toUpperCase()} IS STILL ACTIVE</Text>
              <Text style={styles.activeAlertSub}>Tap the return button below to go back to what to do.</Text>
            </View>
          </View>
        )}

        {/* W16/W17, D09, D23, D38 – G74/G103: one prominent large CALL button for primary helper */}
        <TouchableOpacity
          onPress={() => handleCall(primary)}
          style={styles.primaryCallBtn}
          accessibilityLabel={`Call ${primary.name}`}
        >
          <Ionicons name="call" size={36} color="#ffffff" />
          <View style={styles.primaryCallTextWrapper}>
            <Text style={styles.primaryCallTitle}>CALL {primary.name.split(' ')[0].toUpperCase()}</Text>
            <Text style={styles.primaryCallSub}>{primary.relationship}</Text>
          </View>
        </TouchableOpacity>

        {/* W18 – G93: what-to-say script for autism profile */}
        {impairmentType === 'autism' && (
          <View style={styles.scriptPromptCard}>
            <Text style={styles.scriptPromptTag}>WHAT TO SAY WHEN CALL CONNECTS</Text>
            <Text style={styles.scriptPromptText}>
              "There is {currentAlert ? `a ${currentAlert.type.toLowerCase()}` : 'an emergency'}. I need help to get to a safe place."
            </Text>
          </View>
        )}

        {/* Toggle button to see other helpers when in compact view */}
        {compact && !showAll && (
          <TouchableOpacity
            onPress={() => setShowAll(true)}
            style={styles.otherHelpersBtn}
            accessibilityLabel="Show other helpers"
          >
            <Text style={styles.otherHelpersBtnText}>OTHER HELPERS (2)</Text>
          </TouchableOpacity>
        )}

        {/* Emergency broadcast - shown during active danger */}
        {listVisible && currentAlert && currentAlert.level === 'danger' && (
          <TouchableOpacity
            onPress={handleEmergencyBroadcast}
            style={styles.broadcastButton}
            accessibilityLabel="Alert all helpers now"
            accessibilityRole="button"
          >
            <Ionicons name="notifications" size={32} color="#ffffff" />
            <Text style={styles.broadcastText}>ALERT ALL HELPERS</Text>
          </TouchableOpacity>
        )}

        {/* Contact cards - shown when list is visible */}
        {listVisible && mockCaregivers.map(caregiver => (
          <View key={caregiver.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: caregiver.color }]} aria-label={`Avatar for ${caregiver.name}`}>
                {caregiver.initials === '!!' ? (
                  <Ionicons name="notifications" size={32} color="#ffffff" />
                ) : (
                  <Text style={styles.avatarText}>{caregiver.initials}</Text>
                )}
              </View>
              <View style={styles.caregiverInfo}>
                <Text style={[styles.caregiverName, { fontSize: getFontSize('title') }]}>{caregiver.name}</Text>
                <Text style={[styles.caregiverRel, { fontSize: getFontSize('sub') }]}>{caregiver.relationship}</Text>
                <Text style={[styles.caregiverPhone, { fontSize: getFontSize('body') }]}>{caregiver.phone}</Text>
              </View>
            </View>

            {/* Grid layout of actions with 48dp minimum height targets */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleCall(caregiver)}
                style={[styles.actionBtn, styles.callBtn]}
                accessibilityLabel={`Call ${caregiver.name}`}
              >
                <Ionicons name="call" size={24} color="#ffffff" />
                <Text style={styles.actionBtnText}>CALL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleMessage(caregiver)}
                style={[styles.actionBtn, styles.msgBtn]}
                accessibilityLabel={`Send message to ${caregiver.name}`}
              >
                <Ionicons name="chatbubble" size={24} color="#ffffff" />
                <Text style={styles.actionBtnText}>MESSAGE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleShareLocation(caregiver)}
                style={[styles.actionBtn, styles.locBtn]}
                accessibilityLabel={`Share location with ${caregiver.name}`}
              >
                <Ionicons name="pin" size={24} color="#ffffff" />
                <Text style={styles.actionBtnText}>LOCATION</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Read aloud helper details */}
        <TouchableOpacity
          onPress={() => speakMessage('My helpers are Sarah Johnson, Michael Chen, and Emergency Services. Tap a card to call or message them.')}
          style={styles.listenBtn}
          accessibilityLabel="Hear helper names read aloud"
          accessibilityRole="button"
        >
          <Ionicons name="volume-high" size={24} color="#475569" />
          <Text style={styles.listenBtnText}>LISTEN</Text>
        </TouchableOpacity>

        {/* G93 – Social scripts: pre-written phrases for help-seeking */}
        <View style={styles.scriptsCard}>
          <View style={styles.scriptsHeader}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#1e3a8a" />
            <Text style={styles.scriptsTitle}>WHAT TO SAY</Text>
          </View>
          <Text style={styles.scriptsSubtitle}>Tap to say these phrases</Text>
          {[
            {
              id: 's1',
              label: 'Call for help',
              phrase: 'There is a disaster. I am at my home address. I need help. Please send someone.',
            },
            {
              id: 's2',
              label: 'Tell 119 your location',
              phrase: 'My name is [your name]. I am at [your address]. I need emergency help right now.',
            },
            {
              id: 's3',
              label: 'Tell helper you are OK',
              phrase: 'Hello, I am safe. I am at home. I do not need help right now. I will call you if I need help.',
            },
          ].map(script => (
            <TouchableOpacity
              key={script.id}
              onPress={() => {
                speakMessage(script.phrase);
                triggerHaptic('tap');
              }}
              style={styles.scriptBtn}
              accessibilityLabel={`Say: ${script.label}`}
              accessibilityHint={script.phrase}
              accessibilityRole="button"
            >
              <View style={styles.scriptBtnInner}>
                <Text style={styles.scriptBtnLabel}>{script.label}</Text>
                <Text style={styles.scriptBtnPhrase}>&ldquo;{script.phrase}&rdquo;</Text>
              </View>
              <Ionicons name="volume-high" size={22} color="#1e3a8a" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Persistent bottom return / home exit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleReturn}
          style={[styles.footerHomeButton, currentAlert && styles.footerReturnButton]}
          accessibilityLabel={currentAlert ? "Return to emergency alert" : "Go home"}
          accessibilityRole="button"
        >
          <Ionicons name={currentAlert ? "alert-circle" : "home"} size={26} color="#ffffff" />
          <Text style={styles.footerHomeText}>
            {currentAlert ? 'RETURN TO EMERGENCY ALERT' : 'HOME'}
          </Text>
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
  returnHeaderBtn: {
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: 12,
    gap: 6,
  },
  returnHeaderBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
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
  activeAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  activeAlertTextWrapper: {
    flex: 1,
  },
  activeAlertTitle: {
    color: '#991b1b',
    fontSize: 15,
    fontWeight: '900',
  },
  activeAlertSub: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  primaryCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderColor: '#15803d',
    borderWidth: 4,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
    minHeight: 88,
    gap: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  primaryCallTextWrapper: {
    flexDirection: 'column',
  },
  primaryCallTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  primaryCallSub: {
    color: '#dcfce7',
    fontSize: 16,
    fontWeight: '700',
  },
  scriptPromptCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  scriptPromptTag: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scriptPromptText: {
    color: '#14532d',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  otherHelpersBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#94a3b8',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  otherHelpersBtnText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '800',
  },
  broadcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#b91c1c',
    paddingVertical: 20,
    minHeight: 88,
    gap: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  broadcastText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverName: {
    fontWeight: '900',
    color: '#0f172a',
  },
  caregiverRel: {
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
  },
  caregiverPhone: {
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 14,
    minHeight: 88,
    gap: 6,
  },
  callBtn: {
    backgroundColor: '#16a34a',
  },
  msgBtn: {
    backgroundColor: '#2563eb',
  },
  locBtn: {
    backgroundColor: '#8b5cf6',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#cbd5e1',
    paddingVertical: 18,
    minHeight: 72,
    gap: 10,
    marginTop: 8,
  },
  listenBtnText: {
    color: '#475569',
    fontSize: 20,
    fontWeight: '900',
  },
  scriptsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#bfdbfe',
    padding: 16,
    gap: 10,
  },
  scriptsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scriptsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e3a8a',
  },
  scriptsSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: -4,
  },
  scriptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 72,
    gap: 12,
  },
  scriptBtnInner: {
    flex: 1,
    gap: 4,
  },
  scriptBtnLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  scriptBtnPhrase: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 18,
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
  footerReturnButton: {
    backgroundColor: '#dc2626',
  },
  footerHomeText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
});
