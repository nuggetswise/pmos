# Plan: Enhance PM OS Learning System with PAI Concepts + Meta-Prompt Reasoning

**Status:** Ready for review
**Goal:**
1. Answer: How to identify learning, decision, research, or sessions in PM OS
2. Evaluate PAI v2.3's continuous learning system for PM OS integration
3. Evaluate meta-prompt reasoning framework for PM OS
4. Recommend integration approach that adds real value

---

## Part 1: Identifying Capture Types in PM OS

### 1.1 How PM OS Identifies Different Capture Types

PM OS uses **context + timing** to classify captures:

| Type | When Identified | Storage Location | Key Indicators |
|------|----------------|------------------|----------------|
| **Learning** | After skill completion | `history/learnings/YYYY-MM-DD-[skill].md` | 3-5 key insights extracted from skill execution |
| **Decision** | Explicit user request OR implicit during charters/PRDs | `history/decisions/YYYY-MM-DD-[title].md` | Choice between options with rationale |
| **Research** | Document analysis during discovery phase | `outputs/discovery/` | Multi-source synthesis with signal classification |
| **Session** | User says goodbye/done OR explicit session end | `history/sessions/YYYY-MM-DD-summary.md` | Full session wrap-up with accomplishments |

### 1.2 Detection Heuristics (from decision-detection.md)

**High Confidence (Auto-capture):**
- Completed charter/PRD (PLAN or BUILD phase skill)
- Architectural changes (renamed concepts, restructured system)
- Explicit prioritization ("we're doing X instead of Y")

**Medium Confidence (Ask user):**
- Significant code changes (10+ files)
- Implementation approach chosen
- User language: "let's go with", "I think we should"

**Low Confidence (Skip):**
- Single file edits
- Information gathering
- Answering questions

### 1.3 Current Capture Mechanism

```
Skill Execution
    ↓
Auto-Capture Rule (.claude/rules/system/auto-capture.md)
    ↓
┌─────────────────────────────────────────────────┐
│ If PLAN/BUILD phase → Always capture learning   │
│ If decision detected → Log to decisions/        │
│ If session end → Create session summary         │
│ If significant insight → Append to beads        │
└─────────────────────────────────────────────────┘
    ↓
Storage:
├── history/learnings/2026-01-20-[skill].md
├── history/decisions/2026-01-20-[title].md
├── history/sessions/2026-01-20-summary.md
└── .beads/insights.jsonl
```

---

## Part 2: PAI v2.3 Continuous Learning - Value Analysis

### 2.1 PAI's Key Innovations

| PAI Feature | How It Works | Current PM OS Equivalent |
|-------------|--------------|--------------------------|
| **Sentiment Capture** | Explicit ratings (1-10) + AI-detected mood | None - opportunity |
| **Memory Layers** | Raw capture → sentiment overlay → pattern extraction | Beads (raw) + learned rules (patterns) |
| **Real-time Feedback** | Status line shows learning score | None - opportunity |
| **Continuous Improvement** | Hooks run on every message, learning at session end | Weekly learning only |
| **Multi-modal Rating** | Explicit numbers + implicit emotional tone | None - opportunity |

### 2.2 What Would Add Value to PM OS

#### ✅ HIGH VALUE - Implement These

**1. Output Quality Rating System**
- **What:** After generating any output (charter, PRD, VOC synthesis), ask user: "Rate this output (1-5)"
- **Value:** Identifies which outputs are high-quality vs need improvement
- **Storage:** Extend bead schema with `output-rating` type
- **Learning:** Weekly analysis surfaces patterns: "8/10 charters with ≤3 bets got 5-star ratings"

**2. Sentiment Detection on Feedback**
- **What:** When user provides feedback ("this is great" vs "this is wrong"), capture sentiment
- **Value:** Understand emotional response to different skill outputs
- **Storage:** Beads with `sentiment: positive|neutral|negative`
- **Learning:** "VOC syntheses with explicit quotes get more positive sentiment"

