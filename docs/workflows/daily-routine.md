# Daily Routine Workflow

## Overview

This workflow helps you stay connected to customer reality in 10-30 minutes per day. Run this every morning (or at your preferred time) to triage support work, synthesize customer feedback, and generate stakeholder updates.

**Why this matters:** Daily practice keeps you grounded in real customer pain, prevents backlog buildup, and maintains stakeholder alignment. Think of this as your PM "pulse check."

## When to Use This Workflow

- **Every morning** (recommended) - Start your day with customer context
- **Every evening** - End your day by documenting what you learned
- **Weekly minimum** - If daily is too much, run this weekly
- **After customer calls** - Capture insights while they're fresh
- **Before planning sessions** - Ground decisions in recent customer data

## Prerequisites

**Required:**
- Access to Jira (or support ticket system)
- Customer feedback sources (emails, calls, surveys, Slack)

**Optional but helpful:**
- Previous day's KTLO triage (for comparison)
- Previous VOC synthesis (to track theme evolution)

## Time Breakdown

| Step | Activity | Time |
|------|----------|------|
| 1-2 | Export and triage KTLO | 10 min |
| 3 | Review patterns | 2 min |
| 4-5 | Add and synthesize VOC | 10 min |
| 6 | Review pain points | 3 min |
| 7-8 | Generate and share exec update | 5 min |
| **Total** | | **30 min** |

Speed up by batching steps 1-2 (KTLO) or running less frequently.

## Step-by-Step Process

This updated process gathers all inputs first, runs a single scan to ingest them, and then uses skills to analyze the fresh data. This is more efficient and aligns with the PM OS architecture.

### Step 1: Place Your Raw Data Files in `inputs/`

**Action:** Gather your raw data from the last 24 hours and place it in the correct `inputs/` subdirectories. The `pm-os scan` tool will find and process them automatically.

1.  **Export Jira Tickets:**
    *   Go to Jira and export your support tickets (bugs, requests, escalations) from the last 24 hours as a CSV file.
    *   Place the file in `inputs/jira/`. For example: `inputs/jira/tickets-2026-01-15.csv`.

2.  **Save Customer Feedback:**
    *   Collect any new customer feedback from emails, call transcripts, surveys, or Slack.
    *   Save each source as a separate text or markdown file.
    *   Place the files in `inputs/voc/`. For example: `inputs/voc/interview-acme-corp.md` or `inputs/voc/survey-notes.txt`.

**Why this step matters:** This is the "Observe" phase. You are collecting the raw reality of your customers and your system from the past day. The system can't analyze what it can't see.

**Time:** ~5-10 minutes (depending on export/gathering time)

### Step 2: Scan Inputs to Update the System

**Action:** Run the `pm-os scan` command to make the system aware of the new files you just added.

```bash
pm-os scan
```

**What happens:**
- The `nexa` CLI finds all new or modified files in the `inputs/` directory.
- It extracts their content and updates the central state in `nexa/state.json`.
- Any outputs that depend on these sources are now marked as "stale."

**Why this step matters:** This is the critical ingestion step that makes your raw data available to all other skills. You must run `scan` after adding new files.

**Time:** ~1 minute

### Step 3: Run Skills to Analyze Fresh Data

Now that the system has the latest data, you can run the analytical skills.

1.  **Triage Support Backlog:**
    ```
    /ktlo
    ```
    This skill reads the newly scanned Jira data, triages tickets, and creates a report in `outputs/ktlo/`.

2.  **Synthesize Customer Feedback:**
    ```
    /voc
    ```
    This skill reads the newly scanned VOC files, identifies themes and pain points, and creates a report in `outputs/insights/`.

**Why this step matters:** These skills transform raw data into structured insights, forming the basis for your daily plan and stakeholder updates.

**Time:** ~5-10 minutes

### Step 4: Review Outputs for Key Patterns

**Action:** Read the generated reports to understand the key takeaways from the day.

```bash
# View latest triage report
ls -lt outputs/ktlo/ | head -n 2

# View latest VOC synthesis
ls -lt outputs/insights/ | head -n 2
```

**What to look for:**
- **KTLO:** What are the most urgent (P0) issues? Are there new bug patterns?
- **VOC:** What are the top customer pain points? Are there direct quotes you can use?
- **Combined:** Do the KTLO themes and VOC themes reinforce each other? (e.g., customers are complaining about sync, and you see 12 sync-related bugs).

