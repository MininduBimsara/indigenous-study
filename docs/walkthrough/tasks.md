# Walkthrough tasks T1–T5: optimal paths and step counts

Minindu Abeywardena · Draft, 15 Oct 2026 · For Imansha (wireframes, personas, walkthrough protocol)

**Status: draft.** Confirm every step count against the wireframes on 22 Oct. If a wireframe cannot support a step as written, flag it; we then change either the design or the count. Counts are frozen with the prototype on 29 Oct. The walkthrough starts 30 Oct.

Sources: Research Approach v3.2 (Task 4b, Task 3 profiles, worked example), Start Plan Step 3 (first draft, 8 Oct), `docs/prototype/build-plan.md`, `ews-mobile/model/profile.ts`, `__fixtures__/hanwella.ts`. All forecast values are synthetic.

## 1. Rules for counting

- **One step = one action:** a tap, a choice, or reading one piece of information.
- **Optimal path = the shortest correct path** from the start state to the success state. Evaluators compare what the persona would do against it. Extra steps, dead ends and wrong turns are recorded as problems.
- **Reading counts only for what the task needs.** On forecast screens, a read step is one screen element that carries one or more of the five facts. Other things on the screen (reasons, pictures, next update) are listed as "also on screen". They are not counted, but evaluators note if they get in the way.
- **Scrolling** is not a step unless the wireframe forces it. If something needed is below the fold, add a step and flag it.
- **Back** is one step (on-screen back button or system back).

## 2. The scenario every task uses

Hanwella gauge, Kelani Ganga. Synthetic.

| | Yesterday | Today |
| --- | --- | --- |
| Class | NO_FLOODING | ABOVE_NORMAL |
| Chance of reaching Minor Flood Level (7.5 m) | 0.10 (1 in 10) | 0.29 (3 in 10) |
| CAP word | Possible | Possible |
| Window | Thursday | Thursday |
| Action | Get your go-bag ready today. | Get your go-bag ready today. |

**The five facts** (the invariants `checkInvariants()` enforces): hazard (flooding), place (here), time window (Thursday), likelihood ("possible", uncertainty kept), action (go-bag).

## 3. Screens used

| Screen | What it is | Used in |
| --- | --- | --- |
| S01 | Profile setup start: "Answer questions" or "Pick a ready profile" | T1a, T1b |
| S02 | Profile question (one template, seven questions) | T1a |
| S03 | Ready-made profile picker (three profiles) | T1b |
| S04 | Profile summary and confirm (sample forecast in the chosen profile) | T1a, T1b, T2 |
| S05 | Settings: "How we explain" | T2 |
| S07 | Forecast home card | T3, T4, T5 |
| S08 | "Why?" reasons | T4 |
| S09 | "How sure?" likelihood detail | T4 |
| S10 | Change notice ("changed since yesterday") | T5 |

