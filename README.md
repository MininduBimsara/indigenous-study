# Profile-Based Adaptive XAI for a Flood Early Warning System

Prototype for the UISE 2027 paper on adapting the explanation of a flood ML prediction to a user-chosen explanation profile, for people with cognitive impairments. The app is the React Native (Expo) EWS app from our earlier work, extended with two functions:

1. **Set up and select an explanation profile**
2. **View a prediction and its explanation** ("Why?" and "How sure?" on request)

The research plan is in [docs/research/research-approach-v3.pdf](docs/research/research-approach-v3.pdf). The 50 guidelines the screens must meet, with evidence, are in [docs/research/xai-guideline-evidence-catalogue.pdf](docs/research/xai-guideline-evidence-catalogue.pdf).

## Run the app

Requirements: Node.js 20 or newer, and the Expo Go app on a phone (or an Android emulator / iOS simulator).

```bash
cd ews-mobile
npm install
npm start          # scan the QR code with Expo Go
```

Other targets: `npm run android`, `npm run ios`, `npm run web`.

Checks to run before every pull request:

```bash
npm run typecheck     # TypeScript, no emit
npm run colors:audit  # fails if a colour outside the v2 palette is used
```

The app uses Expo SDK 56. Read the versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing code (see `ews-mobile/AGENTS.md`).

## Where things live

| Folder | What goes there |
| --- | --- |
| `ews-mobile/app/` | Screens (Expo Router: one file per route) |
| `ews-mobile/components/` | Shared components (AdaptiveButton, HapticButton, EasyReadToggle, FocusModeOverlay, StressEscalationTimer) |
| `ews-mobile/theme/colors.ts` | **The v2 colour tokens.** Every colour comes from here; no hex values in screens. |
| `ews-mobile/model/` | Typed data model for the explanation profile and the forecast (Task 7) |
| `ews-mobile/data/synthetic/` | Synthetic forecast data; every value labelled synthetic |
| `docs/wireframes/` | One wireframe image per screen |
| `docs/screen-specs/` | One short spec per screen, written from its wireframe |
| `docs/walkthrough/` | Cognitive walkthrough protocol and evaluator sheets |
| `docs/research/` | Research Approach, evidence catalogue, triage comparison |
| `docs/ai-prompting-template.md` | The template for building a screen with AI |

## Rules

1. **No screen is built without its wireframe and spec.** Each screen has a GitHub issue; the wireframe goes in `docs/wireframes/`, the spec in `docs/screen-specs/`, and both are linked from the issue before any code is written.
2. **One screen per AI prompt**, using [docs/ai-prompting-template.md](docs/ai-prompting-template.md): wireframe image + screen spec + colour tokens + component list.
3. **Colours only from `theme/colors.ts`.** `npm run colors:audit` must pass.
4. **Label every made-up forecast value as synthetic**, in the data and on screen.
5. **Profiles are named by need, never by diagnosis** (G84).
6. **Adapt the explanation, never the prediction.** The five invariants (hazard, place, time window, likelihood, action) appear on every forecast screen in every profile.
7. Work on a branch, open a pull request into `main`, and fill in the pull request checklist.

## Team

Minindu Abeywardena (lead), Supun Tharaka, Imansha Dilshan.
