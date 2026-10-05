/**
 * Alert colour mapping per impairment type and alert level.
 * G111: Calm muted tones for non-urgent; bright red only for danger.
 * Colour values live in theme/colors.ts.
 */
import type { ImpairmentType } from '../contexts/UserPreferencesContext';
import { alertLevel, type AlertLevelColors } from '../theme/colors';

export function getAlertColors(impairmentType: ImpairmentType, level: 'safe' | 'warning' | 'danger'): AlertLevelColors {
  if (level === 'safe') return alertLevel.safe;
  if (level === 'warning') {
    // Autism/schizophrenia: even more muted amber
    if (impairmentType === 'autism' || impairmentType === 'schizophrenia') return alertLevel.warningMuted;
    return alertLevel.warning;
  }
  return alertLevel.danger;
}
