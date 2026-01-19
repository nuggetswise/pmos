# Launch Planning Workflow

## Overview

This workflow helps you create a comprehensive go-to-market (GTM) plan in 60-90 minutes. Run this when preparing to launch a product or major feature to ensure it lands, not just launches. The plan covers market context, positioning, launch phases, enablement, and success criteria.

**Why this matters:** Products that launch without GTM plans often fail silently - engineering ships, but customers don't adopt. GTM ensures cross-functional readiness, clear messaging, and measurable success criteria.

## When to Use This Workflow

- **Approved charter ready for launch** - Charter moving to execution phase
- **New product or major feature shipping** - Significant customer-facing launch
- **Entering new market segment** - Expanding to new customer type or geography
- **Repositioning existing product** - Changing positioning or target audience
- **Pre-sales kickoff planning** - Sales needs launch plan and collateral
- **4-6 weeks before planned launch** - Enough time to prepare enablement

## Prerequisites

**Required:**
- **Charter or PRD** describing what's launching (`outputs/roadmap/` or `outputs/delivery/`)
- **Target launch date** (approximate is fine)
- **Target customer segment** (who is this for?)

**Optional but helpful:**
- Competitive analysis (`outputs/insights/competitive-analysis-*.md`)
- VOC synthesis showing customer pain points (`outputs/insights/voc-synthesis-*.md`)
- Stakeholder map (`outputs/stakeholders/`)
- Market research or TAM/SAM/SOM data
- Beta customer feedback (if beta program ran)

**How to check if prerequisites exist:**
```bash
# Find the charter or PRD for this launch
ls outputs/roadmap/Q*-charters.md
ls outputs/delivery/prds/*.md

# Check for competitive analysis
ls outputs/insights/competitive-analysis-*.md
```

## Time Breakdown

| Step | Activity | Time |
|------|----------|------|
| 1 | Identify launch scope | 5 min |
| 2 | Map stakeholders | 10 min |
| 3 | Gather market context | 10 min |
| 4 | Run planning-gtm-launch | 10 min |
| 5 | Review GTM plan structure | 10 min |
| 6 | Define launch phases | 10 min |
| 7 | Create enablement checklist | 10 min |
| 8 | Align with cross-functional teams | Variable |
| 9 | Refine and finalize | 10 min |
| **Total** | | **65-90 min** |

Add 30-60 min for cross-functional alignment meeting.

## Step-by-Step Process

### Step 1: Identify Launch Scope

**Action:** Define what you're launching and when.

**Questions to answer:**

**What:**
- Product name or feature name
- Which charter or PRD does this map to?
- What's changing for customers?

**When:**
- Target launch date (can be approximate)
- How much time until launch? (4 weeks? 8 weeks?)

**Who:**
- Which customer segment is this for?
- Existing customers, new customers, or both?

**Read the source document:**
```bash
# If launching from a charter
cat outputs/roadmap/Q1-2026-charters.md

# If launching from a PRD
cat outputs/delivery/prds/real-time-sync-prd.md
```

**Example prompt:**
```
"Create GTM plan for Real-Time Catalog Sync.
Charter: outputs/roadmap/Q1-2026-charters.md (Charter 1)
Target launch: March 15, 2026
Target customer: Mid-market retailers (50K-200K SKUs)"
```

**Why this step matters:** GTM plan is only as good as the launch definition. Vague scope = vague plan.

**Time:** ~5 minutes

### Step 2: Map Stakeholders

**Action:** Identify who needs to be enabled or involved in the launch.

**Stakeholder categories:**

**Internal teams:**
- Sales (need training, pitch deck)
- Customer Success (need runbook, support docs)
- Marketing (need messaging, collateral)
- Engineering (need launch readiness checklist)
- Legal/Compliance (need contract/terms review)
- Support (need troubleshooting guides)

