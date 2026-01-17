# Skills Directory

## Purpose

The `skills/` directory contains **reusable PM workflows** - the core intelligence of PM OS. Each skill is a step-by-step pattern for a specific PM task.

**Why this matters:** Skills encode PM best practices, ensuring consistent, evidence-based work. Think of them as your PM playbook - battle-tested workflows you can invoke anytime.

## Directory Structure

```
skills/
├── triaging-ktlo/                    # Daily: KTLO backlog triage
├── synthesizing-voc/                 # Daily: VOC theme extraction
├── generating-exec-update/           # Daily: 1-page exec updates
├── building-truth-base/              # Onboarding: Product understanding
├── analyzing-kb-gaps/                # As-needed: KB pain point analysis
├── generating-quarterly-charters/    # Weekly: Strategic bets
├── writing-prds-from-charters/       # As-needed: PRD creation
├── prioritizing-work/                # As-needed: Prioritization framework
├── competitive-analysis/             # As-needed: Competitive landscape
├── analyzing-data/                   # As-needed: Data deep-dives
├── planning-gtm-launch/              # Senior PM: GTM launch plans
├── stakeholder-management/           # Senior PM: Stakeholder mapping
├── writing-product-strategy/         # Senior PM: 3-5 year strategy
├── reviewing-launch-outcomes/        # Senior PM: Post-launch retrospectives
├── tracking-decisions/               # As-needed: Decision logging
├── learning-from-history/            # Automatic: Pattern extraction
└── using-pm-os/                      # System: Session guardrails
```

**Each skill directory contains:**
- `SKILL.md` - Full implementation (150-350 lines)
- Metadata (name, description)
- When to use section
- Step-by-step core pattern
- Output template with examples

## Skill Categories

### Daily Skills (10-30 min total)

| Skill | Command | Purpose | Time |
|-------|---------|---------|------|
| triaging-ktlo | `/ktlo` | Prioritize support backlog | ~10 min |
| synthesizing-voc | `/voc` | Extract customer themes | ~10 min |
| generating-exec-update | `/exec-update` | Create 1-page stakeholder update | ~10 min |

**Use these:** Every day or weekly for staying on top of incoming data.

### Weekly Skills (15-30 min)

| Skill | Command | Purpose | Time |
|-------|---------|---------|------|
| generating-quarterly-charters | `/charters` | Create strategic bets | ~20 min |

**Use this:** Weekly to plan quarterly roadmap, or when priorities shift.

### Senior PM Skills (30-90 min)

| Skill | Command | Purpose | Time |
|-------|---------|---------|------|
| stakeholder-management | `/stakeholders` | Map power/interest grid | ~30 min |
| planning-gtm-launch | `/gtm` | Create GTM launch plan | ~60 min |
| writing-product-strategy | `/strategy` | Write 3-5 year strategy | ~90 min |
| reviewing-launch-outcomes | `/review` | Post-launch retrospective | ~45 min |

**Use these:** For major initiatives, launches, or strategy planning.

### As-Needed Skills

| Skill | How to Invoke | Purpose |
|-------|---------------|---------|
| building-truth-base | "Run building-truth-base" | Day-1 product understanding |
| analyzing-kb-gaps | "Run analyzing-kb-gaps" | Find KB pain points |
| writing-prds-from-charters | "Run writing-prds-from-charters for [charter]" | Turn charters into PRDs |
| prioritizing-work | "Run prioritizing-work" | Sequence work by impact |
| competitive-analysis | "Run competitive-analysis" | Analyze competitors |
| analyzing-data | "Run analyzing-data" | Data deep-dive |
| tracking-decisions | "Run tracking-decisions" | Log major decisions |

**Use these:** When you need them for specific situations.

### Automatic Skills

| Skill | When It Runs | Purpose |
|-------|--------------|---------|
| learning-from-history | Weekly via hook | Extract success/failure patterns |
| using-pm-os | Every session start | Session guardrails, staleness check |

**You don't invoke these** - they run automatically.

### Skills That Use my-context.md

These skills pull from `inputs/context/my-context.md` to tailor outputs:

| Skill | How It Uses Context |
|-------|---------------------|
| `stakeholder-management` | Pre-populates stakeholder list from Key Stakeholders table |
| `tracking-decisions` | Uses Decision Principles for framing recommendations |
| `generating-quarterly-charters` | Applies Constraints and Current Priorities to strategic bets |
| `writing-product-strategy` | Incorporates Strategic Context for vision alignment |
| `planning-gtm-launch` | References stakeholders and constraints for launch planning |

