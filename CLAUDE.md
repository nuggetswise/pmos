# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**PM OS** is a file-based PM operating system for a Lead Product Manager. It transforms raw inputs (Jira tickets, customer feedback, strategy docs) into actionable insights, strategic charters, and executable PRDs through modular, evidence-driven PM workflows.

**Core Principle:** Evidence before claims, always. Every output cites sources, tags assumptions, and includes a claims ledger.

**Architecture:**
- File-based (no database): Inputs → Skills → Outputs → History → Learning
- 15 reusable PM skills (ranging from tactical KTLO triage to strategic 3-year planning)
- Modular rules system for evidence discipline, output standards, and domain vocabulary
- Automatic learning loop: outputs are versioned in history, patterns extracted weekly into learned rules

---

## Development Commands

### Build & Setup

```bash
# Install dependencies
cd nexa && npm install && npm run build

# Watch mode for TypeScript compilation during development
npm run watch

# Verify build succeeded
npm start -- status
```

### Key CLI Commands (PM OS Daemon)

The `pm-os` CLI is the core daemon for document scanning, extraction, and state management:

```bash
# Scan sources for new/changed documents (reads sources.local.yaml)
pm-os scan

# Show 5-line status brief (phase, current job, next action)
pm-os status

# Copy outputs to history/ for learning (auto-run by Nexa, can run manually)
pm-os mirror [--quiet]

# Analyze history and extract learned patterns
pm-os learn synthesizing-voc    # Learn from specific skill
pm-os learn --auto              # Learn across all skills with sufficient history

# Full-text search across ingested documents and outputs
pm-os search "keyword"

# Watch mode - background daemon monitoring for changes (optional)
pm-os watch

# Initialize or reset state
pm-os init
```

### Running Single Skills (Claude Code)

Skills are invoked conversationally or via slash commands:

```
/ktlo              # Triage KTLO backlog
/voc               # Synthesize VOC themes
/charters          # Generate quarterly charters
/exec-update       # Generate executive update
/strategy          # Write product strategy
/prd               # Write PRD from charter
/learn --decision  # Log a decision
```

See `commands/README.md` for full list of shortcuts.

---

## Architecture Overview

### Directory Structure