**3. Learning Trend Visibility**
- **What:** Show recent output quality trend in session greeting
- **Value:** User sees if PM OS is improving at helping them
- **Storage:** Read recent beads with type=output-rating
- **Display:** `📈 Output Quality: 4.2↑ (trending up)`

#### 🟡 MEDIUM VALUE - Consider These

**4. Implicit Satisfaction Capture**
- **What:** Detect when user says "perfect", "exactly", "thanks" after output
- **Value:** Captures positive signal without explicit rating
- **Complexity:** Requires NLP inference - may be overkill for PM OS

**5. Session Transcript Storage**
- **What:** Save full conversation JSON at session end
- **Value:** Can review entire conversation context later
- **Concern:** Large files, privacy implications

#### ❌ LOW VALUE - Skip These

**6. Real-time Hook on Every Message**
- **What:** PAI runs hooks on UserPromptSubmit for every message
- **Value:** Minimal - PM OS sessions are task-focused, not chat-based
- **Reason to skip:** PM OS is event-driven (skill completion), not message-driven

**7. Explicit Rating Patterns ("that was a 7")**
- **What:** Parse numeric ratings from free-form text
- **Value:** Low - PM OS users are more likely to use structured feedback
- **Reason to skip:** Simpler to ask directly after output

### 2.3 Recommended PAI Integration

**Implement: Output Quality Rating Capture**

**After every skill output generation:**

```
Skill completes (e.g., /voc synthesis)
    ↓
Output written to outputs/insights/voc-synthesis.md
    ↓
Ask user: "Rate this VOC synthesis (1-5, or skip)"
    ↓
User responds: "4" or "skip"
    ↓
If rated:
  - Append bead to .beads/insights.jsonl:
    {
      "id": "bead_20260120_150000_001",
      "type": "output-rating",
      "content": "VOC synthesis - clear themes, good evidence",
      "source": "synthesizing-voc",
      "output_file": "voc-synthesis-2026-01-20.md",
      "rating": 4,
      "sentiment": "positive",
      "tags": ["voc", "quality-4"],
      "created_at": "2026-01-20T15:00:00Z"
    }
    ↓
Weekly learning includes rating analysis:
  - "VOC syntheses avg rating: 4.2/5"
  - "Highest-rated outputs had explicit customer quotes"
  - "Low-rated outputs (≤3) had weak evidence links"
```

**Implementation Files:**

| File | Action | Purpose |
|------|--------|---------|
| `.claude/rules/system/output-rating-capture.md` | Create | Protocol for asking rating after output |
| `.beads/insights.jsonl` | Extend | Add output-rating bead type |
| `nexa/src/learn.ts` | Modify | Include rating analysis in weekly learning |
| `.claude/rules/system/session-greeting.md` | Modify | Show recent quality trend |

---

## Part 3: Meta-Prompt Reasoning Framework - Value Analysis

### 3.1 What Meta-Prompt Proposes

**10-Step PAI Algorithm:**

1. Understand - Define the problem
2. Goals - Measurable objectives
3. Deconstruct - Break into parts
4. Context - Gather constraints
5. Ideate - Brainstorm solutions
6. Filter - Evaluate against goals
7. Select - Choose best option
8. Plan - Sequence actions
9. Execute - Generate artifact
10. Learn - Reflect on outcome

**Application:**
- Add to complex skills (strategy, charters, PRDs)
- Show reasoning process in output
- Make AI thinking transparent

### 3.2 Value Analysis for PM OS

#### ✅ HIGH VALUE for Strategic Skills

**Skills That Benefit:**

| Skill | Why Meta-Prompt Helps | Current Gap |
|-------|----------------------|-------------|
| `writing-product-strategy` | Multi-year strategy needs explicit reasoning | Users don't see "why this approach" |
| `generating-quarterly-charters` | Bet selection needs transparent tradeoffs | Bets appear without visible reasoning |
| `competitive-analysis` | Positioning choices need clear rationale | Analysis lacks decision trail |

**Example Output Improvement:**

**Before (current):**
```markdown
## Q1 2026 Strategic Bets

### Bet 1: Catalog Sync Performance
Improve sync latency from 45s to 5s...
```