**Tip:** Keep `my-context.md` updated quarterly. Stale context leads to misaligned outputs.

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

**Two ways to invoke:**

1. **Via command** (shortcut):
   ```
   /ktlo
   /voc
   /charters
   /exec-update
   /stakeholders
   /gtm
   /strategy
   /review
   ```

2. **Direct invocation**:
   ```
   "Run triaging-ktlo"
   "Run synthesizing-voc"
   "Run building-truth-base"
   ```

**Commands vs Direct:**
- Commands are shortcuts (defined in `commands/*.md`)
- Direct invocation works for all skills (not just those with commands)

### What Skills Produce

Every skill generates:

1. **Structured output** in `outputs/[type]/`
2. **YAML metadata header** tracking sources and dependencies
3. **Claims ledger** tagging evidence/assumptions
4. **Versioned copy** in `history/[skill-name]/`

## Skill Deep-Dives

### triaging-ktlo

**Purpose:** Triage support backlog into prioritized buckets

**Inputs:** `inputs/jira/*.csv` (Jira export)

**Output:** `outputs/ktlo/ktlo-triage-YYYY-MM-DD.md`

**What it does:**
1. Reads Jira tickets from CSV
2. Groups by theme (bugs, requests, tech debt)
3. Prioritizes into tiers (P0: Now, P1: This quarter, P2: Backlog)
4. Identifies patterns (top 3 themes)
5. Generates actionable triage report

**Use when:** Weekly or when backlog grows, to focus support work.

### synthesizing-voc

**Purpose:** Extract themes from customer feedback

**Inputs:** `inputs/voc/*.md` (interviews, surveys, feedback)

**Output:** `outputs/insights/voc-synthesis-YYYY-MM-DD.md`

**What it does:**
1. Reads all VOC files (need min 3 sources)
2. Extracts verbatim quotes
3. Groups into themes
4. Identifies pain points and unmet needs
5. Quantifies patterns (e.g., "3/7 customers mentioned X")

**Use when:** After customer calls or when planning features.

### generating-quarterly-charters

**Purpose:** Create strategic bets for the quarter

**Inputs:** `outputs/truth_base/`, `outputs/insights/`, `outputs/ktlo/`

**Output:** `outputs/roadmap/Q1-YYYY-charters.md`

**What it does:**
1. Reads truth base, VOC synthesis, KTLO triage
2. Generates 3-5 strategic bets
3. Defines success metrics for each bet
4. Identifies risks and dependencies
5. Links to evidence (VOC quotes, KTLO themes)

**Use when:** Weekly for quarterly planning, or when priorities shift.

### writing-prds-from-charters

**Purpose:** Turn charter bets into executable PRDs

**Inputs:** `outputs/roadmap/Q1-YYYY-charters.md`

**Output:** `outputs/delivery/prd-feature-name-YYYY-MM-DD.md`

**What it does:**
1. Reads charter to understand bet
2. Generates problem statement
3. Defines requirements (SHALL/SHOULD/MAY format)
4. Specifies edge cases and error handling
5. Creates acceptance criteria
6. Links back to charter for traceability

**Use when:** After charter is approved, before eng kickoff.

### stakeholder-management

**Purpose:** Map stakeholders using power/interest grid

**Inputs:** User input (stakeholder list)

**Output:** `outputs/stakeholders/stakeholder-map-YYYY-MM-DD.md`

**What it does:**
1. Collects stakeholder names and roles
2. Maps to power/interest grid (4 quadrants)
3. Defines communication strategy per quadrant
4. Tracks alignment status
5. Creates action plan

**Use when:** Major initiative, cross-team project, or politics are complex.

### planning-gtm-launch

**Purpose:** Create comprehensive GTM launch plan

**Inputs:** Charter or spec

**Output:** `outputs/gtm/gtm-initiative-YYYY-MM-DD.md`

**What it does:**
1. Analyzes market context (TAM/SAM/SOM)
2. Defines positioning and messaging
3. Creates 3-phase launch plan (pre/launch/post)
4. Plans enablement (sales, CS, support)
5. Defines success metrics

**Use when:** Product/feature launch, new market entry, or repositioning.

### writing-product-strategy

**Purpose:** Write 3-5 year product strategy

**Inputs:** Context (charters, VOC, competitive analysis)

**Output:** `outputs/strategy/product-strategy-YYYY.md`

**What it does:**
1. Defines vision statement
2. Analyzes market trends and threats
3. Creates strategic pillars (3-5)
4. Maps capability roadmap by year
5. Identifies competitive moats

