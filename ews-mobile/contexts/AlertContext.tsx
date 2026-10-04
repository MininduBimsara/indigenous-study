import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlertLevel = 'safe' | 'warning' | 'danger';
export type FeedbackModality = 'both' | 'visual' | 'audio';
export type CheckInStatus = 'safe' | 'moving' | 'help' | null;

// G28, G45: how an alert ended, so Home can display past alert history & confirm all-clear / false alarm
export type AlertEndReason = 'arrived' | 'acknowledged' | 'all-clear' | 'cancelled';

export interface AlertData {
  level: AlertLevel;
  type: string;
  message: string;
  instructions: string;
  icon: string;
  timestamp: Date;
}

export interface EndedAlert {
  alert: AlertData;
  reason: AlertEndReason;
  endedAt: Date;
}

interface AlertSettings {
  volume: number;
  vibrationStrength: number;
  highContrast: boolean;
  iconOnlyMode: boolean;
  voiceLanguage: string;
  feedbackModality: FeedbackModality;
  criticalAlertsOnly: boolean;
}

interface AlertContextType {
  currentAlert: AlertData | null;
  lastAlert: EndedAlert | null;
  isOnline: boolean;
  batteryLevel: number;
  isOnboarded: boolean;
  checkInStatus: CheckInStatus;
  setAlert: (alert: AlertData | null) => void;
  acknowledgeAlert: () => void;
  endAlert: (reason: AlertEndReason) => void;
  speakMessage: (message: string) => void;
  completeOnboarding: () => void;
  updateCheckInStatus: (status: CheckInStatus) => void;
  settings: AlertSettings;
  updateSettings: (newSettings: Partial<AlertSettings>) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const ONBOARDED_KEY = 'dews_onboarded';
const SETTINGS_KEY = 'dews_settings';

const defaultSettings: AlertSettings = {
  volume: 1.0,
  vibrationStrength: 100,
  highContrast: true,
  iconOnlyMode: false,
  voiceLanguage: 'en-US',
  feedbackModality: 'both',
  criticalAlertsOnly: true,
};

const LAST_ALERT_KEY = 'dews_last_alert';

export function AlertProvider({ children }: { children: ReactNode }) {
  const [currentAlert, setCurrentAlert] = useState<AlertData | null>(null);
  const [lastAlert, setLastAlert] = useState<EndedAlert | null>(null);
  const currentAlertRef = React.useRef<AlertData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>(null);
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings);

  // Load persisted data
  useEffect(() => {
    const load = async () => {
      try {
        const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
        if (onboarded === 'true') setIsOnboarded(true);

        const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });

        const savedLastAlert = await AsyncStorage.getItem(LAST_ALERT_KEY);
        if (savedLastAlert) {
          const parsed = JSON.parse(savedLastAlert);
          setLastAlert({
            ...parsed,
            endedAt: new Date(parsed.endedAt),
            alert: { ...parsed.alert, timestamp: new Date(parsed.alert.timestamp) },
          });
        }
      } catch {}
    };
    load();
  }, []);

  // Network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // Battery level
  useEffect(() => {
    Battery.getBatteryLevelAsync().then(level => {
      setBatteryLevel(Math.round(level * 100));
    }).catch(() => {});

    const sub = Battery.addBatteryLevelListener(({ batteryLevel: level }) => {
      setBatteryLevel(Math.round(level * 100));
    });
    return () => sub.remove();
  }, []);

  const speakMessage = useCallback((message: string) => {
    if (settings.feedbackModality === 'visual') return;
    Speech.stop();
    Speech.speak(message, {
      language: settings.voiceLanguage,
      rate: 0.85,
      pitch: 1.0,
      volume: settings.volume,
    });
  }, [settings.feedbackModality, settings.voiceLanguage, settings.volume]);

  const endAlert = useCallback((reason: AlertEndReason) => {
    const ended = currentAlertRef.current;
    if (ended) {
      const endedData: EndedAlert = { alert: ended, reason, endedAt: new Date() };
      setLastAlert(endedData);
      AsyncStorage.setItem(LAST_ALERT_KEY, JSON.stringify(endedData)).catch(() => {});
    }
    currentAlertRef.current = null;
    setCurrentAlert(null);
  }, []);

  const setAlert = useCallback((alert: AlertData | null) => {
    if (!alert) {
      endAlert('all-clear');
      return;
    }
    currentAlertRef.current = alert;
    setCurrentAlert(alert);
    speakMessage(alert.message + '. ' + alert.instructions);
    if (settings.vibrationStrength > 0) {
      const pattern = alert.level === 'danger'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium;
      Haptics.impactAsync(pattern);
      if (alert.level === 'danger') {
        setTimeout(() => Haptics.impactAsync(pattern), 300);
        setTimeout(() => Haptics.impactAsync(pattern), 600);
      }
    }
  }, [speakMessage, settings.vibrationStrength, endAlert]);

  const acknowledgeAlert = useCallback(() => endAlert('acknowledged'), [endAlert]);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    setIsOnboarded(true);
  }, []);

  const updateCheckInStatus = useCallback((status: CheckInStatus) => {
    setCheckInStatus(status);
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AlertSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  return (
    <AlertContext.Provider value={{
      currentAlert, lastAlert, isOnline, batteryLevel, isOnboarded, checkInStatus,
      setAlert, acknowledgeAlert, endAlert, speakMessage, completeOnboarding,
      updateCheckInStatus, settings, updateSettings,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within AlertProvider');
  return context;
}
