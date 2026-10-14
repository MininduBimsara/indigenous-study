/**
 * Explanation profile (model/profile.ts), saved in AsyncStorage.
 *
 * Sits beside UserPreferencesContext (the condition picker); both stay until
 * the supervisor decides (16 Oct meeting). Not wired into the app yet.
 * The profile changes how a forecast is explained, never the forecast.
 */
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_PROFILE,
  PRESETS,
  hasRequiredConsent,
  type ExplanationProfile,
  type PresetId,
} from '../model/profile';

/** Fields a user can change one by one; presetId and schemaVersion are managed here. */
type EditableField = Exclude<keyof ExplanationProfile, 'presetId' | 'schemaVersion'>;

interface ExplanationProfileContextType {
  profile: ExplanationProfile;
  setProfile: (p: ExplanationProfile) => void;
  choosePreset: (id: Exclude<PresetId, 'custom'>) => void;
  updateField: <K extends EditableField>(key: K, value: ExplanationProfile[K]) => void;
  resetProfile: () => void;
  isLoaded: boolean;
}

const ExplanationProfileContext = createContext<ExplanationProfileContextType | undefined>(undefined);
const PROFILE_KEY = 'dews_explanation_profile';

/** A saved profile, or null if it is missing, unparsable, an old schema, or lacks carer consent. */
function parseSaved(json: string | null): ExplanationProfile | null {
  if (!json) return null;
  try {
    const saved = JSON.parse(json);
    if (typeof saved !== 'object' || saved === null || saved.schemaVersion !== 1) return null;
    const p: ExplanationProfile = { ...DEFAULT_PROFILE, ...saved };
    return hasRequiredConsent(p) ? p : null;
  } catch {
    return null;
  }
}

export function ExplanationProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ExplanationProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);
  // Latest profile, so quick successive updateField calls build on each other.
  const current = useRef<ExplanationProfile>(DEFAULT_PROFILE);
  // Set once the user changes anything, so a slow load cannot overwrite it.
  const changed = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then(json => {
        const saved = parseSaved(json);
        if (saved && !changed.current) {
          current.current = saved;
          setProfileState(saved);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const setProfile = (p: ExplanationProfile) => {
    if (!hasRequiredConsent(p)) {
      console.warn('ExplanationProfile: refused a profile set by a helper without carer consent (G107).');
      return;
    }
    changed.current = true;
    current.current = p;
    setProfileState(p);
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p)).catch(() => {});
  };

  const choosePreset = (id: Exclude<PresetId, 'custom'>) => setProfile({ ...PRESETS[id] });

  const updateField = <K extends EditableField>(key: K, value: ExplanationProfile[K]) =>
    setProfile({ ...current.current, [key]: value, presetId: 'custom' });

  const resetProfile = () => {
    changed.current = true;
    current.current = DEFAULT_PROFILE;
    setProfileState(DEFAULT_PROFILE);
    AsyncStorage.removeItem(PROFILE_KEY).catch(() => {});
  };

  return (
    <ExplanationProfileContext.Provider value={{
      profile,
      setProfile,
      choosePreset,
      updateField,
      resetProfile,
      isLoaded,
    }}>
      {children}
    </ExplanationProfileContext.Provider>
  );
}

export function useExplanationProfile() {
  const context = useContext(ExplanationProfileContext);
  if (!context) throw new Error('useExplanationProfile must be used within ExplanationProfileProvider');
  return context;
}
