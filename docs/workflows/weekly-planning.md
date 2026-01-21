# Weekly Planning Workflow

## Overview

This workflow helps you generate or refine quarterly charters in 15-20 minutes per week. Run this weekly to keep your strategic roadmap aligned with customer reality, or when priorities shift mid-quarter.

**Why this matters:** Charters define your strategic bets - the 3-5 initiatives that will move the needle this quarter. Weekly refinement prevents drift from customer needs and surfaces new opportunities as they emerge.

## When to Use This Workflow

- **Weekly planning session** (recommended) - Every Monday or Friday
- **Start of new quarter** - Generate Q1/Q2/Q3/Q4 charters
- **Mid-quarter adjustment** - Priorities shifted, need to re-plan
- **After major customer feedback** - Strategic theme emerged from VOC
- **Before stakeholder reviews** - Need updated roadmap for alignment meeting
- **When charters are stale** - Foundation outputs (VOC, KTLO) have changed

## Prerequisites

To generate meaningful charters, you need up-to-date foundation outputs. The `generating-quarterly-charters` skill relies on:

-   **VOC Synthesis** (`outputs/insights/voc-synthesis-*.md`)
-   **KTLO Triage** (`outputs/ktlo/ktlo-triage-*.md`)
-   **Truth Base** (`outputs/truth_base/truth-base.md`)

Use the `pm-os status` command to check if these are current.

## Time Breakdown

| Step | Activity | Time |
| --- | --- | --- |
| 1 | Check for and refresh stale data | 5-10 min |
| 2 | Run /charters | 5 min |
| 3 | Review and identify bets | 5 min |
| 4 | Validate metrics | 2 min |
| 5 | Review with stakeholders | Variable |
| 6 | Refine and re-run | 5 min |
| **Total** | | **~25 min** |

## Step-by-Step Process

This process ensures your strategic charters are always based on the most recent customer and system data.

### Step 1: Ensure Foundation Outputs are Current

**Action:** Use `pm-os status` to check if your core data sources (VOC, KTLO) are stale. If they are, refresh them.

1.  **Check Status:**
    ```bash
    pm-os status
    ```
    The CLI will report any stale outputs. If your `voc-synthesis` or `ktlo-triage` files are listed as stale, they need to be refreshed before you can generate meaningful charters.

2.  **Place New Raw Data (if needed):**
    If your sources are stale, it's because new raw data is available. Make sure any new Jira exports, interview notes, or other data are placed in the correct `inputs/` subdirectories (`inputs/jira/`, `inputs/voc/`, etc.).

3.  **Scan and Refresh:**
    If you added new files, run a scan. Then, re-run the skills needed to update your foundation outputs.
    ```bash
    # Ingest the new raw data
    pm-os scan

    # Now, re-run the skills to update the outputs
    /voc
    /ktlo
    ```

**Why this step matters:** Charters are only as good as their inputs. Generating charters from stale VOC or KTLO reports leads to a strategy that is disconnected from current customer reality.

**Time:** ~5-10 minutes (if refreshing is needed)

### Step 2: Run /charters (Generate Quarterly Charters)

**Action:** Once your foundation outputs are fresh, generate the strategic bets for the quarter.

```
/charters
```

**What happens:**
- PM OS reads the latest `voc-synthesis`, `ktlo-triage`, and `truth-base`.
- It analyzes the fresh data for strategic opportunities.
- It generates 3-5 charter-level bets with problem statements, evidence, success metrics, risks, and dependencies.
- The output is written to `outputs/roadmap/Q_-YYYY-charters.md`.

**Time:** ~5 minutes

### Step 3: Review and Identify 3-5 Strategic Bets

**Action:** Read the generated charter document and confirm the prioritization and count of the strategic bets. Aim for 3-5 bets per quarter to maintain focus.

```bash
# Open the latest charter file for review
ls -lt outputs/roadmap/ | head -n 2
```

**What to look for:**
-   **Clarity:** Is the problem statement clear and backed by evidence from the fresh VOC/KTLO reports?
-   **Focus:** Are there 3-5 bets, or is the plan trying to do too much?
-   **Impact:** Do the bets clearly address the most significant opportunities identified in your foundation outputs?

If you have too many charters, prioritize them based on customer impact and feasibility, and defer the rest to the next quarter.

**Time:** ~5 minutes

### Step 4: Validate Metrics (Baseline + Target)

