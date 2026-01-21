# Quarterly Strategy Workflow

## Overview

This workflow helps you create a comprehensive 3-5 year product strategy in 60-90 minutes. Run this annually or bi-annually to define your vision, strategic pillars, capability roadmap, and competitive moats. The strategy connects daily tactical work to long-term direction.

**Why this matters:** Without strategy, quarterly charters become a collection of tactical bets with no coherent direction. Strategy provides the "why" that aligns your team and creates defensible competitive positioning.

## When to Use This Workflow

- **Annual planning cycle** - Start of year or fiscal year
- **New product launch** - Entering a new market or product area
- **Major pivot or repositioning** - Market changes require strategic reset
- **Board/investor presentations** - Need multi-year vision narrative
- **Strategy refresh** - Existing strategy is stale (12-18 months old)
- **Connecting charters to vision** - Quarterly work feels disconnected from long-term goals

## Prerequisites

This skill synthesizes information from other high-level outputs. Before running it, ensure you have fresh versions of:

-   Recent quarterly charters (`outputs/roadmap/`)
-   Recent VOC synthesis (`outputs/insights/voc-synthesis-*.md`)
-   Truth base (`outputs/truth_base/truth-base.md`)
-   Competitive analysis (`outputs/insights/competitive-analysis-*.md`)

Use `pm-os status` to check if these foundation documents are up-to-date.

## Time Breakdown

| Step | Activity | Time |
| --- | --- | --- |
| 1 | Ensure foundation outputs are current | 5-10 min |
| 2 | Define scope and horizon | 5 min |
| 3 | Run writing-product-strategy | 10 min |
| 4 | Review and validate | 15 min |
| 5 | Refine and regenerate | 10 min |
| 6 | Share with stakeholders | Variable |
| **Total** | | **~50-60 min** |

## Step-by-Step Process

This process ensures your long-term strategy is grounded in the latest, validated information from your PM OS.

### Step 1: Ensure Foundation Outputs are Current

**Action:** Before building a long-term strategy, check that your understanding of the present is up-to-date.

1.  **Check Status:**
    ```bash
    pm-os status
    ```
    This command will show if key inputs to the strategy skill—like `voc-synthesis`, `ktlo-triage`, `truth-base`, or `competitive-analysis`—are stale.

2.  **Refresh Stale Outputs:**
    If any of the foundational outputs are stale, follow the appropriate workflow to refresh them first. For example:
    -   If `voc-synthesis` is stale, run the [Daily Routine Workflow](./daily-routine.md).
    -   If `competitive-analysis` is stale, run the `competitive-analysis` skill.

3.  **Add New Research:**
    If you have new market research, analyst reports, or other external documents, place them in `inputs/strategy-docs/` and run `pm-os scan` to make them available to the system.

**Why this step matters:** A strategy built on stale data is a guess. This step ensures your strategic inputs reflect the current reality of your customers, competitors, and product.

**Time:** ~5-10 minutes

### Step 2: Define Scope, Horizon, and Context

**Action:** Tell the AI what the strategy is for and what information to use.

**Example prompt:**
```
"Create a 3-year product strategy for the 'Business Network + Catalogs' product line.

Base the strategy on the most recent outputs for:
- Quarterly Charters
- VOC Synthesis
- Truth Base
- Competitive Analysis

Also consider the following market trend: AI-driven catalog validation is becoming standard and will be table stakes by 2028."
```

**Why this step matters:** Vague scope leads to vague strategy. Clearly defining the product area, time horizon, and key inputs focuses the output.

**Time:** ~5 minutes

### Step 3: Run /strategy (Generate Product Strategy)

**Action:** Generate the multi-year product strategy.

```
/strategy
```
*(Or use the more detailed prompt from the previous step)*

**What happens:**
- PM OS reads the latest versions of the specified outputs.
- It analyzes trends, opportunities, and threats to define a vision.
- It generates 3-5 strategic pillars, a capability roadmap, and defensible moats.
- The output is written to `outputs/strategy/product-strategy-YYYY.md`.

**Time:** ~10 minutes

### Step 4: Review and Validate the Generated Strategy

**Action:** Read the generated strategy and validate its structure, pillars, and metrics.

**Validation Checklist:**
-   [ ] **Vision:** Is the vision statement clear, specific, and inspiring?
-   [ ] **Pillars:** Are there 3-5 pillars? Are they distinct and meaningful? Are they capabilities, not features?
-   [ ] **Metrics:** Does each pillar have a measurable "Success Looks Like" state for the target year?
-   [ ] **Moats:** Are the competitive moats defensible (e.g., network effects, data, switching costs), not just temporary advantages (e.g., "better UX")?
-   [ ] **Cascade:** Does the document clearly explain how the strategy will cascade down to quarterly charters?

**Why this step matters:** The first draft is a starting point. Your strategic judgment is required to refine the AI's output into a winning plan.

**Time:** ~15 minutes

### Step 5: Refine and Regenerate

**Action:** Use your insights from the review to refine the strategy.

**Example Refinement Prompts:**
-   `"Strengthen the competitive moats section by focusing on how our data assets create a compounding advantage."`
-   `"Rewrite Pillar 2, 'Better UX,' to be a measurable capability like 'Zero-Training Onboarding' with a target of 80% task completion without support."`
-   `"Re-run the strategy, but add a constraint that it must align with the company's top-level OKR of expanding into the mid-market segment."`

Run the `/strategy` skill again with these new constraints.

**Time:** ~10 minutes

### Step 6: Share with Stakeholders

**Action:** Present the strategy to leadership, engineering leads, and other key stakeholders for feedback and buy-in.

Use an async-first approach by sharing the generated document, then schedule a meeting to discuss and align.

**Why this step matters:** Strategy only works if the team is aligned and committed to it.

**Time:** Variable

## Expected Outputs After Completion

**Files created:**
1.  `outputs/strategy/product-strategy-YYYY.md` - Your 3-5 year product strategy.

**Versioned copy:**
-   `history/writing-product-strategy/product-strategy-YYYY-MM-DD.md`

**You now have:**
-   A clear, defensible, and actionable multi-year product strategy.
-   Alignment with your team and leadership on the long-term direction.

## Next Steps

-   **Strategy Approved:** Use the strategy to guide your next [Weekly Planning Workflow](./weekly-planning.md), ensuring your quarterly charters align with the strategic pillars.
-   **Gaps Identified:** If the strategy process reveals gaps in your knowledge (e.g., weak competitive analysis), prioritize running the skills to fill them.

## See Also

-   [Weekly Planning Workflow](./weekly-planning.md) - To align quarterly charters to your new strategy.
-   [Daily Routine Workflow](./daily-routine.md) - To gather the ongoing signals that will inform future strategy refreshes.
-   [skills/writing-product-strategy/SKILL.md](../../skills/writing-product-strategy/SKILL.md) - The full strategy creation skill pattern.