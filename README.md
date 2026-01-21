# PM OS Getting Started Guide

**A file-based PM operating system for Business Network + Catalogs (Retail/CPG)**

PM OS helps you build evidence-based PM practice with daily workflows, senior PM skills, and automatic learning. Turn raw inputs (Jira tickets, customer feedback) into actionable insights, strategic charters, and executable PRDs - with scan-based freshness checks and continuous improvement.

**Full documentation:** See [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) for complete implementation guide.

---

## What is PM OS?

PM OS is a **file-based workflow system** that:
- Transforms raw data (tickets, feedback, docs) → structured insights
- Maintains evidence discipline (never invent metrics, always cite sources)
- Tracks dependencies (know when outputs need refreshing)
- Learns from history (extracts success/failure patterns over time)
- Provides senior PM coverage (stakeholder mapping, GTM, strategy, reviews)
- **[AG3]** Communication Engine for executive presence (storytelling, crisis/vision modes)

**Why file-based?** No database, no server, no API - just files, skills, and Claude Code. Works offline, version controlled, shareable.

**Core principle:** Evidence before claims, always. Every output cites sources, tags assumptions, and includes a claims ledger.

---

## Quick Start (AG3)

1. **Set up sources:** `cp nexa/sources.example.yaml nexa/sources.local.yaml`
2. **Scan documents:** `pm-os scan`
3. **Check status:** `pm-os status`
4. **Run skills:** `/voc`, `/ktlo`, `/charters`
5. **Outputs auto-mirror to history, learning runs weekly**

**No manual mirroring required** - the learning loop is fully automated.

---

## Detailed Quick Start (5 Minutes)

### Step 0: Set Up Your Context (5 min)

Before running any skills, populate your context files:

1. Open `inputs/context/compass.md` - your mission, goals, beliefs
2. Open `inputs/context/projects.md` - your current work
3. Open `inputs/context/challenges.md` - your blockers
4. Open `inputs/context/preferences.md` - your working style

Your context informs all PM outputs and is auto-loaded every session.

