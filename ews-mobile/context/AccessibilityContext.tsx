import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// G58: Persist all preferences. G84: stigma-free names (easyMode not "dementiaMode").
export interface AccessibilitySettings {
  textScale: 1 | 1.25 | 1.5;       // G82, G61 — text size
  highContrast: boolean;             // G75 — ≥4.5:1 ratios
  easyReadMode: boolean;             // G49, G67, G121 — plain language + symbols
  easyMode: boolean;                 // G57, G84 — strips UI to hazard + action + call
  sensoryMode: boolean;              // G87, G90 — no animations, no flash
  focusMode: boolean;                // G112 — one-thing-at-a-time
  voiceEnabled: boolean;             // G78, G82, G108 — read-aloud
  soundEnabled: boolean;             // G90, G94
  vibrationEnabled: boolean;         // G90, G118
  language: 'en' | 'si' | 'ta';     // G20, G38, G121
  caregiverMode: boolean;            // G80, G107 — shows caregiver companion view
  showGuidelineIds: boolean;         // dev/research: overlay guideline IDs
}

const DEFAULTS: AccessibilitySettings = {
  textScale: 1,
  highContrast: false,
  easyReadMode: false,
  easyMode: false,
  sensoryMode: false,
  focusMode: false,
  voiceEnabled: false,
  soundEnabled: true,
  vibrationEnabled: true,
  language: 'en',
  caregiverMode: false,
  showGuidelineIds: false,
};

const STORAGE_KEY = '@dews_accessibility_settings';

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  fontSize: (base: number) => number;
  lineHeight: (base: number) => number;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
          setSettings({ ...DEFAULTS, ...parsed });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULTS);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  // G23, G61: 1.5× line height
  const fontSize = (base: number) => Math.round(base * settings.textScale);
  const lineHeight = (base: number) => Math.round(base * settings.textScale * 1.5);

  if (!loaded) return null;

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings, fontSize, lineHeight }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used inside AccessibilityProvider');
  return ctx;
}
