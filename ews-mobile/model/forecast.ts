/**
 * Forecast model (Task 7, Research Approach v3.1 Tasks 2 and 5).
 *
 * One Forecast is one model output for one gauge at one issue time. It is the
 * single source of truth for every explanation: profiles change how a forecast
 * is explained, never the forecast itself. Every field is readonly so adaptation
 * code cannot change it.
 *
 * Shape agreed with Supun (Updates for Supun, section 2):
 *   - file: ews-mobile/data/synthetic/forecasts.json, a list of Forecast objects
 *   - "synthetic": true once per object (no per-value wrapper)
 *   - two complete forecasts for the same gauge (yesterday, today); the app
 *     compares them itself (capability: stored previous forecasts + comparison)
 *   - hazard and action are in the data, because both are fidelity invariants
 *
 * All values in the prototype are synthetic. Thresholds are modelled on the
 * Irrigation Department bulletin of 8 Aug 2026; treating the Minor Flood Level
 * as Flood Hub's SEVERE threshold is our own inference.
 */

/** Invariant: hazard. G11, G119, G120. One hazard in this paper. */
export type Hazard = 'flood';

/** Flood Hub API gauge severity classes (Google Flood Forecasting API). */
export type SeverityClass =
  | 'NO_FLOODING'
  | 'ABOVE_NORMAL'
  | 'SEVERE'
  | 'EXTREME'
  | 'UNKNOWN';

/** OASIS CAP 1.2 §3.2.2 certainty values. G119. */
export type CapCertainty = 'Observed' | 'Likely' | 'Possible' | 'Unlikely' | 'Unknown';

/** OASIS CAP 1.2 severity values. G119. */
export type CapSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';

/** OASIS CAP 1.2 urgency values. G119. */
export type CapUrgency = 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';

/** Local warning levels from the Irrigation Department bulletin (confirmed names). */
export type ThresholdName = 'alert' | 'minorFlood' | 'majorFlood';

/** ISO 8601 date-time with offset, e.g. "2026-10-15T00:00:00+05:30". */
export type IsoDateTime = string;

/** Invariant: place. G73. */
export interface Place {
  readonly gaugeId: string;      // e.g. "hanwella"
  readonly gaugeName: string;    // "Hanwella"
  readonly river: string;        // "Kelani Ganga"
  readonly areaName: string;     // area the forecast applies to, shown in ForecastHeader
}

/**
 * Invariant: time window. G73, G42, G47, G114.
 * Stored as absolute times only. Day names ("Thursday morning") and relative
 * wording ("in 2 days") are computed by the app from the profile's timeWording,
 * so the user never calculates (G47).
 */
export interface TimeWindow {
  readonly start: IsoDateTime;
  readonly end: IsoDateTime;
}

/**
 * Invariant: likelihood (uncertainty kept, never deleted). G26, G119, G81.
 * probability is the model's chance of the gauge reaching `threshold`
 * inside the time window.
 */
export interface Likelihood {
  readonly probability: number;       // 0..1, e.g. 0.29 (shown as 29% only on request)
  readonly threshold: ThresholdName;  // the scenario uses 'minorFlood'
  readonly capCertainty: CapCertainty; // must equal capCertaintyFor(probability) for forecasts
}

/**
 * Invariant: action. G11, G50, G22.
 * Capability: action steps per likelihood level, from a cited source.
 * Only the "Possible" wording is settled; others stay placeholder until a
 * source is found (Supun, section 6 item 4).
 */
export interface Action {
  readonly steps: readonly string[];  // one step per line, e.g. ["Get your go-bag ready today."]
  readonly source: string;            // citation, or "placeholder"
  readonly placeholder: boolean;
}

/** G119: CAP fields carried with the forecast. The CAP instruction is `action`. */
export interface CapFields {
  readonly severity: CapSeverity;
  readonly urgency: CapUrgency;
}

/** Synthetic thresholds (6.5 / 7.5 / 9.5 m), flagged synthetic. G38. */
export interface Thresholds {
  readonly alertM: number;
  readonly minorFloodM: number;
  readonly majorFloodM: number;
  readonly basis: string; // "Modelled on Irrigation Department bulletin, 8 Aug 2026 (synthetic)"
}