**After (with meta-prompt):**
```markdown
## Strategic Reasoning Process

### 1. Understood Goal
Generate 3 strategic bets for Q1 based on VOC, KTLO, and truth base

### 2. Context Analysis
- VOC: 3/7 customers cite sync speed as top pain
- KTLO: 12 sync bugs (25% of total tickets)
- Competitive: Syndigo does sync in 5s vs our 45s

### 3. Options Considered
A. Sync performance (high VOC+KTLO signal)
B. New feature set (low signal, risky)
C. UX refresh (medium signal)

### 4. Selection Rationale
Chose A (sync performance) because:
- Strongest evidence (VOC + KTLO aligned)
- Competitive threat (losing deals to faster alternatives)
- Measurable outcome (45s → 5s)

---

## Q1 2026 Strategic Bets

### Bet 1: Catalog Sync Performance
...
```

**Value:**
- User sees WHY this bet was chosen
- Explicit tradeoff reasoning
- Transparent evidence evaluation
- Can challenge assumptions if they disagree

#### 🟡 MEDIUM VALUE for Tactical Skills

**Skills with Limited Benefit:**

| Skill | Why Less Valuable | Better Approach |
|-------|-------------------|-----------------|
| `synthesizing-voc` | Analysis is straightforward (group themes) | Evidence discipline sufficient |
| `triaging-ktlo` | Prioritization is formulaic (P0/P1/P2) | Current template works |

#### ❌ LOW VALUE for Execution Skills

- PRD writing (traces to charter, reasoning already done)
- Exec updates (summary format, not strategic thinking)
- Stakeholder mapping (data collection, not deep reasoning)

### 3.3 Recommended Meta-Prompt Integration

**Implement for 3 Strategic Skills:**

1. `writing-product-strategy`
2. `generating-quarterly-charters`
3. `competitive-analysis`

**New Section in Skill Output:**

```markdown
## Strategic Reasoning (Meta-Prompt)

### Problem Understanding
[What was asked, core challenge]

### Context & Constraints
[Evidence sources, key facts, limitations]

### Options Evaluated
| Option | Pros | Cons | Evidence |
|--------|------|------|----------|
| A | ... | ... | ... |
| B | ... | ... | ... |

### Selection Rationale
[Why chosen approach beats alternatives]

---

[Rest of output follows existing template]
```

**Implementation Files:**

| File | Action | Purpose |
|------|--------|---------|
| `.claude/rules/pm-core/meta-prompt-reasoning.md` | Create | Canonical 10-step algorithm definition |
| `skills/writing-product-strategy/SKILL.md` | Modify | Add meta-prompt section requirement |
| `skills/generating-quarterly-charters/SKILL.md` | Modify | Add meta-prompt section requirement |
| `skills/competitive-analysis/SKILL.md` | Modify | Add meta-prompt section requirement |

---

## Part 4: Integration Recommendation

### 4.1 Phased Rollout

**Phase 1: Output Rating Capture (Immediate Value)**
- Implement after-skill rating prompt
- Extend beads schema for output-rating type
- Weekly learning includes quality analysis
- Session greeting shows quality trend

**Phase 2: Meta-Prompt for Strategic Skills (High Trust)**
- Add meta-prompt to 3 strategic skills
- Users see explicit reasoning in outputs
- Validate user satisfaction with transparency

**Phase 3: Advanced Learning (Future)**
- Sentiment detection on feedback
- Session transcript storage
- Pattern-based auto-improvement

### 4.2 What NOT to Implement

**From PAI:**
- ❌ Real-time hooks on every message (PM OS is event-driven, not chat-based)
- ❌ Explicit rating parsing from text (simpler to ask directly)
- ❌ Complex sentiment AI inference (overkill for structured workflow)

**From Meta-Prompt:**
- ❌ Apply to all skills (only strategic ones benefit)
- ❌ Rigid 10-step structure (adapt to PM context)

### 4.3 Key Architectural Decisions

