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

### Step 1: Export Overnight Jira Tickets

**Action:** Export support tickets to PM OS inputs folder.

```bash
# If using Jira CSV export (manual)
# 1. Go to Jira → Filters → Your KTLO filter
# 2. Export as CSV
# 3. Save to: inputs/jira/tickets-YYYY-MM-DD.csv

# Or use Jira CLI (if installed)
jira export --filter="KTLO" --output=inputs/jira/tickets-$(date +%Y-%m-%d).csv
```

**Why this step matters:** You can't triage what you can't see. Export ensures you have fresh data to analyze.

**What to export:**
- Bugs filed in last 24 hours
- Support requests
- Tech debt tickets
- Customer escalations

**Pro tip:** Set up a saved Jira filter for "KTLO backlog" and export the same filter daily.

### Step 2: Run /ktlo (Triage Support Backlog)

**Action:** Triage the support backlog into prioritized buckets.

```
/ktlo
```

**What happens:**
- PM OS reads `inputs/jira/*.csv`
- Groups tickets by theme (bugs, requests, tech debt)
- Prioritizes into tiers:
  - **P0: Now** (urgent, blocking customers)
  - **P1: This quarter** (important, affects many)
  - **P2: Backlog** (nice-to-have, defer)
- Identifies top 3 patterns
- Generates report in `outputs/ktlo/ktlo-triage-YYYY-MM-DD.md`

**Expected output:**
```markdown
# KTLO Triage - 2026-01-15

## Summary
- 47 tickets analyzed
- 12 P0 (Now), 18 P1 (This quarter), 17 P2 (Backlog)
- Top 3 themes: Catalog sync bugs (12), Missing attributes (8), Performance (6)

## P0: Now (12 tickets)
[List of urgent tickets with context]

## Top Patterns
1. Catalog sync bugs (12 tickets)
   - Impact: Blocking 3 major customers
   - Root cause: Recent API change
   - Action: Create spike ticket for eng
```

**Time:** ~10 minutes (5 min export + 5 min triage)

### Step 3: Review outputs/ktlo/ for Patterns

**Action:** Read the triage report and note key patterns.

```bash
# View latest triage
cat outputs/ktlo/ktlo-triage-$(date +%Y-%m-%d).md
```