**Why this step matters:** This is where you connect the dots and form an opinion. The reports provide data; this step is where you find the story.

**Time:** ~5 minutes

### Step 5: Generate and Share an Executive Update

**Action:** Use the generated insights to create a summary for your team and stakeholders.

```
/exec-update
```

**What happens:**
- This skill reads the fresh `ktlo` and `voc` outputs you just created.
- It synthesizes them into a single, scannable summary.
- The report is saved to `outputs/exec_updates/`.

**Final action:** Copy the content of the executive update and share it in Slack, email, or your team's daily standup.

**Why this step matters:** This closes the loop. You've observed reality, analyzed it, and now you are communicating the important signals to the rest of the organization to drive action.

**Time:** ~5 minutes


## Expected Outputs After Completion

**Files created:**
1. `outputs/ktlo/ktlo-triage-YYYY-MM-DD.md` - Prioritized support backlog
2. `outputs/insights/voc-synthesis-YYYY-MM-DD.md` - Customer feedback themes
3. `outputs/exec_updates/exec-update-YYYY-MM-DD.md` - 1-page stakeholder summary

**Versioned copies:**
- `history/triaging-ktlo/ktlo-triage-YYYY-MM-DD.md`
- `history/synthesizing-voc/voc-synthesis-YYYY-MM-DD.md`
- `history/generating-exec-update/exec-update-YYYY-MM-DD.md`

**You now have:**
- Clear view of support priorities
- Understanding of customer pain points
- Actionable 1-pager to share with team

## Common Variations

### Weekly Instead of Daily

**Adjust time:**
- 10 min KTLO (weekly backlog is larger)
- 15 min VOC (more feedback to process)
- 5 min exec update
- **Total: 30 min weekly**

**Benefits:**
- Less frequent overhead
- Still stay connected to customer reality

**Tradeoffs:**
- Patterns harder to spot (less frequent signal)
- Backlog can grow between runs

### Morning vs Evening

**Morning routine (recommended):**
- Start day with customer context
- Prioritize work based on triage
- Share updates before standup

**Evening routine:**
- Capture feedback from day's calls
- Triage tickets before EOD
- Share updates for next morning

### Skip KTLO (Focus on VOC Only)

**When to do this:**
- Support backlog is stable (no urgent issues)
- Customer feedback is more strategic right now
- Time-constrained (have only 15 min)

**Adjust workflow:**
1. Skip steps 1-3 (KTLO)
2. Run only steps 4-6 (VOC)
3. Generate exec update (will omit KTLO section)

**Time:** ~15 minutes

### Skip VOC (Focus on KTLO Only)

**When to do this:**
- No new customer feedback to process
- Support backlog is growing (need to focus on triage)
- Time-constrained

**Adjust workflow:**
1. Run only steps 1-3 (KTLO)
2. Skip steps 4-6 (VOC)
3. Generate exec update (will omit VOC section)

**Time:** ~12 minutes

## Troubleshooting

### Issue: "No new inputs to process"

**Problem:** No new Jira tickets or VOC sources since yesterday.

**Solution:**
- **For KTLO:** Skip step 1-2, review yesterday's triage instead
- **For VOC:** Focus on KTLO only, or use this as a documentation day
- **Alternative:** Review older VOC sources for patterns you may have missed

**Why this happens:** Some days are quiet. That's OK. Use the time to review history or plan ahead.

### Issue: "Stale outputs detected"

**Problem:** Session start reports stale outputs from previous runs.

**Example:**
```
⚠️ Stale outputs detected:
- outputs/insights/voc-synthesis-2026-01-14.md (source inputs/voc/interview-3.md changed)
- outputs/exec_updates/exec-update-2026-01-14.md (depends on stale VOC)
```

**Solution:**
- Re-run `/voc` to refresh VOC synthesis
- Re-run `/exec-update` to refresh exec update
- Or proceed with caution if changes are minor

**Time impact:** +5 min to refresh each output

### Issue: "KTLO triage shows no P0 tickets"

**Problem:** All tickets are P1/P2, nothing urgent.

