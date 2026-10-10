# Synthetic forecast data

Made-up forecasts for the prototype and the cognitive walkthrough. **No value here is a real forecast.** Supun owns this folder; the file shape is defined in `ews-mobile/model/forecast.ts`.

## The scenario (Research Approach v3.1, agreed 7 Oct 2026)

A Flood Hub–style forecast for the **Hanwella gauge on the Kelani Ganga**.

| | Yesterday | Today |
| --- | --- | --- |
| Severity class (Flood Hub API) | `NO_FLOODING` | `ABOVE_NORMAL` |
| Chance of reaching the Minor Flood Level (7.5 m) on Thursday | 0.10 (1 in 10) | 0.29 (about 30%, 3 in 10) |
| CAP 1.2 certainty word | Possible | Possible |
| Action | Get your go-bag ready today. | Get your go-bag ready today. |

What "what changed" shows (screen S10, walkthrough task T5): the class change (NO_FLOODING → ABOVE_NORMAL), the picture change (1 of 10 → 3 of 10 houses) and the direction ("went up"). Both days are "Possible", so the word alone does not change. The app computes this comparison itself from the two stored forecasts; it is never written into the file.

The paper's running example says "about 30%" and "3 in 10". Screens show 29% only when the user asks for the exact number.

## Rules

1. **File:** `forecasts.json`, a list of complete forecast objects (type `ForecastFile`). At least two for the Hanwella gauge: yesterday and today.
2. **Synthetic flag:** `"synthetic": true` once on every forecast object, not on each value. The generator (`make_forecast_json.py`) fails if a forecast lacks it.
3. **Label on screen:** every screen that shows a forecast displays "Synthetic data" (in `ForecastHeader`).
4. **The five invariants are always in the data:** `hazard` (`"flood"`), `place`, `window`, `likelihood`, `action`. The invariants check (`checkInvariants()`) compares every adapted explanation against them.
5. **The prediction never changes.** Screens and profiles change how a forecast is explained, never its values.
6. **`likelihood.capCertainty` must equal `capCertaintyFor(probability)`** in `model/forecast.ts`.

## Where each value comes from

| Value | Status | Note |
| --- | --- | --- |
| Severity classes | Flood Hub API names | `NO_FLOODING`, `ABOVE_NORMAL`, `SEVERE`, `EXTREME`, `UNKNOWN` |
| Thresholds 6.5 / 7.5 / 9.5 m (Alert / Minor Flood / Major Flood) | Synthetic | Modelled on the Irrigation Department bulletin of 8 Aug 2026. Cite that date; do not print the other set of Hanwella values |
| Minor Flood Level = Flood Hub's SEVERE threshold | Our inference | Say so in the paper |
| CAP words | OASIS CAP 1.2 §3.2.2 | Likely = p > ~50%; Possible = p ≤ ~50%; Unlikely = p ~ 0. Verified 6 Oct 2026 |
| 5% cut between Unlikely and Possible | Our own choice | CAP only says p ~ 0. Labelled in code and in the paper |
| Action for "Possible" | Research Approach worked example | |
| Action for Unlikely, Likely, Observed | Placeholder | `"placeholder": true` until a source is found (Sri Lankan DMC guidance or the 128-guideline catalogue) |
| Landmark "the old ferry steps" | Placeholder | `"placeholder": true`; nobody supplies real landmark levels for this paper |
| Probabilities, levels, observations | Synthetic | From Supun's toy model (8,000 synthetic rows, AUC 0.85); one case, not evidence about real floods |

## What not to claim from this data

- That "Possible" means 30% in CAP. It covers everything above our 5% cut up to about 50%, including yesterday's 10%.
- Anything about real floods at Hanwella.
- That supporting observations are causes. They are what the model saw, shown for "Why?", never feature importance presented as cause.
