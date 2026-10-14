/**
 * Fidelity invariants check (Framework v2, Task 5).
 *
 * The prediction never changes, only its explanation. checkInvariants() makes
 * sure an AdaptedExplanation still states the five invariants of its Forecast
 * (hazard, place, time window, likelihood, action) before a screen shows it.
 * If it fails, the screen falls back to the Layer 1 baseline.
 *
 * Guidelines: G73 (place and time window), G119 (CAP certainty word),
 * G16 and G17 (banned phrases in Layer 4 AI wording).
 *
 * Pure: reads both arguments, changes neither, no side effects.
 */
import type { CheckInvariants, InvariantMismatch, InvariantName } from './explanation';

/** Phrases Layer 4 AI wording may never use. Matched case-insensitively. */
export const BANNED_PHRASES: readonly string[] = [
  // G16: no double negatives
  'not unlikely',
  'not impossible',
  'not improbable',
  "can't be ruled out",
  'cannot be ruled out',
  // G17: no idioms or metaphors
  'keep an eye on',
  'perfect storm',
  'in the eye of the storm',
  'batten down the hatches',
];

const sameList = (a: readonly string[] = [], b: readonly string[]) =>
  a.length === b.length && a.every((s, i) => s === b[i]);

/** Lower case, with curly apostrophes made straight so "can’t" matches "can't". */
const normalise = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'");

export const checkInvariants: CheckInvariants = (e, f) => {
  const missing: InvariantName[] = [];
  const wrong: InvariantMismatch[] = [];

  if (e.forecastId !== f.id) {
    wrong.push({ invariant: 'forecastId', expected: f.id, found: String(e.forecastId) });
  }

  const fmtWindow = (w?: { start: string; end: string }) => (w ? `${w.start} to ${w.end}` : 'none');
  const chance = (c?: string, p?: number) => `${c ?? 'none'} (${p ?? 'none'})`;
  const like = e.likelihood?.value;

  // [ok, expected, found] per invariant
  const checks: Record<InvariantName, [boolean, string, string]> = {
    hazard: [e.hazard?.value === f.hazard, f.hazard, String(e.hazard?.value)],
    place: [
      e.place?.value?.gaugeId === f.place.gaugeId,
      f.place.gaugeId,
      String(e.place?.value?.gaugeId),
    ],
    timeWindow: [
      e.timeWindow?.value?.start === f.window.start && e.timeWindow?.value?.end === f.window.end,
      fmtWindow(f.window),
      fmtWindow(e.timeWindow?.value),
    ],
    likelihood: [
      like?.certainty === f.likelihood.capCertainty && like?.probability === f.likelihood.probability,
      chance(f.likelihood.capCertainty, f.likelihood.probability),
      chance(like?.certainty, like?.probability),
    ],
    action: [
      sameList(e.action?.value?.steps, f.action.steps),
      f.action.steps.join(' | '),
      (e.action?.value?.steps ?? []).join(' | ') || 'none',
    ],
  };

  for (const name of Object.keys(checks) as InvariantName[]) {
    const slot = e[name];
    if (!slot || !slot.text?.trim()) {
      missing.push(name);
      if (!slot) continue;
    }
    const [ok, expected, found] = checks[name];
    if (!ok) wrong.push({ invariant: name, expected, found });
  }

  // Layer 4 (AI wording): the text itself must also be checked.
  if (e.layer === 4) {
    // G119: the CAP word must appear as a whole word ("likely" must not match "unlikely").
    const cap = f.likelihood.capCertainty;
    const text = e.likelihood?.text ?? '';
    if (text.trim() && !new RegExp(`\\b${cap}\\b`, 'i').test(text)) {
      wrong.push({ invariant: 'likelihood', expected: `text with "${cap}"`, found: text });
    }

    // G16, G17: no banned phrase in any invariant slot.
    for (const name of Object.keys(checks) as InvariantName[]) {
      const slotText = normalise(e[name]?.text ?? '');
      for (const phrase of BANNED_PHRASES) {
        if (slotText.includes(phrase)) {
          wrong.push({ invariant: name, expected: 'no banned phrase', found: phrase });
        }
      }
    }
  }

  return missing.length === 0 && wrong.length === 0 ? { pass: true } : { pass: false, missing, wrong };
};
