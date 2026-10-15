# Related-work notes: NeuroAdaptX, Tielman 2024, Madugalla

Minindu Abeywardena · 11 Oct 2026. Sources: Gemini Notebook runs (9–10 Oct), and Claude reading arXiv:2511.12856v2 directly (10 Oct).

**Status:** every fact below was checked on the page by Minindu on 11 Oct, except the rows Claude read in arXiv v2 and two rows from the Gemini claims report (both are in the papers' abstracts). Gemini page numbers are leads: two Gemini outputs gave different pages for the same Madugalla passage.

## References

- Bunde, E. (2026). NeuroAdaptX: Designing neuro-adaptive explanations for cognitive accessibility in explainable AI interfaces. DESRIST 2026, LNCS 16605, pp. 205–225. https://doi.org/10.1007/978-3-032-28316-0_12
- Tielman, M. L., Suárez-Figueroa, M. C., Jönsson, A., Neerincx, M. A., & Siebert, L. C. (2024). Explainable AI for all: A roadmap for inclusive XAI for people with cognitive disabilities. *Technology in Society*, 79, 102685. https://doi.org/10.1016/j.techsoc.2024.102685 *(check the exact title on p. 1)*
- Madugalla, A., Dong, J., Loi, K. L., Crossman, M., & Grundy, J. (2025). Human-centred requirements engineering for critical systems: Insights from disaster early warning applications. arXiv:2511.12856v2. *(Cite this version; SSRN 2026 version not read.)*

## Checked facts

| Paper | Fact | Where | Checked |
| --- | --- | --- | --- |
| Tielman | Fifth author is Luciano Cavalcante Siebert (not "van der Aa L") | p. 1 | Minindu, on page, 11 Oct |
| Tielman | "Adaptive XAI is the key to inclusive XAI." | p. 9 | Minindu, on page, 11 Oct |
| Tielman | "there is a need to focus on more than just simplicity in text. Rather, personalisation and diversification are the key." | p. 9 | Minindu, on page, 11 Oct |
| Tielman | "Users with diverse cognitive disabilities should be involved throughout the development process of XAI" | p. 10 | Minindu, on page, 11 Oct |
| Tielman | Counterfactual explanations "do not necessarily lead to feasible and actionable explanations." | p. 8 | Minindu, on page, 11 Oct |
| Tielman | "Most of the research, so far, focuses on presenting 'feature importance'" | p. 8 | Minindu, on page, 11 Oct |
| Tielman | Conceptual roadmap; no implementation or user evaluation | pp. 2, 7–8 | Minindu, on page, 11 Oct |
| NeuroAdaptX | Adapts structure, modality and density to self-reported ADHD, autism (ASC) and dyslexia profiles | pp. 205–206 | Gemini claims report |
| NeuroAdaptX | "Informational equivalence was checked before deployment using a coverage checklist" of four units: pattern detected, main drivers, causal interpretation, actionable takeaway. Uncertainty is not one of them | p. 215 | Minindu, on page, 11 Oct |
| NeuroAdaptX | 10 design requirements (DR1–DR10), traced to design principles and features | pp. 206, 210–215 | Minindu, on page, 11 Oct |
| NeuroAdaptX | Randomised online vignette experiment, N = 216; stress prediction in digital wellbeing | pp. 205, 217 | Minindu, on page, 11 Oct |
| Madugalla | Four groups: older adults, low-digital-literacy, rural, colour-blind users | Abstract | Claude, arXiv v2, 10 Oct |
| Madugalla | 62 guidelines → 67 requirements; 6 interviews; cognitive walkthroughs with 8 evaluators, 4 personas | Abstract | Gemini claims report (Confirmed) |
| Madugalla | Cognitive impairments "were outside the scope of this study" | Section 10.3 External Validity (p. 12) | Claude, arXiv v2, 10 Oct |
| Madugalla | Prototype shows the "Next four-day fire danger forecast for users' current area" using the Country Fire Authority's standard danger ratings; it does not explain how the ratings are produced or what a rating means | Section 7.1 | Claude, arXiv v2, 10 Oct |
| Madugalla | Adaptivity "must always remain explainable and controllable, especially in high-stakes environments" | Section 11 Conclusion | Claude, arXiv v2, 10 Oct |
| Madugalla | Users set their own adaptations (language, font size, colour scale) at setup or in settings | p. 11 | Minindu, on page, 11 Oct |

Careful wording: Madugalla's forecast is an agency's published rating, not an ML prediction, and the paper does name its source. Write "shown but not explained", not "does not explain the model or data sources".

## Draft paragraphs (edit into your own words)

**NeuroAdaptX.** Bunde [B26] presents NeuroAdaptX, which adapts the structure, modality and density of AI explanations to self-reported ADHD, autism and dyslexia profiles in a stress-prediction setting. Ten design requirements grounded in cognitive load and cognitive fit theory are traced to design principles and features, and an online vignette experiment (N = 216) compared it with a static baseline. Informational equivalence across variants was checked once, before deployment, with a coverage checklist of four units that does not include uncertainty. It does not address safety-critical predictions, and its check does not apply to explanations produced at run time. *(≈95 words)*

**Tielman et al.** Tielman et al. [T24] set out a roadmap for explainable AI for people with cognitive disabilities. They note that most research so far presents feature importance and that counterfactual explanations "do not necessarily lead to feasible and actionable explanations", and they argue that inclusion needs "more than just simplicity in text": "Adaptive XAI is the key to inclusive XAI." They extend the Explanation Ontology with explanation levels, modes and language levels, but do not implement or evaluate an adaptive system. We respond to this call with a requirements-driven adaptation in a flood warning prototype. *(≈95 words)*

**Madugalla et al.** Madugalla et al. [M25] derive 67 requirements from 62 inclusive design guidelines for disaster early warning apps, for older adults, low-digital-literacy, rural and colour-blind users, and validate them in a bushfire prototype through six interviews and cognitive walkthroughs with eight evaluators and four personas. The prototype shows a four-day fire danger forecast but does not explain it. They state that cognitive impairments "were outside the scope of this study" and that adaptivity "must always remain explainable and controllable". We extend their guideline-to-requirement approach to explaining ML flood predictions for people with cognitive impairments. *(≈95 words)*

Do not add: that our profiles improve comprehension, that any profile was validated, or that we are first to trace requirements to features or to let users choose adaptations.