**What to look for:**
- Recurring themes (same issues appearing repeatedly)
- New patterns (themes that weren't present before)
- Customer impact (who's affected, how severe)
- Actionable insights (what can you do today?)

**Questions to ask:**
- Are the top 3 themes changing week-over-week?
- Are P0 tickets clustered around one feature?
- Is tech debt accumulating in one area?

**Why this step matters:** Reading the report surfaces strategic signals. Multiple tickets about "slow catalog sync" might mean a charter-level investment is needed.

**Time:** ~2 minutes

### Step 4: Add Recent Customer Feedback → inputs/voc/

**Action:** Capture customer feedback from emails, calls, Slack, surveys.

**Create a new file per source:**
```bash
# After customer call
touch inputs/voc/interview-acme-corp-2026-01-15.md

# After reviewing survey responses
touch inputs/voc/survey-q4-2025.md

# After reviewing support emails
touch inputs/voc/feedback-jan-2026.md
```

**Format for customer interviews:**
```markdown
---
date: 2026-01-15
source: Customer call
customer: Acme Corp
role: VP Supply Chain
---

# Interview Notes - Acme Corp

## Key Quotes
> "We spend 4 hours per week fixing catalog errors. It's killing our team."

> "If you had real-time sync, we'd move our entire catalog to your platform."

## Pain Points
- Catalog sync is too slow (runs overnight only)
- Attribute validation is weak (bad data gets through)
- No bulk editing tools (tedious one-by-one edits)

## Context
- 50,000 SKUs in catalog
- 200 suppliers
- Uses competitor X for real-time sync (but wants to consolidate)
```

**Format for surveys/feedback:**
```markdown
---
date: 2026-01-15
source: Survey responses
sample_size: 47 customers
---

# Q4 2025 Survey Results

## Top Requests (by frequency)
1. Bulk editing tools (23 mentions)
2. Better search (19 mentions)
3. Faster sync (15 mentions)

## Verbatim Quotes
> "Bulk editing would save us hours every week." (Customer 12)

> "Search is too slow and often returns wrong results." (Customer 8)
```

**Why this step matters:** VOC synthesis only works if you feed it real customer feedback. This is your source of truth for what customers actually care about.

**Time:** ~5 minutes (copy-paste from notes, emails, calls)

### Step 5: Run /voc (Synthesize Themes)

**Action:** Synthesize customer feedback into prioritized themes.

```
/voc
```

**What happens:**
- PM OS reads `inputs/voc/*.md` (needs minimum 3 sources)
- Extracts verbatim quotes
- Groups into themes
- Identifies pain points and unmet needs
- Quantifies patterns (e.g., "3 of 7 customers mentioned X")
- Generates report in `outputs/insights/voc-synthesis-YYYY-MM-DD.md`

**Expected output:**
```markdown
# VOC Synthesis - 2026-01-15

## Summary
- 7 sources analyzed (5 interviews, 1 survey, 1 feedback doc)
- 4 major themes identified
- 12 verbatim quotes extracted

## Theme 1: Catalog Sync Performance (5/7 sources)

**Pain:** Catalog sync is too slow, runs overnight only

**Quotes:**
> "We spend 4 hours per week fixing catalog errors." (Acme Corp, Jan 15)

> "If you had real-time sync, we'd move our entire catalog." (Acme Corp, Jan 15)

> "Overnight sync means errors don't get caught until next day." (Survey respondent 23)

**Impact:** High - blocking 3 major customers, 23 survey mentions

**Opportunity:** Real-time sync feature (charter-level investment)

## Theme 2: Bulk Editing Tools (4/7 sources)
[...]
```

**Time:** ~5 minutes

### Step 6: Review outputs/insights/ for Pain Points

**Action:** Read the VOC synthesis and identify top pain points.

```bash
# View latest synthesis
cat outputs/insights/voc-synthesis-$(date +%Y-%m-%d).md
```

**What to look for:**
- High-frequency themes (mentioned by many customers)
- High-impact pain points (blocking business)
- Unmet needs (things customers want but can't do today)
- Quote clusters (multiple customers saying the same thing)

**Questions to ask:**
- Which pain point affects the most customers?
- Which pain point has the highest business impact?
- Which pain point can we solve this quarter?
- Are there quick wins (small effort, high value)?

**Why this step matters:** This is where you spot strategic opportunities. If 5/7 customers mention "real-time sync," that's a signal for a charter-level bet.

**Time:** ~3 minutes

### Step 7: Run /exec-update (Generate 1-Page Summary)

**Action:** Generate a 1-page executive update summarizing key insights.

```
/exec-update
```

**What happens:**
- PM OS reads latest outputs from `outputs/ktlo/`, `outputs/insights/`, `outputs/roadmap/`
- Synthesizes into 1-page summary
- Includes:
  - Key customer themes (from VOC)
  - Top support patterns (from KTLO)
  - Charter progress (if available)
  - Next actions
- Generates report in `outputs/exec_updates/exec-update-YYYY-MM-DD.md`

**Expected output:**
```markdown
# Executive Update - 2026-01-15

## Key Insights
1. **Catalog sync performance is top customer pain** (5/7 customers)
   - Blocking 3 major accounts
   - Survey: 15/47 respondents mentioned it
   - Opportunity: Real-time sync feature

2. **Support backlog growing in one area** (12 sync bugs this week)
   - Root cause: Recent API change
   - Action: Eng spike to assess fix effort

## Roadmap Progress
- Q1 Charter 1: On track (85% complete)
- Q1 Charter 2: At risk (needs eng resources)

## Next Actions
- [ ] Assess real-time sync feasibility (Eng spike)
- [ ] Create charter for Q2 catalog performance bet
- [ ] Fix API regression causing sync bugs (P0)
```

**Time:** ~3 minutes

### Step 8: Share outputs/exec_updates/ with Stakeholders

**Action:** Send the exec update to your team, manager, or stakeholders.

**Delivery options:**

**Email:**
```bash
# Copy content to email
cat outputs/exec_updates/exec-update-$(date +%Y-%m-%d).md | pbcopy
```

**Slack:**
```markdown
Morning update: Key customer feedback + support patterns

📊 Top customer pain: Catalog sync performance (5/7 customers)
🐛 Support pattern: 12 sync bugs this week (API regression)
🎯 Action: Eng spike to assess real-time sync feasibility

Full report: [link to outputs/exec_updates/]
```

**Weekly meeting:**
- Use exec update as your status report
- Walk through key insights (2 min)
- Highlight decisions needed (1 min)

**Why this step matters:** Stakeholders can't act on insights they don't know about. Daily updates build trust and alignment.

**Time:** ~2 minutes

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
