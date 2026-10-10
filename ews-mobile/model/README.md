# Data model

Typed model for the **explanation profile**, the **forecast** and the **adapted explanation** (Task 7, due 16 Oct). The forecast shape is agreed with Supun, who owns `data/synthetic/forecasts.json` and the prediction screens.

Rule: the prediction never changes, only its explanation. Every `Forecast` field is `readonly`; profiles and AI wording produce an `AdaptedExplanation`, which is checked against the forecast before it is shown.

| File | Holds | Status |
| --- | --- | --- |
| `forecast.ts` | One forecast: the five invariants (hazard, place, time window, likelihood, action), severity class, CAP fields, issue and next-update times, peak level range, 7-day levels, thresholds, landmark, supporting observations, `synthetic: true`. Also `capCertaintyFor()` (CAP 1.2 §3.2.2, our 5% cut) and `compareForecasts()` | Draft 9 Oct |
| `profile.ts` | The explanation profile: one field per template question, carer consent, the "choose for me" defaults and the three hypothetical presets | Draft 9 Oct |
| `explanation.ts` | `AdaptedExplanation` (one slot per invariant, each with `text` and `value`), `InvariantResult` and the `CheckInvariants` signature | Draft 9 Oct |
| `invariants.ts` | `checkInvariants()` implementation | 13 Oct |
| `__fixtures__/hanwella.ts` | The Hanwella scenario typed: yesterday (NO_FLOODING, 0.10), today (ABOVE_NORMAL, 0.29), and the "How sure" explanation from the worked trace | Draft 9 Oct; replace illustrative values with Supun's JSON |

Each field names the guideline or template question it comes from in a comment, so a requirement traces to a field (Research Approach v3.1, Task 5).
