# Post-Launch Review Workflow

## Overview

This workflow helps you conduct post-launch retrospectives in 45-60 minutes at 30, 60, or 90 days after launch. Compare predicted vs actual outcomes, analyze what worked and what didn't, extract lessons learned, and update PM OS processes to improve future launches. Closes the "Learn → Improve" loop.

**Why this matters:** PMs who don't review launch outcomes repeat the same mistakes. This workflow builds calibration - you learn which predictions are accurate, which instincts are wrong, and which processes need improvement.

## When to Use This Workflow

- **30 days post-launch** - Early signal review (leading indicators)
- **60 days post-launch** - Mid-term review (adoption trends emerging)
- **90 days post-launch** - Full review (business outcomes clear)
- **After clear success or failure** - Learn from extremes (what made it succeed/fail?)
- **Quarterly retrospectives** - Review all launches from past quarter
- **Before next launch** - Apply lessons from previous launch

## Prerequisites

**Required:**
-   **Original GTM plan or charter** (`outputs/gtm/` or `outputs/roadmap/`)
-   **Launch date**
-   **Actual metrics** (from analytics dashboards, CRM, etc.)
-   **Qualitative feedback** (from customer interviews, surveys, support)

Use `pm-os status` to find the path to the original GTM plan and verify it's the correct version.

## Time Breakdown

| Step | Activity | Time |
| --- | --- | --- |
| 1 | Gather data and scan inputs | 10 min |
| 2 | Review original predictions | 5 min |
| 3 | Run /review skill | 10 min |
| 4 | Analyze results and extract lessons | 15 min |
| 5 | Share and apply learnings | 15 min |
| **Total** | | **~55 min** |

## Step-by-Step Process

### Step 1: Gather Data and Scan Inputs

**Action:** Collect the actual quantitative and qualitative data from your launch.

1.  **Gather Quantitative Metrics:**
    Collect your actual launch metrics from your analytics dashboards, CRM, and financial reports. This includes:
    -   **Leading indicators:** Signups, Demos, Trials, Early Usage
    -   **Lagging indicators:** Revenue, Paying Customers, Retention, NPS

2.  **Place Qualitative Feedback in `inputs/`:**
    Gather all qualitative feedback from customer interviews, surveys, and support tickets.
    -   Place these documents into a relevant subdirectory, like `inputs/voc/launch-feedback-[initiative]/`.
    -   For example: `inputs/voc/launch-feedback-real-time-sync/interview-1.md`.

3.  **Scan New Inputs:**
    Run `pm-os scan` to make the new qualitative feedback available to the system.
    ```bash
    pm-os scan
    ```

**Why this step matters:** You can't compare predicted vs. actual without the "actual." This step brings the ground truth of your launch into the system.

**Time:** ~10 minutes

### Step 2: Review Original Predictions

**Action:** Read the original GTM plan or charter to find the predicted metrics and outcomes.

```bash
# Find the original GTM plan using `pm-os status` or `ls`
cat outputs/gtm/gtm-real-time-sync-2026-01-16.md
```

Extract the `Success Criteria` and any key `Assumptions` that were made. You will provide these to the `/review` skill.

**Why this step matters:** This step establishes the baseline for your review. Without predictions, you can't measure how well you predicted the outcome.

**Time:** ~5 minutes

### Step 3: Run /review (Generate Launch Review)

**Action:** Run the `learn --launch` skill to generate the analysis.

**Provide the skill with the context it needs in your prompt:**
```
"Run learn --launch for the 'Real-Time Catalog Sync' launch.

- Launch Date: March 15, 2026
- Review Period: 30 days post-launch
- Original Plan: outputs/gtm/gtm-real-time-sync-2026-01-16.md

Predicted Metrics:
- Signups Week 1: 500
- Demos Month 1: 50
- Revenue Q1: $50K

Actual Metrics:
- Signups Week 1: 320
- Demos Month 1: 62
- Revenue Q1: $35K

The system will also read the qualitative feedback you scanned from `inputs/voc/launch-feedback-[initiative]/`."
```

**What happens:**
- PM OS reads the original plan and the new data you provided.
- It compares predicted vs. actual metrics and calculates the variance.
- It analyzes successes and failures, looking for root causes.
- It generates a full review document in `outputs/reviews/launch-review-[initiative]-YYYY-MM-DD.md`.

**Time:** ~10 minutes

### Step 4: Analyze, Learn, and Plan Updates

**Action:** Read the generated review document. Your role is to analyze the findings, identify the most important lessons, and decide on concrete process improvements.

**What to look for:**
-   **Calibration:** Where were your predictions most wrong (e.g., you consistently overestimate signups but underestimate demo conversions)?
-   **Root Causes:** For the biggest failures, what was the true root cause? (Use the "5 Whys" technique described in the output).
-   **Process Gaps:** What broke in the process that allowed a failure to happen?
-   **Actionable Lessons:** What is a specific, concrete change you can make to a skill, template, or quality gate to prevent this failure next time?

**Example Lesson & Action:**
-   **Lesson:** Marketing wrote generic email copy because they didn't have customer context.
-   **Action:** Update the `planning-gtm-launch` skill to include a new step: "Share VOC synthesis with the marketing team 4 weeks pre-launch."

**Time:** ~15 minutes

### Step 5: Share and Apply Learnings

**Action:** Share the review with the team and, most importantly, apply the process updates you identified.

1.  **Share the `outputs/reviews/...` document** with stakeholders for feedback and alignment.
2.  **Update the PM OS:** Open the relevant skill or rule files and make the changes you identified. For example, open `skills/planning-gtm-launch/SKILL.md` and add the new step for sharing VOC with marketing.

**Why this step matters:** This is the most important step. A lesson is only truly learned when it is encoded into the process to prevent the same mistake from happening again.

**Time:** ~15 minutes

## Expected Outputs After Completion

**Files created:**
-   `outputs/reviews/launch-review-[initiative]-YYYY-MM-DD.md`

**Updated files:**
-   The skill, rule, or template files that you updated with your learnings.

**You now have:**
-   A clear, data-driven understanding of your launch's performance.
-   Actionable insights into what to do more of and what to fix.
-   An improved PM OS that is smarter for your next launch.

## Troubleshooting

### Issue: "Insufficient data - can't measure actual metrics"

**Solution:** This is a key learning in itself. The fix is to update your `planning-gtm-launch` workflow to include a mandatory step: "Define success metrics and confirm tracking is in place *before* launch."

### Issue: "No GTM plan exists - can't compare predicted vs actual"

**Solution:** Another critical lesson. For the current review, you can reconstruct the *implied* predictions from the original charter. For the future, the fix is ensuring the `launch-planning` workflow is always run before a launch.

## See Also

-   [Launch Planning Workflow](./launch-planning.md)
-   [Daily Routine Workflow](./daily-routine.md)
-   [skills/learn/SKILL.md](../../skills/learn/SKILL.md) (--launch mode)