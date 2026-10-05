# Why check the evidence again?

The question a reviewer or supervisor may ask: *"The 128 guidelines already come from previous research. Why did you run a separate evidence check for them?"*

## Answer

The 128 guidelines are sourced, but their sources answer a different question from ours. They show that something helps people with cognitive impairments **use an interface or follow a warning**. We apply the same guidelines to something they were never written for: **explaining an ML prediction**. That move is our assumption. As the Research Approach says, none of the 49 source papers discusses AI explanations.

So the second check doesn't re-justify the guidelines. It tests whether the assumption holds: is there evidence this property changes how people understand an explanation, a probability or a warning?

- **Direct:** the assumption is supported.
- **Indirect:** partly supported. It works for interfaces or for this population, and applying it to explanations is our inference.
- **None found:** pure inference, and we label it that way. Our own rules require every requirement to be marked as stated by a source or inferred by us.

**In one line:** the original sources justify the guideline; our check justifies using it for explanations.

## Where this is used

- Research Approach v3, Task 1: "Why check the evidence again" ([research-approach-v3.md](research-approach-v3.md))
- The evidence catalogue: 50 guidelines, 38 Direct, 9 Indirect, 3 none found ([xai-guideline-evidence-catalogue.pdf](xai-guideline-evidence-catalogue.pdf))
- The three guidelines with no backing (G20, G42, G65) are listed in the Research Approach, Task 3, "Guidelines without published backing (3)"
