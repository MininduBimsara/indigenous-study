# AI prompting template: one screen per prompt

AI builds from text prompts alone came out generic in our earlier work. So every screen is built from four inputs, given together in one prompt, for one screen only:

1. **The wireframe image** from `docs/wireframes/`
2. **The screen spec** from `docs/screen-specs/`
3. **The colour tokens** from `ews-mobile/theme/colors.ts`
4. **The component list** below

Review the generated screen against its wireframe before merging (Research Approach v3, Task 4, build method).

This template is a proposal. The team agrees it at the weekly sync; change this file if the team changes it.

## The prompt

Copy everything in the block, attach the wireframe image, and fill in the parts in angle brackets.

```text
You are adding ONE screen to an existing Expo (SDK 56) React Native app written in TypeScript,
using Expo Router. Read https://docs.expo.dev/versions/v56.0.0/ for any Expo API you use.

SCREEN
<paste the full screen spec from docs/screen-specs/S<nn>-<name>.md>

WIREFRAME
The attached image is the wireframe. Match its layout, order and text exactly.
Do not add elements that are not in the wireframe or the spec.

FILE
Create or edit only: ews-mobile/app/<route>.tsx
(and ews-mobile/model/ or ews-mobile/data/synthetic/ only if the spec says so).

COLOURS
Import colours only from ews-mobile/theme/colors.ts:
  import { palette, colors, alertLevel, capSeverity } from '<relative path>/theme/colors';
Never write a hex value or rgb() colour in the screen. Red is for the Danger state and live
alerts only; the Forecast state uses calm colours (guideline G111).

COMPONENTS
Reuse these existing components instead of writing new ones:
- AdaptiveButton (components/AdaptiveButton.tsx): onPress, children, variant
  'primary' | 'success' | 'danger' | 'secondary' | 'warning', fullWidth, disabled, accessibilityLabel
- HapticButton (components/HapticButton.tsx): label, sublabel, variant
  'primary' | 'secondary' | 'danger' | 'safe' | 'ghost', size 'sm' | 'md' | 'lg' | 'xl', haptic, leftIcon
- EasyReadToggle (components/EasyReadToggle.tsx): isActive, onToggle; also exports toEasyRead(text)
  and getHazardSymbol(type)
- FocusModeOverlay (components/FocusModeOverlay.tsx): children, onExit, stepLabel
- StressEscalationTimer (components/StressEscalationTimer.tsx): seconds, onEscalate, onDismiss
Contexts: useUserPreferences (contexts/UserPreferencesContext.tsx), useAlert
(contexts/AlertContext.tsx), useAccessibility (context/AccessibilityContext.tsx).

RULES
- The explanation changes; the prediction never does. Every forecast screen shows the hazard,
  place, time window, likelihood and action, in every profile.
- Every forecast value on screen comes from the synthetic data file and the screen shows a
  "Synthetic data" label.
- Profiles are named by need ("Just tell me what to do", "Show me why",
  "How sure, and what changed?"), never by a condition.
- Plain, literal words; one instruction per line; sentences of 15 words or fewer.
- Every control has an accessibilityLabel; the icon array has a text equivalent
  (e.g. "3 of 10 houses filled").
- Touch targets at least 48 dp.

OUTPUT
Return the complete file(s). Then list anything in the spec you could not build and why.
```

## After the AI answers

1. Run `npm run typecheck` and `npm run colors:audit` in `ews-mobile/`.
2. Open the screen in Expo Go next to the wireframe and check every element.
3. Check the screen in all three profiles.
4. Open a pull request that links the screen's issue, wireframe and spec.
