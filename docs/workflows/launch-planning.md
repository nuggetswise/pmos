# Launch Planning Workflow

## Overview

This workflow helps you create a comprehensive go-to-market (GTM) plan in 60-90 minutes. Run this when preparing to launch a product or major feature to ensure it lands, not just launches. The plan covers market context, positioning, launch phases, enablement, and success criteria.

**Why this matters:** Products that launch without GTM plans often fail silently - engineering ships, but customers don't adopt. GTM ensures cross-functional readiness, clear messaging, and measurable success criteria.

## When to Use This Workflow

- **Approved charter ready for launch** - Charter moving to execution phase
- **New product or major feature shipping** - Significant customer-facing launch
- **Entering new market segment** - Expanding to new customer type or geography
- **Repositioning existing product** - Changing positioning or target audience
- **4-6 weeks before planned launch** - Enough time to prepare enablement

## Prerequisites

The `planning-gtm-launch` skill works best with fresh, up-to-date context. Before you begin, ensure you have:

-   A clear **charter or PRD** for what is being launched.
-   A **target launch date** and **target customer segment**.
-   (Optional but helpful) Current `competitive-analysis`, `voc-synthesis`, and `stakeholder-map` outputs.

Use `pm-os status` to check if your prerequisites are stale.

## Time Breakdown

| Step | Activity | Time |
| --- | --- | --- |
| 1 | Check prerequisite status | 5 min |
| 2 | Define scope & gather new context | 10 min |
| 3 | Run /gtm (Generate GTM Plan) | 10 min |
| 4 | Review and refine plan | 15 min |
| 5 | Align with cross-functional teams | Variable |
| **Total** | | **~40 min+** |

## Step-by-Step Process

### Step 1: Check Prerequisite Status

**Action:** Before planning a launch, ensure your understanding of the product and market is current.

1.  **Check Status:**
    ```bash
    pm-os status
    ```
    This command will show if key inputs—like the `charter` for the launch, `voc-synthesis`, or `competitive-analysis`—are stale.

2.  **Refresh if Needed:**
    If any key inputs are stale, refresh them first by re-running the appropriate skill (e.g., `/voc`, `/charters`). A GTM plan based on outdated customer feedback or an old charter will be ineffective.

**Why this step matters:** Launching a product based on a 3-month-old understanding of customer pain is a recipe for failure.

**Time:** ~5 minutes

### Step 2: Define Scope & Gather New Context

**Action:** Define what you're launching and gather any new market context that isn't already in the system.

1.  **Define Scope:**
    Be clear about what you're launching, when, and for whom. This context is critical for the `/gtm` skill.
    ```
    "Create GTM plan for Real-Time Catalog Sync.
    Charter: outputs/roadmap/Q1-2026-charters.md (Charter 1)
    Target launch: March 15, 2026
    Target customer: Mid-market retailers (50K-200K SKUs)"
    ```

2.  **Add New Market Research (if any):**
    If you have new market research, analyst reports, or beta customer feedback, place those files into an `inputs/` subdirectory (e.g., `inputs/market-research/`).

3.  **Scan New Inputs:**
    If you added new files, run `pm-os scan` to make them available to the GTM skill.
    ```bash
    pm-os scan
    ```

**Why this step matters:** A GTM plan is only as good as its inputs. This step ensures the plan is based on both the existing, validated knowledge in the system and any brand-new external research.

**Time:** ~10 minutes

### Step 3: Run /gtm (Generate GTM Plan)

**Action:** Generate the comprehensive GTM launch plan using the `planning-gtm-launch` skill.

```
/gtm "Create GTM plan for Real-Time Catalog Sync..."
```
*(Use the detailed prompt from the previous step)*

**What happens:**
- PM OS reads the specified charter/PRD and latest context (VOC, competitive analysis, etc.).
- It defines the positioning, value proposition, messaging, launch phases, and enablement checklist.
- It writes the GTM plan to `outputs/gtm/gtm-[initiative]-YYYY-MM-DD.md`.

**Time:** ~10 minutes

### Step 4: Review and Refine the GTM Plan

**Action:** Read the generated plan carefully. Validate the positioning, messaging, launch phases, and success metrics. The AI provides a strong first draft; your job is to refine it with your strategic judgment.

**What to review:**
-   **Positioning:** Is the value proposition crisp and specific?
-   **Enablement:** Are all cross-functional teams (Sales, CS, Marketing, Legal) accounted for in the checklist?
-   **Metrics:** Are the success criteria specific and measurable (e.g., "500 signups in Week 1," not "increase signups")?

Use the AI to refine vague sections. For example:
`"Refine the success criteria to include specific, quantified targets for leading and lagging indicators."`

**Time:** ~15 minutes

### Step 5: Align with Cross-Functional Teams

**Action:** Share the GTM plan document with stakeholders from Sales, CS, Marketing, and Engineering to get their feedback and buy-in.

**Use an async-first approach:**
Share the generated `outputs/gtm/...` file and ask for feedback on the timeline, deliverables, and risks from their perspective. This is a critical step to ensure all teams are ready and committed for launch day.

**Time:** Variable

## Expected Outputs After Completion

**Files created:**
-   `outputs/gtm/gtm-[initiative]-YYYY-MM-DD.md`

**You now have:**
-   A comprehensive and evidence-based Go-to-Market plan.
-   A clear checklist to ensure all cross-functional teams are ready for launch.
-   Alignment with stakeholders on the launch strategy and success criteria.

## Troubleshooting

### Issue: "Unclear launch scope - charter is vague"

**Solution:** The GTM skill needs a clear definition of what's launching. If the source charter is too high-level, create a small, temporary document that specifies the exact scope for the launch before running the `/gtm` skill.

### Issue: "Missing competitive analysis"

**Solution:** A strong GTM plan requires competitive context. If `pm-os status` shows your competitive analysis is stale or missing, it's highly recommended to run the `competitive-analysis` skill before generating the GTM plan.

## Next Steps

1.  **GTM Plan Approved:** Begin executing the pre-launch activities in the enablement checklist.
2.  **Launch Complete:** After the launch, use the [Post-Launch Review Workflow](./post-launch-review.md) to compare your predicted vs. actual results.

## See Also

-   [Post-Launch Review Workflow](./post-launch-review.md)
-   [Quarterly Strategy Workflow](./quarterly-strategy.md)
-   [skills/planning-gtm-launch/SKILL.md](../../skills/planning-gtm-launch/SKILL.md)