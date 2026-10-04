/**
 * G119 – CAP-compliant message structure
 */
export type CAPSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';

export interface CAPMetadata {
  severity: CAPSeverity;
  urgency: string;
  certainty: string;
  instruction: string;
}

export function getCAPMetadata(level: 'safe' | 'warning' | 'danger'): CAPMetadata {
  switch (level) {
    case 'danger':
      return { severity: 'Extreme', urgency: 'Immediate', certainty: 'Observed', instruction: 'Take protective action immediately.' };
    case 'warning':
      return { severity: 'Severe', urgency: 'Expected', certainty: 'Likely', instruction: 'Be prepared to take action.' };
    default:
      return { severity: 'Minor', urgency: 'Future', certainty: 'Possible', instruction: 'Monitor the situation.' };
  }
}

export const CAP_SEVERITY_COLORS: Record<CAPSeverity, { bg: string; text: string }> = {
  Extreme: { bg: '#7f1d1d', text: '#fef2f2' },
  Severe:  { bg: '#92400e', text: '#fffbeb' },
  Moderate:{ bg: '#1e3a5f', text: '#eff6ff' },
  Minor:   { bg: '#14532d', text: '#f0fdf4' },
  Unknown: { bg: '#374151', text: '#f9fafb' },
};
