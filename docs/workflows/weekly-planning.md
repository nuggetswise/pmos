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

**Required:**
- **Current VOC synthesis** (`outputs/insights/voc-synthesis-*.md`)
- **Current KTLO triage** (`outputs/ktlo/ktlo-triage-*.md`)
- **Truth base** (`outputs/truth_base/truth-base.md`)

**How to check if prerequisites are current:**
```bash
# PM OS will alert at session start if these are stale
# Example: "⚠️ Stale outputs detected: voc-synthesis-2026-01-10.md"
```

**If prerequisites are stale:**
1. Refresh VOC: `/voc`
2. Refresh KTLO: `/ktlo`
3. Refresh truth base: "Run building-truth-base" (if product changed significantly)

## Time Breakdown

| Step | Activity | Time |
|------|----------|------|
| 1 | Check staleness | 2 min |
| 2 | Refresh stale outputs | 5-10 min |
| 3 | Run /charters | 5 min |
| 4 | Review charter output | 3 min |
| 5 | Identify strategic bets | 3 min |
| 6 | Validate metrics | 2 min |
| 7 | Review with stakeholders | Variable |
| 8 | Refine and re-run | 5 min |
| **Total** | | **15-20 min** |

Add 10-15 min if prerequisites are stale (need refreshing).

## Step-by-Step Process

### Step 1: Check Staleness of Foundation Outputs

**Action:** Verify that your foundation outputs are current.

**PM OS does this automatically at session start:**
```
⚠️ Stale outputs detected:
- outputs/insights/voc-synthesis-2026-01-10.md (source inputs/voc/interview-5.md changed)
- outputs/ktlo/ktlo-triage-2026-01-12.md (needs refresh)
```

**Manual check:**
```bash
# Check when foundation outputs were last generated
ls -lt outputs/insights/voc-synthesis-*.md | head -1
ls -lt outputs/ktlo/ktlo-triage-*.md | head -1
ls -lt outputs/truth_base/truth-base.md | head -1
```

**Decision:**
- **If generated within last 7 days** → Proceed to step 3
- **If older than 7 days** → Proceed to step 2 (refresh)
- **If PM OS reports staleness** → Proceed to step 2 (refresh)

**Why this step matters:** Charters are only as good as their inputs. Stale VOC = charters disconnected from customer reality.

**Time:** ~2 minutes

### Step 2: Refresh Stale Outputs If Needed

**Action:** Regenerate foundation outputs to get current data.

**If VOC is stale:**
```
/voc
```
**Time:** ~5 minutes

**If KTLO is stale:**
```
/ktlo
```
**Time:** ~5 minutes

**If truth base is stale (rare):**
```
"Run building-truth-base"
```
**Time:** ~10 minutes

**Pro tip:** Run daily routine workflow to keep these fresh. If you run `/voc` and `/ktlo` daily, step 2 becomes a no-op.

**Why this step matters:** Refreshing ensures your charters reflect the latest customer feedback and support patterns, not last month's data.