**See:** [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md#day-1-populate-your-context) for detailed guidance.

### 1. Drop Files into `inputs/`

```bash
# Export Jira tickets to CSV
inputs/jira/support-tickets-2026-01.csv

# Add customer feedback
inputs/voc/interview-customer-a-2026-01-15.docx
inputs/voc/survey-results-2026-01.csv

# Add strategy docs (if available)
inputs/roadmap_deck/Q1-2026-strategy.pdf
```

### 2. Scan and Check Status (CLI)

Use the CLI to ingest new or changed sources and confirm state:

```bash
pm-os scan          # Ingest new/changed docs and update state
pm-os status        # 5-line snapshot (phase, last job, next action)
pm-os search "kafka"  # Search filenames and full text
```

### 3. Run Your First Skill

```
/ktlo              # Triage KTLO backlog (10 min)
/voc               # Synthesize VOC themes (10 min)
/exec-update       # Generate 1-page update (10 min)
```

### 4. Review Outputs

Check `outputs/` directories:
- `outputs/ktlo/ktlo-triage-2026-01-15.md` - Prioritized backlog
- `outputs/insights/voc-synthesis-2026-01-15.md` - Customer themes
- `outputs/exec_updates/exec-update-2026-01-15.md` - Stakeholder summary

**That's it!** You just ran your first PM OS workflow. Outputs are automatically mirrored to history for learning.

---

## Your First Day

### Step 1: Understand the Folder Structure

PM OS uses a simple input → process → output → history flow:

```
inputs/          ← Drop source files here (Jira, VOC, docs)
   ↓
skills/          ← PM workflows (triaging, synthesis, planning)
   ↓
outputs/         ← Current results (insights, charters, PRDs)
   ↓
history/         ← Versioned trail (enables learning)
```

**Why this matters:**
- **inputs/** = Your evidence (raw data)
- **outputs/** = Your work products (insights, plans)
- **history/** = Your evolution (how thinking changed)
- **skills/** = Your playbook (reusable workflows)

**Deep dives:**
- [inputs/README.md](inputs/README.md) - How to add source data
- [outputs/README.md](outputs/README.md) - Understanding your results
- [history/README.md](history/README.md) - Versioning and learning
- [skills/README.md](skills/README.md) - PM workflow library
- [commands/README.md](commands/README.md) - Command shortcuts
- [.claude/README.md](.claude/README.md) - Configuration and rules

**Output styles:** Customize Claude's communication via `.claude/output-styles/`

### Step 2: Export Your First Inputs

#### Jira Tickets (for KTLO Triage)

1. Go to Jira → Issues → Search for your support backlog
2. Export → CSV
3. Include columns: Summary, Description, Priority, Status, Created
4. Save to `inputs/jira/support-backlog-YYYY-MM-DD.csv`

#### Customer Feedback (for VOC Synthesis)

1. Gather interview transcripts, survey results, feedback forms
2. Convert to markdown or CSV
3. Save to `inputs/voc/` with descriptive names:
   - `interview-customer-name-YYYY-MM-DD.md`
   - `survey-results-YYYY-MM-DD.csv`

**Need at least 3 sources** for meaningful VOC synthesis.

### Step 3: Run Daily Commands

```
/ktlo              # Triage support backlog into priority buckets
```

**What happens:**
1. Reads `inputs/jira/*.csv`
2. Groups tickets by theme (bugs, requests, tech debt)
3. Prioritizes into tiers (P0: Now, P1: This quarter, P2: Backlog)
4. Identifies top 3 patterns
5. Writes to `outputs/ktlo/ktlo-triage-YYYY-MM-DD.md`
6. Copies to `history/triaging-ktlo/` (versioned)

```
/voc               # Synthesize customer feedback themes
```

**What happens:**
1. Reads `inputs/voc/*` (md, txt, docx, pdf, csv)
2. Extracts verbatim quotes
3. Groups into themes (pain points, requests, praise)
4. Quantifies patterns ("3/7 customers mentioned X")
5. Writes to `outputs/insights/voc-synthesis-YYYY-MM-DD.md`

```
/exec-update       # Generate 1-page stakeholder update
```

**What happens:**
1. Reads latest outputs (charters, VOC, KTLO)
2. Summarizes: Top 3 problems, Key metrics, Top 3 risks, Timeline
3. Writes to `outputs/exec_updates/exec-update-YYYY-MM-DD.md`
4. **1 page max** - concise for busy stakeholders

### Step 4: Check History

Every time a skill runs, a dated copy is saved to `history/`:

```bash
ls history/triaging-ktlo/
# ktlo-triage-2026-01-15.md
# ktlo-triage-2026-01-22.md  (after running again)

ls history/synthesizing-voc/
# voc-synthesis-2026-01-15.md
# voc-synthesis-2026-01-22.md
```

**Why this matters:** History enables learning. After 5+ outputs, the learning system mines patterns:
- What makes charters get approved?
- What causes PRDs to need revision?
- What format do you prefer?

Patterns are written to `.claude/rules/learned/` and auto-load in future sessions.

### Step 5: Understand Freshness

PM OS tracks changes via `pm-os scan` and output metadata. When source files change after an output was generated, treat that output as stale:

**Example:**
```
Day 1: Generate VOC synthesis (uses interview-1.md, interview-2.md)
Day 3: Add interview-3.md
Day 4: Run `pm-os scan` → new source ingested
```

**What to do:**
```
/voc               # Refresh synthesis to include interview-3
```

Use `outputs/audit/auto-run-log.md` and output timestamps to verify freshness before making decisions.

---

## Understanding the System

### Folder Structure

| Directory | Purpose | Learn More |
|-----------|---------|------------|
| `inputs/` | Source files (Jira, VOC, docs) | [inputs/README.md](inputs/README.md) |
| `outputs/` | Current work products | [outputs/README.md](outputs/README.md) |
| `history/` | Versioned output trail | [history/README.md](history/README.md) |
| `skills/` | PM workflow library (15 skills) | [skills/README.md](skills/README.md) |
| `commands/` | Quick shortcuts (11 commands) | [commands/README.md](commands/README.md) |
| `.claude/` | Configuration & rules | [.claude/README.md](.claude/README.md) |

### Dependency Flow (3 Tiers)

```
TIER 1: Foundation (from inputs/)
────────────────────────────────────
inputs/voc/*            → outputs/insights/voc-synthesis.md
inputs/jira/*           → outputs/ktlo/ktlo-triage.md
inputs/roadmap_deck/*   → outputs/truth_base/truth-base.md

TIER 2: Planning (from Tier 1)
────────────────────────────────────
outputs/truth_base/*    → outputs/roadmap/Q1-charters.md
outputs/insights/voc-*  → outputs/roadmap/Q1-charters.md
outputs/ktlo/*          → outputs/roadmap/Q1-charters.md

TIER 3: Execution (from Tier 2)
────────────────────────────────────
outputs/roadmap/*       → outputs/delivery/prds/*.md
```

**When Tier 1 changes → Tier 2 becomes stale → Tier 3 becomes stale**

**See:** [outputs/README.md](outputs/README.md) for full dependency documentation

### Evidence Discipline

Every output follows these rules:

1. **Never invent** metrics, customers, or quotes
2. **Every claim tagged:** Evidence / Assumption / Open Question
3. **Every output includes:** Sources Used section + Claims Ledger
4. **Missing data:** Explicitly stated before proceeding

**Claims Ledger Example:**

| Claim | Type | Source |
|-------|------|--------|
| "40% of tickets are catalog-related" | Evidence | inputs/jira/tickets.csv:15-42 |
| "Customers want faster sync" | Evidence | inputs/voc/interview-1.md:89 |
| "Sync time can be <5 seconds" | Assumption | Needs tech spike validation |

**Why this matters:** PM decisions must be evidence-based. Invented data creates false confidence in bad bets.

---

## Daily Workflow (10-30 Minutes)

### Morning Routine

```
/ktlo              # Triage overnight support tickets (~10 min)
/voc               # Synthesize recent feedback (~10 min)
/exec-update       # Generate stakeholder update (~10 min)
```

**Output:** 3 files in ~30 minutes:
- `outputs/ktlo/` - Prioritized backlog with themes
- `outputs/insights/` - Customer pain points and patterns
- `outputs/exec_updates/` - 1-page summary for stakeholders

**Why daily?**
- Keeps you connected to customer reality
- Prevents backlog overwhelm
- Gives stakeholders visibility

### Weekly Planning

```
/charters          # Generate/refine quarterly charters (~20 min)
```

**Uses:**
- Latest VOC synthesis
- Latest KTLO triage
- Truth base (if exists)

**Output:** `outputs/roadmap/Q1-2026-charters.md`
- 3-5 strategic bets for the quarter
- Success metrics (baseline + target)
- Risks with mitigation
- Dependencies

**Why weekly?** Priorities shift. Weekly charter review keeps you aligned with reality, not outdated plans.

---

## Common Tasks

### Daily/Weekly Commands

| Task | Command | Time | Output |
|------|---------|------|--------|
| Triage support backlog | `/ktlo` | 10 min | outputs/ktlo/ |
| Synthesize customer feedback | `/voc` | 10 min | outputs/insights/ |
| Generate exec update | `/exec-update` | 10 min | outputs/exec_updates/ |
| Plan the quarter | `/charters` | 20 min | outputs/roadmap/ |

### Senior PM Commands

| Task | Command | Time | Output |
|------|---------|------|--------|
| Map stakeholders | `/stakeholders` | 30 min | outputs/stakeholders/ |
| Create GTM launch plan | `/gtm` | 60 min | outputs/gtm/ |
| Write product strategy | `/strategy` | 90 min | outputs/strategy/ |
| Post-launch retrospective | `/review` | 45 min | outputs/reviews/ |

### As-Needed Skills

| Task | Invoke | Output |
|------|--------|--------|
| Build product understanding | "Run building-truth-base" | outputs/truth_base/ |
| Find KB gaps | "Run analyze --kb" | outputs/insights/ |
| Write a PRD | "Run writing-prds-from-charters for [charter]" | outputs/delivery/ |
| Prioritize work | "Run prioritizing-work" | outputs/roadmap/ |

**See:** [skills/README.md](skills/README.md) for full skill catalog

---

## Troubleshooting

### "My output is marked as stale"

**What this means:** Source files changed after output was generated.

**How to fix:**
```
/voc               # Refresh VOC synthesis
/ktlo              # Refresh KTLO triage
/charters          # Refresh quarterly charters
```

**See:** `outputs/audit/auto-run-log.md` for scan history

### "I see drift warnings"

**What this means:** Downstream output is newer than upstream sources (manual edit or out-of-sync).

**Options:**
1. **Reconcile:** Keep downstream changes, update upstream to match
2. **Refresh:** Regenerate downstream from current upstream

**See:** [outputs/README.md](outputs/README.md#drift-detection)

### "Command not found"

**Problem:** Typed `/my-command` but nothing happened.

**Solution:**
1. Check available commands: `ls commands/`
2. Use direct invocation: "Run skill-name"
3. Verify skill exists: `ls skills/`

### "No input files found"

**Problem:** Ran skill but no source files exist.

**Solution:**
1. Check expected directory (e.g., `inputs/voc/` for VOC)
2. Export data from source systems (Jira, survey tool)
3. Verify file format (.md, .csv, .pdf, .txt)

### "Output doesn't match my needs"

**Problem:** Generated output isn't quite right.

**Solution:**
1. Skills are customizable - edit `skills/[skill-name]/SKILL.md`
2. Modify output format, add/remove sections
3. Re-run skill with customizations

**See:** [skills/README.md](skills/README.md#customization)

### More Help

- **Detailed troubleshooting:** See `docs/TROUBLESHOOTING.md` (after Phase 4)
- **Workflow guides:** See `docs/workflows/` (after Phase 5)
- **Full implementation guide:** [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)

---

## Learning System

### How PM OS Gets Smarter

After you generate 5+ outputs for a skill, the learning system can analyze patterns:

**What it does:**
1. Reads all versions in `history/[skill-name]/`
2. Identifies success patterns (what gets approved)
3. Identifies failure patterns (what causes revisions)
4. Quantifies confidence: Strong (≥80%), Medium (50-80%), Weak (<50%)
5. Writes learned rules to `.claude/rules/learned/` (auto-loaded)

**Example learned pattern:**

```markdown
## Success Pattern: Charter Brevity
**Observation:** Charters with ≤3 strategic bets get approved faster
**Evidence:** 10/12 successful charters (83%)
**Recommendation:** Default to 3 bets max per quarter
```

**When learning runs:**
- Automatically every 7 days (via session hook: `pm-os learn --auto`)
- Or manually: `pm-os learn <skill-name>`

**See:** [history/README.md](history/README.md#learning-system-integration) for details

---

## Next Steps

### After Your First Week

1. **Review your outputs** - Check `outputs/` directories
2. **Compare versions** - See how thinking evolved in `history/`
3. **Refine your workflow** - Customize skills to fit your domain
4. **Add domain vocabulary** - Update `.claude/rules/domain/vocabulary.md`

### After Your First Month

1. **Generate quarterly charters** - Plan Q1/Q2/etc with `/charters`
2. **Write PRDs** - Turn charters into specs
3. **Run learning analysis** - Extract patterns from history
4. **Try senior PM commands** - `/stakeholders`, `/gtm`, `/strategy`

### After Your First Quarter

1. **Post-launch review** - Run `/review` for completed launches
2. **Quarterly retrospective** - Review all Q1 outputs
3. **Refine PM OS** - Update skills based on learnings
4. **Share with team** - Commit customizations to shared repo

---

## Key Features

### 1. Command-Based Workflow

Short commands invoke PM workflows - no plugin dependency:

```
/ktlo → skills/triaging-ktlo/SKILL.md
/voc → skills/synthesizing-voc/SKILL.md
```

**See:** [commands/README.md](commands/README.md)

### 2. Automatic Learning

Mines `history/` for patterns, writes to `.claude/rules/learned/` (auto-loaded):

- Analyzes success/failure patterns
- Quantifies confidence levels
- Updates personal preferences in `CLAUDE.local.md`
- System gets smarter over time

**See:** [history/README.md](history/README.md#learning-system-integration)

### 3. Modular Rules Architecture

Rules in `.claude/rules/` auto-discover:
- **pm-core/**: Evidence rules, metadata, decision algorithm
- **domain/**: Vocabulary (Business Network, Catalogs, CPG)
- **system/**: Staleness protocol, output destinations
- **pm-workflows/**: Charter and PRD rules (path-specific)
- **learned/**: Auto-generated patterns

**See:** [.claude/README.md](.claude/README.md)

### 4. Senior PM Coverage

Beyond IC-level (VOC, KTLO, charters, PRDs) to Senior PM:
- Stakeholder mapping (`/stakeholders`)
- GTM/launch planning (`/gtm`)
- Multi-year product strategy (`/strategy`)
- Post-launch retrospectives (`/review`)

**See:** [skills/README.md](skills/README.md#senior-pm-skills)

### 5. Communication Engine (AG3)

Executive presence capabilities for high-stakes situations:

| Capability | Usage | What It Does |
|------------|-------|--------------|
| **Storytelling** | `--story-mode` | Context → Conflict → Resolution narrative |
| **Crisis Mode** | `--mode crisis` | Calm, accountable, action-oriented tone |
| **Vision Mode** | `--mode vision` | Inspiring, future-focused tone |
| **Objection Handling** | `/reframe <objection>` | LAAR framework response |
| **Bridge & Pivot** | `/pivot <curveball>` | ABC framework for curveballs |

**Example:**
```
/exec-update --mode crisis
/charters --story-mode --mode vision
/reframe "The timeline is too aggressive"
```

**See:** [docs/AG3-architecture.md](docs/AG3-architecture.md) for full AG3 roadmap

---

## Documentation

- **Quick start:** This README
- **Full implementation guide:** [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)
- **Modular rules verification:** [.claude/MODULAR_RULES_VERIFICATION.md](.claude/MODULAR_RULES_VERIFICATION.md)
- **Folder-specific guides:**
  - [inputs/README.md](inputs/README.md) - Adding source data
  - [outputs/README.md](outputs/README.md) - Understanding results
  - [history/README.md](history/README.md) - Versioning and learning
  - [skills/README.md](skills/README.md) - PM workflow library
  - [commands/README.md](commands/README.md) - Command shortcuts
  - [.claude/README.md](.claude/README.md) - Configuration deep-dive

---

## Support

- **Issues:** Report at https://github.com/anthropics/claude-code/issues
- **Questions:** Check folder READMEs for specific topics
- **Customization:** Edit skills and rules to fit your workflow

---

**Ready to start?** Drop files into `inputs/` and run `/ktlo` or `/voc` to begin!
# pmos