**External stakeholders:**
- Customers (existing users who'll see changes)
- Prospects (new customers to target)
- Partners (if launch affects integrations)
- Press/Analysts (if major product news)

**Create stakeholder map:**
```
"Map stakeholders for Real-Time Sync launch:
- Sales: Need to pitch to prospects
- CS: Need to support existing customers
- Engineering: Need to monitor launch
- Marketing: Need announcement campaign"
```

Or manually create:
```bash
# Create stakeholder map
touch outputs/stakeholders/real-time-sync-stakeholders.md
```

**Why this step matters:** Missed stakeholders = launch day surprises. If CS isn't ready, support tickets flood in. If Sales isn't trained, they can't sell.

**Pro tip:** Run stakeholder-mapping skill if complex launch with many cross-functional dependencies.

**Time:** ~10 minutes

### Step 3: Gather Market Context

**Action:** Collect competitive, customer, and market data for positioning.

**What to gather:**

**Competitive landscape:**
- Who are direct competitors?
- What's their positioning?
- What are their strengths/weaknesses?
- Read competitive analysis if exists: `cat outputs/insights/competitive-analysis-*.md`

**Customer pain points:**
- What problem does this solve?
- What's the customer impact?
- Read VOC synthesis: `cat outputs/insights/voc-synthesis-*.md`

**Market sizing (if known):**
- TAM (Total Addressable Market)
- SAM (Serviceable Addressable Market)
- SOM (Obtainable Market in Year 1)
- Source: Analyst reports, internal data, or "Unknown - needs research"

**Example context:**
```
Market context for Real-Time Sync GTM:
- Competitors: Competitor A (slow sync), Competitor B (expensive)
- Customer pain: 5/7 customers mentioned sync delays (VOC synthesis Jan 15)
- TAM: Unknown - need market research
- Differentiation: Sub-5 second sync vs 24-hour competitor sync
```

**Why this step matters:** GTM positioning requires knowing what makes you different. Without competitive context, messaging becomes generic.

**Pro tip:** If competitive analysis is missing and competitors are important, run it first. Otherwise, proceed with known context and flag gaps.

**Time:** ~10 minutes

### Step 4: Run /gtm (Generate GTM Plan)

**Action:** Generate the comprehensive GTM launch plan.

```
"Run planning-gtm-launch for Real-Time Catalog Sync
Target launch: March 15, 2026
Target customer: Mid-market retailers
Charter: outputs/roadmap/Q1-2026-charters.md (Charter 1)"
```

**What happens:**
- PM OS reads charter/PRD
- Analyzes market context (competitive, customer, TAM)
- Defines positioning and value proposition
- Creates messaging framework (customers, sales, partners, press)
- Maps launch phases (pre-launch, launch, post-launch)
- Generates enablement checklist
- Defines success criteria (leading + lagging indicators)
- Identifies risks and mitigation
- Writes output to `outputs/gtm/gtm-[initiative]-YYYY-MM-DD.md`

**Expected output structure:**
```markdown
# GTM Plan: Real-Time Catalog Sync

## Initiative Context
- What, when, charter link

## Market Context
- TAM/SAM/SOM
- Competitive landscape
- Customer segments (ICP)

## Positioning
- Value proposition (1 sentence)
- Differentiation (3 key points)
- Messaging framework (per audience)

## Launch Plan
- Pre-launch phase (activities, owners, success criteria)
- Launch phase (activities, channels, metrics)
- Post-launch phase (iteration, scale)

## Enablement Checklist
- Sales training, CS runbook, demo, collateral, pricing, legal

## Success Criteria
- Leading indicators (signups, demos, trials)
- Lagging indicators (revenue, retention, NPS)

## Risks & Mitigation
```

**Time:** ~10 minutes

### Step 5: Review GTM Plan Structure

**Action:** Read the generated plan carefully and validate completeness.

```bash
# Open latest GTM plan
ls -lt outputs/gtm/*.md | head -1
cat outputs/gtm/gtm-real-time-sync-2026-01-16.md
```

**What to review:**

**Positioning:**
- Is value proposition crisp (1 sentence)?
- Are differentiators specific (not "better, faster")?
- Does messaging vary by audience (customer vs sales vs press)?

**Good value prop:**
"Real-Time Catalog Sync eliminates 24-hour delays for mid-market retailers, reducing catalog errors by 80% through sub-5 second synchronization."

**Bad value prop:**
"Better catalog sync" (vague, no specific value)

**Launch phases:**
- Is pre-launch phase defined (before launch day)?
- Is launch phase defined (launch week activities)?
- Is post-launch phase defined (first 30/60/90 days)?
- Are owners assigned to each activity?

**Enablement checklist:**
- Are all cross-functional teams covered (sales, CS, marketing)?
- Are deliverables specific (not just "training" but "training deck + session")?
- Are success criteria defined for each deliverable?

**Success metrics:**
- Are leading indicators defined (early signals)?
- Are lagging indicators defined (business outcomes)?
- Are targets quantified (not "increase signups" but "500 signups Week 1")?

**Why this step matters:** Generated GTM plan is a starting point. You need to validate it matches your launch context and fill in gaps.

**Time:** ~10 minutes

### Step 6: Define Launch Phases and Timeline

**Action:** Map launch activities to timeline with clear owners.

**Pre-launch phase (4-6 weeks before launch):**

**Key activities:**
- Beta program (if applicable) - validate with real customers
- Sales training - certify team on pitch and demo
- CS runbook - document support workflows
- Collateral creation - deck, one-pager, video
- Documentation - user guides, API docs
- Legal/compliance - contract review, terms update
- Demo environment - sandbox for sales/prospects

**Channels:** Internal comms, partner previews, beta customer access

**Success gate:** All teams certified and ready before launch day

**Launch phase (launch week):**

**Key activities:**
- Announcement (email, blog, social media)
- Launch event (webinar, demo day, customer event)
- Press release (if major product news)
- Sales kickoff (activate sales team)
- Customer outreach (CS notifies existing customers)

**Channels:** Email blast, social media, PR wire, customer events, webinars

**Success metric:** Launch day KPIs (impressions, attendees, signups)

**Post-launch phase (first 30/60/90 days):**

**Key activities:**
- Customer feedback collection (interviews, surveys)
- Iteration based on feedback (bug fixes, quick improvements)
- Case study creation (success stories from early adopters)
- Scaling adoption (CS outreach, webinars, community)

**Channels:** CS outreach, follow-up webinars, case studies, community forums

**Success metric:** Adoption and retention targets (customers using, revenue generated)

**Example timeline table:**

| Phase | Timeline | Activity | Owner | Success Criterion | Status |
|-------|----------|----------|-------|-------------------|--------|
| Pre-launch | Week -4 | Beta program launch | PM | 10 beta customers onboarded | Pending |
| Pre-launch | Week -3 | Sales training | Sales Enablement | 20 reps certified | Pending |
| Pre-launch | Week -2 | Collateral ready | Marketing | Deck + one-pager approved | Pending |
| Pre-launch | Week -1 | Docs published | Tech Writer | User guide live | Pending |
| Launch | Week 0 | Announcement | Marketing | 10K impressions | Pending |
| Launch | Week 0 | Launch webinar | PM + Sales | 500 attendees | Pending |
| Post-launch | Week 2 | Feedback collection | CS | 20 customer interviews | Pending |
| Post-launch | Week 4 | Case study | Marketing | 2 published | Pending |

**Why this step matters:** Timeline creates accountability. Without dates and owners, activities slip and launch day arrives unprepared.

**Pro tip:** Work backward from launch date. If launch is 6 weeks away, pre-launch activities need to start now.

**Time:** ~10 minutes

### Step 7: Create Enablement Checklist

**Action:** Define what each team needs to be launch-ready.

**Enablement checklist template:**

**Sales enablement:**
- [ ] Sales training deck created
- [ ] Training session delivered (date: [TBD])
- [ ] Pitch certification (quiz or role-play)
- [ ] Objection handling guide
- [ ] Competitive battlecard (vs Competitor A, B)
- [ ] Demo script and sandbox environment
- [ ] Pricing and packaging finalized
- [ ] Success metric: 90% of reps certified by [date]

**Customer Success enablement:**
- [ ] CS runbook created (troubleshooting guide)
- [ ] Support ticket workflows updated
- [ ] FAQ document published
- [ ] Customer communication template (announcement email)
- [ ] Escalation process defined
- [ ] Success metric: CS team can resolve 80% of tickets without eng escalation

**Marketing enablement:**
- [ ] Pitch deck (external facing)
- [ ] One-pager (PDF)
- [ ] Demo video (2-3 min)
- [ ] Blog post (announcement)
- [ ] Social media assets (graphics, copy)
- [ ] Email campaign (existing customers + prospects)
- [ ] Success metric: Collateral ready 1 week pre-launch

**Engineering readiness:**
- [ ] Launch checklist (feature flags, monitoring, rollback plan)
- [ ] Performance testing completed (load, stress)
- [ ] Monitoring dashboards configured
- [ ] Rollback plan documented
- [ ] On-call rotation defined for launch week
- [ ] Success metric: Zero critical bugs in first 48 hours

**Legal/Compliance:**
- [ ] Contract amendments (if needed)
- [ ] Terms of service updated
- [ ] Privacy/security review completed
- [ ] Compliance certifications (if applicable)
- [ ] Success metric: Legal sign-off by [date]

**Why this step matters:** Enablement gaps = launch day chaos. If CS doesn't have a runbook, they can't support customers. If Sales doesn't have pricing, they can't close deals.

**Pro tip:** Assign an owner to each checklist item. "TBD" owners = nothing gets done.

**Time:** ~10 minutes

### Step 8: Align with Cross-Functional Teams

**Action:** Share GTM plan with stakeholders and get commitment.

**Who to review with:**
- **Sales leadership:** Review pitch, training plan, pricing
- **CS leadership:** Review runbook, support readiness
- **Marketing:** Review messaging, channels, timeline
- **Engineering:** Review launch readiness, monitoring
- **Legal/Compliance:** Review contract/terms changes

**Review format options:**

**Async review (Slack/email):**
```markdown
GTM Plan for Real-Time Catalog Sync ready for review:

Launch date: March 15, 2026
Target: Mid-market retailers

Key asks:
- Sales: Training session Week of Feb 10 (2 hours)
- CS: Runbook review by Feb 15
- Marketing: Collateral by March 1
- Eng: Launch checklist sign-off by March 10

Full GTM plan: outputs/gtm/gtm-real-time-sync-2026-01-16.md

Feedback by [date]?
```

**Sync review (GTM alignment meeting):**
- Overview (2 min): What, when, who
- Positioning (3 min): Value prop, differentiation
- Launch phases (5 min): Pre/during/post timeline
- Enablement checklist (10 min): Walk through each team's deliverables
- Success criteria (3 min): How we'll measure success
- Risks and mitigation (5 min): What could go wrong, how to prevent
- Q&A and commitment (10 min): Get buy-in from each team

**What to ask stakeholders:**
- Is the timeline realistic for your team?
- Are there missing deliverables we haven't accounted for?
- What risks do you see from your function's perspective?
- Can you commit to your checklist items by the dates listed?

**Why this step matters:** GTM plans fail when teams aren't aligned. This step surfaces resource conflicts, timeline issues, and missing dependencies before launch day.

**Pro tip:** Schedule the alignment meeting 6-8 weeks before launch to leave time for adjustments.

**Time:** Variable (10 min async read, 30-60 min sync meeting)

### Step 9: Refine and Finalize

**Action:** Incorporate stakeholder feedback and update the GTM plan.

**Common refinements:**

**Adjust timeline based on feedback:**
```
"Update GTM plan:
- Sales training moved to Week of Feb 17 (not Feb 10) due to sales kickoff conflict
- Collateral deadline moved to Feb 25 (Marketing needs more time)
- Launch date stays March 15"
```

**Add missing deliverables:**
```
"Add to enablement checklist:
- Partner integration guide (needed for 3rd party integrations)
- API changelog (for developer customers)
- Migration guide (for customers moving from old sync to new sync)"
```

**Strengthen messaging:**
```
"Refine value proposition to emphasize speed differentiation:
Old: 'Real-time catalog sync for retailers'
New: 'Real-Time Catalog Sync eliminates 24-hour delays, reducing errors by 80% through sub-5 second synchronization'"
```

**Add risk mitigation:**
```
"Add risk to GTM plan:
Risk: Low adoption from existing customers (prefer status quo)
Impact: High (need existing customers for case studies)
Mitigation: Early CS outreach, personalized migration support, incentive program"
```

**Re-run GTM skill:**
```
"Run planning-gtm-launch"
```

**Or manually edit:**
```bash
# Open GTM plan for direct editing
code outputs/gtm/gtm-real-time-sync-2026-01-16.md

# Make changes, save

# No manual stale tracker in AG3; rely on `pm-os status` and re-run the skill if needed
```

**Why this step matters:** First draft GTM plans always have gaps. Stakeholder feedback surfaces what you missed.

**Pro tip:** Version control significant changes. If timeline shifts by 2+ weeks, regenerate the plan with new dates.

**Time:** ~10 minutes

## Expected Outputs After Completion

**Files created:**
1. `outputs/gtm/gtm-[initiative]-YYYY-MM-DD.md` - Comprehensive GTM launch plan

**Versioned copy:**
- `history/planning-gtm-launch/gtm-[initiative]-YYYY-MM-DD.md`

**Updated:**
- `nexa/state.json` - Next action reflects what to refresh or run next
- `outputs/audit/auto-run-log.md` - Records daemon actions (if any)

**You now have:**
- Clear positioning and value proposition
- Messaging framework for each audience
- Phased launch plan (pre/during/post) with owners
- Enablement checklist for all teams
- Success criteria (leading + lagging indicators)
- Cross-functional alignment and commitment

## Common Variations

### Major Product Launch vs Feature Launch

**Major product launch (new product to market):**
- Heavier on market sizing (TAM/SAM/SOM)
- Press/analyst outreach (PR strategy)
- Longer pre-launch phase (8-12 weeks)
- Beta program critical (validate product-market fit)
- **Time:** 90 min + extensive stakeholder alignment

**Feature launch (enhancement to existing product):**
- Focus on existing customer communication
- Less market sizing (already have customers)
- Shorter pre-launch phase (4-6 weeks)
- CS enablement more critical than sales
- **Time:** 60 min + focused alignment

### Internal Launch vs External Launch

**Internal launch (beta, internal tools):**
- Skip press/analyst outreach
- Focus on internal enablement only
- Simpler messaging (no competitive positioning)
- Faster timeline (2-4 weeks)
- **Time:** 45 min

**External launch (public, customer-facing):**
- Full GTM plan (market, positioning, phases, enablement)
- Press/analyst coordination if major news
- Legal/compliance review
- Longer timeline (6-8 weeks)
- **Time:** 90 min

### Greenfield (New Market) vs Existing Market

**Greenfield launch (new market or segment):**
- Heavy market research required (TAM unknown)
- Customer education (they don't know they need this)
- Category creation positioning
- Longer adoption cycle
- **Time:** 90 min + market research

**Existing market launch:**
- Competitive differentiation critical (vs known competitors)
- Customer pain points well-understood
- Faster adoption (customers already looking for solutions)
- **Time:** 60 min

## Troubleshooting

### Issue: "Unclear launch scope - charter is vague"

**Problem:** Charter or PRD doesn't clearly define what's launching or who it's for.

**Solution:**

**Clarify with charter owner:**
```
"Review Q1 Charter 1 - what specifically is launching?
- Is it just real-time sync, or also bulk editing?
- Is it for all customers, or mid-market only?
- Are there feature flags or phased rollout?"
```

**Or create launch scope doc:**
```markdown
# Launch Scope: Real-Time Sync

**In scope:**
- Real-time sync for catalog updates (<5 sec latency)
- User-initiated sync (on-demand button)
- Mid-market tier customers (50K-200K SKUs)

**Out of scope:**
- Bulk editing (separate launch Q2)
- Enterprise tier (future phase)
- Automated sync triggers (future enhancement)
```

Then proceed with GTM planning based on clarified scope.

**Why this happens:** Charters define strategic bets, not launch details. You may need to add specificity for GTM planning.

**Time impact:** +10 min to clarify scope

### Issue: "Missing stakeholder map - don't know who to enable"

**Problem:** Unsure which teams need to be involved in launch.

**Solution:**

**Create quick stakeholder map:**
```markdown
# Stakeholders for Real-Time Sync Launch

**Must enable (critical path):**
- Sales (need to pitch to new customers)
- CS (need to support existing customers)
- Engineering (need to monitor launch)

**Should enable (important but not blocking):**
- Marketing (announcement and collateral)
- Legal (contract review)

**Nice to enable (optional):**
- Partners (integration updates)
- Press (if major news)
```

**Or ask:**
```
"Who needs to be ready for launch day?
- Who will customers contact if they have questions? (CS)
- Who will sell this to new customers? (Sales)
- Who will monitor for issues? (Engineering)
- Who will announce this? (Marketing)"
```

**Why this happens:** Stakeholder mapping is often skipped until launch day, when it's too late.

**Time impact:** +10 min to map stakeholders

### Issue: "No competitive analysis exists"

**Problem:** GTM plan asks for competitive differentiation, but no analysis exists.

**Solution:**

**Option 1: Run competitive analysis first**
```
"Run competitive-analysis for [Competitor A], [Competitor B]"
```
Then return to GTM planning with competitive context.

**Option 2: Proceed with known context**
If you have informal competitive knowledge:
```
"Run planning-gtm-launch with competitive context:
- Competitor A: 24-hour sync, expensive ($$$)
- Competitor B: Real-time sync, but poor reliability (50% uptime)
- Our differentiation: Sub-5 sec sync, 99.9% uptime, mid-market pricing"
```

**Option 3: Flag as unknown**
```
"Run planning-gtm-launch. Competitive landscape is unknown - mark as research needed."
```
GTM plan will flag this as a gap.

**Why this happens:** Competitive analysis takes time. If on tight timeline, proceed with known context and backfill later.

**Time impact:** +15 min if running competitive analysis

### Issue: "Success metrics are vague or missing"

**Problem:** GTM plan has generic success criteria like "increase adoption."

**Solution:**

**Define specific targets:**
```
"Update success criteria with specific targets:

Leading indicators (first 30 days):
- 500 signups Week 1
- 50 demos booked Month 1
- 20 trials started Month 1

Lagging indicators (first 90 days):
- $50K ARR Q1
- 10 paying customers Q1
- 80% retention Month 3
- NPS >40"
```

**Or work backward from goals:**
```
If charter says "3 major accounts unblocked" →
Success metric: 3 major accounts migrated to real-time sync by end of Q1
```

**Why this happens:** PM OS generates metrics based on context. If context is vague ("improve sync"), metrics will be vague. Add specificity.

### Issue: "Timeline is too aggressive - teams say they can't deliver"

**Problem:** Stakeholders say GTM timeline is unrealistic (need more time).

**Solution:**

**Option 1: Push launch date**
```
"Update GTM plan with new launch date:
Old: March 15, 2026
New: April 1, 2026
Reason: Sales needs 4 weeks for training (not 2)"
```

**Option 2: Reduce scope**
```
"Update GTM plan with reduced scope:
Launch Phase 1 (March 15): Core sync feature, existing customers only
Launch Phase 2 (April 15): Full GTM, new customer acquisition
Gives CS more time to validate with existing customers before public launch"
```

**Option 3: Add resources**
```
"Update enablement plan:
- Hire contractor for collateral creation (unblock marketing)
- Use external agency for demo video (faster turnaround)
Keeps March 15 launch date"
```

**Why this happens:** GTM timelines are often optimistic. Stakeholder feedback surfaces real capacity constraints.

## Pre-Launch Checklist

Use this checklist 1 week before launch to validate readiness:

**Sales readiness:**
- [ ] Sales training completed (90%+ of team certified)
- [ ] Pitch deck finalized and approved
- [ ] Demo environment working (no critical bugs)
- [ ] Pricing and packaging locked
- [ ] Competitive battlecard available

**CS readiness:**
- [ ] CS runbook published and reviewed
- [ ] Support ticket workflows updated
- [ ] FAQ document available
- [ ] Customer communication drafted (announcement email)
- [ ] Escalation process tested

**Marketing readiness:**
- [ ] Collateral complete (deck, one-pager, video)
- [ ] Blog post drafted and approved
- [ ] Social media scheduled
- [ ] Email campaign ready to send
- [ ] Press release (if applicable) approved

**Engineering readiness:**
- [ ] Feature flags configured
- [ ] Monitoring dashboards live
- [ ] Performance testing passed
- [ ] Rollback plan documented and tested
- [ ] On-call rotation confirmed for launch week

**Legal/Compliance:**
- [ ] Contract review complete
- [ ] Terms of service updated
- [ ] Privacy/security sign-off received

**Launch day coordination:**
- [ ] Launch day timeline shared (who does what, when)
- [ ] War room scheduled (Slack channel or meeting)
- [ ] Success metrics dashboard live
- [ ] Communication plan for issues (who announces delays, bugs)

## Real-World Scenarios

### Scenario 1: Feature Launch (6 Weeks Before Launch)

**Context:** Charter approved for Real-Time Sync. Engineering says feature will be ready March 15. Need GTM plan.

**Workflow:**
1. Week 1 (6 weeks before): Run GTM planning workflow (60 min)
2. Week 1: Share GTM plan with stakeholders, get feedback
3. Week 2 (5 weeks before): Refine plan, assign owners
4. Week 3-5: Execute pre-launch phase (beta, training, collateral)
5. Week 6 (launch week): Execute launch phase
6. Post-launch: Execute post-launch phase (feedback, iteration)

**Time:** 60 min planning + ongoing execution

### Scenario 2: Major Product Launch (12 Weeks Before Launch)

**Context:** New product launching Q2. Need comprehensive GTM strategy for board presentation.

**Workflow:**
1. Week 1: Gather market research, competitive analysis
2. Week 2: Run GTM planning workflow (90 min)
3. Week 3: Present to board, get feedback
4. Week 4: Refine plan based on board input
5. Week 5-11: Execute pre-launch phase (beta, PR, enablement)
6. Week 12: Launch
7. Post-launch: Measure and iterate

**Time:** 90 min planning + extensive pre-launch execution

### Scenario 3: Repositioning Existing Product

**Context:** Product has low adoption. Need to reposition with new messaging and target new segment.

**Workflow:**
1. Analyze why current positioning failed (VOC, competitive analysis)
2. Run GTM planning with new segment and messaging
3. Create new collateral (pitch deck, positioning)
4. Re-train sales and CS on new positioning
5. Soft relaunch (no big announcement, gradual shift)
6. Measure new segment adoption

**Time:** 60 min repositioning + retraining time

### Scenario 4: Emergency Launch (Feature Ready Early)

**Context:** Engineering shipped feature 3 weeks early. No GTM plan exists. Need to launch ASAP.

**Workflow:**
1. Day 1: Run GTM planning workflow (compress to 45 min)
2. Day 1: Identify critical path (what MUST be done before launch?)
3. Day 2-3: Execute critical enablement (CS runbook, customer comms)
4. Day 4: Soft launch (announce to existing customers only, skip press)
5. Week 2: Full GTM launch (once collateral ready)

**Time:** 45 min planning + compressed enablement (3-5 days)

**Tradeoff:** Soft launch minimizes risk but delays full market impact.

## Next Steps

After completing launch planning:

1. **GTM plan approved** → Execute pre-launch phase, assign owners
2. **GTM reveals enablement gaps** → Address gaps before launch (extend timeline if needed)
3. **GTM identifies risks** → Create mitigation plans, assign owners
4. **Launch completes** → Run post-launch review: "Run reviewing-launch-outcomes 30 days post-launch"

**Weekly checkpoint during pre-launch:** Review enablement checklist, track progress, surface blockers.

## See Also

- [Post-Launch Review Workflow](./post-launch-review.md) - Review outcomes 30/60/90 days post-launch
- [Quarterly Strategy Workflow](./quarterly-strategy.md) - Ensure launches align with long-term strategy
- [skills/planning-gtm-launch/SKILL.md](/Users/singhm/pm_os_superpowers/skills/planning-gtm-launch/SKILL.md) - Full GTM planning pattern
- [skills/stakeholder-mapping/SKILL.md](/Users/singhm/pm_os_superpowers/skills/stakeholder-mapping/SKILL.md) - Map cross-functional dependencies
- [outputs/README.md](/Users/singhm/pm_os_superpowers/outputs/README.md) - Understanding dependencies and staleness