**Solution:**
- **Good news:** Your product is stable!
- Review P1 patterns to identify preventive work
- Focus on VOC synthesis (customer-driven planning)
- Use time saved to work on strategic charters

**Why this happens:** Not every day has fires to fight. Use calm periods for strategic work.

### Issue: "VOC synthesis says 'need minimum 3 sources'"

**Problem:** You only have 1-2 VOC sources in inputs/voc/.

**Solution:**
- Add more sources:
  - Past customer calls (review notes from last week)
  - Support emails (copy recent feedback threads)
  - Survey responses (add old surveys for historical context)
- Or skip VOC synthesis today, focus on KTLO only

**Why this happens:** VOC synthesis needs multiple sources to identify patterns. Single source = anecdote, not pattern.

### Issue: "Exec update is too long"

**Problem:** Generated exec update is 3+ pages, stakeholders won't read it.

**Solution:**
- Edit down to key highlights (top 3 insights only)
- Use bullet points, not paragraphs
- Lead with decisions needed, not background
- Save full detail for outputs/ktlo/ and outputs/insights/

**Example format:**
```markdown
# Exec Update - 2026-01-15

🎯 Decisions Needed:
- [ ] Approve eng spike for real-time sync (2 days)

📊 Top 3 Insights:
1. Catalog sync = #1 customer pain (5/7 customers)
2. 12 sync bugs this week (API regression)
3. Q1 Charter 2 at risk (needs eng resources)
```

## Real-World Scenarios

### Scenario 1: Pre-Standup Routine

**Context:** You have 15 minutes before daily standup. Team expects you to share customer insights.

**Workflow:**
1. Run `/ktlo` (10 min) - Triage overnight tickets
2. Review outputs/ktlo/ (2 min) - Note top 3 patterns
3. Share in standup: "12 sync bugs this week, API regression root cause, eng spike needed"

**Time:** 12 minutes + 3 min standup

### Scenario 2: Post-Customer Call

**Context:** Just finished 3 customer calls. Full of insights, need to capture before they fade.

**Workflow:**
1. Create 3 files in inputs/voc/ (5 min) - One per customer call
2. Run `/voc` (5 min) - Synthesize themes
3. Review outputs/insights/ (3 min) - Note key pain points
4. Run `/exec-update` (3 min) - Share with team
5. Slack summary to stakeholders (2 min)

**Time:** 18 minutes

### Scenario 3: Weekly Review

**Context:** Running daily routine on Friday to summarize the week.

**Workflow:**
1. Review all week's KTLO triages (5 min) - Spot week-over-week patterns
2. Run `/ktlo` for Friday's tickets (5 min)
3. Review all week's VOC sources (5 min) - Any new themes emerging?
4. Run `/voc` (5 min) - Full week synthesis
5. Run `/exec-update` (5 min) - Weekly summary
6. Send to stakeholders as "Week in Review" (2 min)

**Time:** 27 minutes

### Scenario 4: Quarterly Planning Prep

**Context:** Planning Q2 charters next week. Need fresh customer and support data.

**Workflow:**
1. Run daily routine (30 min) - Get current state
2. Review outputs/ktlo/ for tech debt patterns (5 min)
3. Review outputs/insights/ for strategic opportunities (5 min)
4. Tag outputs for charter input: "Use this VOC synthesis for Q2 planning"

**Time:** 40 minutes (+ ready for charter generation)

## Next Steps

After completing daily routine:

1. **If P0 tickets found** → Create eng tickets, escalate blockers
2. **If strategic theme emerges** → Add to next charter planning session
3. **If exec update highlights risk** → Schedule alignment meeting
4. **If all quiet** → Review history for long-term patterns

**Weekly checkpoint:** Are themes consistent week-over-week, or changing? Consistency = signal for charter-level investment.

## See Also

- [Weekly Planning Workflow](./weekly-planning.md) - Turn daily insights into quarterly charters
- [skills/triaging-ktlo/SKILL.md](/Users/singhm/pm_os_superpowers/skills/triaging-ktlo/SKILL.md) - Full KTLO triage pattern
- [skills/synthesizing-voc/SKILL.md](/Users/singhm/pm_os_superpowers/skills/synthesizing-voc/SKILL.md) - Full VOC synthesis pattern
- [outputs/README.md](/Users/singhm/pm_os_superpowers/outputs/README.md) - Understanding output structure
