# Task 1 leftovers: CAP 1.2 and NeuroAdaptX checked against the sources

Checked 6 Oct 2026. Both items from "Check before citing" in the catalogue are now resolved, and the Research Approach v3 and the catalogue have been corrected where they were wrong.

## 1. OASIS CAP 1.2: "Possible" and "Likely"

**Confirmed.** Source: [OASIS, *Common Alerting Protocol Version 1.2*, OASIS Standard, 1 July 2010, §3.2.2](https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html), element `<certainty>`:

| Value | Definition (verbatim) |
| --- | --- |
| Observed | "Determined to have occurred or to be ongoing" |
| Likely | "Likely (p > ~50%)" |
| Possible | "Possible but not likely (p <= ~50%)" |
| Unlikely | "Not expected to occur (p ~ 0)" |
| Unknown | "Certainty unknown" |

**What this means for us**

- A 30% forecast maps to **"Possible"** under the standard. We can cite this as a standard mapping, not our own choice.
- "Unlikely" means p ≈ 0, so anything from a few percent up to 50% is "Possible". A 5% and a 45% forecast get the same word. This is a reason to offer the picture or number (profile option C), and it matches the catalogue's mixed evidence on bare probability words (Budescu et al. 2009; Taylor et al. 2023).
- Same section, for the forecast model: `<urgency>` **Future** = "Responsive action SHOULD be taken in the near future"; **Expected** = "...soon (within next hour)". A 2-day forecast is *Future*; only the live alert becomes *Expected* or *Immediate*. `<severity>` **Moderate** = "Possible threat to life or property"; **Severe** = "Significant threat to life or property".

**Citation:** OASIS. (2010). *Common Alerting Protocol Version 1.2*. OASIS Standard, 1 July 2010. https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html

## 2. NeuroAdaptX: claims checked against the PDF

**Citation:** Bunde, E. (2026). NeuroAdaptX: Designing Neuro-Adaptive Explanations for Cognitive Accessibility in Explainable AI Interfaces. In J. vom Brocke et al. (Eds.), *DESRIST 2026*, LNCS 16605, pp. 205–225. Springer. https://doi.org/10.1007/978-3-032-28316-0_12

| Our claim (Research Approach v3) | What the paper says | Verdict |
| --- | --- | --- |
| Adapts structure, modality and density | "adapts structure, modality, and density to self-reported profiles while preserving informational equivalence" (abstract) | Correct |
| Self-reported profiles (ADHD, autism, dyslexia) | Participants "self-reported a neurodiversity profile (ADHD, ASC, dyslexia)"; one template per profile, assigned once and fixed (§5.1) | Correct. Note: profiles are **condition labels**, not explanation needs |
| RCT, N=216 | "randomized between-subjects online vignette experiment (N = 216)"; 223 responses, 7 excluded; 36 per profile × condition (§5.6) | Correct number; call it a "randomised online vignette experiment", not an RCT |
| Keeps explanation content the same | Same prediction, indicators and "core explanatory claims" in every variant; only presentation varied (§4.4, DR9) | Correct |
| No safety-critical or disaster setting | Domain is **digital wellbeing**: explaining why a day shows a "high-stress pattern" (§4.4) | Correct |
| No RE process | They derive **ten design requirements (DR1–DR10) and six design principles** through Design Science Research, grounded in Cognitive Load and Cognitive Fit Theory (§4.2–4.3) | **Wrong. Must change.** |
| Adapts presentation only | "presentation-level adaptation ... without changing explanatory substance" | Correct |

**Results worth citing** (Table 6, Welch's t, Holm-corrected; Hedges' g): perceived cognitive load g = −0.55; objective comprehension g = 0.39 (0.73 → 0.81); explanation satisfaction g = 0.76; trust g = 0.51. No condition × profile interaction (H5), so the benefit did not differ between ADHD, ASC and dyslexia groups.

### Two findings that change how we position our work

**A. They do have a requirements process.** Replace "no RE process" with: *they derive design requirements from cognitive theory (Design Science Research), not from a cognitive-accessibility requirements catalogue, and they do not map requirements to software capabilities.*

**B. Their "informational equivalence" check is close to our fidelity invariants.** Before deployment they checked every template with a coverage checklist requiring the same "core explanatory units": *pattern detected, main drivers, causal interpretation, actionable takeaway* (§4.4). This is the nearest prior work to `checkInvariants()` and must be cited. Our difference:

| | NeuroAdaptX | Ours |
| --- | --- | --- |
| When checked | Once, manually, before deployment, on fixed templates (Wizard-of-Oz) | At runtime, in code, on every generated explanation |
| What is protected | Explanatory units of a wellbeing classifier | Safety-critical warning facts: hazard, place, time window, likelihood, action |
| Uncertainty | Not among the units | A required invariant |
| What may vary | Presentation only | Presentation **and** depth/order of content, within the invariants |
| Profile basis | Condition label (ADHD / ASC / dyslexia) | User-chosen explanation needs; no diagnosis |

**Other points that support us:**

- Their DR10 (preference-oriented, non-stigmatising framing) and their safeguards (§6.3: profiles "optional, revisable", data minimisation) support our need-based, user-editable profiles and catalogue G84.
- Their own limitations (§6.4): profiles by self-reported label "do not capture the full heterogeneity ... nor ... imply that individuals sharing a label require the same explanation support"; future work should use "live model outputs" and real-world stakes. Both are gaps our paper addresses.

### Revised one-line differentiation

> NeuroAdaptX shows that presentation-level adaptation, checked for informational equivalence before deployment, improves comprehension for neurodivergent users in a low-stakes wellbeing task. We move this to safety-critical warnings: profiles built from explanation needs rather than condition labels, requirements traced from a cognitive-accessibility catalogue to software capabilities, and fidelity invariants (including uncertainty) checked at runtime on every explanation.
