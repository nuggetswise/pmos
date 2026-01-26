# PM OS: Context, Skills, and Continuous Learning

**An Educational Guide to PM OS Architecture and Learning System**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [COMPASS Context Files](#compass-context-files)
3. [Skills Transformation](#skills-transformation)
4. [The Learning Loop](#the-learning-loop)
5. [Concrete Examples](#concrete-examples)
6. [Why This Matters](#why-this-matters)

---

## Architecture Overview

### What is PM OS?

PM OS is a **file-based Product Management operating system** that transforms raw inputs (customer feedback, support tickets, strategy docs) into actionable insights, strategic charters, and executable PRDs through modular, evidence-driven workflows.

### The Three-Layer System

```
┌──────────────────────────────────────────────────────────────┐
│                     CONTEXT LAYER                            │
│  (inputs/context/ - Universal, loaded every session)         │
│  compass.md | projects.md | challenges.md | preferences.md   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                     SKILLS LAYER                             │
│  (Modular PM workflows that transform context into outputs)  │
│  Discovery | Planning | Execution | Strategic | Learning     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                     OUTPUTS LAYER                            │
│  (outputs/ - Organized by tier and temperature)              │
│  Tier 1: Foundation | Tier 2: Planning | Tier 3: Execution  │
└──────────────────────────────────────────────────────────────┘
```

### Why This Architecture Matters

| Principle | Implementation | Benefit |
|-----------|---------------|---------|
| **Modular** | Skills are independent, composable | Run only what you need |
| **Traceable** | Every output cites its sources | Verify claims, detect staleness |
| **Evidence-based** | Never invent data, always cite | Trust outputs for decisions |
| **Learning** | Patterns extracted from history | Quality improves over time |
| **File-based** | No database, just markdown + YAML | Version control, human-readable |

---

## COMPASS Context Files

### The Foundation Layer

PM OS loads **4 universal context files** at every session start. These provide the strategic foundation that all skills can access.

**Location:** `inputs/context/`

### The 4 COMPASS Files

#### 1. compass.md
**Purpose:** Strategic North Star

```yaml
Contains:
  - Mission statement
  - Strategic goals (annual, quarterly)
  - Core beliefs and principles
  - Stakeholder list
  - Success metrics (company-level)
```

**Used by:**
- `generate-charters` - Ensures bets align with mission
- `writing-strategy` - Grounds 3-year vision in mission
- `stakeholder-management` - Maps stakeholders to influence
- `synthesize-voc` - Segments customers by ICP

**Example:**
> Mission: "Enable seamless B2B commerce through real-time catalog sync"
> → Charter bet: "Real-time sync performance" (directly aligned)

---

#### 2. projects.md
**Purpose:** Active Work Tracking

```yaml
Contains:
  - Active initiatives table (initiative, status, next milestone)
  - Current blockers
  - Dependencies between projects
```

**Used by:**
- `create-executive-update` - Shows progress on active work
- `generate-charters` - Avoids duplicating in-flight work
- Session greeting - Displays "Active Work" section
- `stakeholder-management` - Links stakeholders to projects

**Example:**
```markdown
| Initiative | Status | Next Milestone |
|------------|--------|----------------|
| Catalog Sync Performance | In Progress | Beta launch 2026-02-15 |
| Customer Discovery Program | Not Started | Complete 5 interviews by 2026-01-31 |
```

---

#### 3. challenges.md
**Purpose:** Constraints and Obstacles

```yaml
Contains:
  - Active blockers (what's stuck)
  - Resource constraints (team capacity, budget)
  - Technical/organizational challenges
  - Risk register
```

**Used by:**
- `generate-charters` - Includes constraints in planning (e.g., "2 backend engineers available")
- All skills - "Risks & Mitigations" sections reference known challenges
- Session greeting - Displays "Needs Attention" blockers
- `writing-strategy` - Addresses challenges in long-term vision

**Example:**
> Constraint: "2 backend engineers (80% KTLO, 20% new features)"
> → Charter adjusts scope: "Must deliver in 1 quarter with limited capacity"

---

#### 4. preferences.md
**Purpose:** Communication Style and Working Cadence

```yaml
Contains:
  - Output format preferences (concise vs detailed)
  - Communication tone (exec-friendly, technical, narrative)
  - Review cadence (weekly, monthly)
  - Meeting schedule preferences
```

**Used by:**
- All output generation - Adjusts tone and depth
- `create-executive-update` - Formats for exec audience
- Session interactions - Matches user's preferred style

**Example:**
> Preference: "Concise, decision-first outputs. Tables over prose."
> → All outputs lead with recommendation, use tables for comparisons

---

### How Context Loads

**Session Start Sequence:**

1. Nexa reads `nexa/state.json` for daemon status
2. Loads all 4 COMPASS files from `inputs/context/`
3. Displays session greeting with:
   - Active work from `projects.md`
   - Blockers from `challenges.md`
   - Next recommended action
4. Context remains in memory for entire session

**Universal Access:**
- Every skill can reference COMPASS context without explicitly loading
- No "which context file should I use?" - they're always available
- Skills ask only for *additional* inputs (VOC, KTLO, truth base)

---

## Skills Transformation

### How Skills Work

Skills are modular PM workflows that:
1. **Gather context** - Ask what inputs to use (context-gathering protocol)
2. **Transform inputs** - Apply PM logic, extract patterns
3. **Generate outputs** - Create traceable, evidence-backed artifacts
4. **Capture learnings** - Extract insights for future improvement

### Context-Gathering Protocol

**Key Innovation:** Skills don't *block* on missing inputs - they *ask* what to use.

**Flow:**
```
Skill starts
    ↓
Detect available inputs
    ↓
Present options to user:
  - [voc-synthesis-2026-01.md] 7 customer interviews
  - [ktlo-triage-2026-01.md] 47 support tickets
  - [truth-base.md] Product overview
  - [Point me to another document]
  - [Describe what you need]
    ↓
User selects
    ↓
Skill proceeds with selected context
```

**No blocking:**
- Old way: "ERROR: Cannot run /prd without charter"
- New way: "To write this PRD, what context should I use? [options]"

---

### Skill Categories

#### Discovery Skills
**Purpose:** Understand product, customers, operations

| Skill | Consumes | Generates |
|-------|----------|-----------|
| **synthesize-customer-voice** | `inputs/voc/*.md` (interviews)<br>`compass.md` (customer segments) | `outputs/insights/voc-synthesis-YYYY-MM-DD.md`<br>Top themes, quotes, patterns |
| **building-truth-base** | `outputs/ingest/*` (docs)<br>`compass.md` (mission)<br>`projects.md` (roadmap) | `outputs/truth_base/truth-base.md`<br>Product overview, capabilities, gaps |
| **discovery** | `outputs/ingest/*` (docs to analyze)<br>`compass.md` (context) | `outputs/discovery/doc-analysis-*.md`<br>`outputs/discovery/interview-guide-*.md` |
| **triage-backlog** | `inputs/jira/*.csv` (tickets)<br>`projects.md` (active work) | `outputs/ktlo/ktlo-triage-YYYY-MM-DD.md`<br>Prioritized by urgency, patterns |

**Pattern:** Discovery skills create **Tier 1 outputs** (foundation) that feed into planning.

---

#### Planning Skills
**Purpose:** Define what to build and why

| Skill | Consumes | Generates |
|-------|----------|-----------|
| **generate-strategic-charter-and-prd** | `outputs/insights/voc-*.md`<br>`outputs/ktlo/*.md`<br>`outputs/truth_base/*.md`<br>`compass.md` (alignment)<br>`challenges.md` (constraints)<br>`.beads/insights.jsonl` (patterns) | `outputs/roadmap/Qx-YYYY-charters.md`<br>3-5 strategic bets with evidence |
| **stakeholder-management** | `compass.md` (stakeholder list)<br>`projects.md` (initiatives) | `outputs/stakeholders/stakeholder-map-*.md`<br>Power/interest analysis, comms plan |

**Pattern:** Planning skills create **Tier 2 outputs** that synthesize Tier 1 inputs.

---

#### Execution Skills
**Purpose:** Specify how to build

| Skill | Consumes | Generates |
|-------|----------|-----------|
| **writing-prds-from-charters** | `outputs/roadmap/*.md` (charter)<br>`outputs/insights/voc-*.md` (evidence)<br>`outputs/truth_base/*.md` (product context) | `outputs/delivery/prds/*.md`<br>Detailed requirements, edge cases, success criteria |

**Pattern:** Execution skills create **Tier 3 outputs** from Tier 2 plans.

---

#### Strategic Skills
**Purpose:** Long-term vision and positioning

| Skill | Consumes | Generates |
|-------|----------|-----------|
| **writing-product-strategy** | `compass.md` (mission)<br>`outputs/insights/voc-*.md`<br>`outputs/competitive-analysis/*.md`<br>`outputs/roadmap/*.md` | `outputs/strategy/product-strategy-*.md`<br>3-5 year vision, pillars, roadmap |
| **competitive-analysis** | `outputs/truth_base/*.md`<br>Market research docs | `outputs/competitive-analysis/*.md`<br>Positioning, differentiation |
| **create-executive-update** | `projects.md` (active work)<br>`challenges.md` (blockers)<br>`outputs/roadmap/*.md`<br>`preferences.md` (exec tone) | `outputs/exec_updates/exec-update-*.md`<br>1-page status snapshot |

---

#### Learning Skills
**Purpose:** Capture knowledge and improve judgment

| Skill | Consumes | Generates |
|-------|----------|-----------|
| **learn --decision** | User-provided decision context | `outputs/decisions/YYYY-MM-DD-[title].md`<br>Decision record with rationale |
| **learn --patterns** | `history/*` (past outputs)<br>`.beads/insights.jsonl` (ratings) | `.claude/rules/learned/quality-patterns.md`<br>Extracted success patterns |

**Pattern:** Learning skills analyze history to improve future outputs.

---

### Skill Execution Example

**User runs:** `/charters`

**Step 1: Context-Gathering (automatic)**
```
Nexa: To create quarterly charters, I need context. What should I use?

Available:
  - [voc-synthesis-2026-01.md] 7 customer interviews
  - [ktlo-triage-2026-01.md] 47 support tickets
  - [truth-base.md] Product overview

Already loaded:
  - compass.md (mission, goals)
  - challenges.md (constraints: 2 backend engineers)

Or:
  - [Point me to another document]
  - [Describe what you need]

User: Use all three
```

**Step 2: Skill Reads Learnings**
```
Nexa: (internal) Reading .beads/insights.jsonl...
Found pattern: "Charters with VOC+KTLO convergence rated 4.5/5 avg"
Applying to this run.
```

**Step 3: Generate with Meta-Prompt Reasoning**
```markdown
## Strategic Reasoning

### Options Evaluated
| Option | Evidence Score | Why |
|--------|---------------|-----|
| Sync Performance | High | VOC (3/7) + KTLO (12 tickets) + competitive threat |
| UX Refresh | Medium | VOC (2/7), no KTLO signal |
| AI Extraction | Low | No customer asks, unproven |

### Selection: Sync Performance (Bet 1)
Rationale: VOC+KTLO convergence creates strong signal (learned pattern)
```

**Step 4: Auto-Mirror**
```bash
# Nexa runs automatically:
pm-os mirror --quiet

# Result:
outputs/roadmap/Q1-2026-charters.md
  → copied to history/generating-quarterly-charters/Q1-2026-charters-2026-01-24.md
```

**Step 5: Post-Skill Reflection**
```
Nexa: ✅ Quarterly charters complete → outputs/roadmap/Q1-2026-charters.md
      Mirrored to history/generating-quarterly-charters/Q1-2026-charters-2026-01-24.md

📝 Captured learnings: 3 insights, 2 beads → history/learnings/2026-01-24-charters.md

Rate this charter (1-5, or 'skip'):
1 - Needs major revision
2 - Below expectations
3 - Meets expectations
4 - Exceeds expectations
5 - Outstanding, exactly what I needed

User: 5

Nexa: 📊 Recorded rating: 5/5 → .beads/insights.jsonl
```

---

## The Learning Loop

### The Complete Cycle

This is PM OS's **core innovation** - every output improves the system.

```
┌─────────────────────────────────────────────────────────────┐
│                   THE LEARNING LOOP                         │
│                                                             │
│  1. Generate Output                                         │
│     ├─ Write to outputs/                                    │
│     └─ Include metadata (sources, generated timestamp)      │
│                                                             │
│  2. Auto-Mirror (immediate)                                 │
│     ├─ Nexa runs: pm-os mirror --quiet                     │
│     └─ Copy to history/<skill>/<filename>-<date>.md        │
│                                                             │
│  3. Post-Skill Reflection (immediate)                       │
│     ├─ Extract 3-5 key insights                            │
│     ├─ Create: history/learnings/YYYY-MM-DD-<skill>.md     │
│     └─ Create insight beads in .beads/insights.jsonl       │
│                                                             │
│  4. Request Rating (immediate)                              │
│     ├─ Ask user for 1-5 rating                             │
│     └─ Store as output-rating bead                          │
│                                                             │
│  5. Weekly Learning (automated)                             │
│     ├─ Hook runs: pm-os learn --auto                       │
│     ├─ Analyze history/ for patterns                        │
│     ├─ Correlate high ratings with output characteristics   │
│     └─ Extract success patterns                             │
│                                                             │
│  6. Write Learned Patterns (automated)                      │
│     ├─ Create: .claude/rules/learned/quality-patterns.md   │
│     └─ Rules precedence: learned > workflows > core        │
│                                                             │
│  7. Future Skills Apply Patterns (automatic)                │
│     ├─ Next skill run loads learned rules                   │
│     └─ Applies patterns from high-rated outputs             │
│                                                             │
│  8. Quality Improves ↑                                      │
│     └─ Cycle repeats, knowledge compounds                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step Detail

#### Step 1: Generate Output
**What happens:**
- Skill executes (e.g., `/charters`)
- Writes to `outputs/roadmap/Q1-2026-charters.md`
- Includes YAML frontmatter:
  ```yaml
  ---
  generated: 2026-01-24 16:00
  skill: generating-quarterly-charters
  sources:
    - outputs/insights/voc-synthesis-2026-01.md
    - outputs/ktlo/ktlo-triage-2026-01.md
    - inputs/context/compass.md
  downstream:
    - outputs/delivery/prds/*.md
  ---
  ```

**Why it matters:** Metadata enables traceability and staleness detection.

---

#### Step 2: Auto-Mirror (Immediate, Automatic)
**What happens:**
- Nexa runs: `pm-os mirror --quiet` (no user prompt)
- Copies output to `history/generating-quarterly-charters/Q1-2026-charters-2026-01-24.md`
- Date-stamped for versioning

**Why it matters:**
- Every output is preserved for learning analysis
- History builds over time
- Can compare charter quality across quarters

---

#### Step 3: Post-Skill Reflection (Immediate, Automatic)
**What happens:**
```
Nexa internally:
  - "What were the key insights from this charter?"
  - "What patterns emerged from the sources?"
  - "What surprised me or contradicted expectations?"

Extracts:
  1. "All 3 bets had VOC+KTLO convergence - strong signal"
  2. "Explicit non-scope prevented charter creep"
  3. "Risk mitigations were easier with specific threats"

Writes to: history/learnings/2026-01-24-generating-quarterly-charters.md

Creates beads:
  - bead_20260124_160500_001: "VOC+KTLO convergence = strong charter signal"
  - bead_20260124_160500_002: "Explicit non-scope prevents charter creep"
```

**Format:** `history/learnings/YYYY-MM-DD-[skill-name].md`
```markdown
## Learnings from Generate Strategic Charters - 2026-01-24

### Context
Created Q1 2026 charters with 3 bets based on VOC, KTLO, and truth base.

### Key Insights
1. All 3 bets showed VOC+KTLO convergence - this creates strong signal
2. Explicit "What We're NOT Doing" section prevented scope creep
3. Risk sections were easier when tied to specific threats

### Patterns Observed
- Charters with <3 bets got stakeholder approval faster
- Evidence-backed bets reduce pushback in review meetings

### Connections to Past Work
- Links to: bead_20260115_120000_003 (previous charter pattern)

### Open Questions Raised
- Should we always require VOC+KTLO convergence for bets?
- How to handle strategic bets without customer signal?
```

**Bead Format:** `.beads/insights.jsonl` (append-only)
```json
{
  "id": "bead_20260124_160500_001",
  "type": "pattern",
  "content": "VOC+KTLO convergence creates strong charter signal - all 3 bets with this pattern got 5-star ratings",
  "source": "generating-quarterly-charters",
  "created_at": "2026-01-24T16:05:00Z",
  "tags": ["charter", "evidence-convergence", "quality"],
  "confidence": "high",
  "connections": []
}
```

**Why it matters:**
- Atomic insights stored separately from full outputs
- Can be searched, connected, analyzed independently
- Builds up a knowledge graph over time

---

#### Step 4: Request Rating (Immediate, User Action)
**What happens:**
```
Nexa: Rate this charter (1-5, or 'skip'):
      1 - Needs major revision
      2 - Below expectations
      3 - Meets expectations
      4 - Exceeds expectations
      5 - Outstanding, exactly what I needed

User: 5

Nexa: 📊 Recorded rating: 5/5 → .beads/insights.jsonl
```

**Stored as bead:**
```json
{
  "id": "bead_20260124_160600_001",
  "type": "output-rating",
  "content": "",
  "source": "generating-quarterly-charters",
  "output_file": "outputs/roadmap/Q1-2026-charters.md",
  "rating": 5,
  "sentiment": "positive",
  "tags": ["generating-quarterly-charters", "quality-5"],
  "created_at": "2026-01-24T16:06:00Z"
}
```

**Why it matters:**
- Direct quality signal from user
- Enables correlation: "What do 5-star charters have in common?"
- Tracks quality trends over time

---

#### Step 5: Weekly Learning (Automated, Background)
**What happens:**
- Weekly hook fires: `pm-os learn --auto` (7-day cadence)
- Analyzes `history/` directory for all skills
- Reads `.beads/insights.jsonl` for ratings

**Analysis logic:**
```
For each skill with 5+ history entries:
  1. Calculate average rating
  2. Identify high-rated outputs (4-5 stars)
  3. Read actual output files
  4. Extract common characteristics:
     - What sections are present?
     - What evidence patterns appear?
     - What metadata is consistent?
  5. Identify low-rated outputs (1-2 stars)
  6. Note what's missing or problematic
```

**Example analysis:**
```
Skill: generating-quarterly-charters
History: 8 outputs analyzed
Ratings: 5,5,4,5,3,5,4,5 (avg: 4.5/5)

High-rated pattern analysis (6 outputs with 4-5 stars):
  - 100% had "Strategic Reasoning" section
  - 100% cited VOC and KTLO sources
  - 83% had ≤3 bets (focus)
  - 100% included "What We're NOT Doing"
  - 100% had risk mitigations (not just risks)

Low-rated pattern analysis (1 output with 3 stars):
  - Missing Strategic Reasoning
  - 5 bets (too many, diluted focus)
  - Vague success metrics ("improve satisfaction")
```

**Why it matters:**
- Objective pattern detection across time
- Not based on one session's opinion
- Reveals what consistently works

---

#### Step 6: Write Learned Patterns (Automated)
**What happens:**
- Learning system writes: `.claude/rules/learned/quality-patterns.md`

**Example learned rule:**
```markdown
# Learned Quality Patterns: Quarterly Charters

> Auto-generated from 8 charter outputs (avg rating: 4.5/5)
> Last updated: 2026-01-24

## High-Quality Charter Characteristics

Charters rated 4-5 stars consistently show:

1. **Strategic Reasoning Section**
   - Present in 100% of high-rated charters
   - Includes options evaluated with evidence scoring
   - Shows why chosen bets beat alternatives

2. **Limited Scope (≤3 bets)**
   - 83% of high-rated charters had ≤3 bets
   - Charters with >3 bets took 2x longer for approval
   - Focus beats breadth

3. **VOC+KTLO Convergence**
   - 100% of 5-star charters had evidence from both VOC and KTLO
   - Single-source bets more likely to get challenged

4. **Explicit Non-Scope**
   - "What We're NOT Doing" section in 100% of high-rated
   - Prevents scope creep during execution

5. **Risk Mitigations (not just risks)**
   - Every risk must have mitigation
   - Vague "monitor" not sufficient

## Apply These Patterns

When generating charters:
- [ ] Include Strategic Reasoning before main content
- [ ] Limit to 3 bets maximum
- [ ] Require VOC+KTLO evidence convergence
- [ ] Add explicit "What We're NOT Doing"
- [ ] Pair every risk with specific mitigation
```

**Rule precedence:**
```
.claude/rules/ loading order:
  system/ (base)
    ↓
  pm-core/ (discipline)
    ↓
  domain/ (vocabulary)
    ↓
  pm-workflows/ (deliverable rules)
    ↓
  learned/ (HIGHEST - overrides all)
```

**Why it matters:**
- Learned patterns automatically applied to future runs
- No manual "remember to do X" needed
- System improves without user intervention

---

#### Step 7: Future Skills Apply Patterns (Automatic)
**What happens:**
- User runs `/charters` again on 2026-02-15
- Session start loads all rules including `learned/quality-patterns.md`
- Skill applies learned patterns automatically:

```
Nexa (internal):
  - Learned rule: "Limit to 3 bets"
  - Evaluating 7 charter candidates
  - Narrowing to top 3 based on evidence scores
  - Including Strategic Reasoning (learned requirement)
  - Adding "What We're NOT Doing" section (learned pattern)
```

**User sees:**
```
Nexa: Based on learnings from past charters (avg 4.5/5 rating):
      - Focusing on 3 bets (high-rated charters show focus beats breadth)
      - Including Strategic Reasoning to show option evaluation
      - All 3 bets have VOC+KTLO convergence (strong signal)

      Generating charter...
```

**Why it matters:**
- User doesn't have to remember best practices
- Quality is systematically applied
- Each output builds on all previous learnings

---

#### Step 8: Quality Improves ↑
**What happens:**
- Charter generated with learned patterns
- User rates it 5/5 (high quality confirmed)
- Next weekly learning reinforces patterns
- Quality trend visible in session greeting:

```
📈 Output Quality: 4.6/5 ↑ (12 ratings)
```

**The compounding effect:**
```
Week 1: Charter avg 4.0/5
  ↓ (learning extracts patterns)
Week 2: Charter avg 4.3/5 (patterns applied)
  ↓ (more data, refined patterns)
Week 3: Charter avg 4.6/5
  ↓ (high-confidence patterns)
Week 4: Charter avg 4.7/5
```

**Why it matters:**
- Measurable quality improvement
- User sees the system getting better
- Trust builds over time

---

## Concrete Examples

### Example 1: VOC Synthesis Learning Cycle

**Week 1: January 8, 2026**

**User runs:** `/voc`

**Context gathered:**
- `inputs/voc/interview-1.md` through `interview-7.md`
- `compass.md` (for customer segmentation)

**Output generated:** `outputs/insights/voc-synthesis-2026-01-08.md`
```markdown
## Themes

### Theme 1: Catalog Sync Speed
**Frequency:** 3 of 7 sources
**Quotes:**
> "Sync takes forever, we lose deals waiting for updates" - Interview 1
> "Competitors sync in seconds, we take minutes" - Interview 3

### Theme 2: UI/UX Outdated
**Frequency:** 2 of 7 sources
```

**Post-skill reflection captured:**
- Insight: "3 of 7 is weak signal - need more interviews"
- Pattern: "No customer segment breakdown"
- Open question: "Are sync complaints specific to large catalogs?"

**User rates:** 3/5 (meets expectations, but not great)
- Feedback: "Needed more context on which customer segments care most"

**Bead created:**
```json
{
  "type": "output-rating",
  "rating": 3,
  "content": "Needed customer segment breakdown",
  "source": "synthesizing-voc"
}
```

---

**Week 2: January 15, 2026**

**Weekly learning runs:** `pm-os learn --auto`

**Analysis:**
- 1 VOC synthesis in history
- Rating: 3/5
- User feedback: "Needed customer segment breakdown"

**Pattern identified:**
```
Low-rated VOC synthesis missing:
- Customer segment analysis
- Categorization of themes by user type
```

**Learned rule written:** `.claude/rules/learned/voc-patterns.md`
```markdown
## VOC Synthesis Quality Patterns

### Include Customer Segment Breakdown

3-star VOC synthesis lacked segment analysis. Add:

**For each theme, note:**
- Which customer segments mentioned it
- Frequency by segment (e.g., "3/5 Enterprise, 0/2 SMB")
- Segment-specific quotes
```

---

**Week 3: January 22, 2026**

**User runs:** `/voc` (10 new interviews)

**Learned pattern applied automatically:**

**Output generated:** `outputs/insights/voc-synthesis-2026-01-22.md`
```markdown
## Themes

### Theme 1: Catalog Sync Speed
**Frequency:** 6 of 10 sources
**Segment Breakdown:**
  - Enterprise: 5 of 6 mentioned (83%)
  - SMB: 1 of 4 mentioned (25%)

**Quotes (by segment):**

*Enterprise:*
> "Sync takes forever, we lose deals waiting for updates" - Enterprise Interview 1
> "Our catalogs have 50K SKUs, sync is a bottleneck" - Enterprise Interview 3

*SMB:*
> "Sync is okay for our small catalog" - SMB Interview 2

**Insight:** Sync speed is primarily an Enterprise pain point, less critical for SMB.
```

**User rates:** 5/5 (outstanding)
- Feedback: "Exactly what I needed - segment breakdown made it actionable"

**Result:**
- Quality improved from 3/5 → 5/5
- Learned pattern validated
- Future VOC syntheses will include segment breakdown automatically

---

### Example 2: Charter Generation Learning Cycle

**January 15, 2026: First Charter**

**User runs:** `/charters`

**Context:**
- VOC synthesis (3/7 mention sync)
- KTLO triage (12 sync bugs)
- Truth base (product context)

**Generated (without learned patterns):**
```markdown
# Q1 2026 Strategic Charters

## Bet 1: Catalog Sync Performance
[Standard sections...]

## Bet 2: UX Refresh
[Standard sections...]

## Bet 3: AI Extraction
[Standard sections...]

## Bet 4: New Categories
[Standard sections...]

## Bet 5: Mobile App
[Standard sections...]
```

**User rates:** 3/5
- Feedback: "Too many bets, diluted focus. Hard to see why these over alternatives."

**Insights captured:**
- "5 bets is too many - stakeholders confused"
- "Missing rationale for why these beat other options"

---

**January 20, 2026: Weekly Learning**

**Pattern identified:**
```
Charter rated 3/5 had:
- 5 bets (too many)
- No Strategic Reasoning section
- No explanation of alternatives considered
```

**Learned rule written:**
```markdown
## Charter Quality Patterns

1. **Limit to 3 bets** - 5 bets diluted focus
2. **Include Strategic Reasoning** - Show options evaluated
3. **Require VOC+KTLO convergence** - Single-source bets weak
```

---

**January 24, 2026: Second Charter (Patterns Applied)**

**User runs:** `/charters`

**Nexa applies learned patterns:**
```
Nexa: Evaluating 7 charter candidates...

      (Internal) Learned rule: Limit to 3 bets
      → Narrowing from 7 to top 3 based on evidence scores

      (Internal) Learned rule: Include Strategic Reasoning
      → Adding meta-prompt section before main content

      (Internal) Learned rule: VOC+KTLO convergence
      → Prioritizing candidates with both signals
```

**Generated:**
```markdown
# Q1 2026 Strategic Charters

## Strategic Reasoning

### Options Evaluated

| Option | Evidence Score | VOC Signal | KTLO Signal |
|--------|---------------|------------|-------------|
| Sync Performance | **High** | 3/7 (43%) | 12 tickets (26%) |
| UX Refresh | Medium | 2/7 (29%) | 0 tickets |
| AI Extraction | Low | 0/7 (0%) | 0 tickets |
| New Categories | Medium | Sales pipeline | 0 tickets |
| Mobile App | Low | 1/7 (14%) | 1 ticket |

### Selection Rationale

**Chosen: Sync Performance (Bet 1), UX Refresh (Bet 2), New Categories (Bet 3)**

Why Sync Performance beats AI Extraction:
- Evidence: 3 aligned sources (VOC, KTLO, competitive) vs 0 customer asks
- Urgency: Losing deals today vs future differentiation
- Risk: Proven architecture vs unproven AI capability

---

## Bet 1: Catalog Sync Performance
[Details...]

## Bet 2: UX Refresh
[Details...]

## Bet 3: New Categories
[Details...]

## What We're NOT Doing (Explicit Non-Scope)
- AI Extraction - No customer validation yet
- Mobile App - Lower priority until sync foundation solid
```

**User rates:** 5/5
- Feedback: "Perfect - focused, clear reasoning, exactly what stakeholders need"

**Quality improvement:**
- Week 1: 3/5 (too many bets, no reasoning)
- Week 2: 5/5 (learned patterns applied)

**Impact:**
- Stakeholder meeting: approved in 30 minutes (vs 2 hours for previous charter)
- Engineering: "Clear scope, we can start immediately"

---

### Example 3: Cross-Skill Learning

**How patterns from one skill improve another**

**January 10: VOC Synthesis**
- Pattern captured: "Verbatim quotes more impactful than paraphrasing"
- Bead created: `bead_20260110_001` "Exact quotes > summaries"

**January 15: Charter Generation**
- Nexa reads beads, sees quote pattern
- Applies to charter: Uses exact VOC quotes in problem statements
- User rates 5/5

**January 20: PRD Writing**
- Nexa reads beads, sees quote pattern
- Applies to PRD: Requirements section includes verbatim customer requests
- User rates 5/5

**Result:**
- One insight from VOC skill → improved 2 other skills
- Knowledge compounds across workflows

---

## Why This Matters

### The Transformation

**Without Learning Loop:**
```
Session 1: "Let me help you create a charter"
  → Output quality: depends on user guidance
  → No memory of what worked

Session 2: "Let me help you create a charter"
  → Starts from scratch again
  → Same mistakes possible

Session 10: "Let me help you create a charter"
  → Still starting from scratch
  → No improvement over time
```

**With Learning Loop:**
```
Session 1: "Let me help you create a charter"
  → Output quality: baseline
  → Captures what worked, what didn't
  → User rates it

Session 2: "Based on learnings from last charter (rated 4/5)..."
  → Applies patterns from high-rated output
  → Avoids issues from low-rated output
  → Quality trend: ↑

Session 10: "Based on learnings from 9 previous charters (avg 4.6/5)..."
  → Applies refined patterns from all history
  → Consistently high quality
  → Quality trend: ↑↑
```

### Measurable Benefits

| Metric | Without Learning | With Learning |
|--------|-----------------|---------------|
| **Output quality** | Inconsistent (varies 2-4/5) | Trending up (3.5 → 4.6/5) |
| **Stakeholder approval time** | 1-2 hours per review | 30 min (clear reasoning) |
| **Rework cycles** | 2-3 revisions typical | 0-1 revisions |
| **PM confidence** | "Hope this is right" | "This matches proven patterns" |
| **Knowledge retention** | Resets each session | Compounds over time |

### The Compounding Effect

```
Week 1:  1 output  → 1 learned pattern  → Applied to next output
Week 2:  2 outputs → 3 learned patterns → Applied to next output
Week 4:  8 outputs → 12 learned patterns → Applied to next output
Week 8:  20 outputs → 35 learned patterns → Applied to next output
Week 12: 40 outputs → 67 learned patterns → Applied to next output
```

**Each output:**
- Builds on all previous learnings
- Contributes new insights
- Refines existing patterns
- Raises the quality floor

### From Task Executor to Strategic Partner

**Traditional AI Assistant:**
- Executes tasks as instructed
- No memory across sessions
- Quality depends on user expertise
- "I did what you asked"

**PM OS with Learning Loop:**
- Suggests evidence-backed approaches
- Remembers what worked before
- Quality improves systematically
- "Based on what worked last time, here's my recommendation"

### The User Experience

**Session 1:**
```
User: Create Q1 charters
Nexa: [Generates charter with 5 bets, no reasoning]
User: Too many bets, hard to follow
Rating: 3/5
```

**Session 5:**
```
User: Create Q2 charters
Nexa: Based on learnings from 4 previous charters (avg 4.2/5):
      - Limiting to 3 bets (focus beats breadth)
      - Including Strategic Reasoning showing option evaluation
      - All 3 bets have VOC+KTLO convergence
      [Generates focused charter with clear reasoning]
User: Perfect, exactly what I needed
Rating: 5/5
```

**Session 10:**
```
User: Create Q3 charters
Nexa: Based on learnings from 9 previous charters (avg 4.6/5):
      - 3 focused bets with evidence convergence
      - Strategic Reasoning with 5+ options evaluated
      - Explicit non-scope to prevent creep
      - Risk mitigations tied to specific threats
      [Generates high-quality charter matching proven patterns]
User: Stakeholders approved in 20 minutes, engineering started immediately
Rating: 5/5
```

**The evolution:**
- Week 1: AI learns from you
- Week 5: AI applies proven patterns
- Week 10: AI anticipates what works

---

## Traceability & Staleness

### Output Metadata

Every output includes YAML frontmatter:

```yaml
---
generated: 2026-01-24 16:00
skill: generating-quarterly-charters
sources:
  - outputs/insights/voc-synthesis-2026-01.md (modified: 2026-01-15)
  - outputs/ktlo/ktlo-triage-2026-01.md (modified: 2026-01-18)
  - inputs/context/compass.md (modified: 2026-01-10)
downstream:
  - outputs/delivery/prds/sync-performance-prd.md
temperature: hot
review_by: 2026-01-31
---
```

**What this enables:**

1. **Source Attribution**
   - Every claim traceable to source file + line number
   - Claims Ledger links claims to sources
   - No "I heard somewhere" - always "From [file:line]"

2. **Staleness Detection**
   - Compare `generated` timestamp with source `modified` timestamps
   - If source newer than output → output is stale
   - Session greeting reports stale outputs

3. **Dependency Tracking**
   - `downstream` field lists dependent outputs
   - If this output changes → downstream becomes stale
   - Cascading staleness across tiers

### Tier System

```
TIER 1: Foundation (Inputs → Foundation Outputs)
───────────────────────────────────────────────────
inputs/voc/*.md           → outputs/insights/voc-synthesis.md
inputs/jira/*.csv         → outputs/ktlo/ktlo-triage.md
outputs/ingest/*          → outputs/truth_base/truth-base.md

TIER 2: Planning (Tier 1 → Strategy Outputs)
───────────────────────────────────────────────────
outputs/insights/voc-*    → outputs/roadmap/Q1-charters.md
outputs/ktlo/*            → outputs/roadmap/Q1-charters.md
outputs/truth_base/*      → outputs/roadmap/Q1-charters.md

TIER 3: Execution (Tier 2 → Delivery Outputs)
───────────────────────────────────────────────────
outputs/roadmap/*         → outputs/delivery/prds/*.md
outputs/roadmap/*         → outputs/gtm/launch-plan.md
```

**Staleness Cascade:**

```
User updates: inputs/voc/interview-8.md (new data)
    ↓
Tier 1 becomes stale: outputs/insights/voc-synthesis.md
    ↓
Tier 2 becomes stale: outputs/roadmap/Q1-charters.md
    ↓
Tier 3 becomes stale: outputs/delivery/prds/sync-prd.md
    ↓
Session greeting reports:
  ⚠️ Stale outputs detected:
     - voc-synthesis.md (source updated 2026-01-24)
     - Q1-charters.md (depends on stale voc-synthesis)
     - sync-prd.md (depends on stale charter)

  Recommend: Refresh upstream first (voc-synthesis), then downstream
```

### Temperature Classification

```yaml
temperature: hot|warm|cold
review_by: YYYY-MM-DD
```

| Temperature | Meaning | Review Cadence | Examples |
|-------------|---------|----------------|----------|
| **hot** | Active this sprint | Weekly | Current quarter charters, in-progress PRDs, active blockers |
| **warm** | Reference material | Monthly | Truth base, VOC synthesis, stakeholder maps, closed decisions |
| **cold** | Archive only | No review | History folder, old quarters, superseded docs |

**Session start loads:**
1. All **hot** outputs first (immediate context)
2. **Warm** outputs on demand (reference when needed)
3. **Cold** ignored unless explicitly requested

---

## Summary: The Complete Flow

### From Input to Continuous Improvement

```
┌─────────────────────────────────────────────────────────────┐
│ DAY 1: Foundation                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ User creates COMPASS context:                               │
│   - compass.md (mission, goals, stakeholders)               │
│   - projects.md (active work)                               │
│   - challenges.md (constraints)                             │
│   - preferences.md (communication style)                    │
│                                                             │
│ User adds raw inputs:                                       │
│   - inputs/voc/*.md (customer interviews)                   │
│   - inputs/jira/*.csv (support tickets)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WEEK 1: Discovery                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ User: /voc (synthesize customer voice)                      │
│   → Nexa reads: inputs/voc/*.md + compass.md               │
│   → Generates: outputs/insights/voc-synthesis.md            │
│   → Auto-mirrors to: history/synthesizing-voc/              │
│   → Captures: 3 insights, 2 beads                           │
│   → Requests rating: User rates 3/5                         │
│   → Feedback: "Needed customer segment breakdown"           │
│                                                             │
│ User: /ktlo (triage backlog)                                │
│   → Nexa reads: inputs/jira/*.csv                           │
│   → Generates: outputs/ktlo/ktlo-triage.md                  │
│   → Auto-mirrors to: history/triaging-ktlo/                 │
│   → Captures: "12 catalog sync bugs = systemic issue"       │
│   → Requests rating: User rates 4/5                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WEEK 2: Planning (First Pass)                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Weekly learning runs: pm-os learn --auto                    │
│   → Analyzes 2 outputs in history/                          │
│   → Identifies pattern: "VOC syntheses need segments"       │
│   → Writes: .claude/rules/learned/voc-patterns.md           │
│                                                             │
│ User: /charters (generate Q1 charters)                      │
│   → Nexa reads: voc-synthesis + ktlo-triage + compass.md    │
│   → Generates: 5 bets (no learned patterns yet)             │
│   → Auto-mirrors to: history/generating-quarterly-charters/ │
│   → Requests rating: User rates 3/5                         │
│   → Feedback: "Too many bets, no clear reasoning"           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WEEK 3: Improvement                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Weekly learning runs: pm-os learn --auto                    │
│   → Analyzes 3 outputs (1 VOC, 1 KTLO, 1 charter)           │
│   → Patterns identified:                                     │
│     - "VOC needs segment breakdown" (reinforced)             │
│     - "Charters with >3 bets rated lower"                   │
│     - "Strategic Reasoning increases clarity"               │
│   → Writes: .claude/rules/learned/quality-patterns.md       │
│                                                             │
│ User: /voc (10 new interviews)                              │
│   → Learned pattern applied: Include segment breakdown      │
│   → Generates: VOC synthesis with segments                  │
│   → User rates: 5/5 "Exactly what I needed"                 │
│                                                             │
│ User: /charters (Q2 planning)                               │
│   → Learned patterns applied:                               │
│     - Limit to 3 bets                                       │
│     - Include Strategic Reasoning                           │
│     - Require VOC+KTLO convergence                          │
│   → Generates: Focused charter with clear reasoning         │
│   → User rates: 5/5 "Perfect"                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WEEK 8: Systematic Quality                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Quality trend visible in session greeting:                  │
│   📈 Output Quality: 4.6/5 ↑ (20 ratings)                   │
│                                                             │
│ Learned patterns now include:                               │
│   - VOC: Segment breakdown, verbatim quotes                 │
│   - KTLO: Pattern identification, severity scoring          │
│   - Charters: ≤3 bets, Strategic Reasoning, convergence     │
│   - PRDs: Edge cases, rollback plans, success gates         │
│                                                             │
│ User: /charters (Q3 planning)                               │
│   → All patterns applied automatically                      │
│   → Stakeholder approval: 20 minutes (vs 2 hours week 1)    │
│   → User rates: 5/5                                         │
│                                                             │
│ Result: PM OS has learned what works for this user          │
│         Every output builds on proven patterns              │
│         Quality is systematic, not luck                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Context is Universal** - COMPASS files loaded every session, available to all skills

2. **Skills Ask, Don't Block** - Context-gathering protocol lets users decide what's relevant

3. **Every Output Teaches** - Auto-mirror + reflection + ratings = continuous learning

4. **Patterns Compound** - Each output builds on all previous learnings

5. **Quality is Measurable** - Rating trends show systematic improvement

6. **Traceability Matters** - Every claim links to source, staleness auto-detected

7. **Learning is Automatic** - Weekly analysis extracts patterns, no manual work

8. **Nothing is Forgotten** - History + beads + learned rules = permanent memory

---

**PM OS transforms from task executor to strategic partner through the learning loop.**

**The more you use it, the better it gets.**
