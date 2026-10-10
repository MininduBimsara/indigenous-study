/**
 * Explanation profile (Task 7, Research Approach v3.1 Task 3).
 *
 * One field per template question. Each field names its cognitive domain
 * (the question's source) and the guidelines it serves, so a requirement
 * traces to a field (Task 5).
 *
 * Rules:
 *   - Profiles are by explanation need, never by diagnosis (Brief 1, G84).
 *     No field or preset name refers to a condition.
 *   - The questions ask about preference, not ability.
 *   - The three presets are HYPOTHETICAL: derived from literature and existing
 *     apps, not from users, and not validated.
 *   - A profile changes order, form and depth of the explanation. It never
 *     changes the forecast (see forecast.ts).
 *
 * This sits beside the existing condition picker (UserPreferencesContext);
 * whether to drop that picker is an open question for the 15 Oct meeting.
 */

export type PresetId = 'justTellMe' | 'showMeWhy' | 'howSure' | 'custom';

/** Numeracy (Subjective Numeracy Scale preference items). G26, G119, G81. */
export type LikelihoodForm =
  | 'word'               // Option A: "Possible"
  | 'wordPicture'        // Option B: "Possible" + 3 of 10 houses
  | 'wordPictureNumber'; // Option C: "Possible" + 3 of 10 houses + 30%

/** Attention. G41, G21, G11, G18. */
export type FirstView =
  | 'mainMessage'  // bottom line and action first; the rest on tap
  | 'everything';  // all enabled parts on the first screen

/** Executive function / planning. G4, G50, G22. */
export type ActionDetail =
  | 'stepByStep'   // numbered list, one step per line
  | 'summary';     // the first step only, the rest on tap

/** Orientation to time. G47, G73, G114. */
export type TimeWording =
  | 'dayAndPart'   // "Thursday morning"
  | 'relative'     // "in 2 days"
  | 'both';        // "Thursday morning (about 2 days)"

/** Language: default modality. G128, G67, G14. */
export type Modality = 'text' | 'audio' | 'pictures';

/** Reasoning / curiosity. Brief 1, G25. */
export type ExplanationGoal =
  | 'whatToDo'     // reasons available on request only
  | 'why';         // reasons and landmark comparison shown

/** Who answered the setup questions. G107. */
export type AnsweredBy =
  | 'self'
  | 'selfWithHelper'
  | 'helper'        // requires carerConsent.given === true
  | 'defaults';     // "Not sure, choose for me" or a preset chosen without questions

/** G107, G80. Recorded before a carer changes the profile. */
export interface CarerConsent {
  readonly given: boolean;
  readonly carerName?: string;
  readonly recordedAt: string; // ISO 8601
}

export interface ExplanationProfile {
  readonly schemaVersion: 1;              // for AsyncStorage migration
  readonly presetId: PresetId;            // 'custom' once any field differs from its preset
  readonly likelihoodForm: LikelihoodForm;
  readonly firstView: FirstView;
  readonly actionDetail: ActionDetail;
  readonly reminders: boolean;            // Memory. G54, G109
  readonly changeAlerts: boolean;         // Memory. G89, G27, G118
  readonly timeWording: TimeWording;
  readonly modality: Modality;
  readonly explanationGoal: ExplanationGoal;
  readonly answeredBy: AnsweredBy;
  readonly carerConsent?: CarerConsent;
}

/**
 * "Not sure, choose for me" default for each question.
 * likelihoodForm 'wordPicture' is a design default (Option B), not a claim
 * that words plus picture is best for people with cognitive impairments.
 */
export const DEFAULT_PROFILE: ExplanationProfile = {
  schemaVersion: 1,
  presetId: 'custom',
  likelihoodForm: 'wordPicture',
  firstView: 'mainMessage',
  actionDetail: 'stepByStep',
  reminders: true,
  changeAlerts: true,
  timeWording: 'dayAndPart',
  modality: 'text',
  explanationGoal: 'whatToDo',
  answeredBy: 'defaults',
};

/**
 * The three hypothetical ready profiles (Research Approach v3.1, Task 3).
 * Values the Research Approach states are marked "RA"; the others are
 * defaults we filled in ("fill-in"), to confirm with Imansha's questions.
 */
export const PRESETS: Readonly<Record<Exclude<PresetId, 'custom'>, ExplanationProfile>> = {
  /** "Just tell me what to do": main message first; step-by-step actions; words only; listen. */
  justTellMe: {
    ...DEFAULT_PROFILE,
    presetId: 'justTellMe',
    likelihoodForm: 'word',        // RA: words only
    firstView: 'mainMessage',      // RA: main message first
    actionDetail: 'stepByStep',    // RA
    modality: 'audio',             // RA: listen
    explanationGoal: 'whatToDo',   // fill-in ("Why?" stays one tap away, G124 counter-evidence)
    changeAlerts: false,           // fill-in
  },
  /** "Show me why": reasons on; words + picture; landmark comparisons. */
  showMeWhy: {
    ...DEFAULT_PROFILE,
    presetId: 'showMeWhy',
    likelihoodForm: 'wordPicture', // RA
    explanationGoal: 'why',        // RA: reasons on (landmark comparison follows from 'why')
    firstView: 'everything',       // fill-in, matches the worked example
    changeAlerts: false,           // fill-in
  },
  /** "How sure, and what changed?": words + picture + number; change alerts on. */
  howSure: {
    ...DEFAULT_PROFILE,
    presetId: 'howSure',
    likelihoodForm: 'wordPictureNumber', // RA
    changeAlerts: true,                  // RA
    firstView: 'everything',             // fill-in, matches the worked example
    explanationGoal: 'why',              // fill-in: "It went up because of new rain"
  },
};

/** Display names, by need. G84: never a condition name. */
export const PRESET_NAMES: Readonly<Record<Exclude<PresetId, 'custom'>, string>> = {
  justTellMe: 'Just tell me what to do',
  showMeWhy: 'Show me why',
  howSure: 'How sure, and what changed?',
};

/** A profile set by a helper must carry consent (G107). */
export function hasRequiredConsent(p: ExplanationProfile): boolean {
  return p.answeredBy !== 'helper' || p.carerConsent?.given === true;
}
