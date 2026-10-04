import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ImpairmentType = 'dementia' | 'autism' | 'mci' | 'adhd' | 'schizophrenia' | null;

export interface AdaptiveSettings {
  maxButtonsPerScreen: number;
  dwellTimeMs: number;
  confirmationRequired: boolean;
  colorPalette: 'calm' | 'high-contrast' | 'muted' | 'vibrant';
  fontSize: 'large' | 'extra-large' | 'huge';
  iconSize: 'large' | 'extra-large';
  spacing: 'comfortable' | 'generous' | 'extra-generous';
  repeatInstructions: boolean;
  showProgressIndicators: boolean;
  enableRoutineMode: boolean;
  memoryAidsEnabled: boolean;
  useSimpleLanguage: boolean;
  breakIntoSteps: boolean;
  realityAnchors: boolean;
  sensoryFriendly: boolean;
  focusMode: boolean;
}

interface UserPreferencesContextType {
  impairmentType: ImpairmentType;
  setImpairmentType: (type: ImpairmentType) => void;
  adaptiveSettings: AdaptiveSettings;
  hasSelectedImpairment: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);
const IMPAIRMENT_KEY = 'dews_impairment_type';

function getAdaptiveSettings(impairmentType: ImpairmentType): AdaptiveSettings {
  const base: AdaptiveSettings = {
    maxButtonsPerScreen: 3, dwellTimeMs: 1000, confirmationRequired: true,
    colorPalette: 'calm', fontSize: 'large', iconSize: 'large', spacing: 'comfortable',
    repeatInstructions: true, showProgressIndicators: true, enableRoutineMode: false,
    memoryAidsEnabled: false, useSimpleLanguage: true, breakIntoSteps: true,
    realityAnchors: false, sensoryFriendly: false, focusMode: false,
  };
  switch (impairmentType) {
    case 'dementia':
      return { ...base, maxButtonsPerScreen: 2, dwellTimeMs: 1500, fontSize: 'extra-large', spacing: 'extra-generous', memoryAidsEnabled: true };
    case 'autism':
      return { ...base, enableRoutineMode: true, sensoryFriendly: true, colorPalette: 'muted', spacing: 'generous' };
    case 'mci':
      return { ...base, memoryAidsEnabled: true, confirmationRequired: true };
    case 'adhd':
      return { ...base, maxButtonsPerScreen: 2, focusMode: true, colorPalette: 'vibrant', dwellTimeMs: 800 };
    case 'schizophrenia':
      return { ...base, maxButtonsPerScreen: 2, realityAnchors: true, fontSize: 'extra-large', spacing: 'extra-generous', sensoryFriendly: true };
    default:
      return base;
  }
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [impairmentType, setImpairmentTypeState] = useState<ImpairmentType>(null);

  useEffect(() => {
    AsyncStorage.getItem(IMPAIRMENT_KEY).then(val => {
      if (val && val !== 'null') setImpairmentTypeState(val as ImpairmentType);
    }).catch(() => {});
  }, []);

  const setImpairmentType = async (type: ImpairmentType) => {
    await AsyncStorage.setItem(IMPAIRMENT_KEY, type ?? 'null');
    setImpairmentTypeState(type);
  };

  return (
    <UserPreferencesContext.Provider value={{
      impairmentType,
      setImpairmentType,
      adaptiveSettings: getAdaptiveSettings(impairmentType),
      hasSelectedImpairment: impairmentType !== null,
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  return context;
}
