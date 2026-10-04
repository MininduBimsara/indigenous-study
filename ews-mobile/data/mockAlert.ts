import type { CAPSeverity } from '../utils/capSeverity';

export interface EvacuationStep {
  id: number;
  text: string;
  easyText: string;
  timeEstimate: string;
  pictogram: string;
  accessibilityLabel: string;
}

export interface MockAlert {
  id: string;
  hazard: string;
  hazardCode: 'tornado' | 'flood' | 'tsunami' | 'earthquake' | 'fire';
  hazardSymbol: string;
  title: string;
  titleEasyRead: string;
  location: string;
  severity: CAPSeverity;
  urgency: string;
  certainty: string;
  instruction: string;
  instructionEasyRead: string;
  consequence: string;
  issuedAt: string;
  expiresAt: string;
  steps: EvacuationStep[];
  sinhala: { title: string; instruction: string };
  tamil: { title: string; instruction: string };
}

export const MOCK_ALERT: MockAlert = {
  id: 'A-2024-001',
  hazard: 'Tornado',
  hazardCode: 'tornado',
  hazardSymbol: '🌪️',
  title: 'Tornado Warning — Nuwara Eliya',
  titleEasyRead: 'A tornado is coming',
  location: 'Nuwara Eliya District, Sri Lanka',
  severity: 'Extreme',
  urgency: 'Immediate',
  certainty: 'Observed',
  instruction: 'Take shelter now. Go to the lowest floor of a solid building. Stay away from windows.',
  instructionEasyRead: 'Go inside now. Go downstairs. Stay away from windows. Wait inside.',
  consequence: 'If you do not take shelter, you may be seriously hurt. Rescue may not reach you for 24 hours.',
  issuedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  sinhala: {
    title: 'කුණාටු අනතුරු ඇඟවීම — නුවර එළිය',
    instruction: 'දැන් ආරක්ෂිත ස්ථානයක් සොයා ගන්න. ජනේලෙන් ඈත් වන්න.',
  },
  tamil: {
    title: 'சூறாவளி எச்சரிக்கை — நுவரெலியா',
    instruction: 'இப்போது தங்குமிடம் தேடுங்கள். ஜன்னல்களில் இருந்து விலகுங்கள்.',
  },
  steps: [
    {
      id: 1,
      text: 'Grab your emergency go-bag',
      easyText: 'Pick up your emergency bag',
      timeEstimate: '2 min',
      pictogram: '🎒',
      accessibilityLabel: 'Step 1 of 4: Grab your emergency go-bag. Takes about 2 minutes.',
    },
    {
      id: 2,
      text: 'Move to the lowest floor with no windows',
      easyText: 'Go downstairs. Stay away from windows.',
      timeEstimate: '1 min',
      pictogram: '⬇️',
      accessibilityLabel: 'Step 2 of 4: Move to the lowest floor with no windows. Takes about 1 minute.',
    },
    {
      id: 3,
      text: 'Stay away from windows and exterior walls',
      easyText: 'Move to the centre of the room. Do not stand near windows.',
      timeEstimate: '30 sec',
      pictogram: '🧱',
      accessibilityLabel: 'Step 3 of 4: Stay away from windows and exterior walls. Takes about 30 seconds.',
    },
    {
      id: 4,
      text: 'Wait inside until the all-clear is announced',
      easyText: 'Wait inside. Do not go out until DEWS says it is safe.',
      timeEstimate: 'Until all-clear',
      pictogram: '✅',
      accessibilityLabel: 'Step 4 of 4: Wait inside until the all-clear is announced.',
    },
  ],
};

export const SAFE_STATE = {
  title: 'All Clear',
  hazard: 'No Active Alerts',
  hazardSymbol: '✅',
  location: 'Nuwara Eliya District',
  severity: 'Minor' as CAPSeverity,
  instruction: 'No active hazards in your area. Stay prepared.',
};
