# Cognitive walkthrough

Persona-based cognitive walkthrough of the prototype (Research Approach v3, Task 4b). Imansha owns the protocol; Minindu owns the task steps (T1–T5) and the final defect-to-guideline mapping.

## Files

| File | What it is | Owner |
| --- | --- | --- |
| `protocol.md` | Personas, the five questions per step, bias control | Imansha |
| `tasks.md` | T1–T5 broken into atomic steps with the optimal step count | Minindu |
| [`evaluator-sheet-template.csv`](evaluator-sheet-template.csv) | One row per task step; each evaluator fills their own copy | — |
| `sheets/<evaluator>.csv` | Filled sheets, one per evaluator | each evaluator |
| `defect-log.csv` | Merged defects with guideline IDs (added after all passes) | Minindu |

## Tasks

| ID | Task | Function |
| --- | --- | --- |
| T1 | Set up an explanation profile for the first time | 1 |
| T2 | Switch to a different ready-made profile | 1 |
| T3 | Read a new forecast and know what, where, when, how likely, and what to do | 2 |
| T4 | Ask for more explanation ("Why?" or "How sure?") and return | 2 |
| T5 | Notice that the forecast has changed since yesterday | 2 |

## Filling in the sheet

- Q1–Q5: Yes or No. Q5 is our added question: can the user detect and recover from an error?
- **What went wrong:** plain words only. **No guideline column**: the team maps each problem to a guideline afterwards, in a separate pass.
- **Severity:** 0–4. A screenshot is required for severity 3–4 (save it in `sheets/screenshots/`, file name in the sheet).
- For T3, also record whether the persona could state the five invariants after reading.

## Bias control

Three members walk independently. The person who built a screen does not lead it. Severities are rated before discussion, and agreement is reported.
