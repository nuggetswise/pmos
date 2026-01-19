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

**Required:**
- Recent quarterly charters (`outputs/roadmap/`)
- Recent VOC synthesis (`outputs/insights/voc-synthesis-*.md`)
- Truth base (`outputs/truth_base/truth-base.md`)

**Optional but helpful:**
- Competitive analysis (`outputs/insights/competitive-analysis-*.md`)
- Market research or analyst reports
- Customer interviews focused on future needs
- Product roadmap deck (`inputs/roadmap_deck/`)

**How to check if prerequisites are current:**
```bash
# PM OS will alert at session start if these are stale
# Example: "Stale outputs detected: voc-synthesis-2026-01-10.md"
```

**If missing competitive analysis:**
```
"Run competitive-analysis for [competitors]"
```

## Time Breakdown

| Step | Activity | Time |
|------|----------|------|
| 1 | Gather strategic inputs | 10 min |
| 2 | Run competitive analysis (if needed) | 15 min |
| 3 | Define scope and horizon | 5 min |
| 4 | Run writing-product-strategy | 10 min |
| 5 | Review strategy structure | 10 min |
| 6 | Validate pillars and metrics | 10 min |
| 7 | Refine and regenerate | 10 min |
| 8 | Share with stakeholders | Variable |
| **Total** | | **60-90 min** |

Add 30+ minutes for stakeholder review/alignment.

## Step-by-Step Process

### Step 1: Gather Strategic Inputs

**Action:** Collect all relevant context for strategy creation.

**What to gather:**

**From PM OS outputs:**
```bash
# Check recent charters
ls -lt outputs/roadmap/*.md | head -3

# Check recent VOC synthesis
ls -lt outputs/insights/voc-synthesis-*.md | head -1

# Check truth base
cat outputs/truth_base/truth-base.md
```

**External inputs:**
- Market research reports (analyst reports, industry trends)
- Customer interviews about future needs (not just current pain)
- Competitive intelligence (recent product launches, funding, positioning)
- Company OKRs or strategic priorities
- Technology trends (AI, automation, standards evolution)

**What happens:**
You're building a complete picture of:
- Where you are today (truth base, charters)
- Where customers are heading (VOC, interviews)
- Where the market is heading (trends, competition)
- Where the company wants to go (OKRs, priorities)

**Why this step matters:** Strategy built on incomplete context is either too cautious (misses opportunities) or too aggressive (ignores threats). You need the full picture.

**Pro tip:** Create a temporary folder `inputs/strategy-inputs/` to organize all external research, interview notes, and market data in one place.

**Time:** ~10 minutes

### Step 2: Run Competitive Analysis (If Needed)

**Action:** If you don't have recent competitive analysis, generate it now.

```
"Run competitive-analysis for [Competitor A], [Competitor B], [Competitor C]"
```

**What to analyze:**
- **Strengths:** What are they good at?
- **Weaknesses:** Where are they vulnerable?
- **Strategy:** Where are they investing?
- **Differentiation:** How do we position against them?

**Expected output:**
File created at `outputs/insights/competitive-analysis-YYYY-MM-DD.md`

**When to skip this step:**
- You have competitive analysis from last 30 days
- You're in a blue ocean market (no direct competitors)
- Competitive landscape hasn't changed significantly

**Why this step matters:** You can't define defensible positioning without understanding competitive threats. Your moats need to be built around competitor weaknesses.

**Pro tip:** Focus on 2-3 major competitors, not the entire landscape. Deep analysis of key threats beats shallow analysis of everyone.

**Time:** ~15 minutes (skip if already done)

### Step 3: Define Scope and Horizon

**Action:** Clarify what product area and time horizon your strategy covers.

**Questions to answer:**

**Scope:**
- "What product area is this strategy for?"
  - Example: "Business Network + Catalogs for Retail/CPG"
  - Or: "Self-service supplier onboarding platform"