**Use when:** Annual/bi-annual strategy planning, board presentations.

### reviewing-launch-outcomes

**Purpose:** Post-launch retrospective with lessons learned

**Inputs:** Launch data, original GTM plan

**Output:** `outputs/reviews/launch-review-initiative-YYYY-MM-DD.md`

**What it does:**
1. Compares predicted vs actual metrics
2. Identifies what went well (success patterns)
3. Identifies what went wrong (failure patterns)
4. Extracts lessons learned
5. Updates PM OS skills with improvements

**Use when:** 30/60/90 days after launch, or after major initiative.

## Customization

### Modifying Skills

Skills are markdown files - you can edit them:

1. **Read the skill**: `cat skills/triaging-ktlo/SKILL.md`
2. **Edit to fit your workflow**: Adjust steps, add sections, change format
3. **Test**: Run the modified skill, verify output
4. **Commit**: Version control your changes

**Example:** Add a "Tech Debt Impact" section to KTLO triage:
```markdown
## Step 4: Assess Tech Debt Impact
For each tech debt ticket:
- Estimate engineering weeks to fix
- Identify systems affected
- Calculate opportunity cost
```

### Creating New Skills

To add a new skill:

1. **Create directory**: `mkdir skills/my-new-skill/`
2. **Create SKILL.md**:
   ```markdown
   ---
   name: my-new-skill
   description: What this skill does
   ---

   # My New Skill

   ## Overview
   [Description]

   ## When to Use
   [Triggers]

   ## Core Pattern
   **Step 1:** [Action]
   ...
   ```
3. **Test**: "Run my-new-skill"
4. **Optional: Add command**: Create `commands/my-skill.md` for `/my-skill` shortcut

### Extending Skills

Add domain-specific knowledge:

**Example:** Add retail-specific context to VOC synthesis:
```markdown
## Retail-Specific VOC Patterns

Look for these retail themes:
- Assortment gaps (missing products)
- Catalog quality (attribute completeness)
- Supplier onboarding friction
- Pricing competitiveness
```

## Common Workflows

### Daily Routine

```
/ktlo              # 10 min: Triage support backlog
/voc               # 10 min: Synthesize customer feedback
/exec-update       # 10 min: Generate stakeholder update
```

### Planning a Quarter

```
1. Refresh foundation outputs (if stale)
2. /charters       # Generate strategic bets
3. Review with stakeholders
4. Refine and re-run /charters
5. Write PRDs from charters
```

### Launching a Product

```
1. /stakeholders   # Map key players
2. /gtm            # Create launch plan
3. Execute launch
4. /review         # 30 days post-launch retrospective
```

## Common Issues

### Issue: "Skill not found"

**Problem:** Trying to invoke a skill that doesn't exist.

**Solution:**
1. Check available skills: `ls skills/`
2. Verify skill name matches directory name
3. Check if there's a command shortcut: `ls commands/`

### Issue: "Skill ran but no output"

**Problem:** Skill completed but output file missing.

**Solution:**
1. Check if inputs exist (skills need source data)
2. Review error messages in skill execution
3. Verify outputs/ directory exists
4. Check if skill expects specific input format

### Issue: "Output doesn't match my needs"

**Problem:** Generated output isn't quite right for your workflow.

**Solution:**
1. Modify the skill file to fit your needs
2. Add/remove sections in `SKILL.md`
3. Re-run the skill with modifications
4. Version control your customizations

### Issue: "Learning system isn't updating skills"

**Problem:** Patterns extracted but skills not using them.

**Solution:**
1. Check `.claude/rules/learned/` for pattern files
2. Verify patterns are auto-loaded (they should be)
3. Restart session to reload rules
4. Learning improves future runs, not retroactively

## Best Practices

1. **Use skills consistently** - Don't reinvent workflows
2. **Customize to fit** - Adapt skills to your domain
3. **Track improvements** - Note what works, update skills
4. **Share patterns** - Commit skill modifications to team repo
5. **Version control** - Track skill evolution over time

## Integration with PM OS

```
┌──────────┐
│ Commands │ ← Quick shortcuts
└────┬─────┘
     │
     ▼
┌──────────┐
│  Skills  │ ← Reusable PM workflows
└────┬─────┘
     │
     ├────► Read inputs/
     │
     ├────► Generate outputs/
     │
     ├────► Copy to history/
     │
     └────► Update alerts/stale-outputs.md
```

**See also:**
- [commands/README.md](../commands/README.md) - Command shortcuts
- [outputs/README.md](../outputs/README.md) - Understanding results
- [Main README](../README.md) - Getting started guide
