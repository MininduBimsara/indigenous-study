/**
 * Alert colour mapping per impairment type and alert level.
 * G111: Calm muted tones for non-urgent; bright red only for danger.
 */
import type { ImpairmentType } from '../contexts/UserPreferencesContext';

interface AlertColors {
  bg: string;
  text: string;
  buttonBg: string;
  buttonText: string;
}

export function getAlertColors(impairmentType: ImpairmentType, level: 'safe' | 'warning' | 'danger'): AlertColors {
  // G111: calm green for safe, amber for warning, red ONLY for danger
  if (level === 'safe') {
    return { bg: '#d1fae5', text: '#065f46', buttonBg: '#059669', buttonText: '#ffffff' };
  }
  if (level === 'warning') {
    // Autism/schizophrenia: even more muted amber
    if (impairmentType === 'autism' || impairmentType === 'schizophrenia') {
      return { bg: '#fef3c7', text: '#78350f', buttonBg: '#d97706', buttonText: '#ffffff' };
    }
    return { bg: '#fef3c7', text: '#92400e', buttonBg: '#f59e0b', buttonText: '#ffffff' };
  }
  // danger: red
  return { bg: '#dc2626', text: '#ffffff', buttonBg: '#ffffff', buttonText: '#dc2626' };
}