/** Capability: local reference levels for each area. G38, G76. */
export interface Landmark {
  readonly name: string;        // "the old ferry steps"
  readonly levelM: number;
  readonly placeholder: true;   // nobody supplies real landmark levels for this paper
}

/** Peak level range for the window. Capability: probability or range from the model. */
export interface LevelRange {
  readonly lowM: number;
  readonly medianM: number;
  readonly highM: number;
}

export interface DailyLevel {
  readonly date: string; // "2026-10-15" (local date)
  readonly medianM: number;
  readonly lowM?: number;
  readonly highM?: number;
}

/**
 * Capability: the model exposes supporting observations for "Why?" (G25, G14).
 * These are observed inputs, not feature importance, and never presented as
 * cause. Plain words come from a lookup table keyed by `id` (G14), not from here.
 */
export type ObservationId =
  | 'rain72h'
  | 'upstreamLevel'
  | 'soilMoisture'
  | 'prevDayLevel';

export interface Observation {
  readonly id: ObservationId;
  readonly value: number;
  readonly unit: string;           // "mm", "m", "%"
  readonly observedAt: IsoDateTime;
}

export interface Forecast {
  readonly id: string;              // e.g. "hanwella-2026-10-13"
  readonly synthetic: true;         // README rule: every forecast object carries this

  // ---- the five fidelity invariants ----
  readonly hazard: Hazard;
  readonly place: Place;
  readonly window: TimeWindow;
  readonly likelihood: Likelihood;
  readonly action: Action;

  // ---- prediction detail ----
  readonly severityClass: SeverityClass;
  readonly cap: CapFields;
  readonly issuedAt: IsoDateTime;
  readonly nextUpdateAt: IsoDateTime;  // capability: forecast schedule metadata (G42)
  readonly peakLevel: LevelRange;
  readonly dailyLevels: readonly DailyLevel[]; // 7 days
  readonly thresholds: Thresholds;
  readonly landmark: Landmark;
  readonly supportingObservations: readonly Observation[];
  readonly whatWouldChangeIt: readonly string[];
}

/** The forecasts.json file: a list, at least yesterday and today for one gauge. */
export type ForecastFile = readonly Forecast[];

/**
 * Cut-off between "Unlikely" and "Possible". CAP 1.2 only says Unlikely is
 * p ~ 0; the 5% value is OUR OWN CHOICE and must be labelled so in the paper.
 */
export const UNLIKELY_CUTOFF = 0.05;

/**
 * CAP 1.2 §3.2.2: Likely = p > ~50%; Possible = p <= ~50%; Unlikely = p ~ 0.
 * "Observed" is for events that have happened, so a forecast never maps to it.
 * Note: this maps 0.10 and 0.29 both to "Possible", which is why the picture
 * or number stays available. It does not mean "Possible" = 30% in CAP.
 */
export function capCertaintyFor(probability: number): CapCertainty {
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) return 'Unknown';
  if (probability > 0.5) return 'Likely';
  if (probability >= UNLIKELY_CUTOFF) return 'Possible';
  return 'Unlikely';
}

/**
 * Capability: stored previous forecasts and a comparison (G89, G54).
 * Computed by the app from two stored forecasts, never precomputed in the JSON.
 */
export interface ForecastChange {
  readonly previousId: string;
  readonly currentId: string;
  readonly classChanged: boolean;     // NO_FLOODING -> ABOVE_NORMAL
  readonly certaintyChanged: boolean; // Possible -> Possible: false in the scenario
  readonly direction: 'up' | 'down' | 'same'; // of probability
  readonly previousTenths: number;    // 1 (of 10 houses)
  readonly currentTenths: number;     // 3 (of 10 houses)
}

/** Probability as filled houses out of 10 for the icon array (G26, G81). */
export function tenthsOf(probability: number): number {
  return Math.round(probability * 10);
}

export function compareForecasts(previous: Forecast, current: Forecast): ForecastChange {
  const p0 = previous.likelihood.probability;
  const p1 = current.likelihood.probability;
  return {
    previousId: previous.id,
    currentId: current.id,
    classChanged: previous.severityClass !== current.severityClass,
    certaintyChanged: previous.likelihood.capCertainty !== current.likelihood.capCertainty,
    direction: p1 > p0 ? 'up' : p1 < p0 ? 'down' : 'same',
    previousTenths: tenthsOf(p0),
    currentTenths: tenthsOf(p1),
  };
}
