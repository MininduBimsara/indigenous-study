import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../contexts/AlertContext';
import { triggerHaptic } from '../utils/haptic';

interface OfflineAction {
  id: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  detail: string;
  action: () => void;
}

export default function OfflineModeScreen() {
  const { speakMessage, isOnline } = useAlert();

  const OFFLINE_ACTIONS: OfflineAction[] = [
    {
      id: 'call911',
      iconName: 'call',
      iconColor: '#dc2626',
      title: 'CALL 911',
      detail: 'Works without internet',
      action: () => {
        triggerHaptic('alert');
        Alert.alert('Calling 911', 'Connecting emergency voice call...');
      },
    },
    {
      id: 'sms',
      iconName: 'chatbubble',
      iconColor: '#2563eb',
      title: 'SEND TEXT',
      detail: 'SMS works offline',
      action: () => {
        triggerHaptic('tap');
        Alert.alert('Send SMS', 'Opening text message client to caregiver...');
      },
    },
    {
      id: 'bluetooth',
      iconName: 'radio',
      iconColor: '#9333ea',
      title: 'NEARBY ALERTS',
      detail: 'Bluetooth works nearby',
      action: () => {
        triggerHaptic('tap');
        Alert.alert('Scanning Nearby', 'Searching for peers via Bluetooth...');
      },
    },
    {
      id: 'map',
      iconName: 'pin',
      iconColor: '#16a34a',
      title: 'SAVED MAP',
      detail: 'Works without internet',
      action: () => {
        triggerHaptic('tap');
        Alert.alert('Offline Map', 'Loading cached disaster map center location details...');
      },
    },
  ];

  if (isOnline) {
    return (
      <SafeAreaView style={styles.onlineContainer} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.onlineCircle}>
          <Ionicons name="wifi" size={48} color="#16a34a" />
        </View>
        <Text style={styles.onlineTitle}>YOU ARE ONLINE</Text>
        <Text style={styles.onlineSub}>Your internet connection is active and working.</Text>
        <TouchableOpacity
          onPress={() => { triggerHaptic('tap'); router.replace('/'); }}
          style={styles.onlineHomeBtn}
          accessibilityLabel="Go home"
          accessibilityRole="button"
        >
          <Ionicons name="home" size={24} color="#ffffff" />
          <Text style={styles.onlineHomeText}>HOME</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Alert header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="wifi-outline" size={36} color="#ffffff" style={styles.headerWifiIcon} />
          <Text style={styles.headerTitle}>NO INTERNET</Text>
        </View>
        <Text style={styles.headerSubtitle}>You can still get help</Text>
      </View>

      {/* Read aloud instructions */}
      <View style={styles.listenContainer}>
        <TouchableOpacity
          onPress={() => speakMessage('No internet. You can still call 911. You can send a text. Bluetooth works nearby. You have a saved map.')}
          style={styles.listenBtn}
          accessibilityLabel="Hear choices read aloud"
          accessibilityRole="button"
        >
          <Ionicons name="volume-high" size={24} color="#475569" />
          <Text style={styles.listenBtnText}>LISTEN</Text>
        </TouchableOpacity>
      </View>

      {/* Offline choices */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {OFFLINE_ACTIONS.map(action => (
          <TouchableOpacity
            key={action.id}
            onPress={action.action}
            style={styles.actionCard}
            accessibilityLabel={`${action.title}: ${action.detail}`}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name={action.iconName} size={32} color={action.iconColor} />
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardTitle}>{action.title}</Text>
              <Text style={styles.cardDetail}>{action.detail}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Persistent bottom home exit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => { triggerHaptic('tap'); router.push('/'); }}
          style={styles.homeBtn}
          accessibilityLabel="Go home"
          accessibilityRole="button"
        >
          <Ionicons name="home" size={22} color="#475569" />
          <Text style={styles.homeBtnText}>HOME</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ea580c',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerWifiIcon: {
    opacity: 0.9,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#ffedd5',
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
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingVertical: 12,
    minHeight: 48,
    gap: 8,
  },
  listenBtnText: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 16,
    alignItems: 'center',
    minHeight: 96,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  cardDetail: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  footer: {
    padding: 20,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingVertical: 14,
    minHeight: 56,
    gap: 8,
  },
  homeBtnText: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '800',
  },
  onlineContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  onlineCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  onlineTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  onlineSub: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  onlineHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingVertical: 18,
    width: '100%',
    minHeight: 72,
    gap: 10,
    marginTop: 40,
  },
  onlineHomeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
});
