# Meta-Prompt Reasoning Framework

## Purpose

Makes strategic PM thinking transparent by showing the reasoning process behind complex outputs. Enables users to verify assumptions, challenge logic, and understand tradeoffs before committing to a strategic direction.

**This is NOT required for all PM outputs** - only strategic ones where the reasoning process adds trust and clarity.

## When to Apply

Use meta-prompt reasoning for these strategic skills:

| Skill | Why Meta-Prompt Helps |
|-------|----------------------|
| `writing-product-strategy` | Multi-year strategy needs explicit reasoning about bets and positioning |
| `generating-quarterly-charters` | Bet selection involves complex tradeoffs - show why A beats B |
| `competitive-analysis` | Positioning choices need transparent rationale |

**NOT for:**
- Tactical skills (VOC synthesis, KTLO triage) - analysis is straightforward
- Execution skills (PRDs, exec updates) - reasoning already done upstream
- Data collection (truth base, stakeholder mapping) - minimal judgment required

## The 10-Step Algorithm (PM-Adapted)

### Phase 1: Understanding (Steps 1-4)

**1. Understand**
- Restate the problem in one sentence
- Identify the core challenge (not the surface request)
- Example: "Not 'write a charter' but 'choose 3 bets from 15 possible initiatives based on limited evidence'"

**2. Goals**
- Define measurable success criteria
- What would make this output "5-star quality"?
- Example: "Stakeholders can explain why these 3 bets beat alternatives in 2 minutes"

**3. Deconstruct**
- Break the problem into components
- Identify decision points
- Example: "Must evaluate initiatives on: customer evidence, competitive urgency, feasibility, strategic alignment"

**4. Context**
- Gather constraints and requirements
- List available evidence sources
- Identify gaps
- Example: "Have VOC (7 interviews), KTLO (47 tickets), no engineering capacity data"

### Phase 2: Exploration (Steps 5-6)

**5. Ideate**
- Generate options (initiatives, approaches, positioning choices)
- Don't filter yet - list all plausible options
- Example: "15 possible Q1 initiatives from VOC, KTLO, and competitive analysis"

**6. Filter**
- Evaluate each option against goals and constraints
- Use evidence to score
- Document tradeoffs
- Example: "Sync performance: high VOC signal (3/7), high KTLO signal (12 tickets), competitive threat (Syndigo faster)"

### Phase 3: Decision (Steps 7-8)

**7. Select**
- Choose best options with explicit rationale
- Show why chosen options beat alternatives
- Example: "Chose sync performance over UX refresh because evidence stronger (VOC+KTLO aligned) and competitive threat immediate"

**8. Plan**
- Sequence the chosen approach
- Identify dependencies
- Example: "Q1: sync performance, Q2: UX refresh (depends on sync foundation)"

### Phase 4: Execution & Learning (Steps 9-10)

**9. Execute**
- Generate the artifact (charter, strategy, analysis)
- Apply chosen approach
- Example: "Write charter with sync performance as Bet 1"

**10. Learn**
- Capture reasoning for future reference
- Note what would change the decision
- Example: "If VOC interviews show UX pain in 5+ more interviews, reconsider UX priority"

## Output Format

When meta-prompt is required, add this section **before** the main output:

```markdown
## Strategic Reasoning

### Problem & Goals
**Problem:** [One-sentence restatement]
**Success Criteria:** [What makes this output high-quality]

### Context & Constraints
**Available Evidence:**
- [Source 1 with key findings]
- [Source 2 with key findings]

**Constraints:**
- [Limitation 1]
- [Limitation 2]

**Gaps:**
- [Unknown 1 that affects decisions]

### Options Evaluated

| Option | Strengths | Weaknesses | Evidence Score |
|--------|-----------|------------|----------------|
| A | [Pros] | [Cons] | High/Medium/Low |
| B | [Pros] | [Cons] | High/Medium/Low |
| C | [Pros] | [Cons] | High/Medium/Low |

**Evidence Scoring:**
- High: 3+ sources aligned, quantified impact
- Medium: 2 sources, qualitative signals
- Low: 1 source or assumption-based

### Selection Rationale
**Chosen:** [Options selected]

**Why chosen beats alternatives:**
1. [Reason 1 with evidence]
2. [Reason 2 with evidence]
3. [Reason 3 with evidence]

**What would change this decision:**
- [Condition that would shift priority]

---

[Main output follows existing skill template]
```