**Time:** 5-10 minutes (depending on what's stale)

### Step 3: Run /charters (Generate Quarterly Charters)

**Action:** Generate strategic bets for the quarter.

```
/charters
```

**What happens:**
- PM OS reads:
  - `outputs/truth_base/truth-base.md` (product context)
  - `outputs/insights/voc-synthesis-*.md` (customer pain points)
  - `outputs/ktlo/ktlo-triage-*.md` (support patterns)
- Analyzes data for strategic opportunities
- Generates 3-5 charter-level bets
- Defines success metrics for each bet
- Identifies risks and dependencies
- Links to evidence (VOC quotes, KTLO themes)
- Writes output to `outputs/roadmap/Q1-YYYY-charters.md`

**Expected output structure:**
```markdown
# Q1 2026 Quarterly Charters

## Summary
- 4 strategic bets
- Focus areas: Catalog performance, Supplier onboarding, Data quality

## Charter 1: Real-Time Catalog Sync

**Problem:** Catalog sync runs overnight only, causing 4-hour delays in detecting errors.

**Evidence:**
> "We spend 4 hours per week fixing catalog errors." (Acme Corp, VOC synthesis Jan 15)
- 5/7 customers mentioned sync performance (VOC)
- 12 sync bugs this week (KTLO triage Jan 15)

**Bet:** Build real-time sync engine (sub-5 second latency)

**Success Metrics:**
- Baseline: Sync runs once per day (overnight)
- Target: Sync runs in <5 seconds on-demand
- Customer impact: 3 major accounts unblocked

**Risks:**
- Engineering effort is high (8-10 weeks estimated)
- Requires infrastructure changes (new queue system)

**Dependencies:**
- Eng team has capacity (Q1 slot available)
- Platform team supports new queue system

## Charter 2: Bulk Editing Tools
[...]

## Charter 3: Supplier Onboarding Automation
[...]

## Charter 4: Attribute Validation Engine
[...]
```

**Time:** ~5 minutes

### Step 4: Review outputs/roadmap/

**Action:** Read the generated charters carefully.

```bash
# Open latest charter
cat outputs/roadmap/Q1-$(date +%Y)-charters.md
```

**What to review:**

**Problem statements:**
- Is the problem clear and specific?
- Does it reflect customer pain (evidence-backed)?

**Success metrics:**
- Are baseline and target metrics defined?
- Are they measurable (not vague like "improve performance")?
- Are they achievable this quarter?

**Evidence links:**
- Are VOC quotes included?
- Are KTLO patterns referenced?
- Can you trace claims back to sources?

**Risks and dependencies:**
- Are major risks identified?
- Are dependencies on other teams called out?

**Why this step matters:** Generated charters are a starting point, not the final word. You need to validate they make sense for your product context.

**Time:** ~3 minutes

### Step 5: Identify 3-5 Strategic Bets

**Action:** Confirm the charter count and prioritization.

**Charter count:**
- **3-4 charters** = Good (focused, achievable)
- **5 charters** = Aggressive (requires strong execution)
- **6+ charters** = Risky (likely to under-deliver)

**If too many charters generated:**
- Rank by customer impact (which affects most customers?)
- Rank by feasibility (which can ship this quarter?)
- Defer lower-priority bets to next quarter

**Prioritization framework:**

| Charter | Customer Impact | Effort | Priority |
|---------|----------------|--------|----------|
| Real-time sync | High (3 major accounts) | High (10 weeks) | P0 |
| Bulk editing | Medium (23 survey mentions) | Low (3 weeks) | P1 |
| Supplier onboarding | Medium (2 customers) | High (8 weeks) | P2 |
| Attribute validation | Low (nice-to-have) | Medium (5 weeks) | Defer |

**Decision:** Focus on P0 and P1, defer P2 to Q2.

**Questions to ask:**
- Can we deliver all charters this quarter?
- Which charter has the highest customer impact?
- Which charter is the biggest risk (effort, dependencies)?
- Are we spreading too thin?

**Why this step matters:** Charters are bets - you can't bet on everything. Focus wins quarters.

**Time:** ~3 minutes

### Step 6: Validate Metrics (Baseline + Target)

**Action:** Verify that success metrics are specific and measurable.

**Good metrics:**
- ✅ "Baseline: Sync runs once per day (overnight)" → Specific, measurable
- ✅ "Target: Sync runs in <5 seconds on-demand" → Specific, measurable
- ✅ "Customer impact: 3 major accounts unblocked" → Specific outcome

**Bad metrics:**
- ❌ "Improve catalog performance" → Vague, not measurable
- ❌ "Make customers happy" → Not specific
- ❌ "Faster sync" → No baseline or target

**Validation checklist:**

For each charter, check:
- [ ] **Baseline defined** - What's the current state?
- [ ] **Target defined** - What's the goal state?
- [ ] **Measurable** - Can you verify success with data?
- [ ] **Achievable** - Can you hit the target this quarter?
- [ ] **Customer impact quantified** - How many customers affected?

**If metrics are vague:**

Edit the charter file manually:
```bash
# Open charter for editing
code outputs/roadmap/Q1-2026-charters.md

# Or use PM OS to refine
"Refine Charter 1 metrics: Define baseline and target for sync performance"
```

**Why this step matters:** Vague metrics = impossible to measure success. You need to know if you won or lost at the end of the quarter.

**Time:** ~2 minutes

### Step 7: Review with Stakeholders

**Action:** Share charters with your team, manager, or leadership for alignment.

**Who to review with:**
- **Engineering lead** - Validate effort estimates, surface technical risks
- **Design lead** - Confirm UX scope, identify design dependencies
- **Manager/Leadership** - Align on priorities, get buy-in for resources
- **Cross-functional partners** - Sales, CS, Support (if charters affect them)

**Review format options:**

**Async review (Slack/email):**
```markdown
Q1 Charters draft ready for review:

1. Real-Time Catalog Sync (10 weeks, 3 major accounts unblocked)
2. Bulk Editing Tools (3 weeks, 23 survey mentions)
3. Supplier Onboarding Automation (8 weeks, 2 customers)

Full doc: outputs/roadmap/Q1-2026-charters.md

Feedback by EOD Friday?
```

**Sync review (meeting):**
- Walk through each charter (2 min per charter)
- Highlight evidence (VOC quotes, KTLO patterns)
- Discuss risks and dependencies
- Get alignment on priorities
- Note feedback for refinement

**What to ask stakeholders:**
- Does this align with our strategy?
- Are effort estimates realistic?
- Are we missing any major risks?
- Should we adjust priorities?

**Why this step matters:** Charters are your team's contract for the quarter. Alignment upfront prevents mid-quarter thrash.

**Time:** Variable (5 min async, 30 min sync meeting)

### Step 8: Refine and Re-Run If Needed

**Action:** Incorporate stakeholder feedback and regenerate charters.

**Common refinements:**

**Change priorities:**
```
"Re-run /charters with these priorities:
1. Bulk editing tools (move to P0)
2. Real-time sync (move to P1)
3. Defer supplier onboarding to Q2"
```

**Adjust metrics:**
```
"Update Charter 1 metrics:
- Baseline: Sync runs once per day (24-hour latency)
- Target: Sync runs in <5 seconds (user-initiated)
- Measure: Latency P50/P95 from monitoring dashboard"
```

**Add constraints:**
```
"Add constraint to Charter 1:
- Must not require platform team changes (they're at capacity)
- Use existing queue system"
```

**Re-run charters:**
```
/charters
```

**Or manually edit:**
```bash
# Open charter file for direct editing
code outputs/roadmap/Q1-2026-charters.md

# Make changes, save

# Update alerts/stale-outputs.md to reflect manual edit
```

**Pro tip:** If making small changes (typos, metric tweaks), edit the file directly. If making big changes (reprioritization, new bets), re-run `/charters`.

**Why this step matters:** First draft is rarely perfect. Refinement based on stakeholder input creates shared ownership.

**Time:** ~5 minutes

## Expected Outputs After Completion

**Files created:**
1. `outputs/roadmap/Q1-YYYY-charters.md` - Strategic bets for the quarter

**Versioned copy:**
- `history/generating-quarterly-charters/Q1-YYYY-charters-YYYY-MM-DD.md`

**Updated:**
- `alerts/stale-outputs.md` - Tracks charter sources and dependencies

**You now have:**
- 3-5 strategic bets for the quarter
- Evidence-backed problem statements
- Measurable success metrics
- Stakeholder alignment on priorities

## Common Variations

### New Quarter vs Mid-Quarter Adjustment

**New quarter (Q1 start):**
- Generate fresh charters from scratch
- Review all foundation outputs (VOC, KTLO, truth base)
- Include year-over-year comparisons
- Set quarterly OKRs aligned to charters
- **Time:** 30 minutes (includes stakeholder alignment)

**Mid-quarter adjustment:**
- Read existing charters: `outputs/roadmap/Q1-YYYY-charters.md`
- Identify what changed (new customer feedback, technical blockers)
- Re-run `/charters` with context: "Charter 2 is blocked, propose alternatives"
- Focus on deltas, not full regeneration
- **Time:** 15 minutes

### Solo vs Team Planning

**Solo planning (PM-driven):**
- Run workflow independently
- Share charters for async review
- Incorporate feedback and re-run
- **Time:** 20 minutes + async feedback time

**Team planning (collaborative):**
- Run steps 1-4 before meeting (prep work)
- Review charters in team meeting (step 7)
- Refine live based on discussion
- Re-run after meeting with final inputs
- **Time:** 15 min prep + 30 min meeting + 5 min refinement

### Strategic Focus (Top-Down) vs Tactical Focus (Bottom-Up)

**Strategic (top-down):**
- Start with company OKRs or product strategy
- Run `/charters` with context: "Focus on charters that ladder to company OKR: Expand TAM"
- Ensure charters align to strategic pillars
- **Use when:** Annual planning, board presentations, major pivots

**Tactical (bottom-up):**
- Start with customer pain points (VOC) and support patterns (KTLO)
- Run `/charters` as-is (default behavior)
- Let evidence drive charter selection
- **Use when:** Normal quarterly planning, customer-driven roadmap

## Troubleshooting

### Issue: "Too many charters generated (6+)"

**Problem:** `/charters` generated 7 strategic bets. Team can't deliver that many.

**Solution:**

**Option 1: Prioritize and defer**
```
"Re-run /charters with constraint: Generate only top 3 charters by customer impact"
```

**Option 2: Merge related charters**
- If "Real-time sync" and "Sync performance" are separate, merge into one charter
- Combine small bets into one charter with multiple phases

**Option 3: Manually edit**
```bash
# Open charter file
code outputs/roadmap/Q1-2026-charters.md

# Delete lower-priority charters
# Keep top 3-4

# Add note: "Deferred to Q2: Charter 5, Charter 6, Charter 7"
```

**Why this happens:** PM OS generates charters based on evidence. If many pain points exist, it proposes many bets. You're the final filter.

### Issue: "Missing metrics (baseline + target)"

**Problem:** Charter has vague success criteria like "Improve performance."

**Solution:**

**Define metrics explicitly:**
```
"Update Charter 1 with specific metrics:
- Baseline: What's the current state? (e.g., 24-hour sync latency)
- Target: What's the goal? (e.g., <5 second sync latency)
- Measure: How will you track it? (e.g., P95 latency from monitoring)"
```

**Or manually add:**
```markdown
## Charter 1: Real-Time Catalog Sync

**Success Metrics:**
- Baseline: Sync runs once per day (24-hour latency)
- Target: Sync runs in <5 seconds (user-initiated)
- Measure: P95 latency from Datadog monitoring dashboard
- Customer impact: 3 major accounts unblocked (Acme Corp, GlobalRetail, FastSupply)
```

**Why this happens:** Metrics require domain knowledge. PM OS can infer from context, but you may need to add specifics.

### Issue: "Stale dependencies reported"

**Problem:** PM OS reports: "Charter depends on stale VOC synthesis."

**Example:**
```
⚠️ Dependency staleness detected:
- outputs/roadmap/Q1-2026-charters.md depends on:
  - outputs/insights/voc-synthesis-2026-01-10.md (source changed Jan 15)
```

**Solution:**

**Refresh upstream outputs:**
```
/voc              # Refresh VOC synthesis
/charters         # Regenerate charters from fresh VOC
```

**Or acknowledge and defer:**
- If VOC changes are minor (typo fixes), proceed with current charters
- Add note: "Reviewed: VOC changes are minor, charters still valid"

**Why this happens:** Upstream inputs changed after charters were generated. PM OS detects this to prevent drift.

### Issue: "Charters don't align with product strategy"

**Problem:** Generated charters are tactically sound but don't ladder to product strategy.

**Solution:**

**Add strategic context:**
```
"Re-run /charters with strategic constraint:
- Company OKR: Expand TAM into mid-market segment
- Product strategy pillar: Self-service onboarding
- Focus charters on reducing onboarding friction"
```

**Or manually reframe:**
```markdown
## Charter 1: Self-Service Supplier Onboarding

**Strategic alignment:** Ladders to company OKR "Expand TAM" by reducing onboarding friction for mid-market customers.

**Problem:** Supplier onboarding requires 4 hours of manual work per customer.
[...]
```

**Why this happens:** PM OS generates charters from customer evidence (bottom-up). You need to layer on strategic alignment (top-down).

### Issue: "Effort estimates are missing or wrong"

**Problem:** Charter says "8-10 weeks" but eng team says "4 weeks."

**Solution:**

**Validate with engineering:**
- Share charter with eng lead
- Get effort estimate (t-shirt sizing: S/M/L or weeks)
- Update charter with validated estimate

**Update manually:**
```bash
# Edit charter
code outputs/roadmap/Q1-2026-charters.md

# Update effort section
**Effort:** 4 weeks (validated with Eng lead)
```

**Or re-run with constraint:**
```
"Re-run /charters with constraint: Charter 1 effort is 4 weeks (eng validated)"
```

**Why this happens:** PM OS estimates effort based on problem scope, but engineering has the ground truth.

## Real-World Scenarios

### Scenario 1: Start of Q1 Planning

**Context:** It's December 20th. Need Q1 charters by January 5th.

**Workflow:**
1. Run daily routine for 2 weeks (build up VOC and KTLO data)
2. Week before Q1: Run `/charters` (draft)
3. Share with stakeholders for feedback
4. Week of Q1: Refine and finalize charters
5. Kickoff meeting: Present charters to team

**Time:** 20 min initial generation + 30 min stakeholder review + 10 min refinement

### Scenario 2: Mid-Quarter Pivot

**Context:** It's week 6 of Q1. Major customer churned, priorities need to shift.

**Workflow:**
1. Check current charters: `cat outputs/roadmap/Q1-2026-charters.md`
2. Capture new customer feedback in `inputs/voc/`
3. Run `/voc` to refresh synthesis
4. Run `/charters` with context: "Charter 2 is now lower priority due to churn, propose alternatives"
5. Review with stakeholders: "Proposed charter adjustment based on churn"
6. Update and communicate change

**Time:** 30 min (includes context gathering)

### Scenario 3: Annual Strategy Translation

**Context:** Leadership defined 3-year product strategy. Need to translate to Q1 charters.

**Workflow:**
1. Read product strategy: `cat outputs/strategy/product-strategy-2026.md`
2. Identify Q1 focus: "Year 1, Pillar 1: Self-service onboarding"
3. Run `/charters` with context: "Generate charters aligned to Pillar 1 (self-service onboarding)"
4. Validate charters ladder to strategy (traceability)
5. Review with leadership for alignment

**Time:** 25 min

### Scenario 4: Customer-Driven Roadmap

**Context:** No formal product strategy. Roadmap is purely customer-driven.

**Workflow:**
1. Run daily routine consistently (build VOC corpus)
2. Weekly: Run `/charters` (defaults to evidence-driven)
3. Review charters: Top pain points become charters
4. Validate with customers: "We heard you need X, shipping in Q1"
5. Execute and iterate

**Time:** 15 min weekly

## Next Steps

After completing weekly planning:

1. **Charters approved** → Write PRDs: "Run writing-prds-from-charters for Charter 1"
2. **Charters need engineering validation** → Schedule tech spike, revisit next week
3. **Charters reveal dependency** → Engage cross-functional partner (platform, design)
4. **Charters highlight gap** → Run competitive analysis or data deep-dive

**Mid-quarter checkpoint:** Re-run weekly planning to assess charter progress and adjust if needed.

## See Also

- [Daily Routine Workflow](./daily-routine.md) - Keep foundation outputs fresh
- [Quarterly Strategy Workflow](./quarterly-strategy.md) - Align charters to long-term strategy
- [skills/generating-quarterly-charters/SKILL.md](/Users/singhm/pm_os_superpowers/skills/generating-quarterly-charters/SKILL.md) - Full charter generation pattern
- [outputs/README.md](/Users/singhm/pm_os_superpowers/outputs/README.md) - Understanding dependencies and staleness