**Action:** For each charter, verify that the success metrics are specific, measurable, and have a clear baseline and target.

**Good metrics:**
- ✅ "Baseline: Sync runs once per day" → Specific, measurable
- ✅ "Target: Sync runs in <5 seconds on-demand" → Specific, measurable

**Bad metrics:**
- ❌ "Improve catalog performance" → Vague, not measurable

If metrics are vague, edit the charter file manually or use the AI to refine them based on more specific goals.

**Time:** ~2 minutes

### Step 5: Review with Stakeholders

**Action:** Share the generated charters with your engineering lead, manager, and other stakeholders to get alignment on priorities and feasibility.

**Use an async-first approach:**
```markdown
Q1 Charters draft ready for review:

1.  Real-Time Catalog Sync (Est: 10 weeks, Unblocks 3 major accounts)
2.  Bulk Editing Tools (Est: 3 weeks, Addresses 23 survey mentions)

Full doc: [path to outputs/roadmap/Q_...-charters.md]

Please provide feedback on priorities and feasibility by EOD Friday.
```

**Why this step matters:** Charters are your team's contract for the quarter. Alignment upfront prevents mid-quarter thrash and resource conflicts.

**Time:** Variable

### Step 6: Refine and Re-Run If Needed

**Action:** Incorporate stakeholder feedback and regenerate or edit the charters.

If feedback requires significant changes (e.g., changing priorities, adding new constraints), re-run the `/charters` skill with additional context. For minor tweaks, edit the file directly.

```
"Re-run /charters with this constraint: The 'Real-Time Sync' charter must not require any platform team dependencies."
```

**Time:** ~5 minutes

## Expected Outputs After Completion

**Files created:**
1.  `outputs/roadmap/Q1-YYYY-charters.md` - Strategic bets for the quarter

**Versioned copy:**
-   `history/generating-quarterly-charters/Q1-YYYY-charters-YYYY-MM-DD.md`

**You now have:**
-   3-5 strategic bets for the quarter, based on fresh data.
-   Evidence-backed problem statements.
-   Measurable success metrics.
-   Stakeholder alignment on priorities.

## Common Variations

### New Quarter vs Mid-Quarter Adjustment

**New quarter (Q1 start):**
- Generate fresh charters from scratch.
- Set quarterly OKRs aligned to the new charters.
- **Time:** 30 minutes (includes stakeholder alignment).

**Mid-quarter adjustment:**
- Read existing charters and identify what's changed (e.g., a bet is blocked).
- Re-run `/charters` with context: "Charter 2 is blocked, propose alternatives based on the latest VOC."
- Focus on the delta, not a full regeneration.
- **Time:** 15 minutes.

## Troubleshooting

### Issue: "Stale dependencies reported"

**Problem:** `pm-os status` reports that your foundation outputs are stale.

**Solution:** This is the intended workflow. Follow Step 1 to refresh the stale outputs (`/voc`, `/ktlo`) before you run `/charters`. This ensures your strategy is based on the latest data.

### Issue: "Too many charters generated (6+)"

**Problem:** `/charters` generated 7 strategic bets. The team can't deliver that many.

**Solution:** Use your judgment to prioritize. Ask the AI to rank them, or manually edit the document to defer the lower-priority bets to the next quarter. The AI proposes, you decide.

### Issue: "Charters don't align with product strategy"

**Problem:** The generated charters are tactically sound but don't ladder up to the long-term product strategy.

**Solution:** Add strategic context when you run the skill.
```
"Re-run /charters with this strategic constraint: Focus on charters that advance our 'Self-Service Onboarding' pillar from the 2026 product strategy."
```

## Next Steps

After completing weekly planning:

1.  **Charters approved** → Write PRDs: "Run writing-prds-from-charters for Charter 1"
2.  **Charters need engineering validation** → Schedule a tech spike and revisit next week.
3.  **Charters reveal dependency** → Engage the cross-functional partner (e.g., platform, design).

## See Also

-   [Daily Routine Workflow](./daily-routine.md) - How to keep your foundation outputs fresh.
-   [Quarterly Strategy Workflow](./quarterly-strategy.md) - How to align charters to a long-term strategy.
-   [skills/generating-quarterly-charters/SKILL.md](../../skills/generating-quarterly-charters/SKILL.md) - The full charter generation skill pattern.
-   [outputs/README.md](../../outputs/README.md) - Understanding dependencies and staleness.