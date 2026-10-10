/**
 * Hanwella scenario (Research Approach v3.1), typed. SYNTHETIC.
 *
 * Fixed by the scenario: gauge, river, classes, probabilities (0.10 -> 0.29),
 * Minor Flood Level threshold 7.5 m (thresholds 6.5 / 7.5 / 9.5), window on
 * Thursday, "Possible", the go-bag action, landmark "the old ferry steps".
 *
 * NOT fixed (illustrative, to be replaced by Supun's forecasts.json): calendar
 * dates, area name, CAP severity/urgency, observation values, levels,
 * landmark height, whatWouldChangeIt. Do not cite
 * these numbers anywhere.
 */
import type { Forecast } from '../forecast';
import type { AdaptedExplanation } from '../explanation';

const place = {
  gaugeId: 'hanwella',
  gaugeName: 'Hanwella',
  river: 'Kelani Ganga',
  areaName: 'Hanwella', // illustrative
} as const;

const thresholds = {
  alertM: 6.5,
  minorFloodM: 7.5,
  majorFloodM: 9.5,
  basis: 'Modelled on Irrigation Department bulletin, 8 Aug 2026 (synthetic)',
} as const;

const landmark = { name: 'the old ferry steps', levelM: 7.5, placeholder: true } as const;

const thursday = { start: '2026-10-15T00:00:00+05:30', end: '2026-10-15T23:59:59+05:30' };

const possibleAction = {
  steps: ['Get your go-bag ready today.'],
  source: 'Research Approach v3.1 worked example', // source for other levels still to find
  placeholder: false,
} as const;

export const yesterday: Forecast = {
  id: 'hanwella-2026-10-12',
  synthetic: true,
  hazard: 'flood',
  place,
  window: thursday,
  likelihood: { probability: 0.1, threshold: 'minorFlood', capCertainty: 'Possible' },
  action: possibleAction,
  severityClass: 'NO_FLOODING',
  cap: { severity: 'Minor', urgency: 'Future' },
  issuedAt: '2026-10-12T06:00:00+05:30',
  nextUpdateAt: '2026-10-13T06:00:00+05:30',
  peakLevel: { lowM: 5.6, medianM: 6.2, highM: 7.6 },
  dailyLevels: [],
  thresholds,
  landmark,
  supportingObservations: [],
  whatWouldChangeIt: [],
};

export const today: Forecast = {
  id: 'hanwella-2026-10-13',
  synthetic: true,
  hazard: 'flood',
  place,
  window: thursday,
  likelihood: { probability: 0.29, threshold: 'minorFlood', capCertainty: 'Possible' },
  action: possibleAction,
  severityClass: 'ABOVE_NORMAL',
  cap: { severity: 'Moderate', urgency: 'Expected' },
  issuedAt: '2026-10-13T06:00:00+05:30',
  nextUpdateAt: '2026-10-14T06:00:00+05:30',
  peakLevel: { lowM: 6.4, medianM: 7.0, highM: 8.1 },
  dailyLevels: [],
  thresholds,
  landmark,
  supportingObservations: [
    { id: 'rain72h', value: 120, unit: 'mm', observedAt: '2026-10-13T05:00:00+05:30' },
    { id: 'upstreamLevel', value: 3.1, unit: 'm', observedAt: '2026-10-13T05:00:00+05:30' },
  ],
  whatWouldChangeIt: ['More heavy rain upstream before Wednesday night.'],
};

/** "How sure, and what changed?" for today: the worked trace, steps 5-6. */
export const howSureToday: AdaptedExplanation = {
  forecastId: today.id,
  presetId: 'howSure',
  layer: 2,
  hazard: { text: 'Flooding', value: 'flood' },
  place: { text: 'here', value: { gaugeId: 'hanwella' } },
  timeWindow: { text: 'on Thursday', value: thursday },
  likelihood: {
    text: 'Possible. 3 in 10 chance.',
    value: { certainty: 'Possible', probability: 0.29, form: 'wordPictureNumber' },
  },
  action: { text: 'Get your go-bag ready today.', value: { steps: possibleAction.steps } },
  extras: {
    nextUpdate: { text: 'Next update: tomorrow at 6 am.', value: today.nextUpdateAt },
  },
};
