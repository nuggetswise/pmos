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
- **interview-protocol.md** - Role-specific interview question templates and protocols for discovery
- **signal-classification.md** - EXPLICIT/INFERRED/IMPLICIT signal classification framework

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
- The `learn --patterns` skill extracts patterns from your outputs
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

### domain/mode-crisis.md

**Purpose:** Tone and structure rules for high-stakes, time-sensitive communications.

**Key Requirements:**
- Lead with impact, not cause
- Own the issue directly, without hedging language
- Provide timelines you can commit to
- Structure updates with Status, Impact, Next Steps

**Why it matters:** In a crisis, clear and accountable communication is essential for maintaining stakeholder trust.

---

### domain/mode-vision.md

**Purpose:** Tone and structure rules for inspiring, forward-looking communications.

**Key Requirements:**
- Paint the destination, not just the path
- Connect the vision to a larger purpose (customer, company, team)
- Acknowledge the difficulty of the journey to build credibility
- Make the vision tangible with concrete examples

**Why it matters:** A compelling vision rallies teams and aligns stakeholders around a future state.

---

### domain/vocabulary.md

**Purpose:** Domain vocabulary for Business Network + Catalogs (Retail/Brands/CPG).

**Sections:**
- Core terms (Business Network, Catalog, SKU, Item, etc.)
- Systems (PIM, MDM)
- PM acronyms (KTLO, VOC, GTM, PRD, TAM/SAM/SOM, ICP)

**Expanding:** Add new terms as you encounter them; `learn --patterns` skill will extract terms from outputs.

---

### pm-core/algorithm-enforcement.md

**Purpose:** Enforces the OBSERVE → THINK → PLAN → BUILD loop by checking for required inputs before running skills.

**Key Requirements:**
- Hard block skills that have firm prerequisites (e.g., cannot run `writing-prds-from-charters` without a charter).
- Soft block skills with recommendations (e.g., suggest running `synthesizing-voc` before `brainstorming`).
- Tracks and displays current phase in the algorithm loop.

**Why it matters:** Prevents "out of order" execution, ensuring that every planning and build action is based on prior observation and thinking.

---

### pm-core/decision-algorithm.md

**Purpose:** Defines the iterative loop all PM work follows.

**The Loop:** OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN

**Key Principle:** Verifiability is everything. Evidence before claims, always.

---

### pm-core/decision-detection.md

**Purpose:** Automatically detects decision moments during PM work to prompt logging.

**Key Requirements:**
- Uses heuristics to classify decisions as High, Medium, or Low confidence.
- Auto-logs high-confidence decisions (e.g., completing a charter).
- Asks the user to confirm medium-confidence decisions (e.g., choosing one option over another).
- Avoids prompt fatigue by batching and respecting user preferences.

**Why it matters:** Ensures important decisions are captured for future learning without creating excessive administrative burden.

---

### pm-core/deviation-rules.md

**Purpose:** Provides predictable guidance when unexpected situations arise during skill execution.

**Key Rules:**
- **Rule 1 (Missing Source):** Pause and ask the user how to proceed.
- **Rule 2 (Conflicting Data):** Flag the conflict, use the most recent source, and proceed.
- **Rule 3 (Scope Creep):** Document as "Out of Scope" and continue with the original plan.
- **Rule 4 (Invalid Assumption):** STOP immediately and checkpoint with the user.

**Why it matters:** Prevents the AI from failing or producing incorrect output when faced with imperfect inputs or changing conditions.

---

### pm-core/evidence-rules.md

**Purpose:** Ensures every claim in PM outputs is properly tagged and sourced.

**Key Requirements:**
- Every output must include a "Sources Used" section.
- Every major claim tagged as: `Evidence`, `Assumption`, or `Open Question`.
- A "Claims Ledger" table is required at the end of all outputs.
- Never invent metrics, customers, roadmap facts, or quotes.

**Validation Checklist:** 9-point checklist before marking any output complete.

---

### pm-core/goal-backward-verification.md

**Purpose:** Prevents "completed but wrong" outputs by checking if the final document achieves its strategic purpose.

**Key Requirements:**
- State the output's true goal (e.g., "Engineering can build without questions").
- Derive 3-5 observable truths that should result from a successful output.
- Validate key links (e.g., every problem statement links to evidence).

**Why it matters:** It shifts the definition of "done" from "all sections are filled" to "this document accomplishes its goal."

---

### pm-core/output-metadata.md

**Purpose:** Standardizes metadata for dependency tracking and staleness detection.

