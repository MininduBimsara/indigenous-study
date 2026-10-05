/**
 * G119 – CAP-compliant message structure
 */
import { capSeverity } from '../theme/colors';

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

export const CAP_SEVERITY_COLORS: Record<CAPSeverity, { bg: string; text: string }> = capSeverity;
