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
- **Original GTM plan or charter** (`outputs/gtm/` or `outputs/roadmap/`)
- **Launch date** (when did it launch?)
- **Actual metrics** (analytics, revenue, customer data)

**Optional but helpful:**
- Customer feedback (interviews, surveys, support tickets)
- Team retrospectives (sales, CS, engineering feedback)
- Competitive response (did competitors react?)
- Stakeholder quotes (what did sales/CS/customers say?)

**How to gather actual metrics:**

```bash
# Find the original GTM plan
ls outputs/gtm/gtm-*.md

# Gather actual data from:
# - Analytics dashboard (signups, trials, usage)
# - CRM (revenue, customers, pipeline)
# - Support system (ticket volume, common issues)
# - Customer interviews (satisfaction, pain points)
```

## Time Breakdown

| Step | Activity | Time |
|------|----------|------|
| 1 | Gather launch data | 10 min |
| 2 | Review original predictions | 5 min |
| 3 | Run reviewing-launch-outcomes | 10 min |
| 4 | Analyze predicted vs actual | 10 min |
| 5 | Identify what worked | 5 min |
| 6 | Identify what didn't work | 5 min |
| 7 | Extract lessons and PM OS updates | 10 min |
| 8 | Share review with team | Variable |
| 9 | Apply learnings (update processes) | 10 min |
| **Total** | | **55-75 min** |

Add time for team retrospective meeting (30-60 min).

## Step-by-Step Process

### Step 1: Gather Launch Data

**Action:** Collect actual metrics and feedback from the launch.

**What to collect:**

**Quantitative data (metrics):**

**Leading indicators (early signals):**
```markdown
- Signups (Week 1, Month 1)
- Demos booked
- Trials started
- Early usage metrics (DAU, feature adoption)

Source: Product analytics (Amplitude, Mixpanel, etc.)
```

**Lagging indicators (business outcomes):**
```markdown
- Revenue (Q1 actual)
- Paying customers (Q1 actual)
- Retention (Month 3 retention rate)
- NPS or CSAT scores

Source: CRM (Salesforce), finance dashboard, customer surveys
```

**Adoption metrics:**
```markdown
- Existing customers who adopted (%)
- New customers acquired
- Feature usage (% of users using feature weekly)

Source: Product analytics, CRM
```

**Qualitative data (feedback):**

**Customer feedback:**
```bash
# Create folder for launch feedback
mkdir -p inputs/voc/launch-feedback-real-time-sync/

# Add customer interview notes
touch inputs/voc/launch-feedback-real-time-sync/interview-customer-1.md

# Add survey responses
touch inputs/voc/launch-feedback-real-time-sync/survey-post-launch.md

# Add support ticket themes
touch inputs/voc/launch-feedback-real-time-sync/support-tickets-week1.md
```

**Team retrospectives:**
```markdown
- Sales feedback: "What worked/didn't work in the pitch?"
- CS feedback: "What support issues emerged?"
- Engineering feedback: "What technical issues occurred?"
- Marketing feedback: "What messaging resonated?"

Source: Team retrospective meetings, Slack conversations
```

**Why this step matters:** You can't compare predicted vs actual without actual data. This is your source of truth for what really happened.

**Pro tip:** Set a calendar reminder at launch to collect data at 30/60/90 day marks. Otherwise you'll forget.

**Time:** ~10 minutes (if data sources already exist)

### Step 2: Review Original Predictions

**Action:** Read the original GTM plan or charter to see what you predicted would happen.

```bash
# Find the original GTM plan
cat outputs/gtm/gtm-real-time-sync-2026-01-16.md

# Or the charter if no GTM plan exists
cat outputs/roadmap/Q1-2026-charters.md
```

**What to extract:**

**Predicted metrics:**
```markdown
From GTM plan (Section: Success Criteria):

Leading indicators:
- Predicted: 500 signups Week 1
- Predicted: 50 demos booked Month 1
- Predicted: 20 trials started Month 1

Lagging indicators:
- Predicted: $50K ARR Q1
- Predicted: 10 paying customers Q1
- Predicted: 80% retention Month 3
```

**Expected outcomes:**
```markdown
From charter:
- Goal: Unblock 3 major accounts
- Metric: Reduce catalog errors from 40% to 30%
- Timeline: Q1 delivery
```

