# Skills Directory

## Purpose

The `skills/` directory contains **reusable PM workflows** - the core intelligence of PM OS. Each skill is a step-by-step pattern for a specific PM task.

**Why this matters:** Skills encode PM best practices, ensuring consistent, evidence-based work. Think of them as your PM playbook - battle-tested workflows you can invoke anytime.

## Skill Count: 15 Skills

PM OS consolidates related workflows into unified skills with modes. This keeps the system learnable while preserving functionality.

## Directory Structure

```
skills/
├── discovery/                        # Onboarding: Document analysis, interview prep
├── building-truth-base/              # Onboarding: Product understanding
├── synthesizing-voc/                 # Daily: VOC theme extraction
├── triaging-ktlo/                    # Daily: KTLO backlog triage
├── generating-exec-update/           # Daily: 1-page exec updates
├── brainstorming/                    # As-needed: Divergent thinking
├── competitive-analysis/             # As-needed: Competitive landscape
├── analyze/                          # As-needed: Data (--data) or KB gaps (--kb)
├── generating-quarterly-charters/    # Weekly: Strategic bets
├── prioritizing-work/                # As-needed: Prioritization framework
├── stakeholder-management/           # Senior PM: Stakeholder mapping
├── writing-prds-from-charters/       # As-needed: PRD creation
├── planning-gtm-launch/              # Senior PM: GTM launch plans
├── learn/                            # Learning: Decisions, launches, patterns
└── writing-product-strategy/         # Senior PM: 3-5 year strategy
```

**Each skill directory contains:**
- `SKILL.md` - Full implementation (150-350 lines)
- Metadata (name, description)
- When to use section
- Step-by-step core pattern
- Output template with examples

## Conversational Invocation (Preferred)

PM OS should feel like talking to a 2nd brain, not running CLI commands. Express intent naturally:

| Instead of... | Say... |
|---------------|--------|
| `/voc` | "What are customers saying?" |
| `/discover --analyze-docs` | "Help me understand these docs" |
| `/charters` | "What should we focus on this quarter?" |
| `/learn --decision` | "Log this decision" |
| `/analyze --data` | "Analyze this CSV for me" |
| `/ktlo` | "What's on fire in support?" |

Nexa routes to the right skill automatically based on your intent.

## Skill Categories

### Onboarding Skills (New PM)

| Skill | Command | Conversational | Time |
|-------|---------|----------------|------|
| discovery | `/discover` | "Help me understand these docs" | ~30-60 min |
| building-truth-base | `/truth-base` | "What is this product?" | ~45 min |

**Use these:** First week on a new product. Discovery -> Truth Base -> then daily skills.

### Daily Skills (10-30 min total)

| Skill | Command | Conversational | Time |
|-------|---------|----------------|------|
| triaging-ktlo | `/ktlo` | "What's on fire in support?" | ~10 min |
| synthesizing-voc | `/voc` | "What are customers saying?" | ~10 min |
| generating-exec-update | `/exec-update` | "Generate an exec update" | ~10 min |

**Use these:** Every day or weekly for staying on top of incoming data.

### Weekly Skills (15-30 min)

| Skill | Command | Conversational | Time |
|-------|---------|----------------|------|
| generating-quarterly-charters | `/charters` | "What should we build this quarter?" | ~20 min |

**Use this:** Weekly to plan quarterly roadmap, or when priorities shift.

### Senior PM Skills (30-90 min)

| Skill | Command | Conversational | Time |
|-------|---------|----------------|------|
| stakeholder-management | `/stakeholders` | "Map the stakeholders" | ~30 min |
| planning-gtm-launch | `/gtm` | "Plan the GTM launch" | ~60 min |
| writing-product-strategy | `/strategy` | "What's our 3-year strategy?" | ~90 min |

**Use these:** For major initiatives, launches, or strategy planning.

### As-Needed Skills

| Skill | Command | Conversational |
|-------|---------|----------------|
| brainstorming | `/brainstorm` | "Help me brainstorm options" |
| competitive-analysis | `/compete` | "Who are our competitors?" |
| analyze | `/analyze` | "Analyze this data" or "What's missing from KB?" |
| writing-prds-from-charters | `/prd` | "Write me a PRD for [charter]" |
| prioritizing-work | `/prioritize` | "Prioritize this backlog" |

### Learning Skills

| Skill | Command | Conversational |
|-------|---------|----------------|
| learn | `/learn` | "Log this decision" / "How did the launch go?" / "What patterns have we learned?" |

**Modes:**
- `--decision` - Log decision context and rationale
- `--launch` - Post-launch retrospective (30/60/90 days)
- `--patterns` - Extract patterns from history

### Analysis Skills

| Skill | Command | Conversational |
|-------|---------|----------------|
| analyze | `/analyze` | "Analyze this CSV" or "What gaps exist in KB?" |

**Modes:**
- `--data` - Python-based data analysis (CSV, Excel)
- `--kb` - Knowledge Base gap analysis

## Session Guardrails

Session guardrails (dependency hygiene, evidence discipline, auto-mirroring) are now automatic rules, not a skill. See `.claude/rules/system/session-guardrails.md`.

## How Skills Work

### Skill Structure

Every skill follows this pattern:

```markdown
---
name: skill-name
description: One-line description
---

# Skill Name

## Overview
[What this skill does]

## When to Use
[Specific triggers]

## Core Pattern
**Step 1: [Action]**
[Detailed instructions]

**Step 2: [Action]**
[Detailed instructions]

...

## Quick Reference
[Tables, checklists, examples]

## Verification Checklist
- [ ] Step 1 completed
- [ ] Step 2 completed
...
```

