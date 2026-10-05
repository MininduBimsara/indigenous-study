# Data model

Typed model for the **explanation profile** and the **forecast** (Task 7, due 16 Oct). The JSON shape of the forecast is agreed with Supun, who owns the synthetic forecast file and the prediction screens.

Planned files:

| File | Holds |
| --- | --- |
| `profile.ts` | The explanation profile: one field per template question (likelihood form, detail on first view, action detail, reminders and change alerts, time and place wording, modality and reading level, explanation goal), plus carer consent |
| `forecast.ts` | One forecast: hazard, place, time window, likelihood (probability + CAP certainty word), severity class, action, previous level, next update time, supporting observations, `synthetic: true` |
| `invariants.ts` | The fidelity check: hazard, place, time window, likelihood and action must be present in every adapted explanation |

Each field should name the guideline or template question it comes from in a comment, so a requirement traces to a field (Research Approach v3, Task 5).
