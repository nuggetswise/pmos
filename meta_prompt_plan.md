# Plan: Implementing the Meta-Prompt Reasoning Framework

## 1. Overview

### Objective
To enhance the reasoning quality and output transparency of complex AI skills by explicitly instructing them to follow a structured, 10-step problem-solving algorithm (the "PAI Algorithm").

### Goal
Make the AI's internal "thought process" a visible and structured part of its final output for key strategic skills. This improves user trust, makes the AI's reasoning verifiable, and increases the robustness of the generated artifacts. This change will not affect the user's workflow or commands.

### Strategy
A phased rollout, beginning with a single, high-impact skill (`writing-product-strategy`) as a pilot. Once validated, this "meta-prompt" pattern can be applied to other complex skills.

---

## 2. Phase 1: Pilot Implementation

**Objective:** Implement and validate the meta-prompt pattern on a single, complex skill.

### Task 1.1: Select Pilot Skill

*   **Action:** The `writing-product-strategy` skill is selected as the pilot.
*   **Rationale:** This is one of the most complex and high-value skills in the system. Its output will benefit the most from a transparent and structured reasoning process.
*   **Acceptance Criteria:** The pilot skill is formally identified for this plan.

### Task 1.2: Create the Canonical Algorithm Definition

*   **Action:** Create a new core rule file at `.claude/rules/pm-core/pai_algorithm.md`.
*   **Content:** This file will serve as the single source of truth for the algorithm. It will contain the following text:
    ```markdown
    # The PAI 10-Step Reasoning Algorithm
    
    1.  **Understand:** Clearly define the core request and problem.
    2.  **Goals:** Determine the primary, measurable objectives and desired outcomes.
    3.  **Deconstruct:** Break the problem down into its smaller, constituent parts.
    4.  **Context:** Gather relevant information, facts, and constraints from provided sources.
    5.  **Ideate:** Brainstorm a wide range of potential solutions or approaches.
    6.  **Filter:** Evaluate the brainstormed ideas against the goals and constraints.
    7.  **Select:** Choose the most promising option(s) to move forward with.
    8.  **Plan:** Create a clear, sequenced plan of action.
    9.  **Execute:** Perform the plan and generate the required artifact.
    10. **Learn:** Reflect on the process and outcome to identify potential improvements for the future.
    ```
*   **Acceptance Criteria:** The `pai_algorithm.md` file is created and contains the canonical 10-step definition.

### Task 1.3: Update the Pilot Skill Prompt

*   **Action:** Modify the skill file `skills/writing-product-strategy/SKILL.md`.
*   **Action:** Insert a new instruction at the beginning of the main "Core Pattern" section.
*   **New Instruction Text:**
    > "Before generating the strategy document, you must first explicitly reason through the request using the 10-step PAI algorithm defined in `.claude/rules/pm-core/pai_algorithm.md`.
    >
    > Structure the beginning of your output to show this reasoning process. For example:
    >
    > ```
    > ## Strategic Reasoning Process
    >
    > ### 1. Understood Goal
    > The primary goal is to generate a 3-year product strategy...
    >
    > ### 2. Deconstruction
    > To achieve this, I will analyze three key areas: Market Opportunity, Competitive Landscape, and Internal Capabilities...
    > ```
    >
    > After outlining this reasoning process, proceed with generating the full strategy document as requested."
*   **Acceptance Criteria:** The prompt for the `writing-product-strategy` skill is updated with this new directive.

---

## 3. Phase 2: Verification and Rollout

**Objective:** Verify the success of the pilot and apply the pattern to other relevant skills.

### Task 2.1: Manual Verification

*   **Action:** Execute the pilot skill by running the `/strategy` command.
*   **Action:** Review the generated output document.
*   **Acceptance Criteria:** The output document begins with the new "Strategic Reasoning Process" section, which clearly outlines the AI's thought process according to the 10 steps. The quality and coherence of the final strategy are maintained or improved.

### Task 2.2: Future Rollout

*   **Action (Placeholder):** Once the pilot is deemed successful, this same meta-prompt pattern can be applied to other complex skills.
*   **Candidate Skills for Future Rollout:**
    *   `planning-gtm-launch`
    *   `generating-quarterly-charters`
    *   `competitive-analysis`
*   **Effort per Skill:** The effort to update each subsequent skill is considered **Small (S)**.
