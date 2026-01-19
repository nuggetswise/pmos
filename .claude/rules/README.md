# PM OS Rules Directory

This directory contains modular rules that govern how Claude operates as your PM copilot. Rules are auto-discovered and loaded at session start.

> **AG3 Note:** Staleness and session state now live in `nexa/state.json`. Any
> references to `alerts/stale-outputs.md` or `outputs/session-state.md` are legacy.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Quick Reference](#quick-reference)
- [Rule Categories](#rule-categories)
- [How Rules Work](#how-rules-work)
- [Adding New Rules](#adding-new-rules)
- [Rule Reference](#rule-reference)
- [Troubleshooting](#troubleshooting)

---

## Directory Structure

```
.claude/rules/
├── pm-core/           # Core PM discipline rules (non-negotiable)
├── pm-workflows/      # Workflow-specific rules
├── domain/            # Domain-specific vocabulary and context
├── system/            # System protocols for file management
└── learned/           # Auto-generated patterns from past work
```

---

## Quick Reference

| Category | Purpose | When to Use | Precedence |
|----------|---------|-------------|------------|
| `system/` | File management, dependencies | Tracking outputs, staleness | Base (loaded first) |
| `pm-core/` | Non-negotiable discipline | All PM work | High |
| `domain/` | Vocabulary, terminology | Domain-specific language | Medium |
| `pm-workflows/` | Deliverable rules | Charters, PRDs, etc. | High |
| `learned/` | Auto-generated patterns | Past learnings | Override all |

---

## Rule Categories

### pm-core/

**Non-negotiable PM discipline rules** that apply to all outputs.

- **evidence-rules.md** - Evidence tagging, Claims Ledger, source attribution
- **output-metadata.md** - YAML frontmatter standards, temperature classification, review cadence
- **decision-algorithm.md** - The OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN loop
- **pm-collaborative-style.md** - MANDATORY collaborative PM interaction style (explains why, teaches patterns, connects to history)

**Why these matter:** Violating evidence discipline creates false confidence in bad bets. These rules ensure every output is traceable, verifiable, and properly tracked.

### pm-workflows/

**Workflow-specific rules** for common PM deliverables.

- **charter-creation.md** - Quarterly charter requirements, evidence gates, downstream impact
- **prd-writing.md** - PRD sections, requirements format, quality gates, format options

**Why these matter:** Standardizes high-stakes deliverables to ensure consistency and completeness.

### domain/

**Domain knowledge** specific to your product area.

- **vocabulary.md** - Business Network + Catalogs terminology, system acronyms, PM acronyms

**Why these matter:** Ensures Claude speaks your domain language correctly. Expand this as you encounter new terms.

### system/

**System protocols** for file management and dependency tracking.

- **related-files.md** - File relationship map, cascade rules, enforcement protocol
- **output-destinations.md** - Where outputs are stored, history directories, dependency graph
- **staleness-protocol.md** - Session start checks, staleness reporting, drift detection

**Why these matter:** Keeps your PM OS coherent. When you change one file, related files stay in sync. When inputs change, downstream outputs are flagged as stale.

### learned/

**Auto-generated patterns** from past work. This directory is empty initially and grows as you use PM OS.

**How it works:**
- Skills like `learning-from-history` extract patterns from your outputs
- New vocabulary, decision patterns, and personal preferences are stored here
- Rules in `learned/` take precedence over base rules (your recent learnings override defaults)

---

## How Rules Work

### Rule Loading Order

```
Session Start
     │
     ▼
┌─────────────┐
│   system/   │  ← Base protocols (file mgmt, staleness)
└──────┬──────┘
       ▼
┌─────────────┐
│  pm-core/   │  ← Core discipline (evidence, metadata)
└──────┬──────┘
       ▼
┌─────────────┐
│   domain/   │  ← Vocabulary & terminology
└──────┬──────┘
       ▼
┌─────────────┐
│pm-workflows/│  ← Deliverable-specific (charters, PRDs)
└──────┬──────┘
       ▼
┌─────────────┐
│  learned/   │  ← Override all (your patterns)
└─────────────┘
```

### Auto-Discovery

Claude loads all `.md` files in `.claude/rules/` at session start:

1. Reads all subdirectories recursively
2. Applies rules in order: `system/` → `pm-core/` → `domain/` → `pm-workflows/` → `learned/`
3. Later rules can override earlier rules

### Frontmatter Metadata

Some rules include frontmatter to specify which files they apply to:

```yaml
---
paths:
  - "outputs/delivery/**/*.md"
  - "history/writing-prds-from-charters/**/*.md"
---
```

This limits the rule's scope to specific output types.

### Session Start Protocol

Before responding to any request, Claude:

1. Reads `nexa/state.json`
2. Reports any stale outputs
3. Checks for drift (downstream newer than sources)
4. Then proceeds with your request

See `system/staleness-protocol.md` for details.

---

## Adding New Rules

### When to Add a New Rule

Add a new rule when you find yourself:
- Repeating the same instruction across multiple sessions
- Correcting the same mistake in multiple outputs
- Wanting a specific format or structure to be automatic

### How to Add a Rule

1. **Choose the right category:**
   - `pm-core/` - Applies to all PM work (rare - high bar)
   - `pm-workflows/` - Specific deliverable type (charters, PRDs, etc.)
   - `domain/` - Vocabulary or domain-specific knowledge
   - `system/` - File management or dependency tracking

2. **Create a new `.md` file:**
   ```
   .claude/rules/pm-workflows/gtm-planning.md
   ```

3. **Add frontmatter (optional):**
   ```yaml
   ---
   paths:
     - "outputs/gtm/**/*.md"
   ---
   ```

4. **Write the rule:**
   - Use clear headings
   - Be specific (examples help)
   - Explain why the rule matters

5. **Update related files (if needed):**
   - If your rule affects file dependencies, update `system/output-destinations.md`
   - If it relates to other rules, update `system/related-files.md`

### Example Rule Structure

```markdown
# [Rule Name]

## Purpose
[What this rule does and why it matters]

## When It Applies
[Specific files, workflows, or conditions]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Quality Gates
- [How to verify compliance]

## Examples
[Show good vs. bad examples]
```

---

## Rule Reference

### pm-core/evidence-rules.md

**Purpose:** Ensures every claim in PM outputs is properly tagged and sourced.

**Key Requirements:**
- Every output must include a "Sources Used" section
- Every major claim tagged as: Evidence / Assumption / Open Question
- Claims Ledger table required at end of all outputs
- Never invent metrics, customers, roadmap facts, or quotes

**Validation Checklist:** 9-point checklist before marking any output complete.

---

### pm-core/output-metadata.md

**Purpose:** Standardizes metadata for dependency tracking and staleness detection.

**Key Requirements:**
- YAML frontmatter with: generated, skill, sources, downstream
- Temperature classification: hot (weekly review), warm (monthly), cold (archive)
- Output style: crisp, decision-first, always include risks and next actions
- Copy to history directory with date suffix

**After Generation:** Update `nexa/state.json` + audit log and copy to history.

---

### pm-core/decision-algorithm.md

**Purpose:** Defines the iterative loop all PM work follows.

**The Loop:** OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN

**Key Principle:** Verifiability is everything. Evidence before claims, always.

---

### pm-core/pm-collaborative-style.md

**Purpose:** MANDATORY collaborative PM interaction style for all PM OS workflows.

**Key Requirements:**
- Explain the "why" before acting on any PM task
- Provide insights during analysis (share emerging patterns)
- Suggest evidence-based next steps after completion
- Maintain strict evidence discipline (never invent, always cite)
- Teach PM patterns and connect work to history
- Connect work across tiers (inputs → strategy → delivery)

**Output Style:** Decision-first, crisp, enterprise-grade, risk-inclusive, action-oriented

**Why this matters:** Makes you a better PM by teaching patterns, not just executing tasks.

---

### pm-workflows/charter-creation.md

**Purpose:** Rules for quarterly charter creation.

**Required Sections:** Strategic bets, success metrics, risks, dependencies

**Evidence Requirements:** All bets must link to VOC or KTLO evidence, claims ledger required

**Quality Gates:** Review with stakeholder-map, run verification-before-completion

**Downstream Impact:** When charters change, PRDs become stale

---

### pm-workflows/prd-writing.md

**Purpose:** Rules for writing Product Requirements Documents.

**Required Sections:** Problem statement, success metrics, requirements (SHALL/SHOULD/MAY), edge cases, dependencies, acceptance criteria

**Evidence Requirements:** Link back to charter, all requirements trace to charter bets or VOC, no scope creep

**Format Options:** `--format full` (complete), `--format exec` (1-page), `--format eng` (requirements only)

**Quality Gates:** Run verification-before-completion, ensure all SHALL requirements are testable

---

### domain/vocabulary.md

**Purpose:** Domain vocabulary for Business Network + Catalogs (Retail/Brands/CPG).

**Sections:**
- Core terms (Business Network, Catalog, SKU, Item, etc.)
- Systems (PIM, MDM)
- PM acronyms (KTLO, VOC, GTM, PRD, TAM/SAM/SOM, ICP)

**Expanding:** Add new terms as you encounter them; `learning-from-history` skill will extract terms from outputs.

---

### system/related-files.md

**Purpose:** Ensures related files stay in sync when one is modified.

**File Relationship Map:** Table mapping files to their dependents

**Enforcement Protocol:** Before completing any file modification, check table, read related files, fix inconsistencies

**Cascade Rules:** Some changes cascade through multiple levels (e.g., context → stakeholders → charters)

---

### system/output-destinations.md

**Purpose:** Tracks where different PM outputs are stored and their history directories.

**Output Type Mapping:** Table mapping output types to locations and history directories

**History Rule:** When writing to `outputs/`, copy to `history/<skill>/` with date suffix

**Dependency Graph:** Visualizes how inputs flow to outputs (Tier 0 → Tier 1 → Tier 2 → Tier 3)

---

### system/staleness-protocol.md

**Purpose:** Defines session start behavior for checking stale outputs.

**Session Start Protocol:** Always check `nexa/state.json` before responding to any request

**Staleness Check Format:** Report stale outputs with source change reason

**Drift Detection:** Report when downstream output is newer than sources

**Frozen Outputs:** Some outputs may be intentionally frozen (not updated despite stale sources)

---

## Troubleshooting

### Rules not loading?

- **Check file extension:** Rules must be `.md` files
- **Verify location:** Files must be in `.claude/rules/` or a subdirectory
- **Check syntax:** Malformed YAML frontmatter can prevent loading

### Rule conflict?

- **Check precedence order:** `learned/` overrides all, then `pm-workflows/` → `domain/` → `pm-core/` → `system/`
- **Review frontmatter paths:** If two rules have overlapping `paths:`, later-loaded rule wins
- **Split rules:** If a rule is too broad, narrow its `paths:` scope

### Staleness errors at session start?

- **Refresh upstream:** Say "refresh <skill-name>" to regenerate stale outputs
- **Check inputs:** Verify source files in `inputs/` haven't changed unexpectedly
- **Review drift:** If downstream is newer than upstream, reconcile or refresh

### Rule not applying to expected files?

- **Check paths frontmatter:** Ensure glob patterns match your file paths
- **Verify file exists:** Rule must be readable at session start
- **Test pattern:** Use `outputs/delivery/**/*.md` format for recursive matching

---

## Questions?

If you're unsure which category a rule belongs in, ask yourself:

- **Does this apply to all PM work?** → `pm-core/`
- **Is this specific to one deliverable type?** → `pm-workflows/`
- **Is this a term or domain concept?** → `domain/`
- **Is this about file management or dependencies?** → `system/`
- **Is this a learned pattern from past work?** → `learned/` (auto-generated)

When in doubt, start in `pm-workflows/` and promote to `pm-core/` only if it truly applies universally.