### Invoking Skills

**Three ways to invoke:**

1. **Conversational (preferred):**
   ```
   "What are customers saying?"
   "Help me understand these docs"
   "What should we focus on this quarter?"
   ```

2. **Via command** (shortcut):
   ```
   /discover
   /ktlo
   /voc
   /charters
   /exec-update
   /stakeholders
   /gtm
   /strategy
   /learn
   /analyze
   ```

3. **Direct invocation**:
   ```
   "Run triaging-ktlo"
   "Run synthesizing-voc"
   "Run building-truth-base"
   ```

### What Skills Produce

Every skill generates:

1. **Structured output** in `outputs/[type]/`
2. **YAML metadata header** tracking sources and dependencies
3. **Claims ledger** tagging evidence/assumptions
4. **Versioned copy** in `history/[skill-name]/` (auto-mirrored)

## Skill Deep-Dives

### discovery

**Purpose:** Analyze inherited documents, prepare for stakeholder interviews, synthesize discovery signals

**Modes:**
- `--analyze-docs` - Extract structured insights from documents (EXPLICIT/INFERRED/IMPLICIT)
- `--prep [role]` - Generate interview questions for sales, support, marketing, customer, engineering, or leadership
- `--synthesize` - Combine all signals into validated themes and personas

**Use when:** First week on a new product, before quarterly planning, or when preparing for stakeholder interviews.

### learn

**Purpose:** Close the feedback loop - log decisions, review launches, extract patterns

**Modes:**
- `--decision` - Log decision context, rationale, expected outcomes for later review
- `--launch` - Post-launch retrospective comparing predicted vs actual outcomes
- `--patterns` - Mine history for success/failure patterns, update learned rules

**Use when:** After major decisions, 30/60/90 days post-launch, or weekly for pattern extraction.

### analyze

**Purpose:** Generate PM insights from structured data

**Modes:**
- `--data` - Python-based analysis of CSV/Excel (retention, funnel, segmentation)
- `--kb` - Knowledge Base gap analysis (pain points, missing articles, AI opportunities)

**Use when:** Have data files to analyze or KB exports to review.

### triaging-ktlo

**Purpose:** Triage support backlog into prioritized buckets

**What it does:**
1. Reads Jira tickets from CSV
2. Groups by theme (bugs, requests, tech debt)
3. Prioritizes into tiers (P0: Now, P1: This quarter, P2: Backlog)
4. Identifies patterns (top 3 themes)

**Use when:** Weekly or when backlog grows.

### synthesizing-voc

**Purpose:** Extract themes from customer feedback

**What it does:**
1. Reads all VOC files (need min 3 sources)
2. Extracts verbatim quotes
3. Groups into themes
4. Quantifies patterns (e.g., "3/7 customers mentioned X")

**Use when:** After customer calls or when planning features.

### generating-quarterly-charters

**Purpose:** Create strategic bets for the quarter

**What it does:**
1. Reads truth base, VOC synthesis, KTLO triage
2. Generates 3-5 strategic bets
3. Defines success metrics for each bet
4. Links to evidence (VOC quotes, KTLO themes)

**Use when:** Weekly for quarterly planning, or when priorities shift.

### writing-prds-from-charters

**Purpose:** Turn charter bets into executable PRDs

**What it does:**
1. Reads charter to understand bet
2. Generates problem statement
3. Defines requirements (SHALL/SHOULD/MAY format)
4. Creates acceptance criteria

**Use when:** After charter is approved, before eng kickoff.

## Common Workflows

### Daily Routine

```
"What's on fire in support?"     # ~10 min: KTLO triage
"What are customers saying?"     # ~10 min: VOC synthesis
"Generate an exec update"        # ~10 min: Stakeholder update
```

### Planning a Quarter

```
1. Refresh foundation outputs (if stale)
2. "What should we focus on this quarter?"  # Generate charters
3. Review with stakeholders
4. "Write me a PRD for [charter bet]"       # Turn into specs
```

### Launching a Product

```
1. "Map the stakeholders"        # Power/interest grid
2. "Plan the GTM launch"         # Launch plan
3. Execute launch
4. "How did the launch go?"      # 30-day retrospective
```

### Learning Loop

```
1. "Log this decision"           # After major choices
2. "How did the launch go?"      # Post-launch review
3. "What patterns have we learned?"  # Extract insights
```

## Customization

### Modifying Skills

Skills are markdown files - you can edit them:

1. **Read the skill**: Open `skills/[skill-name]/SKILL.md`
2. **Edit to fit your workflow**: Adjust steps, add sections, change format
3. **Test**: Run the modified skill, verify output
4. **Commit**: Version control your changes

### Creating New Skills

To add a new skill:

1. **Create directory**: `mkdir skills/my-new-skill/`
2. **Create SKILL.md** with standard structure
3. **Test**: "Run my-new-skill"
4. **Optional: Add command**: Create command file for `/my-skill` shortcut

## Integration with PM OS

```
┌─────────────────────┐
│ Conversational      │ <- Preferred invocation
│ Intent              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Session Guardrails  │ <- Auto-applied rules
│ (Routing + Hygiene) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     Skills          │ <- Reusable PM workflows
└──────────┬──────────┘
           │
           ├────► Read inputs/
           │
           ├────► Generate outputs/
           │
           ├────► Auto-mirror to history/
           │
           └────► Update nexa/state.json + audit log
```

**See also:**
- [Main README](../README.md) - Getting started guide
- [docs/GETTING_STARTED.md](../docs/GETTING_STARTED.md) - Onboarding
