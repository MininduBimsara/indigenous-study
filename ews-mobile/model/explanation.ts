/**
 * Adapted explanation and the fidelity-invariants contract (Task 5).
 *
 * explain.ts (Supun) and the Layer 4 AI wording both produce an
 * AdaptedExplanation. checkInvariants() (Minindu, model/invariants.ts, 13 Oct)
 * checks it against the Forecast before any screen shows it. If the check
 * fails, the screen falls back to the Layer 1 baseline.
 *
 * Each invariant slot carries two things:
 *   - text:  what the user sees or hears (wording is free to change by profile)
 *   - value: the fact the text states, copied from the forecast
 * "missing" = slot absent or text empty. "wrong" = value differs from the
 * forecast, or (for Layer 4) the text contradicts the value.
 */
import type {
  Action,
  CapCertainty,
  Forecast,
  ForecastChange,
  Hazard,
  ObservationId,
  TimeWindow,
} from './forecast';
import type { LikelihoodForm, PresetId } from './profile';

export const INVARIANTS = ['hazard', 'place', 'timeWindow', 'likelihood', 'action'] as const;
export type InvariantName = (typeof INVARIANTS)[number];

/**
 * Four layers (Competitive Analysis 03 architecture).
 * 1 baseline, 2 profile rules, 3 alert mode (G124), 4 optional AI wording.
 */
export type Layer = 1 | 2 | 3 | 4;

export interface Slot<V> {
  readonly text: string;
  readonly value: V;
}

export interface LikelihoodValue {
  readonly certainty: CapCertainty;  // the word shown in every form
  readonly probability: number;      // shown as houses or % only if the form allows
  readonly form: LikelihoodForm;     // which form this slot renders
}

/** Optional parts, shown by profile. None of these is an invariant. */
export interface Extras {
  readonly reasons?: readonly Slot<ObservationId>[];   // "Why?" (G25); observations, not causes
  readonly change?: Slot<ForecastChange>;              // "What changed?" (G89)
  readonly nextUpdate?: Slot<string>;                  // ISO time (G42)
  readonly landmark?: Slot<{ readonly name: string; readonly levelM: number }>; // G38
  readonly consequence?: Slot<string>;                 // G25 consequence line
}

export interface AdaptedExplanation {
  readonly forecastId: string;   // the forecast this explains; must equal Forecast.id
  readonly presetId: PresetId;
  readonly layer: Layer;

  // ---- one slot per fidelity invariant; all required ----
  readonly hazard: Slot<Hazard>;
  readonly place: Slot<{ readonly gaugeId: string }>;
  readonly timeWindow: Slot<TimeWindow>;
  readonly likelihood: Slot<LikelihoodValue>;
  readonly action: Slot<Pick<Action, 'steps'>>;

  readonly extras?: Extras;
}

export interface InvariantMismatch {
  readonly invariant: InvariantName | 'forecastId';
  readonly expected: string;
  readonly found: string;
}

export type InvariantResult =
  | { readonly pass: true }
  | {
      readonly pass: false;
      readonly missing: readonly InvariantName[];
      readonly wrong: readonly InvariantMismatch[];
    };

/**
 * Signature only. Implemented in model/invariants.ts (to-do step 4).
 * Pure: reads both arguments, changes neither.
 */
export type CheckInvariants = (e: AdaptedExplanation, f: Forecast) => InvariantResult;