**Assumptions made:**
```markdown
From GTM plan:
- Assumption: Existing customers will adopt quickly (within 2 weeks)
- Assumption: Sales can pitch effectively with 2-week training
- Assumption: No major competitive response
```

**Why this step matters:** Without baseline predictions, you can't measure calibration. Did you over-estimate or under-estimate? You'll only know by comparing.

**Time:** ~5 minutes

### Step 3: Run /review (Generate Launch Review)

**Action:** Generate the post-launch review document.

```
"Run reviewing-launch-outcomes for Real-Time Catalog Sync.
Launch date: March 15, 2026
Review period: 30 days post-launch
Original plan: outputs/gtm/gtm-real-time-sync-2026-01-16.md

Actual metrics:
- Signups Week 1: 320 (predicted 500)
- Demos Month 1: 62 (predicted 50)
- Trials Month 1: 15 (predicted 20)
- Revenue Q1: $35K (predicted $50K)
- Customers Q1: 7 (predicted 10)

Key feedback: CS reported 40 support tickets Week 1 (documentation gaps)"
```

**What happens:**
- PM OS reads original GTM plan or charter
- Compares predicted vs actual metrics
- Calculates variance (% difference)
- Analyzes what went well (successes with root causes)
- Analyzes what went wrong (failures with root causes)
- Extracts lessons learned
- Identifies PM OS process improvements
- Generates output in `outputs/reviews/launch-review-[initiative]-YYYY-MM-DD.md`

**Expected output structure:**
```markdown
# Launch Review: Real-Time Catalog Sync

## Launch Context
- What, when, original plan link

## Predicted vs Actual
- Leading indicators (table with variance)
- Lagging indicators (table with variance)
- Overall assessment (exceeded/mixed/missed)

## What Went Well
- Success 1 (what, why, pattern to reinforce, evidence)
- Success 2
- Success 3

## What Went Wrong
- Failure 1 (what, why, fix for next time, owner)
- Failure 2
- Failure 3

## Lessons Learned
- Lesson 1 (what learned, why matters, PM OS update action)
- Lesson 2
- Lesson 3

## Updates to PM OS
- Skills to update
- Templates to update
- Quality gates to add
- Vocabulary to add

## Recommendations for Next Launch
- Do more of
- Do less of / stop
- Try differently
```

**Time:** ~10 minutes

### Step 4: Analyze Predicted vs Actual

**Action:** Review the variance table and identify patterns.

```bash
# Open latest review
cat outputs/reviews/launch-review-real-time-sync-2026-04-15.md
```

**What to analyze:**

**Variance patterns:**

| Metric | Predicted | Actual | Variance | Pattern |
|--------|-----------|--------|----------|---------|
| Signups Week 1 | 500 | 320 | -36% | Over-estimated demand |
| Demos Month 1 | 50 | 62 | +24% | Under-estimated interest |
| Trials Month 1 | 20 | 15 | -25% | Conversion lower than expected |
| Revenue Q1 | $50K | $35K | -30% | Pricing or deal size off |

**Questions to ask:**

**Over-estimates (predicted > actual):**
- Why did fewer signups occur? (Marketing reach? Messaging? Timing?)
- Why did fewer trials convert? (Product readiness? Onboarding friction?)
- Why was revenue lower? (Deal size smaller? Sales cycle longer?)

**Under-estimates (predicted < actual):**
- Why did more demos book? (Better messaging? Pent-up demand?)
- Why did adoption exceed expectations? (Urgent customer need? Competitor weakness?)

**Calibration insights:**
```markdown
Pattern: Consistently over-estimate top-of-funnel (signups), under-estimate mid-funnel (demos)
Reason: Marketing reach estimates too optimistic, but messaging resonates with those who see it
Fix: Use more conservative reach estimates, but maintain conversion rate assumptions
```

**Why this step matters:** Variance tells you where your mental models are wrong. If you always over-estimate signups by 30%, you need to adjust your prediction model.

**Time:** ~10 minutes

### Step 5: Identify What Went Well

**Action:** Extract 3-5 successes with root cause analysis.

**Success analysis framework:**

For each success, answer:
- **What:** Specific thing that succeeded
- **Why:** Root cause (not just "good execution" - dig deeper with 5 whys)
- **Pattern to reinforce:** Repeatable lesson for future launches
- **Evidence:** Metric or feedback that proves success