**1. Rating Storage: Beads, Not Separate System**
- PAI uses `MEMORY/SIGNALS/ratings.jsonl`
- PM OS should use `.beads/insights.jsonl` with type=output-rating
- Reason: Beads system already exists, append-only, learning-ready

**2. Rating Prompt: Explicit Ask, Not Implicit Detection**
- PAI does both explicit + AI-inferred sentiment
- PM OS should start with explicit only (simpler, clearer)
- Ask: "Rate this output (1-5)" immediately after generation

**3. Learning Frequency: Weekly, Not Real-time**
- PAI runs learning hooks on every session end
- PM OS already has weekly-learning.sh on 7-day cadence
- Extend weekly learning to include rating analysis

**4. Meta-Prompt: Section in Output, Not Separate File**
- Meta-prompt reasoning becomes a section in the output document
- Keeps reasoning connected to final artifact
- Users see "why" alongside "what"

---

## Part 5: Implementation Plan

### Phase 1: Output Rating Capture

**Task 1.1: Create Output Rating Rule**
File: `.claude/rules/system/output-rating-capture.md`

Protocol:
1. After any PLAN or BUILD phase skill completes
2. Ask user: "Rate this [output type] (1-5, or 'skip')"
3. If rated: Create bead with type=output-rating
4. Store in `.beads/insights.jsonl`

**Task 1.2: Extend Bead Schema**
File: `.beads/insights.jsonl`

New bead type:
```json
{
  "id": "bead_YYYYMMDD_HHMMSS_XXX",
  "type": "output-rating",
  "content": "User feedback text (optional)",
  "source": "skill-name",
  "output_file": "filename.md",
  "rating": 1-5,
  "sentiment": "positive|neutral|negative",
  "tags": ["skill-tag", "quality-N"],
  "created_at": "ISO timestamp"
}
```

**Task 1.3: Enhance Weekly Learning**
File: `nexa/src/learn.ts`

Add rating analysis:
- Calculate average rating per skill
- Identify high-rated vs low-rated patterns
- Write to `.claude/rules/learned/quality-patterns.md`

Example learned pattern:
```markdown
## High-Quality Output Patterns

**VOC Synthesis (avg: 4.5/5)**
- Explicit customer quotes in evidence (8/10 high-rated)
- Clear theme grouping (7/10 high-rated)
- Linked to KTLO for validation (6/10 high-rated)

**Low-Rated Outputs (≤3/5)**
- Weak evidence attribution (5/7 low-rated)
- Too many assumptions vs evidence (4/7 low-rated)
```

**Task 1.4: Update Session Greeting**
File: `.claude/rules/system/session-greeting.md`

Add quality trend to greeting:
```
👋 Nexa here - PM OS ready.

📚 Loaded: 5 context dimensions

📈 Recent Output Quality: 4.2/5 ↑ (trending up based on 8 ratings)

🔄 Phase: PLAN
...
```

---

### Phase 2: Meta-Prompt for Strategic Skills

**Task 2.1: Create Meta-Prompt Rule**
File: `.claude/rules/pm-core/meta-prompt-reasoning.md`

Define 10-step algorithm adapted for PM work:
1. Understand - Problem statement
2. Goals - Measurable outcomes
3. Context - Evidence from sources
4. Options - Brainstorm approaches
5. Filter - Evaluate vs evidence/constraints
6. Select - Choose best option with rationale
7. Plan - Sequence of work
8. Execute - Generate artifact
9. Verify - Quality gates
10. Learn - Capture insights

**Task 2.2: Update Strategic Skills**

Files:
- `skills/writing-product-strategy/SKILL.md`
- `skills/generating-quarterly-charters/SKILL.md`
- `skills/competitive-analysis/SKILL.md`

Add requirement for "Strategic Reasoning" section before main output.

**Task 2.3: Create Output Template**

Template for reasoning section:
```markdown
## Strategic Reasoning

### Problem & Goals
[What was asked, success criteria]

### Evidence Analysis
[Key facts from sources with citations]

### Options Evaluated
| Option | Strengths | Weaknesses | Evidence Score |
|--------|-----------|------------|----------------|
| ... | ... | ... | High/Medium/Low |

### Selection Rationale
[Why chosen approach is best given constraints]

---

[Main output follows existing template]
```

