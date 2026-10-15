# Research documents: Profile-Based Adaptive XAI for Cognitive Accessibility

Documents for the UISE 2027 paper that this prototype supports (Task 1: which EWS design guidelines matter for XAI).

## Folders

| Folder | What is in it |
| --- | --- |
| [approach/](approach/) | The Research Approach: current version and its change list. Older versions are in `approach/earlier-versions/`. |
| [framework/](framework/) | Framework v2. |
| [guidelines/](guidelines/) | The 50 XAI-relevant guidelines: evidence catalogue, Framework v2 coverage, triage comparison, method and re-audit. |
| [related-work/](related-work/) | Checked facts on the closest papers, the Task 1 leftover checks, and the Gemini AI drafts. |

## approach/

| File | What it is |
| --- | --- |
| [research-approach-v3.2.pdf](approach/research-approach-v3.2.pdf) | Research Approach, version 3.2 (12 Oct 2026): Task 5 replaced by Framework v2, gap statement and NeuroAdaptX contrast. **Current version.** |
| [research-approach-v3.2-changes.pdf](approach/research-approach-v3.2-changes.pdf) | The eight changes from v3.1 to v3.2, each with before, after and why. |
| [earlier-versions/research-approach-v3.1.pdf](approach/earlier-versions/research-approach-v3.1.pdf) | Research Approach, version 3.1 (7 Oct 2026). |
| [earlier-versions/research-approach-v3.pdf](approach/earlier-versions/research-approach-v3.pdf) | Research Approach, version 3 (4 Oct 2026), as a PDF. |
| [earlier-versions/research-approach-v3.md](approach/earlier-versions/research-approach-v3.md) | The same version 3 as Markdown, exported from the shared doc. |
| [earlier-versions/research-approach-framework.svg](approach/earlier-versions/research-approach-framework.svg) | The framework figure used in version 3 (kept next to the Markdown that embeds it). |

## framework/

| File | What it is |
| --- | --- |
| [framework-v2.pdf](framework/framework-v2.pdf) | Framework v2 (11 Oct 2026): run-time fidelity invariants, four layers, requirement → capability table, worked trace. |

## guidelines/

| File | What it is |
| --- | --- |
| [xai-guideline-evidence-catalogue.pdf](guidelines/xai-guideline-evidence-catalogue.pdf) | The 50 XAI-relevant guidelines (31 from the first triage + 19 from the manual review), grouped by published evidence: 38 Direct, 9 Indirect, 3 none found. Each has the implication for the explanation, how to adapt it in the EWS app, and sources. |
| [xai-guideline-evidence-catalogue.html](guidelines/xai-guideline-evidence-catalogue.html) | Same catalogue as a web page, with clickable source links. |
| [xai-framework-v2-guideline-coverage.xlsx](guidelines/xai-framework-v2-guideline-coverage.xlsx) | The 50 guidelines checked against Framework v2. Final (14 Oct): 13 covered, 20 partly, 9 UI only, 8 not covered. The Gaps sheet lists what we fix and what we report as limitations. |
| [how-to-check-the-50-guidelines.pdf](guidelines/how-to-check-the-50-guidelines.pdf) | The method and first pass behind the coverage workbook. |
| [why-a-second-evidence-check.md](guidelines/why-a-second-evidence-check.md) | The answer to "the guidelines are already sourced, why check the evidence again?" |
| [guideline-triage-differences.html](guidelines/guideline-triage-differences.html) | Comparison of the manual colour marking of the 128-guideline spreadsheet against the Research Approach v2 triage. |
| [rating-reaudit-llm-13oct.xlsx](guidelines/rating-reaudit-llm-13oct.xlsx) | An LLM re-audit of the ratings (13 Oct). AI-assisted; **not an independent human rater**. |

Notes before citing anything from the catalogue are on its last page ("Check before citing"); CAP 1.2 and NeuroAdaptX are now checked (see [related-work/task1-leftover-checks.md](related-work/task1-leftover-checks.md)).

## related-work/

| File | What it is |
| --- | --- |
| [related-work-notes.md](related-work/related-work-notes.md) | Checked facts with page numbers on NeuroAdaptX, Tielman et al. 2024 and Madugalla et al. 2025 (checked on the page, 11 Oct), plus three draft related-work paragraphs. |
| [task1-leftover-checks.md](related-work/task1-leftover-checks.md) | CAP 1.2 certainty wording and NeuroAdaptX claims, checked against the sources on 6 Oct 2026, with the corrections they caused. |
| [gemini-ai-drafts/](related-work/gemini-ai-drafts/) | Gemini outputs on the three papers (9 Oct). AI drafts; checked facts are in related-work-notes.md. |