```
pm_os_superpowers/
├── nexa/                    # PM OS CLI (TypeScript daemon)
│   ├── src/
│   │   ├── index.ts         # CLI entry point
│   │   ├── state.ts         # State management (nexa/state.json)
│   │   ├── scanner.ts       # File scanning (reads sources.local.yaml)
│   │   ├── ingest.ts        # Text extraction (PDF, DOCX, PPTX, CSV)
│   │   ├── mirror.ts        # History mirroring (outputs → history)
│   │   ├── learn.ts         # Pattern learning (history → rules)
│   │   ├── search.ts        # Full-text search
│   │   ├── types.ts         # TypeScript types
│   │   └── utils.ts         # Utilities
│   ├── package.json         # Node dependencies
│   ├── tsconfig.json        # TypeScript config
│   ├── state.json           # Single source of truth (gitignored)
│   ├── sources.example.yaml # Configuration template
│   └── sources.local.yaml   # User sources (gitignored)
│
├── inputs/                  # User-maintained source files
│   ├── context/             # COMPASS dimensions (compass.md, projects.md, challenges.md, preferences.md)
│   ├── voc/                 # Customer interviews, feedback, surveys
│   ├── jira/                # KTLO backlog (CSV exports)
│   └── [other sources]/     # Strategy docs, market research, etc.
│
├── outputs/                 # Generated artifacts (current)
│   ├── ingest/              # Extracted document text (daemon-managed)
│   ├── deltas/              # Change summaries by category (daemon-managed)
│   ├── audit/               # Append-only operation log (daemon-managed)
│   ├── discovery/           # Document analysis, interview guides, signals
│   ├── truth_base/          # Product understanding and truth base
│   ├── insights/            # VOC synthesis, KB gap analysis, data analysis
│   ├── ktlo/                # KTLO triage output
│   ├── roadmap/             # Quarterly charters, prioritized work
│   ├── delivery/            # PRDs, launch specs
│   ├── stakeholders/        # Stakeholder maps, communication plans
│   ├── gtm/                 # GTM launch plans
│   ├── strategy/            # Long-term product strategy
│   ├── reviews/             # Launch reviews, retrospectives
│   ├── decisions/           # Decision logs
│   └── exec_updates/        # Executive update snapshots
│
├── history/                 # Versioned output trail (auto-managed)
│   ├── triaging-ktlo/           # Historical KTLO triages
│   ├── synthesizing-voc/        # Historical VOC syntheses
│   ├── generating-quarterly-charters/ # Historical charters
│   └── [skill-name]/            # One directory per skill
│
├── skills/                  # PM workflow library (15 skills)
│   ├── triaging-ktlo/           # Triage and prioritize support backlog
│   ├── synthesizing-voc/        # Extract customer themes
│   ├── generating-quarterly-charters/ # Plan the quarter
│   ├── writing-prds-from-charters/   # Create execution spec
│   ├── generating-exec-update/  # 1-page stakeholder summary
│   ├── writing-product-strategy/    # 3-year vision
│   ├── planning-gtm-launch/     # Launch planning
│   ├── stakeholder-management/  # Power/interest analysis
│   ├── competitive-analysis/    # Competitive landscape
│   ├── building-truth-base/     # Product understanding
│   ├── discover/                # Onboarding to new product
│   ├── analyze/                 # Data analysis, KB gaps
│   ├── learn/                   # Decision logging, retrospectives
│   ├── prioritizing-work/       # Backlog prioritization
│   └── brainstorming/           # Creative exploration
│
├── commands/                # Quick command shortcuts (11 commands)
│   └── [skill-name].md      # Links to skills
│
├── .claude/                 # Rules and configuration
│   ├── rules/               # Modular PM OS rules (auto-discovered)
│   │   ├── pm-core/         # Non-negotiable: evidence discipline, metadata, decision algorithm
│   │   ├── pm-workflows/    # Workflow-specific: charters, PRDs, interview protocol
│   │   ├── domain/          # Domain vocabulary (Business Network, Catalogs, CPG)
│   │   ├── system/          # System protocols: staleness, output destinations, session management
│   │   └── learned/         # Auto-generated patterns from history
│   ├── output-styles/       # Communication style customizations (tone, depth)
│   └── README.md            # Rules architecture documentation
│
├── .beads/                  # AG3 bead storage (atomic insights)
│   └── insights.jsonl       # Append-only: atomic insights from all work
│
├── hooks/                   # Session automation
│   ├── session-start.sh     # Load context, show greeting
│   └── weekly-learning.sh   # Auto-run pm-os learn --auto
│
└── docs/                    # Deep documentation
    ├── GETTING_STARTED.md   # Day 1 guide
    ├── TROUBLESHOOTING.md   # Common issues and solutions
    └── AG3-architecture.md  # Future evolution roadmap
```

### Data Flow (3 Tiers)

```
TIER 1: Foundation (direct from inputs/)
─────────────────────────────────────────
inputs/voc/*            → outputs/insights/voc-synthesis.md
inputs/jira/*           → outputs/ktlo/ktlo-triage.md
inputs/roadmap_deck/*   → outputs/truth_base/truth-base.md

TIER 2: Planning (from Tier 1)
─────────────────────────────────────────
outputs/truth_base/*    → outputs/roadmap/Q1-charters.md
outputs/insights/voc-* → outputs/roadmap/Q1-charters.md
outputs/ktlo/*          → outputs/roadmap/Q1-charters.md

TIER 3: Execution (from Tier 2)
─────────────────────────────────────────
outputs/roadmap/*       → outputs/delivery/prds/*.md
```

**Staleness cascades:** When Tier 1 changes → Tier 2 becomes stale → Tier 3 becomes stale.

---