**Example analysis:**

**Success 1: Demo bookings exceeded target (+24%)**

**What:** 62 demos booked vs 50 predicted

**Why (5 whys):**
1. Why did more demos book? → Sales pitch resonated strongly
2. Why did pitch resonate? → Used customer quote in opening slide
3. Why did that quote work? → Directly addressed top pain point (sync delays)
4. Why was pain point so compelling? → Recent competitor outage made it urgent
5. Why did timing matter? → Competitor weakness created window

**Root cause:** Customer quote + competitor weakness + urgent timing = strong pitch

**Pattern to reinforce:** Always include verbatim customer quotes in sales pitch (3x more demos booked)

**Evidence:** Sales feedback: "Quote slide closed 80% of first meetings"

**Success 2: CS handled 90% of tickets without eng escalation**

**What:** Low escalation rate despite 40 tickets Week 1

**Why:** CS runbook was comprehensive (troubleshooting guide, FAQ, escalation criteria)

**Pattern to reinforce:** Invest in CS runbook 2 weeks pre-launch (prevents escalations)

**Evidence:** CS manager: "Best launch we've had in terms of team readiness"

**Why this step matters:** Successes are often attributed to luck or "good execution" without understanding root causes. Root cause analysis makes success repeatable.

**Pro tip:** Interview stakeholders (sales, CS, engineering) to understand what worked from their perspective.

**Time:** ~5 minutes

### Step 6: Identify What Didn't Work

**Action:** Extract 3-5 failures with root cause analysis and fixes.

**Failure analysis framework:**

For each failure, answer:
- **What:** Specific thing that failed
- **Why:** Root cause (use 5 whys to dig deeper)
- **Fix for next time:** Concrete process change
- **Owner:** Who will implement the fix

**Example analysis:**

**Failure 1: Signups 36% below target**

**What:** 320 signups vs 500 predicted

**Why (5 whys):**
1. Why fewer signups? → Email campaign had low open rate (12% vs 30% expected)
2. Why low open rate? → Subject line didn't resonate
3. Why didn't it resonate? → Generic ("Announcing Real-Time Sync" vs specific pain point)
4. Why was it generic? → Marketing wrote it without customer context
5. Why didn't they have context? → VOC synthesis not shared with marketing team

**Root cause:** Marketing team lacked customer context (no VOC access)

**Fix for next time:**
- Add to GTM template: "Share VOC synthesis with marketing 4 weeks pre-launch"
- Quality gate: "Marketing reviews VOC before writing launch email"

**Owner:** PM (ensure VOC sharing in next GTM plan)

**Failure 2: Documentation gaps caused 40 support tickets Week 1**

**What:** High support ticket volume (40 tickets) for documentation issues

**Why:** User guide didn't cover migration from old sync to new sync

**Root cause:** Docs writer wasn't told about migration use case

**Fix for next time:**
- Add to enablement checklist: "Docs review must include migration/upgrade scenarios"
- Quality gate: "CS reviews docs 1 week pre-launch for completeness"

**Owner:** PM (update enablement checklist template)

**Why this step matters:** Failures without root cause analysis lead to surface-level fixes ("write better docs") instead of process improvements ("ensure CS reviews docs pre-launch").

**Pro tip:** Avoid blame. Focus on process gaps, not individual mistakes. "Why didn't we catch this?" not "Who messed up?"

**Time:** ~5 minutes

### Step 7: Extract Lessons and PM OS Updates

**Action:** Convert lessons into concrete PM OS process updates.

**Types of PM OS updates:**

**1. Skill file updates:**
```markdown
Lesson: Marketing needs VOC context for launch messaging

Update: skills/planning-gtm-launch/SKILL.md
Section: Pre-launch phase
Add: "Share VOC synthesis with marketing team 4 weeks before launch. Marketing should extract customer quotes for email subject lines and campaign copy."
```

**2. Template updates:**
```markdown
Lesson: CS runbook prevents escalations

Update: outputs/gtm/ template
New section: "Enablement Checklist - CS Readiness"
Add mandatory items:
- [ ] CS runbook created (troubleshooting + FAQ)
- [ ] CS reviews docs for completeness (1 week pre-launch)
- [ ] CS training session completed (2 weeks pre-launch)
```