**Out of the walkthrough:** S06 carer-assisted setup (first on the cut list) and S11 live alert (alert-mode content waits on Madam's answer to Q2). Both are reported as not evaluated.

## 4. Summary

| Task | Function | Persona does | Screens | Optimal steps |
| --- | --- | --- | --- | --- |
| T1a | 1 | Set up a profile by answering questions | S01 → S02 ×7 → S04 | 9 |
| T1b | 1 | Set up by picking a ready profile | S01 → S03 → S04 | 3 |
| T2 | 1 | Switch to another ready profile | Settings → S05 → S04 | 4 |
| T3 | 2 | Read today's forecast and know the five facts | S07 | 3 per profile |
| T4 | 2 | Ask "Why?" or "How sure?" and come back | S07 → S08 or S09 → S07 | Why? 4 · How sure? 3 |
| T5 | 2 | Notice the forecast changed since yesterday | S10 → S07 | 4 (alerts on); open question for alerts off |

## 5. Function 1: set up and change the profile

### T1a Set up by answering questions

- **Start state:** fresh install, welcome screen done, S01 shown.
- **Success state:** profile saved, home (S07) shown.
- **Screens:** S01, S02 ×7, S04.
- **Optimal steps: 9**

1. S01: choose "Answer questions".
2. S02 Q1: choose how likely-ness is shown (word / word + picture / word + picture + number).
3. S02 Q2: choose what comes first (main message / everything).
4. S02 Q3: choose how actions are shown (step by step / first step only).
5. S02 Q4: choose reminders and change alerts (on / off).
6. S02 Q5: choose how time is said (day and part of day / "in 2 days" / both).
7. S02 Q6: choose read, listen or pictures.
8. S02 Q7: choose what you want from an explanation (what to do / why).
9. S04: confirm.

Notes for the wireframe:
- Count assumes **choosing an option moves on** to the next question. If each question also needs a "Next" tap, T1a becomes 16 steps. Decide which in the wireframe. One tap per question is shorter; a separate "Next" lets people change their mind (G4). Either is fine if we count it honestly.
- "Not sure, choose for me" counts as one choice (same step).
- Question wording is Imansha's (Research Approach Task 3). The labels above are short forms of the profile fields only.

### T1b Set up by picking a ready profile

- **Start state:** same as T1a.
- **Success state:** same as T1a.
- **Screens:** S01, S03, S04.
- **Optimal steps: 3**

1. S01: choose "Pick a ready profile".
2. S03: pick one of "Just tell me what to do", "Show me why", "How sure, and what changed?".
3. S04: confirm.

Note: each persona picks its own profile. Reading the sample forecast under each profile on S03 is optional and not counted.

### T2 Switch to another ready profile

- **Start state:** home (S07), a profile already set.
- **Success state:** new profile saved, home shown in the new profile.
- **Screens:** Settings tab, S05, S04.
- **Optimal steps: 4**

1. Open the Settings tab.
2. Open "How we explain" (S05).
3. Pick the other ready profile.
4. S04: confirm.

Note: if Madam says to keep the old condition picker in Settings, the persona has to tell "How we explain" apart from it. Count stays 4, but evaluators should watch for a wrong turn there.

## 6. Function 2: the adapted explanation

### T3 Read today's forecast

- **Start state:** home (S07) with today's forecast card; profile set.
- **Success state:** the persona can state all five facts.
- **Screens:** S07.
- **Optimal steps: 3 reads in every profile.** The profile changes what each read looks like, not how many there are.

**Path A: "Just tell me what to do"** (words only, main message first, listen)

1. Read (or listen to) "Flooding is possible here on Thursday." (hazard, place, time window)
2. Read "It is not certain." (likelihood)
3. Read "Get your go-bag ready today." (action)

Also on screen: "Why?" button.

**Path B: "Show me why"** (words + picture, reasons on)

1. Read "Flooding is possible here on Thursday." (hazard, place, time window, likelihood word)
2. Read the picture: 3 of 10 houses filled. (likelihood picture)
3. Read "Get your go-bag ready today." (action)

Also on screen: "Why: a lot of rain has fallen upstream, and the river is rising."; river-level picture against the landmark; "How sure is this?" button.

**Path C: "How sure, and what changed?"** (words + picture + number, change alerts on)

1. Read "Flooding is possible here on Thursday. 3 in 10 chance." (hazard, place, time window, likelihood)
2. Read the icon array: 3 of 10 houses filled. (likelihood picture)
3. Read "Get your go-bag ready today." (action)

Also on screen: "Yesterday it was 1 in 10. It went up because of new rain."; "Next update: tomorrow at 6 am."; exact figure (29%) on tap.

**Comprehension check after T3.** The evaluator asks, as the persona: what could happen, where, when, how likely, and what should you do? Record yes or no for each of the five facts.

Notes:
- **Gap in the worked example:** the Research Approach worked example lists no action line for "Show me why" or "How sure, and what changed?". The invariants require the action in every profile, so Paths B and C include it. Please put it on the S07 wireframe in all three profiles.
- **Listening (Path A):** the profile's default is audio. If playing the audio needs a tap, add 1 step (T3 = 4). Decide in the wireframe whether it plays automatically.

### T4 Ask for more explanation and come back

- **Start state:** home (S07) with today's forecast; profile set.
- **Success state:** back on S07 after reading the extra explanation.
- **Screens:** S07, then S08 ("Why?") or S09 ("How sure?").

**Path "Why?": 4 steps**

1. Tap "Why?".
2. Read reason 1: a lot of rain has fallen upstream (synthetic: 120 mm in 72 hours).
3. Read reason 2: the river upstream is rising.
4. Back to S07.

**Path "How sure?": 3 steps**

1. Tap "How sure is this?".
2. Read the likelihood detail: "Possible", 3 of 10 houses, 29%.
3. Back to S07.

The steps are the same in every profile; the profile changes what S08 and S09 show.

**Suggested assignment** (each persona walks the extra explanation its profile does not show by default):

| Persona's profile | Walks | Steps |
| --- | --- | --- |
| Just tell me what to do | Why? | 4 |
| Show me why | How sure? | 3 |
| How sure, and what changed? | Why? | 4 |

Note: the number of read steps in "Why?" equals the number of reasons S08 shows. The draft assumes two (the two supporting observations in the fixture). If Supun's `forecasts.json` gives a different number, the count changes.

### T5 Notice that the forecast has changed

- **Start state:** a forecast update has arrived since yesterday (0.10 → 0.29).
- **Success state:** the persona can say what changed (chance went up, from 1 in 10 to 3 in 10) and in which direction (up).
- **Screens:** S10, S07.

**Path with change alerts on ("How sure, and what changed?"): 4 steps**

1. See the change notice (S10).
2. Open it.
3. Read "Yesterday it was 1 in 10. Now it is 3 in 10. It went up because of new rain."
4. Return to S07.

**Open question: profiles with change alerts off.** In `profile.ts`, "Just tell me what to do" and "Show me why" have change alerts off, so S10 does not appear for them. Options:

1. Walk T5 only with the "How sure, and what changed?" persona. Simplest; T5 has one path.
2. Show a short "Changed since yesterday" line on S07 in every profile. Then the path is: read the line (1), tap it (2), read the change (3), back (4) = 4 steps.

Because both days say "Possible", the CAP word alone hides the change. That is a reason to prefer option 2 (G89, G27). To decide together before the S07 and S10 wireframes.

## 7. Who walks what

- **Personas:** one per profile, built from the evidence-record personas (affected domains, documented behaviours, urgency modifier, sources), plus an optional carer persona. Each persona walks every task with its own profile, except T4 (assignment above) and T5 (open question).
- **Questions per step:** the four standard cognitive-walkthrough questions plus our fifth (would the persona notice and recover from an error?).
- **Evaluator sheet:** Task, step and persona columns are pre-filled from this file. Then Q1–Q5 (yes/no), what went wrong, severity 0–4, screenshot for severity 3–4. No guideline column; the team maps defects to guidelines afterwards.
- **Bias control:** three members walk independently. The person who built a screen does not lead its walkthrough. Minindu builds S01–S05, so Minindu does not lead T1 or T2. Whoever builds S07–S10 does not lead T3–T5. Severities are rated before discussion, and agreement is reported.

## 8. What to check against the wireframes on 22 Oct

- [ ] S02: does choosing an option move on, or is there a "Next" tap? (T1a = 9 or 16)
- [ ] S07: is the action line shown in all three profiles?
- [ ] S07, "Just tell me what to do": does audio play by itself, or need a tap? (T3 = 3 or 4)
- [ ] S07: is anything needed for T3 below the fold?
- [ ] S08: how many reasons are shown? (T4 "Why?" = 2 + number of reasons)
- [ ] S07 / S10: change line for profiles with alerts off (T5 option 1 or 2)
- [ ] S05: is "How we explain" clearly separate from the old condition picker (if kept)?
