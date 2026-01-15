# .claude/ Directory

## Purpose

The `.claude/` directory contains **Claude Code configuration and rules** - the intelligence that makes PM OS smart, adaptive, and learning-focused.

**Why this matters:** This directory holds the "brain" of PM OS:
- Modular rules that guide PM work
- Auto-generated learned patterns from your history
- Configuration for agents and output styles
- Personal preferences that aren't version controlled

## Directory Structure

```
.claude/
├── rules/                          # Modular rules (auto-discovered)
│   ├── pm-core/                    # Core PM principles
│   │   ├── evidence-rules.md       # Never invent data, tag claims
│   │   ├── output-metadata.md      # YAML header standards
│   │   └── decision-algorithm.md   # PM decision loop (PAI)
│   ├── domain/                     # Domain vocabulary
│   │   └── vocabulary.md           # Business Network, Catalog terms
│   ├── system/                     # System rules
│   │   ├── staleness-protocol.md   # Dependency tracking
│   │   └── output-destinations.md  # Where outputs live
│   ├── pm-workflows/               # Workflow-specific rules
│   │   ├── charter-creation.md     # Charter requirements
│   │   └── prd-writing.md          # PRD standards
│   └── learned/                    # Auto-generated patterns
│       └── (empty until learning runs)
├── agents/                         # Agent definitions (optional)
├── output-styles/                  # Custom output styles (optional)
├── settings.json                   # Rules configuration
├── settings.local.json             # Local overrides (not in git)
└── MODULAR_RULES_VERIFICATION.md  # Rules documentation
```

## Modular Rules System

### What are Modular Rules?

Modular rules are **markdown files with YAML frontmatter** that Claude Code automatically loads and applies.

**Example rule:**

```markdown
---
paths:
  - "outputs/roadmap/**/*.md"
  - "history/generating-quarterly-charters/**/*.md"
---

# Charter Creation Rules

## Required Sections
- Strategic bets (≤3 per quarter recommended)
- Success metrics (baseline + target format)
- Risks (with mitigation owner)
...
```

### Rule Categories

#### pm-core/ - Core PM Principles

**evidence-rules.md** - Evidence discipline (non-negotiable)
- Never invent metrics, customers, or quotes
- Tag all claims: Evidence / Assumption / Open Question
- Include Sources Used section
- Include Claims Ledger table

**output-metadata.md** - YAML header standards
- Required: generated, skill, sources, downstream
- Format: `sources: - path/file.md (modified: YYYY-MM-DD)`
- After generation: Copy to history/, update alerts/

**decision-algorithm.md** - PM decision loop
- OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN
- Maps to PM OS skills
- Verifiability is everything

#### domain/ - Domain Vocabulary

**vocabulary.md** - Business Network + Catalog terms
- Business Network, Catalog, SKU, Item, Attributes
- GTIN, PIM, MDM
- KTLO, VOC, GTM, PRD, TAM/SAM/SOM

**Extensible:** Add your domain terms as you learn them

#### system/ - System Rules

**staleness-protocol.md** - Session start staleness check
- Read `alerts/stale-outputs.md` before responding
- Report stale outputs to user
- Detect drift (downstream newer than upstream)

**output-destinations.md** - Maps output types to directories
- Truth base → `outputs/truth_base/`
- VOC synthesis → `outputs/insights/`
- Quarterly charters → `outputs/roadmap/`
- etc.

#### pm-workflows/ - Workflow-Specific Rules

**charter-creation.md** - Charter requirements
- **Paths:** `outputs/roadmap/**/*.md`, `history/generating-quarterly-charters/**/*.md`
- Required sections: Strategic bets, metrics, risks, dependencies
- Evidence requirements: Link to VOC/KTLO, claims ledger
- Quality gates: Review with stakeholders, run verification

**prd-writing.md** - PRD standards
- **Paths:** `outputs/delivery/**/*.md`, `history/writing-prds-from-charters/**/*.md`
- Before writing: Verify charter up-to-date, check stakeholder map
- Required sections: Problem, metrics, requirements, edge cases
- Format options: full, exec, eng

**Path-specific loading:** Rules with `paths:` frontmatter auto-load when working in those directories.