## Core Concepts

### 1. Evidence Discipline (Non-Negotiable)

Every PM output follows strict evidence rules:

- **Never invent** metrics, customers, quotes, or roadmap facts
- **Every claim tagged:** Evidence (from source), Assumption (inferred, needs validation), or Open Question (unknown)
- **Every output includes:**
  - `Sources Used` section listing all input files read
  - `Claims Ledger` table with evidence mapping
- **Missing data explicitly stated** before proceeding with analysis

**Example Claims Ledger:**
```markdown
| Claim | Type | Source |
|-------|------|--------|
| "40% of tickets are catalog-related" | Evidence | inputs/jira/tickets.csv:15-42 |
| "Customers want faster sync" | Evidence | inputs/voc/interview-1.md:89 |
| "Sync time can be <5 seconds" | Assumption | Needs tech spike validation |
```

### 2. State Management (Single Source of Truth)

**File:** `nexa/state.json`

PM OS tracks:
- Current algorithm phase (OBSERVE/THINK/PLAN/BUILD/VERIFY/LEARN)
- Current job status (or null if idle)
- Next recommended action
- Ingest index (what documents have been processed)
- Recent errors (last 10)

This replaces manual markdown status files. The daemon updates state.json; Nexa (Claude) reads it to detect staleness and present context at session start.

**Schema:**
```json
{
  "version": 1,
  "daemon": { "status": "stopped|running", "pid": null, "last_heartbeat_at": null },
  "phase": "OBSERVE|THINK|PLAN|BUILD|VERIFY|LEARN",
  "current_job": null,
  "brief": { "top_themes": [], "risk_flags": [], "latest_delta": null },
  "next_action": "Run 'pm-os scan' to scan for new documents",
  "ingest_index": [],
  "last_job": null,
  "errors": []
}
```

### 3. Staleness Tracking

**Rule:** An output is stale when its source files were modified **after** the output was generated.

**Detection:**
1. Compare output's `generated` timestamp (in YAML metadata) with source files' modification times
2. If any source is newer → stale
3. Session start checks staleness via hooks and reports it

**Cascading:** Tier 1 staleness → Tier 2 stale → Tier 3 stale

**Resolution:** Refresh upstream first, then downstream.

### 4. Learning Loop

**Fully automated:**

1. **Skills generate outputs** → written to `outputs/[type]/`
2. **Auto-mirror runs** → Nexa runs `pm-os mirror --quiet` after every skill, copies to `history/[skill]/` with date suffix
3. **Weekly learning runs** → Hook fires `pm-os learn --auto`
4. **Patterns extracted** → Analyzes history, writes to `.claude/rules/learned/` (auto-loaded)
5. **Future outputs improve** → Learned patterns applied to subsequent runs

No manual intervention required. The learning loop closes automatically.

### 5. Output Metadata Standards

Every output file must include YAML frontmatter:

```yaml
---
generated: YYYY-MM-DD HH:MM
skill: skill-name
sources:
  - path/to/source.md (modified: YYYY-MM-DD)
  - path/to/source.csv (modified: YYYY-MM-DD)
downstream:
  - path/to/dependent/output.md
temperature: hot|warm|cold  # Review cadence
---
```

Temperature classification:
- **hot**: Active this sprint (review weekly)
- **warm**: Reference material (review monthly)
- **cold**: Archive only (no review)

---

## Key Files to Understand

### Configuration

| File | Purpose |
|------|---------|
| `nexa/sources.local.yaml` | Configure where pm-os scans for documents (gitignored) |
| `nexa/input-rules.yaml` | Route ingested documents to appropriate jobs |
| `CLAUDE.md` | This file - guidance for Claude Code |
| `.claude/rules/README.md` | Rules architecture (15 rule types across 5 categories) |

### Context Files (User-Maintained)

