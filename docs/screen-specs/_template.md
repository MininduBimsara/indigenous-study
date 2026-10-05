# S<nn>: <screen name>

- **Issue:** #<number>
- **Wireframe:** [`../wireframes/S<nn>-<short-name>.png`](../wireframes/)
- **Function:** 1 (profile) / 2 (prediction)
- **Route / file:** `ews-mobile/app/<path>.tsx`

## Purpose

One sentence: what the user can do or learn on this screen.

## Content, top to bottom

| # | Element | Exact text (English) | Component | Reads profile attribute |
| --- | --- | --- | --- | --- |
| 1 | Header | "..." | Text | — |
| 2 | ... | | | |

Sinhala and Tamil text: add when the English is final (G121).

## Profile variants

What changes between "Just tell me what to do", "Show me why" and "How sure, and what changed?". Write "none" if the screen is the same for all three.

## Invariants (forecast screens only)

Hazard, place, time window, likelihood and action: where each one appears on this screen.

## Interactions

| Action | Result |
| --- | --- |
| Tap "..." | ... |

## Guidelines this screen must meet

IDs from the evidence catalogue, e.g. G21, G73.

## Data

Fields read from the data model (`ews-mobile/model/`) and the synthetic data file. Mark every forecast value as synthetic.

## Done when

- [ ] Matches the wireframe
- [ ] All colours from `theme/colors.ts` (`npm run colors:audit` passes)
- [ ] Works in all three profiles
- [ ] Screen reader labels on every control and on the icon array