### learned/ - Auto-Generated Patterns

The `learned/` directory is special - it's **written by the learning system**, not manually edited.

**How it works:**

1. **Learning system analyzes** `history/` directories
2. **Extracts patterns**: Success/failure patterns from versioned outputs
3. **Writes rules**: Auto-generates pattern files to `learned/`
4. **Claude Code loads**: Patterns auto-apply to future work

**Example learned pattern file:**

`.claude/rules/learned/charter-patterns.md`

```markdown
---
generated: 2026-01-20 14:30
skill: learning-from-history
analyzed_skill: generating-quarterly-charters
sample_size: 12
---

# Learned Patterns: Quarterly Charters

## Success Pattern: Charter Brevity
**Observation:** Charters with ≤3 strategic bets get approved faster
**Evidence:** 10/12 successful charters (83%)
**Recommendation:** Default to 3 bets max per quarter

## Failure Pattern: Missing Metrics
**Observation:** Charters without baseline metrics get rejected
**Evidence:** 5/7 rejected charters (71%)
**Recommendation:** Always include baseline + target format
```

**When learning runs:**
- Automatically after 7 days (via session hook)
- Or manually: "Analyze patterns from [skill-name] history"

## Personal Preferences

`CLAUDE.local.md` - **Not in git**, personal to you

Contains your preferences that learning system extracts:

```markdown
# Learned Preferences (from history analysis)

## Charter Preferences
**Last updated:** 2026-01-20
**Based on:** 12 outputs

- User prefers table format over bullets (10/12 times, 83%)
- User's typical review cycle: 2 rounds before approval
- User always requests risk mitigation owners (12/12 times)
- User's common stakeholders: Sarah (Eng), Mike (Design), Lisa (Sales)

## Domain Context
- Key terms user uses: "Business Network", "globally connected catalogs"
- User's product area: Retail/CPG catalog platform
- User's success metrics: Data accuracy, sync speed, catalog completeness
```

**Purpose:** Makes PM OS adapt to your specific workflow over time.

## Agents Directory

The `agents/` directory can contain custom agent definitions for specialized tasks.

**Example use cases:**
- Code review agents
- Technical writing agents
- Data analysis agents

**Not required for PM OS** - optional advanced feature.

## Output Styles Directory

The `output-styles/` directory can contain custom output styles that modify Claude Code's behavior.

**Example:** PM Collaborative output style

`.claude/output-styles/pm-collaborative.md`

```markdown
---
name: PM Collaborative
description: Collaborative PM mode with explanatory insights
keep-coding-instructions: false
---

# PM Collaborative Output Style

You are a collaborative PM copilot...

## Core Behaviors

1. **Explain the Why**: Before tasks, explain why analysis matters
2. **Evidence Discipline**: Maintain strict evidence rules
3. **Learning Mindset**: Share insights from history/
...
```

**To use:**
```
/output-style pm-collaborative
```

## Configuration Files

### settings.json

Main configuration for rules system:

```json
{
  "rules": {
    "rulesDirectories": [".claude/rules"]
  }
}
```

**Tells Claude Code:** "Auto-discover rules in `.claude/rules/`"

### settings.local.json

Local overrides (not in version control):

```json
{
  "outputStyle": "pm-collaborative"
}
```

**Use for:** Personal preferences that shouldn't be shared with team.

## How Rules Auto-Load

```
Session Start
     │
     ▼
┌────────────────────┐
│ Claude Code reads: │
│ - .claude/rules/** │
└────────┬───────────┘
         │
         ▼
┌───────────────────────┐
│ All .md files loaded: │
│ - pm-core/*.md        │
│ - domain/*.md         │
│ - system/*.md         │
│ - pm-workflows/*.md   │
│ - learned/*.md        │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────────┐
│ Path-specific rules apply │
│ when working in:          │
│ - outputs/roadmap/        │
│ - outputs/delivery/       │
│ - history/...             │
└───────────────────────────┘
```

**You don't need to do anything** - rules load automatically.

## Learning System Workflow