| File | Purpose |
|------|---------|
| `inputs/context/compass.md` | Mission, goals, beliefs, stakeholders (strategic context) |
| `inputs/context/projects.md` | Current initiatives, blockers, dependencies |
| `inputs/context/challenges.md` | Obstacles, constraints, risks |
| `inputs/context/preferences.md` | Communication style, working preferences, operating cadence |

These 4 files are auto-loaded every session and inform all PM outputs.

### Session Start Behavior

1. Read `nexa/state.json` for current status
2. Load context from `inputs/context/*.md` (COMPASS dimensions)
3. Load rules from `.claude/rules/` (auto-discovered, loaded in order: system → pm-core → domain → pm-workflows → learned)
4. Show 5-line greeting with current phase, blockers, and active work
5. Report any stale outputs (if sources changed)

### Rules Auto-Discovery

PM OS rules are auto-discovered and loaded in this order:
1. `system/` - Base protocols (file mgmt, staleness)
2. `pm-core/` - Core discipline (evidence, metadata, decision algorithm)
3. `domain/` - Vocabulary (Business Network, Catalogs, CPG)
4. `pm-workflows/` - Deliverable-specific (charters, PRDs)
5. `learned/` - Auto-generated patterns (override all)

Later rules override earlier ones. This enables continuous improvement without breaking the system.

---

## Working on Skills

### Skill Structure

Each skill is a self-contained PM workflow:

```
skills/[skill-name]/
├── SKILL.md          # Main skill definition (steps, input requirements, output format)
└── [optional files]  # Reference materials, templates
```

**SKILL.md sections:**
1. **Goal** - What does this skill help PMs achieve?
2. **Prerequisites** - What inputs/context are needed?
3. **Steps** - Numbered workflow (1-10 steps typical)
4. **Output format** - Where output goes, what sections to include
5. **Examples** - Real outputs from past runs
6. **Customization** - How to adapt for different domains

### When to Modify a Skill

- **Customization**: Edit output sections, add/remove analysis steps
- **New domain vocabulary**: Update domain/ rules, reference in skill
- **Iterative improvement**: After 5+ runs in history/, learning extracts patterns that should be applied

### When to Create a New Skill

- Repeatable PM workflow that appears 3+ times
- Clear goal that other skills don't address
- Can be described in 8-10 steps

Create in `skills/[new-skill]/SKILL.md`, then add command shortcut in `commands/`.

---

## Working on Rules

### Rule Categories