**3. Quality gates:**
```markdown
Lesson: Docs gaps cause support burden

New quality gate: "Documentation Review Gate"
When: 1 week before launch
Who: CS lead + PM
Check: Review docs for completeness (setup, migration, troubleshooting)
Pass criteria: CS can answer 80% of common questions from docs alone
```

**4. Vocabulary terms:**
```markdown
Lesson: "Soft launch" was unclear to team

Add to .claude/rules/domain/vocabulary.md:
- Soft launch: Limited launch to existing customers only (no press, no broad marketing)
- Hard launch: Full GTM launch (press, marketing, new customer acquisition)
- Phased rollout: Gradual rollout with feature flags (10% → 50% → 100%)
```

**Why this step matters:** Lessons that don't update processes are wasted. The goal is to make PM OS smarter over time, so future launches avoid past mistakes.

**Pro tip:** Actually make the updates now (don't defer). If you wait, they won't happen.

**Time:** ~10 minutes

### Step 8: Share Review with Team

**Action:** Present findings to stakeholders for feedback and alignment.

**Who to share with:**
- **Engineering:** What technical issues emerged? Process improvements?
- **Sales:** What pitch/positioning lessons? Training adjustments?
- **CS:** What support issues? Documentation gaps?
- **Marketing:** What messaging worked/didn't work?
- **Leadership/Manager:** Overall success vs failure? What to adjust?

**Review format options:**

**Async review (email/Slack):**
```markdown
30-Day Post-Launch Review: Real-Time Catalog Sync

Overall: ⚠️ Mixed results
- Exceeded: Demo bookings (+24%)
- Missed: Signups (-36%), Revenue (-30%)

Key Lessons:
1. Customer quotes in pitch = 3x demo conversion (keep doing)
2. Marketing needs VOC context 4 weeks pre-launch (process gap)
3. CS runbook prevented escalations (best practice confirmed)

Process updates: Added 3 quality gates to GTM template

Full review: outputs/reviews/launch-review-real-time-sync-2026-04-15.md

Feedback welcome by [date]
```

**Sync review (retrospective meeting):**
- Overview (2 min): Launch summary, overall result
- Predicted vs actual (5 min): Walk through variance table
- What worked (5 min): 3-5 successes with patterns
- What didn't work (5 min): 3-5 failures with fixes
- Lessons learned (5 min): PM OS updates and process changes
- Team feedback (10 min): What did each team observe?
- Action items (3 min): Who owns which process updates

**What to ask team:**
- What did I miss in this analysis?
- What worked/didn't work from your function's perspective?
- What process changes would prevent future issues?
- Are there patterns we're not seeing?

**Why this step matters:** Your perspective is limited. Sales/CS/Engineering see different failure modes. Team input surfaces blind spots.

**Time:** Variable (5 min async read, 30-45 min retrospective meeting)

### Step 9: Apply Learnings (Update PM OS)

**Action:** Actually update the skill files, templates, and processes identified in Step 7.

**Update sequence:**

**1. Update skill files:**
```bash
# Open skill file
code skills/planning-gtm-launch/SKILL.md

# Add lesson to relevant section
# Example: Add VOC sharing to pre-launch phase
```

**2. Update templates:**
```bash
# Open GTM template (in skill file)
code skills/planning-gtm-launch/SKILL.md

# Add new checklist items or sections
# Example: Add CS docs review to enablement checklist
```

**3. Add quality gates:**
```bash
# Create quality gate document if doesn't exist
touch .claude/rules/pm-core/quality-gates.md

# Add new gate with criteria
```

**4. Update vocabulary:**
```bash
# Open vocabulary file
code .claude/rules/domain/vocabulary.md

# Add new terms or clarify existing ones
```

**5. Update AG3 state (no manual stale tracker):**
```bash
# Confirm next action reflects the change
pm-os status

# If you updated skills/templates manually, note it in your commit message
```

**Track decisions:**
```
"Run tracking-decisions to log this launch review as a decision outcome"
```

This creates feedback loop: Decision (launch plan) → Outcome (review) → Lesson (calibration)

**Why this step matters:** This is where learning becomes systematic. If you don't update PM OS, you'll make the same mistakes next launch.

**Pro tip:** Commit changes to git with clear message: "Post-launch learnings: Add VOC sharing to GTM process"

**Time:** ~10 minutes

## Expected Outputs After Completion

**Files created:**
1. `outputs/reviews/launch-review-[initiative]-YYYY-MM-DD.md` - Post-launch review
2. `outputs/decisions/launch-decision-[initiative].md` - Decision tracking update (if using tracking-decisions)

**Versioned copy:**
- `history/reviewing-launch-outcomes/launch-review-[initiative]-YYYY-MM-DD.md`

**Updated files:**
- Skill files with lessons learned (e.g., `skills/planning-gtm-launch/SKILL.md`)
- Templates with new sections or checklists
- Quality gates with new checkpoints
- Vocabulary with new terms
- `nexa/state.json` reflects next actions and recent activity

**You now have:**
- Clear understanding of what worked/didn't work
- Root cause analysis (not just surface symptoms)
- Concrete process improvements
- Updated PM OS (smarter for next launch)
- Team alignment on lessons learned

## Common Variations

### 30-Day vs 60-Day vs 90-Day Review

**30-day review (early signals):**
- Focus on leading indicators (signups, demos, trials)
- Early adoption patterns
- Launch execution issues (what broke?)
- Quick fixes still possible
- **Time:** 45 min (less data available)

**60-day review (trends emerging):**
- Mid-term adoption trends
- Initial retention signals
- Revenue patterns becoming clear
- Competitive response visible
- **Time:** 60 min (more complete picture)

**90-day review (full picture):**
- Business outcomes clear (revenue, retention, NPS)
- Long-term adoption patterns
- Full customer feedback cycle
- Strategic lessons (product-market fit, positioning)
- **Time:** 60-75 min (comprehensive analysis)

**Pro tip:** Run 30-day for quick course corrections, 90-day for strategic lessons.

### Success Review vs Failure Review

**Success review (exceeded targets):**
- Focus on "what worked" analysis
- Extract repeatable patterns
- Identify lucky timing vs real advantages
- Risk: Confirmation bias (attributing success to skill when it was luck)
- **Goal:** Make success repeatable

**Failure review (missed targets):**
- Focus on "what went wrong" analysis
- Avoid blame, focus on process gaps
- Identify early warning signs missed
- Risk: Blame culture (punishing failures instead of learning)
- **Goal:** Prevent future failures

**Mixed review (some exceeded, some missed):**
- Most common scenario
- Balance success and failure analysis
- Look for patterns (what differentiates wins from losses?)
- **Goal:** Calibrate predictions

### Individual Launch Review vs Quarterly Batch Review

**Individual launch review:**
- Review one launch in detail
- Deep dive on specific launch
- Immediate feedback loop (lessons fresh)
- **Time:** 60 min per launch

**Quarterly batch review:**
- Review all launches from quarter (3-5 launches)
- Look for cross-launch patterns
- Identify systemic issues vs one-off problems
- **Time:** 90 min for batch analysis

**Example quarterly batch review:**

| Launch | Target | Actual | Variance | Pattern |
|--------|--------|--------|----------|---------|
| Real-Time Sync | $50K | $35K | -30% | Over-estimated pricing |
| Bulk Editing | $30K | $28K | -7% | On target |
| Supplier Portal | $80K | $45K | -44% | Over-estimated adoption |

**Cross-launch pattern:** Consistently over-estimate revenue by 20-40% → Adjust revenue model

## Troubleshooting

### Issue: "Insufficient data - can't measure actual metrics"

**Problem:** Metrics don't exist or weren't tracked properly.

**Solution:**

**Option 1: Collect available data**
If some metrics exist (even partial):
```
"Run reviewing-launch-outcomes with partial data:
- Signups Week 1: 320 (have this)
- Demos Month 1: Unknown (not tracked)
- Revenue Q1: $35K (have this)
Mark unknowns clearly."
```

**Option 2: Use proxy metrics**
If direct metrics unavailable, use proxies:
```markdown
Predicted: 500 signups Week 1
Actual: Unknown (not tracked)
Proxy: 200 support tickets filed (implies at least 200 users active)
Estimated signups: 200-400 (based on support:user ratio)
```

**Option 3: Qualitative-only review**
If no quantitative data:
```
"Run reviewing-launch-outcomes based on qualitative feedback only:
- Sales feedback: Pitch resonated, demos converting
- CS feedback: 40 support tickets Week 1 (documentation gaps)
- Customer interviews: 8/10 satisfied, 2/10 had migration issues"
```

**Fix for next time:** Add to GTM template: "Define success metrics and tracking plan before launch"

**Why this happens:** Metrics often aren't instrumented until after launch. Prevention: Define tracking plan in GTM phase.

### Issue: "Launch clearly failed - team is defensive"

**Problem:** Launch missed targets badly. Team is defensive, blaming external factors.

**Solution:**

**Reframe as learning, not blame:**
```
"This is a learning review, not a blame session. We're identifying process gaps, not individual mistakes.

Question: What signals did we miss that could have predicted this?
Question: What process would have caught this issue earlier?
Question: What can we control next time?"
```

**Focus on controllable factors:**
```markdown
Don't say: "Sales didn't close deals" (blame)
Do say: "Sales lacked objection handling for [specific objection]. Add to training next time."

Don't say: "Customer adoption was low" (vague)
Do say: "Onboarding friction at step 3. Add tutorial video for next launch."
```

**Extract one actionable fix per failure:**
Every failure needs a concrete "fix for next time" with owner.

**Why this happens:** Failed launches trigger defensiveness. Reframe as process improvement, not performance review.

### Issue: "Can't identify root causes - failures feel random"

**Problem:** Failures don't have clear patterns or root causes.

**Solution:**

**Use 5 whys technique:**
```
Problem: Signups were 36% below target

Why? → Email campaign had low open rate
Why? → Subject line didn't resonate
Why? → Subject line was generic
Why? → Marketing didn't have customer context
Why? → VOC synthesis wasn't shared with marketing

Root cause: Process gap (marketing not in VOC loop)
Fix: Share VOC with marketing 4 weeks pre-launch
```

**Interview stakeholders:**
Ask each team: "What did you observe that surprised you?"

Often root causes emerge from conversations, not data alone.

**Look for patterns across launches:**
If this is the 3rd launch in a row with low signups:
```
Pattern: Consistently over-estimate top-of-funnel
Question: What's wrong with our signup prediction model?
Fix: Use more conservative reach estimates (cut predicted signups by 30%)
```

**Why this happens:** Surface-level analysis stops at symptoms. Root cause analysis requires digging deeper.

### Issue: "No GTM plan exists - can't compare predicted vs actual"

**Problem:** Launch happened without formal GTM plan. No predictions documented.

**Solution:**

**Reconstruct intent from charter:**
```bash
# Read the charter
cat outputs/roadmap/Q1-2026-charters.md

# Extract what success looked like
# Example: "Unblock 3 major accounts, reduce errors from 40% to 30%"
```

**Use those as baseline predictions:**
```markdown
Predicted (from charter):
- 3 major accounts unblocked
- Error rate reduced from 40% to 30%

Actual:
- 2 major accounts migrated (1 still blocked)
- Error rate reduced from 40% to 35%

Variance: Partially achieved goals
```

**Focus on qualitative review:**
Without metrics, focus on:
- What team observed (sales, CS, eng feedback)
- What customers said (interviews, surveys)
- What surprised us (unexpected issues or wins)

**Fix for next launch:** Create GTM plan before launch (use launch-planning workflow)

**Why this happens:** Early-stage products often launch without formal GTM. Retrospectively, harder to measure success.

## Review Timing Guide

**When to run each review:**

| Review Timing | What You Can Measure | Best Use Case |
|---------------|---------------------|---------------|
| **1 week post-launch** | Launch execution issues, initial reactions | Quick fixes (bugs, documentation gaps) |
| **30 days post-launch** | Leading indicators, early adoption | Course corrections, messaging tweaks |
| **60 days post-launch** | Adoption trends, retention signals | Mid-term adjustments, feature iterations |
| **90 days post-launch** | Business outcomes, strategic lessons | Full retrospective, process improvements |
| **6 months post-launch** | Long-term impact, market response | Strategic review, product-market fit |

**Pro tip:** Run quick 1-week review for tactical fixes, then 90-day review for strategic lessons.

## Real-World Scenarios

### Scenario 1: 30-Day Review (Early Course Correction)

**Context:** Launched Real-Time Sync 30 days ago. Signups lower than expected. Need to understand why before end of quarter.

**Workflow:**
1. Gather 30-day metrics (signups, trials, support tickets)
2. Run reviewing-launch-outcomes (30-day review)
3. Identify top failure: Low email open rate
4. Root cause: Generic subject line (marketing lacked VOC context)
5. Quick fix: Rewrite email campaign with customer quotes
6. Relaunch email to remaining list
7. Track if open rate improves

**Time:** 45 min + course correction execution

**Result:** Caught issue early, adjusted mid-quarter

### Scenario 2: 90-Day Review (Full Retrospective)

**Context:** Quarter ended. Need comprehensive review of Real-Time Sync launch for board presentation.

**Workflow:**
1. Gather full quarter metrics (revenue, customers, retention, NPS)
2. Collect customer interviews (20 interviews conducted)
3. Collect team retrospectives (sales, CS, eng feedback)
4. Run reviewing-launch-outcomes (90-day review)
5. Analyze predicted vs actual (mixed results: demos exceeded, revenue missed)
6. Extract lessons (5 successes, 5 failures)
7. Update PM OS (add 3 quality gates to GTM template)
8. Share with board (what worked, what didn't, what we learned)

**Time:** 75 min + board presentation prep

**Result:** Full picture of launch success/failure, process improvements captured

### Scenario 3: Failed Launch Review (Learning from Failure)

**Context:** Supplier Portal launched 60 days ago. Adoption is 50% below target. Need to understand why before pivoting.

**Workflow:**
1. Gather metrics (adoption, retention, churn)
2. Conduct 10 customer interviews (why didn't they adopt?)
3. Run reviewing-launch-outcomes (failure review)
4. Root cause analysis: Product didn't solve real pain point (incorrect problem definition)
5. Decision: Pivot or double down?
6. Extract lesson: VOC was outdated (18 months old), didn't validate before building
7. Update PM OS: Add quality gate "Re-validate customer pain 30 days before launch"
8. Share with team: Pivot direction based on fresh customer research

**Time:** 60 min + pivot planning

**Result:** Avoided sunk cost fallacy, pivoted based on evidence

### Scenario 4: Quarterly Batch Review (Pattern Analysis)

**Context:** End of Q1. Launched 4 features this quarter. Want to identify patterns across all launches.

**Workflow:**
1. Gather metrics for all 4 launches
2. Create comparison table (predicted vs actual for each)
3. Run reviewing-launch-outcomes for each launch (4 reviews)
4. Cross-launch pattern analysis:
   - Pattern 1: Consistently over-estimate revenue by 25%
   - Pattern 2: Demos always exceed target (messaging works)
   - Pattern 3: Retention lower than predicted (onboarding friction)
5. Update PM OS based on patterns:
   - Adjust revenue model (cut estimates by 25%)
   - Invest in onboarding (address retention issue)
   - Keep current messaging approach (demos converting)
6. Share with team: "Q1 launch learnings + Q2 process changes"

**Time:** 90 min for batch analysis (4 launches)

**Result:** Systemic improvements, not one-off fixes

## Next Steps

After completing post-launch review:

1. **Process updates identified** → Apply learnings now (update skill files, templates)
2. **Quick fixes available** → Execute course corrections (re-launch email, add docs)
3. **Strategic pivot needed** → Run fresh customer research, update charter
4. **Major success identified** → Run case study, share best practices with team
5. **Next launch coming** → Apply lessons to upcoming GTM plan

**Quarterly checkpoint:** Review all launches from quarter, identify cross-launch patterns, update PM OS systemically.

## See Also

- [Launch Planning Workflow](./launch-planning.md) - Create GTM plan before launch
- [Daily Routine Workflow](./daily-routine.md) - Gather customer feedback post-launch
- [skills/reviewing-launch-outcomes/SKILL.md](/Users/singhm/pm_os_superpowers/skills/reviewing-launch-outcomes/SKILL.md) - Full launch review pattern
- [skills/tracking-decisions/SKILL.md](/Users/singhm/pm_os_superpowers/skills/tracking-decisions/SKILL.md) - Track launch as decision for calibration
- [outputs/README.md](/Users/singhm/pm_os_superpowers/outputs/README.md) - Understanding dependencies and staleness