## Example: Quarterly Charters with Meta-Prompt

```markdown
---
generated: 2026-01-20 16:00
skill: generating-quarterly-charters
sources:
  - outputs/insights/voc-synthesis-2026-01.md
  - outputs/ktlo/ktlo-triage-2026-01.md
  - outputs/truth_base/truth-base.md
---

# Q1 2026 Strategic Charters

## Strategic Reasoning

### Problem & Goals
**Problem:** Choose 3 strategic bets for Q1 from 15 possible initiatives, maximizing customer value and competitive positioning with limited engineering capacity.

**Success Criteria:**
- Stakeholders can explain why these 3 bets in 2 minutes
- Each bet has measurable success criteria
- Evidence-backed (not just opinions)
- Engineering can realistically deliver

### Context & Constraints
**Available Evidence:**
- VOC synthesis: 7 customer interviews, 3/7 cite sync speed as top pain
- KTLO triage: 47 tickets, 12 related to catalog sync (26%)
- Competitive analysis: Syndigo delivers sync in 5s vs our 45s

**Constraints:**
- Engineering: 2 backend engineers available (80% KTLO, 20% new features)
- Timeline: Must ship in Q1 (3 months)
- Budget: $50K infrastructure spend approved

**Gaps:**
- No current performance baseline (need to instrument)
- Win-loss data incomplete (only 3 of 7 churned customers interviewed)

### Options Evaluated

| Option | Strengths | Weaknesses | Evidence Score |
|--------|-----------|------------|----------------|
| **Sync Performance** | VOC+KTLO aligned (3/7 + 12 tickets), competitive threat (Syndigo), measurable (45s→5s) | Requires infrastructure investment, 2-month build | **High** |
| **UX Refresh** | 2/7 VOC mention outdated UI, marketing wants it | No KTLO signal, hard to measure success, lower urgency | **Medium** |
| **AI Extraction** | Exciting tech, competitive differentiation | Zero customer requests, unproven feasibility, risky | **Low** |
| **New Categories** | Expands TAM (groceries, hard goods) | No specific customer pull yet, requires BD partnerships | **Medium** |

**Evidence Scoring:**
- Sync Performance: High (3 sources: VOC, KTLO, competitive; quantified impact)
- UX Refresh: Medium (2 sources: VOC, marketing; qualitative)
- AI Extraction: Low (1 source: vision doc; no customer validation)
- New Categories: Medium (2 sources: sales, market research; directional)

### Selection Rationale
**Chosen:** Sync Performance (Bet 1), UX Refresh (Bet 2), New Categories (Bet 3)

**Why chosen beats alternatives:**

1. **Sync Performance beats AI Extraction**
   - Evidence: 3 aligned sources vs 0 customer asks
   - Urgency: Losing deals to Syndigo today vs future differentiation
   - Risk: Proven architecture approach vs unproven AI capability

2. **UX Refresh beats other tactical work**
   - Visible customer impact (affects all users)
   - Enables future features (modern component library)
   - Marketing alignment (needed for rebranding)

3. **New Categories beats incremental features**
   - TAM expansion (2x addressable market)
   - Sales has pipeline (3 prospects in groceries)
   - Strategic positioning (not just feature work)

**What would change this decision:**
- If engineering capacity drops to 1 engineer → cut New Categories
- If 5+ more VOC interviews cite UX → swap priorities (UX becomes Bet 1)
- If infrastructure cost exceeds $100K → defer sync performance to Q2

---

## Q1 2026 Strategic Bets

### Bet 1: Catalog Sync Performance
**Problem:** Sync latency (45s) is 9x slower than Syndigo (5s), causing deal losses.

**Goal:** Reduce sync latency to <5s for 95% of operations by end of Q1.

[Rest of charter follows existing template...]
```

## Quality Gates

Before completing an output with meta-prompt:

- [ ] Problem restated in one sentence (not just echoing user request)
- [ ] Success criteria are measurable and specific
- [ ] Context section lists actual sources with key findings (not vague "various sources")
- [ ] Options table includes ≥3 alternatives with honest pros/cons
- [ ] Evidence scoring is justified (High/Medium/Low explained)
- [ ] Selection rationale explains why chosen beats alternatives (not just why chosen is good)
- [ ] "What would change this decision" includes real triggers (not hypotheticals)
- [ ] Main output follows after reasoning (reasoning is preface, not replacement)

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
|--------------|--------------|---------|
| **Reasoning after decision** | Looks like justification, not thinking | Show options before selection |
| **Only 1-2 options** | Looks like fake choice | Always evaluate ≥3 alternatives |
| **All pros, no cons** | Loses credibility | Honest tradeoffs for each option |
| **Vague evidence** | "Research shows..." | Cite specific sources with findings |
| **No "what would change"** | Decision looks rigid | Show flexibility triggers |
| **Reasoning replaces output** | User gets philosophy, not deliverable | Reasoning is preface to main output |

## Why This Matters

**Without meta-prompt:**
- Strategic outputs appear without visible reasoning
- Users must trust AI chose correctly
- Hard to challenge assumptions
- Opaque tradeoffs

**With meta-prompt:**
- Transparent: "Here's why I chose A over B"
- Verifiable: User can check reasoning against own judgment
- Correctable: User can challenge weak reasoning before committing
- Teachable: Reasoning improves as user provides feedback (via output ratings)

**Trust Equation:**
```
Transparency (meta-prompt) + Quality Feedback (ratings) = Compounding Trust
```

Strategic outputs with clear reasoning get higher ratings → patterns identified → future reasoning improves → ratings trend up.

## Integration with Output Ratings

Meta-prompt reasoning and output ratings work together:

1. **Generate output with meta-prompt** (transparent reasoning)
2. **User rates the output** (1-5 scale)
3. **Weekly learning analyzes** which reasoning patterns correlate with high ratings
4. **Learned patterns update** reasoning approach for future outputs

Example learned pattern:
```
High-rated charters (≥4/5) show these reasoning patterns:
- Evaluated ≥4 options (not just 2-3)
- Evidence scoring explicit (High/Medium/Low with justification)
- "What would change" includes specific triggers (not vague "if things change")
- Tradeoffs honest (acknowledged cons of chosen options)
```

## Relationship to Other Rules

| Rule | Relationship |
|------|--------------|
| `.claude/rules/pm-core/evidence-rules.md` | Meta-prompt shows how evidence was evaluated to reach decisions |
| `.claude/rules/system/output-rating-capture.md` | Ratings provide feedback on reasoning quality |
| `.claude/rules/pm-core/decision-algorithm.md` | Meta-prompt is the "THINK" phase made visible |
| `.claude/rules/pm-workflows/charter-creation.md` | Meta-prompt precedes charter content |

Meta-prompt doesn't replace evidence discipline - it shows how evidence was used to make strategic choices.

## When User Requests "Skip Reasoning"

If user says "skip the reasoning" or "just give me the output":
- Respect the request
- Generate output without meta-prompt section
- Still apply reasoning internally (just don't show it)
- Note: output may get lower rating if user later questions choices

Offer: "I can show my reasoning if you'd like to verify the approach first."

## Iterating on Reasoning

If user challenges the reasoning:
1. Acknowledge their concern
2. Re-evaluate the challenged logic
3. Update reasoning section if they're right
4. Regenerate main output if reasoning changes
5. Create new version (don't just edit - show "v2 with revised reasoning")

Example:
```
User: "Why didn't you consider mobile app in the options?"

Nexa: You're right - mobile app should be in the options table given the sales
      pipeline mentions. Let me revise the reasoning section to include mobile
      as Option D and re-evaluate.

      [Regenerates Strategic Reasoning section with 4 options]

      Updated reasoning shows mobile scored Medium (sales interest but no
      engineering capacity). Still recommend sync/UX/new-categories, but now
      the mobile tradeoff is explicit.
```

This is why meta-prompt matters: users can catch gaps in reasoning before committing to a strategic direction.