```
1. You run skills, outputs written to history/
     │
     ▼
2. After 7 days (or manual trigger)
     │
     ▼
3. Learning system analyzes history/
     │
     ├──► Identifies success patterns
     ├──► Identifies failure patterns
     ├──► Quantifies confidence
     │
     ▼
4. Writes patterns to .claude/rules/learned/
     │
     ▼
5. Next session: Patterns auto-load
     │
     ▼
6. Future work uses learned patterns automatically
```

**Example:** If learning finds "3-bet charters get approved faster", future charter generation defaults to 3 bets.

## Common Workflows

### Checking What Rules are Loaded

```
/memory
```

Should show all `.claude/rules/**/*.md` files loaded.

### Triggering Learning Manually

After generating several charters:

```
"Analyze patterns from generating-quarterly-charters history"
```

Learning system will:
1. Read all charter files in history/
2. Extract patterns
3. Write to `.claude/rules/learned/charter-patterns.md`
4. Update `CLAUDE.local.md` with preferences

### Adding Domain Vocabulary

Edit `.claude/rules/domain/vocabulary.md`:

```markdown
| **MDM** | Master Data Management |
| **PIM** | Product Information Management |
| **Your New Term** | Definition |
```

Next session, Claude Code knows your terms.

### Creating Path-Specific Rules

For custom workflows, add new rule file:

`.claude/rules/pm-workflows/gtm-planning.md`

```markdown
---
paths:
  - "outputs/gtm/**/*.md"
  - "history/planning-gtm-launch/**/*.md"
---

# GTM Planning Rules

## TAM/SAM/SOM Analysis
- Always include market sizing
- Cite sources for market data
- Show calculation methodology

...
```

Rules auto-apply when working in GTM directories.

## Common Issues

### Issue: "Rules not loading"

**Problem:** Expected rules to apply but they didn't.

**Solution:**
1. Check rules exist: `ls .claude/rules/pm-core/`
2. Verify YAML frontmatter is correct
3. Check settings.json has rules directory
4. Restart Claude Code session

### Issue: "Learning patterns not appearing"

**Problem:** Ran learning but no files in `learned/`.

**Solution:**
1. Check history has enough files: `ls history/[skill]/`
2. Need ≥5 outputs for meaningful patterns
3. Check learning ran successfully (no errors)
4. Look for output in `outputs/learning/`

### Issue: "Path-specific rules not applying"

**Problem:** Rules should apply in directory but don't.

**Solution:**
1. Check rule file has `paths:` frontmatter
2. Verify path pattern matches your directory
3. Path patterns use glob syntax: `**/*.md`
4. Test by working directly in matching directory

### Issue: "CLAUDE.local.md missing"

**Problem:** Expected personal preferences file but it doesn't exist.

**Solution:**
1. File is created by learning system (not manual)
2. Run learning analysis to generate it
3. Or create manually with preferences structure
4. Add to `.gitignore` (shouldn't be version controlled)

## Best Practices

1. **Don't manually edit learned/** - Let learning system manage it
2. **Do customize pm-workflows/** - Add domain-specific rules
3. **Do extend domain/vocabulary.md** - Add your terms
4. **Version control most rules** - Except CLAUDE.local.md
5. **Review learned patterns** - Verify they make sense before relying on them

## Rule Hierarchy

When rules conflict, this is the precedence:

1. **Path-specific rules** (pm-workflows/*.md with `paths:`)
2. **Learned patterns** (.claude/rules/learned/)
3. **Core rules** (pm-core/)
4. **Domain rules** (domain/)
5. **System rules** (system/)

**Why:** More specific rules override general ones.

## Integration with PM OS

```
┌─────────────────┐
│ .claude/rules/  │ ← Auto-discovered rules
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Skills execute  │ ← Apply rules
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Outputs follow  │ ← Evidence discipline, metadata
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ History builds  │ ← Versioned trail
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Learning mines  │ ← Extract patterns
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Learned patterns│ ← Auto-improve
│ written to      │
│ .claude/rules/  │
│ learned/        │
└─────────────────┘
```

**Closed loop:** Your work improves the system over time.

## See Also

- [Main README](../README.md) - Getting started guide
- [history/README.md](../history/README.md) - How learning uses history
- `.claude/MODULAR_RULES_VERIFICATION.md` - Rules system documentation
- Claude Code docs on rules: https://code.claude.com/docs/en/customization/rules