**Key Requirements:**
- YAML frontmatter with: `generated`, `skill`, `sources`, `downstream`.
- Temperature classification: `hot`, `warm`, `cold`.
- **Mandatory:** Run `pm-os mirror --quiet` after generating any output to copy it to `history/`.

**Why it matters:** This metadata is the foundation of the system's memory, enabling automated staleness detection and learning from historical work.

---

### pm-core/pm-collaborative-style.md

**Purpose:** MANDATORY collaborative PM interaction style for all PM OS workflows.

**Key Requirements:**
- Explain the "why" before acting on any PM task.
- Provide insights and emerging patterns during analysis.
- Suggest evidence-based next steps after completion.
- Maintain strict evidence discipline, citing sources for all claims.
- Teach PM patterns and connect work to historical context.

**Why this matters:** Transforms the AI from a simple task-executor into a collaborative partner that helps the user become a better PM.

---

### pm-workflows/bridge-and-pivot.md

**Purpose:** Provides patterns for handling off-topic questions and unexpected challenges gracefully.

**Framework (ABC):**
- **A**cknowledge the question.
- **B**ridge to your key message.
- **C**ommunicate your point concisely.

**Why it matters:** Helps maintain control of a conversation and stay on message, even when caught off-guard.

---

### pm-workflows/charter-creation.md

**Purpose:** Rules for quarterly charter creation.

**Required Sections:** Strategic bets, success metrics, risks, dependencies.

**Evidence Requirements:** All bets must link to VOC or KTLO evidence; a claims ledger is required.

**Quality Gates:** Review with stakeholder-map; run verification-before-completion.

---

### pm-workflows/narrative-structure.md

**Purpose:** Transforms messy PM context into a compelling narrative for stakeholder communication.

**Framework:**
- **Context:** The setup.
- **Conflict:** The tension or problem.
- **Resolution:** The path forward.

**Why it matters:** A good story is more persuasive than a list of facts. This structure helps build buy-in for strategic initiatives.

---

### pm-workflows/objection-handling.md

**Purpose:** Patterns for handling pushback and challenges from stakeholders.

**Framework (LAAR):**
- **L**isten completely.
- **A**cknowledge their concern.
- **A**sk clarifying questions to find the underlying need.
- **R**espond to the need, not just the surface objection.

**Why it matters:** Turns adversarial objections into collaborative problem-solving.

---

### pm-workflows/prd-writing.md

**Purpose:** Rules for writing Product Requirements Documents.

**Required Sections:** Problem statement, success metrics, requirements (SHALL/SHOULD/MAY), edge cases, dependencies, acceptance criteria.

**Evidence Requirements:** Link back to charter; all requirements must trace to charter bets or VOC; no scope creep.

**Format Options:** `--format full` (complete), `--format exec` (1-page), `--format eng` (requirements only).

---

### system/output-destinations.md

**Purpose:** Tracks where different PM outputs are stored and their history directories.

**Key Feature:** A mapping table that links output types (e.g., "Quarterly charters") to their location (`outputs/roadmap/`) and history folder (`history/generating-quarterly-charters/`).

**Why it matters:** Provides a single source of truth for file organization, enabling programmatic access and reliable mirroring.

---

### system/related-files.md

**Purpose:** Ensures related files stay in sync when one is modified.

**Key Feature:** A relationship map that tells the AI to check `file B` when `file A` is changed.

**Why it matters:** Prevents inconsistencies and maintains the integrity of the knowledge base as it evolves.

---

### system/session-greeting.md

**Purpose:** Defines the mandatory greeting format the AI must use at the start of every new session.

**Key Requirements:**
- The greeting MUST be the first output in a session.
- It must report status based on `nexa/state.json`, including the daemon status, current algorithm phase, active work, and any blockers.

**Why it matters:** Ensures the user has immediate context on the system's state before starting work.

---

### system/session-state-protocol.md

**Purpose:** Defines that session state is tracked in `nexa/state.json`.

**Key Fields:** `phase`, `current_job`, `next_action`, `last_job`, `errors`.

**Why it matters:** Centralizes state management into a single, machine-readable file, replacing previous manual markdown tracking.

---

### system/staleness-protocol.md

**Purpose:** Defines session start behavior for checking stale outputs.

**Key Requirement:** Staleness is inferred by comparing an output's `generated` timestamp with the `modified` timestamps of its sources, as listed in its metadata.

**Why it matters:** This automates staleness detection, removing the need for manual tracking files.


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