---

## Part 6: Success Criteria

**Phase 1 (Output Rating):**
- [ ] User is prompted for rating after charter/PRD/strategy generation
- [ ] Ratings stored in `.beads/insights.jsonl` with correct schema
- [ ] Weekly learning generates quality-patterns.md with rating analysis
- [ ] Session greeting shows quality trend based on recent ratings

**Phase 2 (Meta-Prompt):**
- [ ] Strategic skills include "Strategic Reasoning" section
- [ ] Reasoning shows evidence evaluation and option comparison
- [ ] Users report increased trust in strategic outputs
- [ ] Low-rated outputs (≤3) are investigated for pattern improvement

---

## Part 7: What Makes This Valuable

### From PAI Integration:

**Value:** Systematic quality tracking
- Right now, PM OS has no feedback loop on output quality
- Users might regenerate outputs multiple times to get quality
- No visibility into "is PM OS getting better at helping me?"

**With rating capture:**
- Clear signal: which skills produce high-quality outputs?
- Learning: what patterns correlate with 5-star ratings?
- Visibility: user sees quality trending up over time
- Improvement: weekly learning identifies and fixes low-quality patterns

### From Meta-Prompt Integration:

**Value:** Transparent strategic reasoning
- Right now, strategic outputs (charters, strategy) appear without visible reasoning
- Users have to trust the AI chose the right approach
- Hard to challenge assumptions if reasoning is hidden

**With meta-prompt:**
- Explicit: "Here's why I chose Bet A over Bet B"
- Verifiable: User can check reasoning against their own judgment
- Correctable: User can challenge weak reasoning before committing
- Teachable: Reasoning improves as user provides feedback

### Combined Value:

**The Learning Loop Closes:**
```
Meta-Prompt → Transparent Reasoning
     ↓
User Rates Output (1-5)
     ↓
Rating Stored in Beads
     ↓
Weekly Learning Analyzes Patterns
     ↓
High-Rated Patterns → Learned Rules
     ↓
Future Outputs Use Learned Patterns
     ↓
Quality Trends Up ↑
```

**This is what enterprise teams build internally.**

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `.claude/rules/system/output-rating-capture.md` | Create | Rating prompt protocol |
| `.claude/rules/pm-core/meta-prompt-reasoning.md` | Create | 10-step reasoning algorithm |
| `nexa/src/learn.ts` | Modify | Add rating analysis to weekly learning |
| `.claude/rules/system/session-greeting.md` | Modify | Show quality trend |
| `skills/writing-product-strategy/SKILL.md` | Modify | Add meta-prompt requirement |
| `skills/generating-quarterly-charters/SKILL.md` | Modify | Add meta-prompt requirement |
| `skills/competitive-analysis/SKILL.md` | Modify | Add meta-prompt requirement |

---

## Key Insight

**PAI's continuous learning** is powerful but chat-focused. PM OS is **event-focused** (skill execution, not message-by-message).

**Adaptation:** Take PAI's rating capture + learning loop, but trigger on **skill completion** not every message. This gives PM OS the same quality feedback without the chat-based overhead.

**Meta-prompt** adds transparency to strategic thinking. Users see "why" alongside "what", building trust and enabling correction.

**Together:** PM OS becomes a learning system that improves at generating high-quality outputs over time, with transparent reasoning that users can verify and challenge.


  Phase 2 (if Phase 1 successful):                                                                                                                                      
  - Add capture to OBSERVE skills (VOC, KTLO, truth base)                                                                                                               
  - Add capture to BUILD skills (PRDs)                                                                                                                                  
  - Add capture to other strategic skills (GTM, stakeholders)                                                                                                           
                                                                                                                                                                        
  Phase 3 (Polish):                                                                                                                                                     
  - Continuous observation capture (mid-conversation insights)                                                                                                          
  - Weekly learning enhancement (analyze rating patterns)                                                                                                               
  - Cross-session pattern detection  