**Horizon:**
- "What time horizon: 3 years or 5 years?"
  - 3 years: For fast-moving markets, tech-heavy products
  - 5 years: For enterprise platforms, network effects businesses

**Context:**
- "What existing context should I read?"
  - List file paths: `outputs/roadmap/Q1-2026-charters.md`, `outputs/insights/voc-synthesis-2026-01-15.md`
  - Mention external sources: "Market research from Gartner 2026 Retail Tech report"

**Example prompt:**
```
"Create 3-year product strategy for Business Network + Catalogs.
Read:
- outputs/roadmap/Q1-2026-charters.md
- outputs/insights/voc-synthesis-2026-01-15.md
- outputs/insights/competitive-analysis-2026-01-14.md
- Market trend: AI-driven catalog validation becoming standard by 2028"
```

**Why this step matters:** Vague scope leads to vague strategy. "Improve our product" isn't a strategy. "Become the operating system for retail product information by 2029" is.

**Time:** ~5 minutes

### Step 4: Run /strategy (Generate Product Strategy)

**Action:** Generate the multi-year product strategy.

```
"Run writing-product-strategy"
```

Or use the full prompt from Step 3.

**What happens:**
- PM OS reads all specified sources
- Analyzes trends, opportunities, threats
- Defines vision statement (where you'll be in N years)
- Creates 3-5 strategic pillars with capabilities
- Maps capability roadmap to timeline
- Identifies competitive moats
- Shows strategy cascade (strategy → charters → PRDs)
- Generates output in `outputs/strategy/product-strategy-YYYY.md`

**Expected output structure:**
```markdown
# Product Strategy: Business Network + Catalogs (2026-2029)

## Vision Statement
[2-3 sentences: Where we'll be in 3 years]

## Market Context
- Trends (next 3 years)
- Opportunities (white space)
- Threats (risks to vision)

## Strategic Pillars
### Pillar 1: [Name]
- Why this matters
- Key capabilities
- Success looks like (Year 3)

### Pillar 2: [Name]
[...]

## Capability Roadmap
[Timeline mapping capabilities to years]

## Competitive Moats
[What makes this defensible]

## Strategy Cascade to Execution
[How strategy → charters → PRDs]

## Investment Allocation
[% of engineering per pillar]
```

**Time:** ~10 minutes

### Step 5: Review Strategy Structure

**Action:** Read the generated strategy carefully and validate structure.

```bash
# Open latest strategy
cat outputs/strategy/product-strategy-$(date +%Y).md
```

**What to review:**

**Vision statement:**
- Is it clear and specific? (Not "be the best")
- Does it describe a future state? (Where you'll be in N years)
- Does it explain your role in that future?

**Good vision:**
"In 3 years, every retail buyer will use our Business Network as their primary source of truth for catalog data. Suppliers will publish once to reach all retailers. We'll be the operating system for retail product information."

**Bad vision:**
"Be the leading catalog platform" (vague, no specific outcome)

**Strategic pillars:**
- Are there 3-5 pillars? (Not too many, not too few)
- Does each pillar have clear business case ("Why this matters")?
- Does each pillar have specific capabilities listed?
- Does each pillar have measurable success criteria?

**Market context:**
- Are trends specific and time-bound?
- Are opportunities sized (TAM if known)?
- Are threats identified with mitigation plans?

**Competitive moats:**
- Are moats defensible? (Network effects, data, switching costs)
- Is it clear how you'll build each moat?
- Do moats map to competitor weaknesses?

**Why this step matters:** First draft may miss key elements or have vague sections. This review surfaces gaps before stakeholder review.

**Time:** ~10 minutes

### Step 6: Validate Pillars and Metrics

**Action:** Ensure each pillar is specific, defensible, and measurable.

**Validation checklist for each pillar:**

**Specificity:**
- [ ] Pillar has clear name (not generic like "Better quality")
- [ ] "Why this matters" explains business value
- [ ] Capabilities are concrete (not abstract)

**Measurability:**
- [ ] Success criteria include baseline state
- [ ] Success criteria include target state (Year N)
- [ ] Metrics are quantifiable (not "improved" or "better")

**Defensibility:**
- [ ] Pillar creates competitive advantage
- [ ] Pillar builds on unique strength
- [ ] Pillar is hard for competitors to replicate

**Example validation:**

| Bad Pillar | Why Bad | Good Pillar |
|------------|---------|-------------|
| "Improve quality" | Vague, no outcome | "Automated catalog quality: <5% error rate via AI validation by 2029" |
| "Faster performance" | Generic | "Sub-second search: 500ms p95 for 100M SKUs enabling real-time buyer workflows" |
| "Better UX" | Unmeasurable | "Zero-training onboarding: 80% task completion without docs/support within 7 days" |

**If metrics are vague:**

Edit the strategy file manually:
```bash
# Open strategy for editing
code outputs/strategy/product-strategy-2026.md

# Or use PM OS to refine
"Refine Pillar 1 success criteria: Define baseline and target for catalog error rate"
```

**Why this step matters:** Vague pillars = impossible to execute. Your charters should directly advance pillars, and that only works if pillars are concrete.

**Time:** ~10 minutes

### Step 7: Refine and Regenerate

**Action:** Incorporate feedback and regenerate if needed.

**Common refinements:**

**Adjust pillar focus:**
```
"Re-run writing-product-strategy with these changes:
- Pillar 1: Focus on AI-driven automation (not manual processes)
- Pillar 2: Add self-service supplier onboarding
- Remove Pillar 4 (defer to 5-year strategy)"
```

**Add strategic context:**
```
"Update strategy with constraint:
- Must align with company OKR: Expand TAM to mid-market
- Focus pillars on reducing onboarding friction"
```

**Strengthen moats:**
```
"Strengthen competitive moats section:
- Add network effect moat (more suppliers = more buyers)
- Add data moat (catalog quality improves with volume)
- Explain why switching costs increase over time"
```

**Re-run strategy:**
```
"Run writing-product-strategy"
```

**Or manually edit:**
```bash
# Open strategy file for direct editing
code outputs/strategy/product-strategy-2026.md

# Make changes, save

# No manual stale tracker in AG3; rely on `pm-os status` and re-run the skill if needed
```

**Pro tip:** If making small changes (typos, metric tweaks), edit directly. If making big changes (new pillars, different horizon), re-run the skill.

**Why this step matters:** Strategy is never perfect on first draft. Refinement creates shared ownership and ensures alignment with company direction.

**Time:** ~10 minutes

### Step 8: Share with Stakeholders

**Action:** Present strategy for feedback and alignment.

**Who to review with:**
- **Leadership/Manager:** Align on vision and investment allocation
- **Engineering lead:** Validate technical feasibility of capabilities
- **Design lead:** Confirm UX vision aligns with pillars
- **Cross-functional partners:** Sales, CS, Marketing (if strategy affects GTM)
- **Board/Investors:** If applicable for funding or strategic direction

**Review format options:**

**Async review (email/Slack):**
```markdown
Product Strategy (2026-2029) ready for review:

Vision: Become the operating system for retail product information

3 Strategic Pillars:
1. Automated Catalog Quality (<5% error rate by 2029)
2. Self-Service Supplier Onboarding (80% zero-touch by 2028)
3. Real-Time Catalog Network (sub-second sync across all retailers)

Full doc: outputs/strategy/product-strategy-2026.md

Feedback by [date]?
```

**Sync review (presentation):**
- Vision (2 min): Where we're going
- Market context (3 min): Why now, what's changing
- Strategic pillars (10 min): What we'll build, why defensible
- Roadmap (5 min): Year 1 → Year 2 → Year 3
- Q&A (10 min): Address concerns, refine

**What to ask stakeholders:**
- Does vision align with company strategy?
- Are pillars defensible (competitive moats)?
- Are capability timelines realistic?
- Are we missing major threats or opportunities?
- Does investment allocation make sense?

**Why this step matters:** Strategy only works if stakeholders buy in. Alignment upfront prevents mid-year pivots and resource conflicts.

**Time:** Variable (10 min async read, 30-60 min sync meeting)

## Expected Outputs After Completion

**Files created:**
1. `outputs/strategy/product-strategy-YYYY.md` - 3-5 year product strategy

**Versioned copy:**
- `history/writing-product-strategy/product-strategy-YYYY-MM-DD.md`

**Updated:**
- `nexa/state.json` - Next action reflects what to refresh or run next
- `outputs/audit/auto-run-log.md` - Records daemon actions (if any)

**You now have:**
- Clear 3-5 year vision
- 3-5 strategic pillars with capabilities
- Capability roadmap mapped to timeline
- Competitive moats defined
- Strategy cascade (how quarterly charters advance pillars)
- Stakeholder alignment on direction

## Common Variations

### Annual vs Bi-Annual Strategy Refresh

**Annual strategy (every year):**
- Full strategy regeneration
- Review all pillars, adjust based on market changes
- Update capability roadmap
- Reassess competitive landscape
- **Time:** 90 minutes (full workflow)

**Bi-annual strategy (every 2 years):**
- Major strategy creation or pivot
- Often tied to funding events or market shifts
- Deeper market research required
- **Time:** 90 minutes + external research time

**Mid-year strategy check (6 months):**
- Read existing strategy
- Validate pillars still make sense
- Update capability roadmap (shift timelines if needed)
- No full regeneration unless major pivot required
- **Time:** 30 minutes

### Top-Down (Company-Driven) vs Bottom-Up (Customer-Driven)

**Top-down (company OKRs drive strategy):**
- Start with company OKRs or board priorities
- Map product pillars to company strategy
- Ensure quarterly charters advance company goals
- **Use when:** Board priorities clear, well-funded, strategic clarity exists

**Bottom-up (customer needs drive strategy):**
- Start with VOC synthesis and customer trends
- Let customer pain points define pillars
- Connect customer value to business outcomes
- **Use when:** Early stage, customer discovery mode, product-market fit phase

**Hybrid (most common):**
- Company OKRs provide constraints ("Expand TAM to mid-market")
- Customer VOC defines how to achieve OKRs
- Pillars balance strategic goals + customer needs

### 3-Year vs 5-Year Horizon

**3-year strategy:**
- Fast-moving markets (tech, SaaS, AI-driven)
- High uncertainty beyond 3 years
- Focus on near-term defensibility
- **Time:** 60-90 minutes

**5-year strategy:**
- Enterprise platforms (long sales cycles)
- Network effects businesses (compounding growth)
- Capital-intensive bets (infrastructure, data moats)
- **Time:** 90 minutes + deeper market research

## Troubleshooting

### Issue: "Missing competitive analysis"

**Problem:** No recent competitive analysis exists, and competitors are a major factor.

**Solution:**

**Option 1: Run competitive analysis first**
```
"Run competitive-analysis for [Competitor A], [Competitor B]"
```
Then return to strategy workflow (Step 4).

**Option 2: Proceed with known context**
If you have informal competitive knowledge, provide it:
```
"Run writing-product-strategy with competitive context:
- Competitor A: Strong in enterprise, weak in self-service
- Competitor B: Fast UX, but limited catalog scale
- Competitor C: Cheap, but low data quality"
```

**Option 3: Mark as unknown**
If competitive landscape is unclear:
```
"Run writing-product-strategy. Competitive analysis is unknown - mark as open question."
```
Strategy will flag this as a gap requiring research.

**Why this happens:** Competitive intelligence takes time. If on tight deadline, proceed with known context and backfill analysis later.

**Time impact:** +15 min if running competitive analysis

### Issue: "Pillars feel too tactical (features, not capabilities)"

**Problem:** Pillars read like a feature list, not strategic capabilities.

**Example of tactical (bad):**
- Pillar 1: Build bulk editing tool
- Pillar 2: Add search filters
- Pillar 3: Faster sync

**Solution:**

**Reframe as capabilities:**
```
"Refine strategic pillars to focus on capabilities, not features:
- Pillar 1: Zero-friction catalog management (includes bulk editing, validation, templates)
- Pillar 2: Intelligent catalog discovery (includes search, recommendations, personalization)
- Pillar 3: Real-time catalog network (includes sync, notifications, collaboration)"
```

**Or manually edit:**
```markdown
### Pillar 1: Zero-Friction Catalog Management

**Why This Matters:**
Managing 50K+ SKUs manually is unsustainable. Automation reduces time-to-market by 80%.

**Key Capabilities:**
- Bulk editing and templating
- AI-powered validation and enrichment
- Workflow automation for approvals

**Success Looks Like (Year 3):**
- 80% of catalog updates automated (vs 20% today)
- Time-to-publish reduced from 4 hours to 30 minutes
- <5% error rate (vs 40% today)
```

**Why this happens:** It's easier to list features than to articulate strategic capabilities. Force yourself to think "what does this enable?" not "what will we build?"

### Issue: "Strategy doesn't connect to current charters"

**Problem:** Strategy feels disconnected from quarterly work. Charters don't ladder to pillars.

**Solution:**

**Add strategy cascade section:**
```
"Update strategy with examples showing:
- How Q1 2026 Charter 1 (Real-time sync) advances Pillar 3 (Real-time catalog network)
- How Q1 2026 Charter 2 (Bulk editing) advances Pillar 1 (Zero-friction management)
- Show metric cascade: Strategy KPI → Charter metric → PRD acceptance"
```

**Or manually map:**
```markdown
## Strategy Cascade Example

**Strategy Pillar:** Automated Catalog Quality
**Q1 Charter:** Ship AI validation for top 5 error types
**PRD:** AI validation service for missing attributes
**Success Metric Cascade:**
- Strategy KPI: <5% data error rate (Year 3)
- Charter Metric: Reduce error rate from 40% to 30% (Q1)
- PRD Acceptance: Validate 10K products, catch 90% of missing attributes
```

**Why this happens:** Strategy and execution are often created in isolation. The "cascade" section bridges this gap, showing how daily work advances long-term vision.

### Issue: "Competitive moats are weak or unclear"

**Problem:** Moats section lists generic advantages that competitors can easily replicate.

**Example of weak moats:**
- "Better product" (not defensible)
- "Good customer service" (easily copied)
- "Lower price" (race to bottom)

**Solution:**

**Identify real moats:**
```
"Strengthen competitive moats section with:
1. Network effect: More suppliers attract more buyers, creating flywheel
2. Data moat: Catalog quality improves with scale (10M products = better AI models)
3. Switching cost: Once catalog is migrated and integrated, painful to leave
Explain how each moat compounds over time."
```

**Or use framework:**
```markdown
### Moat 1: Network Effects
**What:** Two-sided marketplace - more suppliers attract more buyers, more buyers attract more suppliers.
**How We Build It:** Incentivize early supplier adoption, create buyer value that scales with supplier count.
**Defensibility:** Competitors starting from zero can't match network density. Compounding advantage over time.

### Moat 2: Data Moat
**What:** 100M+ product records create proprietary dataset for AI validation and enrichment.
**Defensibility:** Competitors with smaller datasets have worse AI accuracy. Data compounds with scale.
```

**Why this happens:** Moats require deep thinking about what's truly hard to replicate. Most product advantages are temporary - moats are structural.

### Issue: "Vision statement is vague or generic"

**Problem:** Vision reads like corporate jargon, not a specific future state.

**Example of vague vision:**
"Be the leading provider of innovative catalog solutions."

**Solution:**

**Make it specific:**
```
"Rewrite vision statement to be concrete:
- Where: Retail/CPG industry, North America
- Who: Every retail buyer and supplier
- What: Operating system for product information
- When: By 2029
- How different: Publish once, reach all retailers (vs today's fragmented publishing)"
```

**Good vision example:**
"In 3 years, every retail buyer in North America will use our Business Network as their primary source of truth for catalog data. Suppliers will publish once to reach all retailers, replacing today's fragmented EDI systems. We'll be the operating system for retail product information."

**Why this happens:** It's easier to write vague aspirations than specific outcomes. Force yourself to answer: What will be different in the world? Who will do what differently?

## Real-World Scenarios

### Scenario 1: Annual Strategy Planning (Start of Year)

**Context:** It's December. Board wants 2027-2030 strategy by January for planning cycle.

**Workflow:**
1. Week 1: Gather inputs (customer interviews, market research, competitive analysis)
2. Week 2: Run daily routine to build fresh VOC corpus
3. Week 3: Run competitive analysis
4. Week 4: Run writing-product-strategy (draft)
5. Week 4: Share with stakeholders, collect feedback
6. Week 5: Refine and finalize strategy
7. Week 5: Present to board/leadership

**Time:** 90 min strategy generation + research time + stakeholder alignment

### Scenario 2: Mid-Year Strategy Refresh (Pivot)

**Context:** Market shifted significantly. Major competitor launched competing product. Need to adjust strategy.

**Workflow:**
1. Review current strategy: `cat outputs/strategy/product-strategy-2026.md`
2. Capture new market data (competitor launch details, customer reactions)
3. Run competitive analysis for new competitor
4. Run writing-product-strategy with context: "Account for Competitor X launch of [product]"
5. Compare old vs new strategy (what changed?)
6. Share with stakeholders: "Proposed strategy adjustment based on market shift"
7. Update and communicate

**Time:** 60 min + stakeholder alignment

### Scenario 3: New Product Launch (Blue Ocean)

**Context:** Launching entirely new product in unproven market. No direct competitors yet.

**Workflow:**
1. Gather customer research (interviews, surveys about future needs)
2. Run writing-product-strategy with context: "No direct competitors, focus on category creation"
3. Emphasize vision and market opportunity (not competitive differentiation)
4. Define success as category ownership, not competitive wins
5. Share with investors/board for funding alignment

**Time:** 90 min (heavier on vision/market context, lighter on competitive moats)

### Scenario 4: Connecting Charters to Strategy (Alignment Check)

**Context:** Quarterly charters feel disconnected. Engineering asks "why are we building this?"

**Workflow:**
1. Read current strategy: `cat outputs/strategy/product-strategy-2026.md`
2. Read current charters: `cat outputs/roadmap/Q1-2026-charters.md`
3. Map each charter to a pillar
4. If charter doesn't map → question whether it belongs on roadmap
5. Update charters with explicit pillar alignment
6. Share with team: "How our Q1 work advances 3-year vision"

**Time:** 30 min (alignment check, not full strategy regeneration)

## Next Steps

After completing quarterly strategy:

1. **Strategy approved** → Validate quarterly charters align with pillars
2. **Strategy reveals gaps** → Run competitive analysis or customer research to fill gaps
3. **Strategy highlights pillar** → Create charter to advance that pillar this quarter
4. **Strategy shifts priorities** → Update quarterly charters to reflect new direction

**Annual checkpoint:** Re-run strategy workflow every 12 months or when market shifts significantly.

## See Also

- [Weekly Planning Workflow](./weekly-planning.md) - Align charters to strategic pillars
- [Daily Routine Workflow](./daily-routine.md) - Gather customer/market signals for strategy
- [skills/writing-product-strategy/SKILL.md](/Users/singhm/pm_os_superpowers/skills/writing-product-strategy/SKILL.md) - Full strategy creation pattern
- [outputs/README.md](/Users/singhm/pm_os_superpowers/outputs/README.md) - Understanding dependencies and staleness