| Category | Purpose | Example Files |
|----------|---------|---|
| **pm-core/** | Non-negotiable PM discipline | evidence-rules.md, metadata standards, decision algorithm |
| **pm-workflows/** | Deliverable-specific rules | charter-creation.md, prd-writing.md, interview-protocol.md |
| **domain/** | Domain vocabulary & terminology | vocabulary.md (Business Network terms) |
| **system/** | System protocols | staleness-protocol.md, output-destinations.md, session-greeting.md |
| **learned/** | Auto-generated from history | quality-patterns.md, vocabulary-updates.md (auto-created weekly) |

### Adding a New Rule

1. Choose correct category (prefer pm-workflows/ for new, rarely pm-core/)
2. Create file: `.claude/rules/[category]/[rule-name].md`
3. Add frontmatter if applying to specific paths:
   ```yaml
   ---
   paths:
     - "outputs/delivery/**/*.md"
     - "history/writing-prds-from-charters/**/*.md"
   ---
   ```
4. Document the rule (why it matters, when to apply, examples)
5. Update related files (see `system/related-files.md`)

### Relationship to Skills

Rules define **how** PM work should be done. Skills define **what** work to do. Example:
- **Rule** (evidence-rules.md): "Every claim must be tagged and sourced"
- **Skill** (synthesizing-voc): "Extract 5 themes from interviews, quantify patterns"

Skills implement rules. When modifying a skill output, verify it complies with applicable rules.

---

## Development Workflow

### When Adding a New Feature

1. **Understand the dependency tier:**
   - Tier 1 (foundation): Inputs → single output
   - Tier 2 (planning): Foundation outputs → strategy output
   - Tier 3 (execution): Strategy → executable output

2. **Identify what triggers staleness:**
   - What input files change?
   - What downstream outputs depend on this?

3. **Update metadata:**
   - YAML frontmatter with sources and downstream
   - Claims Ledger for all major assertions

4. **Test with evidence discipline:**
   - Don't invent test data
   - Use real sample files from inputs/
   - Tag all claims (Evidence/Assumption/Open)

5. **Version history:**
   - Auto-mirroring copies to history/[skill]/
   - After 5+ versions, run `pm-os learn [skill]`
   - Extracted patterns inform future outputs

### When Fixing a Bug

- **Before fixing:** Understand the tier (foundation/planning/execution)
- **Fix strategy:** Don't fix forward (don't fix downstream), fix at source
- **Update state:** Run `pm-os scan` if file changes affect ingest
- **Test:** Verify staleness cascading works correctly

### When Optimizing Extraction

- **For PDF/DOCX extraction:** Edit `nexa/src/ingest.ts`
- **For text parsing:** Edit `nexa/src/utils.ts`
- **For state tracking:** Edit `nexa/src/state.ts`
- **After changes:** Rebuild: `npm run build`

---

## Testing

### Manual Testing (Recommended)

1. **Set up test inputs:** Create sample files in `inputs/test/`
2. **Run scan:** `pm-os scan` to ingest test documents
3. **Run skill:** `/ktlo`, `/voc`, etc. to test output generation
4. **Check outputs:** Review `outputs/` for expected structure
5. **Verify history:** `ls history/[skill]/` shows versioned copies
6. **Check state:** `pm-os status` shows correct phase and next action

### Automated Testing (Future)

No test suite currently exists. When adding TypeScript features to `nexa/src/`, follow Node.js/TypeScript testing best practices (Jest or Mocha).

### Staleness Testing

1. Generate output at time T1
2. Modify a source file at time T2 (T2 > T1)
3. Run session start or `pm-os status`
4. Verify staleness is detected and reported

---

## Common Development Tasks

### Task: Update Evidence Rules

1. Read `.claude/rules/pm-core/evidence-rules.md`
2. Identify the change needed (new tagging requirement, updated validation)
3. Update the rule file with examples
4. Update related files (see system/related-files.md)
5. Verify skills implement the new rule

### Task: Add Domain Vocabulary

1. Add term to `.claude/rules/domain/vocabulary.md`
2. Include definition, examples, when to use
3. Update skills that use domain terms (e.g., triaging-ktlo)
4. Rebuild and test with sample data

### Task: Customize Output Format

1. Find skill: `skills/[skill-name]/SKILL.md`
2. Locate "Output format" section
3. Modify sections, add new analysis steps
4. Add frontmatter to rules if format changes
5. Test with sample inputs

### Task: Extract Learned Patterns

1. Generate 5+ outputs for a skill (build up history/)
2. Run: `pm-os learn [skill-name]`
3. Check `.claude/rules/learned/` for extracted patterns
4. Review patterns - are they accurate?
5. Consider if patterns should be codified as new rules

### Task: Investigate Staleness Issue

1. Check output metadata: `head -5 [output-file]` (YAML section)
2. Compare `generated` timestamp with source file `modified` times
3. If stale: `pm-os scan` to re-ingest, then refresh skill
4. Check state: `pm-os status` to confirm phase and next action
5. If incorrect state, consider `pm-os init` to reset

---

## Dependency Management

### NPM Dependencies (nexa/)

```json
{
  "adm-zip": "ZIP file handling",
  "chokidar": "File watching (for pm-os watch)",
  "glob": "File pattern matching",
  "js-yaml": "YAML parsing (sources.local.yaml)",
  "mammoth": "DOCX text extraction",
  "pdf-parse": "PDF text extraction",
  "xlsx": "Excel/CSV parsing"
}
```

**When adding dependencies:**
- Verify it's necessary (try npm ecosystem first)
- Update package.json
- Run `npm install && npm run build`
- Test with real document types

---

## Troubleshooting Common Issues

### pm-os scan finds no files

1. Check `nexa/sources.local.yaml` exists and has valid paths
2. Verify paths are absolute (~/Drive works, ./Drive may not)
3. Check glob patterns match files (e.g., `**/*.pdf`)
4. Files may already be indexed - check `nexa/state.json` `ingest_index`

### Output marked stale but sources haven't changed

1. Check file sync tool (Dropbox, Drive) touching files
2. Verify modification times: `ls -lt inputs/voc/`
3. Run `pm-os scan` to refresh ingest index
4. Consider `pm-os init` if state is corrupted

### Skills not using learned patterns

1. Verify `.claude/rules/learned/` has pattern files
2. Run `pm-os learn --auto` to regenerate
3. Restart Claude Code session (rules reload at startup)
4. Learned patterns inform future runs, not retroactively

### Mirror not working (outputs not copying to history)

1. Verify outputs exist in `outputs/` directories
2. Check skill name matches history directory naming
3. Manually: `pm-os mirror --quiet`
4. Check for errors: `cat outputs/audit/auto-run-log.md`

---

## Continuous Improvement

### Learning Loop (Weekly)

1. **User generates 5+ outputs** for a skill
2. **Nexa auto-mirrors** to history/ after each
3. **Weekly hook fires** `pm-os learn --auto`
4. **System extracts patterns** (success factors, failure modes)
5. **Patterns written to** `.claude/rules/learned/`
6. **Future outputs improve** using learned patterns

### When to Refine Skills

- After completing a quarter of work
- When you notice repeating patterns in history/
- When stakeholders request output format changes
- When domain context changes significantly

### Feedback Loop

1. User generates outputs
2. User provides feedback (implicitly via next steps, or explicitly via ratings)
3. Learning system analyzes patterns (high-rated outputs vs low-rated)
4. Patterns inform next outputs
5. System improves iteratively

---

## Resources

### Documentation

- **Main README:** `README.md` - Quick start and overview
- **Getting Started:** `docs/GETTING_STARTED.md` - Day 1 guide
- **Troubleshooting:** `docs/TROUBLESHOOTING.md` - Common issues
- **AG3 Architecture:** `docs/AG3-architecture.md` - Future roadmap
- **Folder READMEs:**
  - `inputs/README.md` - Adding source data
  - `outputs/README.md` - Output structure and dependencies
  - `history/README.md` - Versioning and learning
  - `skills/README.md` - Skill library overview
  - `commands/README.md` - Command shortcuts
  - `.claude/README.md` - Rules system

### Running the System

```bash
# Build and install
cd nexa && npm install && npm run build

# Try it out
pm-os scan
pm-os status
```

### Key Patterns to Follow

1. **Evidence First:** Always cite sources, never invent data
2. **Tier Awareness:** Know which tier an output depends on
3. **Staleness Matters:** Use state tracking to avoid stale decisions
4. **History Shapes Future:** Review history/ before customizing
5. **Rules Enable Scale:** Rules document why outputs work, not just how to create them

---

## Quick Reference

| Task | Command | Output |
|------|---------|--------|
| Scan for new docs | `pm-os scan` | Updates `nexa/state.json` ingest_index |
| Check status | `pm-os status` | 5-line brief |
| Triage backlog | `/ktlo` | `outputs/ktlo/ktlo-triage-YYYY-MM-DD.md` |
| Synthesize VOC | `/voc` | `outputs/insights/voc-synthesis-YYYY-MM-DD.md` |
| Plan quarter | `/charters` | `outputs/roadmap/Q1-YYYY-charters.md` |
| Write PRD | `/prd [charter]` | `outputs/delivery/prds/*.md` |
| Learn patterns | `pm-os learn --auto` | `.claude/rules/learned/*.md` |
| Search | `pm-os search "keyword"` | Matching files and content |

---

**Last Updated:** January 2026
**Version:** AG3 Phase 1 (state management, auto-mirroring, learning loop)
