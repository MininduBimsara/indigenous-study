# Synthetic forecast data

Made-up forecasts for the prototype and the walkthrough. **No value here is a real forecast.**

Rules:

- Every forecast object has `"synthetic": true`, and every screen that shows one displays a "Synthetic data" label.
- Values follow the scenario in Research Approach v3: a Flood Hub–style forecast for one Sri Lankan river gauge, 30% chance of reaching SEVERE in two days, upgraded from ABOVE_NORMAL yesterday.
- Keep at least two forecasts for the same gauge (yesterday and today), so the "what changed" screens (S10, task T5) have something to compare.
- The file shape follows `ews-mobile/model/forecast.ts` (Task 7). Supun owns this folder.

Planned file: `forecasts.json`.
