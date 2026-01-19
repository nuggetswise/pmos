# Getting Started with PM OS

**A comprehensive guide for Day 1 users**

PM OS is a file-based PM operating system for Business Network + Catalogs (Retail/CPG). This guide will take you from installation to your first analysis in about 45 minutes.

---

## Table of Contents

1. [Understanding PM OS](#understanding-pm-os) (5 min read)
2. [Installation & Setup](#installation--setup) (5 min)
3. [Your First Analysis](#your-first-analysis) (15 min hands-on)
4. [Understanding Dependencies](#understanding-dependencies) (10 min read)
5. [Daily Workflow](#daily-workflow) (10 min practice)
6. [Next Steps](#next-steps)

---

## Understanding PM OS

**Time:** 5 minutes

### What Problem Does It Solve?

As a PM, you face these challenges daily:

- **Data overload:** Jira tickets, customer feedback, strategy docs scattered everywhere
- **Inconsistent analysis:** Every synthesis feels like starting from scratch
- **Stale insights:** That VOC analysis from 2 weeks ago? Already outdated
- **Lost context:** What informed that charter decision again?
- **No learning loop:** Repeating the same mistakes because nothing captures what worked

**PM OS solves this** by turning raw inputs into structured insights with:

1. **Evidence discipline:** Every claim cites sources, never invented data
2. **Automatic staleness tracking:** Know when outputs need refreshing
3. **Versioned history:** See how thinking evolved over time
4. **Learning system:** Extract patterns from past work to improve future work
5. **Reusable workflows:** Battle-tested PM skills you can invoke anytime

### How Is It Different?

**Traditional PM tools:**
- Jira: Issue tracking only
- Confluence: Wiki pages that go stale
- Google Docs: Unstructured, no dependencies
- PM software: Rigid templates, vendor lock-in

**PM OS:**
- **File-based:** No database, no server - just markdown files
- **Evidence-driven:** Claims ledger tags every assertion
- **Dependency-aware:** Knows when outputs are stale
- **Self-improving:** Learns from history automatically
- **Portable:** Works offline, version controlled, shareable

### Core Principles

1. **Evidence before claims, always**
   - Never invent metrics, customers, or quotes
   - Every output includes Sources Used section
   - Claims ledger tags: Evidence / Assumption / Open Question

2. **Modular by design**
   - Skills are reusable PM workflows
   - Mix and match for your domain
   - Customize without breaking the system

3. **Learning from history**
   - Every output versioned in `history/`
   - Pattern extraction after 5+ outputs
   - System gets smarter over time

4. **Staleness matters**
   - Tracks when source files change
   - Alerts when outputs need refreshing
   - Prevents decisions on outdated data

**Why this matters:** PM decisions must be evidence-based. Invented data creates false confidence in bad bets. PM OS keeps you honest and current.

---

## Installation & Setup

**Time:** 5 minutes

### Prerequisites

- Claude Code installed and working
- Basic familiarity with file systems
- Access to your Jira, customer feedback, strategy docs

### Verify Structure

Your PM OS repo should have this structure:

```
pm_os_superpowers/
├── inputs/          # Drop source files here
├── outputs/         # Generated insights and plans
├── history/         # Versioned output trail
├── skills/          # PM workflow library (17 skills)
├── commands/        # Quick shortcuts (11 commands)
├── .claude/         # Configuration and rules
├── hooks/           # Session automation
└── README.md        # Quick start guide
```

### Understand the Flow

PM OS follows a simple pattern:

```
inputs/          ← You drop files here (Jira, VOC, docs)
   ↓
skills/          ← PM workflows process inputs
   ↓
outputs/         ← Generated insights (current)
   ↓
history/         ← Versioned trail (learning)
```

### Folder Quick Reference

| Directory | Purpose | You Add | System Generates |
|-----------|---------|---------|------------------|
| `inputs/` | Source files | ✓ | |
| `outputs/` | Current results | | ✓ |
| `history/` | Versioned trail | | ✓ |
| `skills/` | PM workflows | ✓ (optional) | |
| `commands/` | Quick shortcuts | ✓ (optional) | |
| `.claude/` | Config & rules | ✓ (advanced) | ✓ (learned) |

**Deep dives available:**
- [inputs/README.md](/Users/singhm/pm_os_superpowers/inputs/README.md) - How to add source data
- [outputs/README.md](/Users/singhm/pm_os_superpowers/outputs/README.md) - Understanding your results
- [skills/README.md](/Users/singhm/pm_os_superpowers/skills/README.md) - PM workflow library

---

## Day 1: Populate Your Context

Before diving into skills, establish your operating context:

1. **Open** `inputs/context/my-context.md`
2. **Fill in** each section:
   - Role: Your title, scope, reporting structure
   - Domain Knowledge: What you know, what you're learning
   - Key Stakeholders: Names, roles, influence strategies
   - Priorities: This quarter's focus (max 3)
   - Constraints: Compliance, resourcing, technical limits
   - Metrics: How you're measured
   - Decision Principles: Your operating philosophy

**Why this matters:** Skills like stakeholder-management, tracking-decisions, and generating-quarterly-charters pull from this context to tailor outputs to your situation.

**Update cadence:** Review quarterly or when role changes significantly.

---

## Your First Analysis

**Time:** 15 minutes hands-on

Let's triage a KTLO backlog - a common Day 1 task for PMs.

### Step 1: Export Sample Jira Tickets

**Time:** 3 minutes

1. **Go to Jira** → Issues → Search for your support backlog
2. **Export** → CSV
3. **Include these columns:**
   - Issue Key
   - Summary
   - Description
   - Priority
   - Status
   - Created
   - Updated (optional)
   - Component/Product area (if available)

4. **Save to inputs:**
   ```bash
   inputs/jira/support-backlog-2026-01-15.csv
   ```

**Sample CSV format:**

```csv
Issue Key,Summary,Description,Priority,Status,Created
PROD-123,Catalog sync fails,Users report catalog not syncing...,High,Open,2026-01-10
PROD-124,Search returns no results,Search is broken for...,Medium,Open,2026-01-11
PROD-125,Slow item page load,Item pages take 10+ seconds...,Low,Open,2026-01-12
```

**Don't have Jira access yet?** Create a sample CSV with 5-10 fake tickets to test the workflow.

### Step 2: Run `/ktlo` Command

**Time:** 2 minutes

In Claude Code, type:

```
/ktlo
```

**What happens:**

1. Skill reads `inputs/jira/*.csv`
2. Categorizes tickets into 5 buckets:
   - Revenue/Renewal Risk
   - Customer Trust & Data Integrity
   - Operational Burden
   - Paper Cuts (UX Friction)
   - Tech Debt Blocking Roadmap
3. Ranks top 20 issues by severity
4. Identifies patterns (e.g., "40% are catalog-related")
5. Recommends: STOP (close), FIX (address soon), DEFER (backlog)

**Output generated:**
```
outputs/ktlo/ktlo-triage-2026-01-15.md
```

### Step 3: Review Output

**Time:** 5 minutes

Open the generated file:

```bash
cat outputs/ktlo/ktlo-triage-2026-01-15.md
```

**You should see:**

1. **YAML metadata header:**
   ```yaml
   ---
   generated: 2026-01-15 14:30
   skill: triaging-ktlo
   sources:
     - inputs/jira/support-backlog-2026-01-15.csv (modified: 2026-01-15)
   downstream:
     - outputs/roadmap/Q1-2026-charters.md
   ---
   ```

2. **Executive Summary:**
   - 3 sentences summarizing KTLO state
   - What's most urgent

3. **Bucket Overview:**
   - Table showing issue distribution
   - Counts by severity (Critical/High/Med/Low)

4. **Top 20 Issues:**
   - Ranked table with: Key, Summary, Bucket, Severity, Why It Matters, Next Step
   - Prioritized for immediate action

5. **Patterns Observed:**
   - Top 3 themes (e.g., "Catalog sync issues affecting 7 tickets")
   - Systemic problems to address

6. **Recommendations:**
   - STOP: Issues to close/deprioritize
   - FIX: Issues to address soon
   - DEFER: Backlog for later

7. **Claims Ledger:**
   ```markdown
   | Claim | Type | Source |
   |-------|------|--------|
   | "40% of tickets are catalog-related" | Evidence | inputs/jira/support-backlog.csv:15-42 |
   | "Sync issues are increasing" | Evidence | Ticket creation dates analysis |
   | "Low-priority UX issues can be deferred" | Assumption | Based on severity distribution |
   ```

**Why this format matters:**
- **Metadata:** Tracks dependencies for staleness detection
- **Executive Summary:** Shareable with stakeholders
- **Patterns:** Identifies systemic issues
- **Claims Ledger:** Evidence discipline - every claim is tagged

### Step 4: Check History

**Time:** 2 minutes

Every skill run automatically creates a versioned copy:

```bash
ls history/triaging-ktlo/
# ktlo-triage-2026-01-15.md
```

**Why history matters:**

After 5+ runs, the learning system can analyze:
- What patterns kept appearing?
- What recommendations were acted on?
- What format do you prefer?

Patterns are extracted and written to `.claude/rules/learned/` to improve future runs.

### Step 5: Understanding the Output

**Time:** 3 minutes

Let's examine what makes this different from a manual analysis:

**Traditional PM approach:**
1. Read 50+ Jira tickets individually
2. Try to remember patterns
3. Create a spreadsheet
4. Manually categorize
5. Lose context in 2 weeks when priorities change

**PM OS approach:**
1. Export tickets once
2. Run `/ktlo` (takes 2 min)
3. Get structured analysis with evidence
4. Refresh anytime with one command
5. History shows how backlog evolved

**The difference:**
- **Consistency:** Same structure every time
- **Traceability:** Every claim cites sources
- **Refreshable:** Re-run when tickets change
- **Shareable:** Professional output for stakeholders
- **Learning:** System improves over time

---

## Understanding Dependencies

**Time:** 10 minutes

### How Inputs → Outputs → Downstream Flow

PM OS tracks dependencies across 3 tiers:

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

**What this means:**

1. **Tier 1 outputs** depend directly on input files
2. **Tier 2 outputs** depend on Tier 1 outputs
3. **Tier 3 outputs** depend on Tier 2 outputs

**Cascading changes:**
- If `inputs/jira/` changes → Tier 1 becomes stale
- If Tier 1 changes → Tier 2 becomes stale
- If Tier 2 changes → Tier 3 becomes stale

### What Staleness Tracking Means

**Staleness:** An output is stale when its source files were modified **after** the output was generated.

**Example:**

```
Day 1 (Jan 15):
- Run /voc at 14:30
- Reads: inputs/voc/interview-1.md (modified Jan 10)
- Generates: outputs/insights/voc-synthesis-2026-01-15.md
- Status: ✓ Current

Day 3 (Jan 17):
- Add: inputs/voc/interview-2.md at 09:00
- Session starts, checks staleness
- voc-synthesis generated Jan 15, but interview-2.md added Jan 17
- Status: ⚠️ STALE

Day 3 (later):
- Run /voc to refresh
- New synthesis includes interview-2.md
- Status: ✓ Current again
```

**How PM OS detects staleness (AG3):**

1. **Session start:** Hook reads `nexa/state.json`
2. **Compare timestamps:** Output generation time vs source modification time
3. **Report:** "These outputs may be stale: [list]" (via status brief)
4. **User decides:** Refresh now or proceed with caution

**Visual representation:**

```
outputs/insights/voc-synthesis-2026-01-15.md (generated Jan 15)
  ← inputs/voc/interview-1.md (modified Jan 10) ✓ OK
  ← inputs/voc/interview-2.md (modified Jan 17) ⚠️ STALE
```

### Why Evidence Discipline Matters

PM OS enforces evidence discipline through:

1. **Claims Ledger:** Every output ends with a table tagging claims as:
   - **Evidence:** Directly from source files (verifiable)
   - **Assumption:** Inferred, needs validation
   - **Open Question:** Unknown, needs research

2. **Sources Section:** Lists all input files used

3. **Verification before claims:** Can't say "customers want X" without a quote

**Example Claims Ledger:**

| Claim | Type | Source |
|-------|------|--------|
| "40% of tickets are catalog-related" | Evidence | inputs/jira/tickets.csv:15-42 |
| "Customers want faster sync" | Evidence | inputs/voc/interview-1.md:89 |
| "Sync time can be <5 seconds" | Assumption | Needs tech spike validation |
| "Competitors offer real-time sync" | Open Question | Need competitive analysis |

**Why this matters:**

A charter with invented customer quotes or fabricated metrics is **worse than no charter** - it creates false confidence in bad bets.

Evidence discipline prevents:
- Invented data
- Unverified assumptions presented as facts
- Forgetting what you don't know
- Decision-making on vibes

**Common PM anti-patterns PM OS prevents:**

| Anti-Pattern | How PM OS Prevents |
|--------------|-------------------|
| "Customers are asking for X" (based on 1 conversation) | Claims ledger requires source: "1/7 customers mentioned X" |
| Using stale VOC synthesis for Q2 planning | Staleness alert: "VOC synthesis is stale (source changed)" |
| Forgetting why a decision was made | Metadata tracks sources, history shows evolution |
| Repeating failed approaches | Learning system extracts patterns from history |

---

## Daily Workflow

**Time:** 10 minutes practice

### Morning Routine (10-30 Minutes)

**Goal:** Stay connected to customer reality, prevent backlog overwhelm, give stakeholders visibility.

```
/ktlo              # Triage overnight support tickets (~10 min)
/voc               # Synthesize recent feedback (~10 min)
/exec-update       # Generate stakeholder update (~10 min)
```

**Output:** 3 files in ~30 minutes
- `outputs/ktlo/` - Prioritized backlog with themes
- `outputs/insights/` - Customer pain points and patterns
- `outputs/exec_updates/` - 1-page summary for stakeholders

#### 1. KTLO Triage

**When to run:** Daily or weekly, depending on backlog volume

**Inputs:** `inputs/jira/*.csv`

**Command:** `/ktlo`

**What it does:**
- Groups tickets by theme (bugs, requests, tech debt)
- Prioritizes into tiers (P0: Now, P1: This quarter, P2: Backlog)
- Identifies top 3 patterns
- Recommends STOP/FIX/DEFER actions

**Use the output to:**
- Prioritize support work
- Identify systemic issues
- Communicate backlog state to stakeholders

#### 2. VOC Synthesis

**When to run:** After customer calls, surveys, or user research

**Inputs:** `inputs/voc/*.md` (interviews, feedback, surveys)

**Command:** `/voc`

**What it does:**
- Extracts verbatim quotes
- Groups into themes (pain points, requests, praise)
- Quantifies patterns ("3/7 customers mentioned X")
- Identifies unmet needs

**Use the output to:**
- Inform feature prioritization
- Validate charter bets
- Share customer voice with team

**Minimum required:** 3+ source files for meaningful synthesis

#### 3. Exec Update

**When to run:** Weekly for stakeholder visibility

**Inputs:** Latest outputs (charters, VOC, KTLO)

**Command:** `/exec-update`

**What it does:**
- Summarizes: Top 3 problems, Key metrics, Top 3 risks, Timeline
- 1 page max - concise for busy stakeholders
- Links to detailed outputs for deep dives

**Use the output to:**
- Keep stakeholders informed
- Align on priorities
- Surface blockers early

### Weekly Planning (15-30 Minutes)

**Goal:** Keep quarterly roadmap aligned with reality, not outdated plans.

```
/charters          # Generate/refine quarterly charters (~20 min)
```

**When to run:** Weekly for quarterly planning, or when priorities shift

**Inputs:**
- `outputs/truth_base/` (product understanding)
- `outputs/insights/voc-*` (customer themes)
- `outputs/ktlo/*` (support patterns)

**What it does:**
- Generates 3-5 strategic bets for the quarter
- Defines success metrics (baseline + target)
- Identifies risks with mitigation
- Lists dependencies

**Output:** `outputs/roadmap/Q1-2026-charters.md`

**Use the output to:**
- Align team on quarterly priorities
- Present strategy to leadership
- Guide PRD creation

### Understanding When Outputs Are Stale

**Automatic checks:**

Every session start, PM OS checks `nexa/state.json` and reports:

```
✓ No stale outputs detected. All current.
```

or

```
⚠️ Stale outputs detected:
- outputs/insights/voc-synthesis-2026-01.md (source inputs/voc/feedback.csv changed)
- outputs/roadmap/Q1-2026-charters.md (depends on stale VOC synthesis)

Say "refresh voc" to update, or proceed with caution.
```

**What to do:**

1. **Refresh upstream first:**
   ```
   /voc          # Refresh Tier 1 (foundation)
   ```

2. **Then refresh downstream:**
   ```
   /charters     # Refresh Tier 2 (planning)
   ```

3. **Finally refresh execution:**
   ```
   "Run writing-prds-from-charters for [charter]"  # Refresh Tier 3
   ```

**Manual staleness check:**

```
pm-os status
```

The 5-line brief shows next actions and stale outputs (when applicable).

### Common Daily Scenarios

#### Scenario 1: New Customer Feedback

**Situation:** Just finished 3 customer interviews

**Action:**
1. Export transcripts to `inputs/voc/`
2. Run `/voc` to refresh synthesis
3. Check if charters need updating: "Is Q1-charters.md current?"
4. If stale, run `/charters` to incorporate new insights

#### Scenario 2: Support Escalation

**Situation:** Critical bug reported, backlog is growing

**Action:**
1. Export latest Jira tickets to `inputs/jira/`
2. Run `/ktlo` to re-triage
3. Review top 20 issues for new patterns
4. Share updated triage with team

#### Scenario 3: Stakeholder Asks for Update

**Situation:** Weekly sync with leadership in 1 hour

**Action:**
1. Check staleness: "What outputs are stale?"
2. Refresh if needed: `/voc`, `/ktlo`, `/charters`
3. Generate update: `/exec-update`
4. Share `outputs/exec_updates/` file

---

## Next Steps

### After Your First Week

**Goals:**
- Build muscle memory for daily commands
- Understand output structure
- See how history accumulates

**Actions:**

1. **Review your outputs**
   ```bash
   ls outputs/ktlo/
   ls outputs/insights/
   ls outputs/exec_updates/
   ```
   - What's consistent across outputs?
   - What format works best for your stakeholders?

2. **Compare versions in history**
   ```bash
   ls history/triaging-ktlo/
   ls history/synthesizing-voc/
   ```
   - How has thinking evolved?
   - What patterns keep appearing?

3. **Refine your workflow**
   - Edit skill files to fit your domain
   - Add domain-specific terms to `.claude/rules/domain/vocabulary.md`
   - Customize output sections in `skills/[skill-name]/SKILL.md`

4. **Add domain vocabulary**
   - Update `.claude/rules/domain/vocabulary.md` with terms specific to Business Network + Catalogs
   - System will use these in future outputs

### After Your First Month

**Goals:**
- Move from tactical (KTLO, VOC) to strategic (charters, PRDs)
- Generate quarterly roadmap
- Run learning analysis

**Actions:**

1. **Generate quarterly charters**
   ```
   /charters
   ```
   - Review `outputs/roadmap/Q1-2026-charters.md`
   - Share with team for feedback
   - Refine and re-run as priorities shift

2. **Write PRDs from charters**
   ```
   "Run writing-prds-from-charters for [charter-name]"
   ```
   - Turns strategic bets into executable specs
   - Output: `outputs/delivery/prd-feature-name.md`

3. **Run learning analysis**
   - After 5+ KTLO triages: `pm-os learn triaging-ktlo`
   - After 5+ VOC syntheses: `pm-os learn synthesizing-voc`
   - System extracts success/failure patterns
   - Patterns written to `.claude/rules/learned/` (auto-loaded)

4. **Try senior PM commands**
   ```
   /stakeholders      # Map power/interest grid (~30 min)
   /gtm               # Create GTM launch plan (~60 min)
   /strategy          # Write 3-5 year strategy (~90 min)
   ```

### After Your First Quarter

**Goals:**
- Complete full cycle: Observe → Think → Plan → Build → Learn
- Run post-launch reviews
- Refine PM OS based on learnings

**Actions:**

1. **Post-launch review**
   ```
   /review
   ```
   - 30/60/90 days after launch
   - Compare predicted vs actual metrics
   - Extract lessons learned
   - Update skills with improvements

2. **Quarterly retrospective**
   - Review all Q1 outputs in `history/`
   - What worked? What didn't?
   - Update skill patterns based on experience

3. **Refine PM OS**
   - Customize skills for your domain
   - Add new skills for repeated workflows
   - Update commands for frequently used skills

4. **Share with team**
   - Commit customizations to shared repo
   - Document domain-specific patterns
   - Onboard teammates to PM OS

### Advanced Topics

After mastering the basics, explore:

#### 1. Customizing Skills

Edit skill files to fit your workflow:

```bash
# Edit KTLO triage skill
vim skills/triaging-ktlo/SKILL.md

# Add domain-specific buckets
# Change output format
# Add new sections
```

See: [skills/README.md](/Users/singhm/pm_os_superpowers/skills/README.md#customization)

#### 2. Creating New Skills

Build your own PM workflows:

```bash
mkdir skills/my-new-skill/
vim skills/my-new-skill/SKILL.md
```

Add command shortcut:
```bash
vim commands/my-skill.md
```

See: [skills/README.md](/Users/singhm/pm_os_superpowers/skills/README.md#creating-new-skills)

#### 3. Learning System Deep-Dive

Understand how PM OS learns from history:

- Pattern extraction after 5+ outputs
- Success/failure pattern identification
- Confidence quantification (Strong ≥80%, Medium 50-80%, Weak <50%)
- Auto-loading learned rules

See: [history/README.md](/Users/singhm/pm_os_superpowers/history/README.md#learning-system-integration)

#### 4. Modular Rules Architecture

Configure how PM OS works:

- **pm-core/**: Evidence rules, metadata standards
- **domain/**: Business Network + Catalogs vocabulary
- **system/**: Staleness protocol, output destinations
- **learned/**: Auto-generated patterns

See: [.claude/README.md](/Users/singhm/pm_os_superpowers/.claude/README.md)

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

**When to ignore:** Minor changes (typo fixes) that don't affect analysis.

See: `outputs/audit/auto-run-log.md` for scan history

### "I see drift warnings"

**What this means:** Downstream output is newer than upstream sources (manual edit or out-of-sync).

**Example:**
```
outputs/roadmap/Q1-charters.md (generated Jan 18)
  ← outputs/insights/voc-synthesis.md (modified Jan 20)
```

**Options:**
1. **Reconcile:** Keep downstream changes, update upstream to match
2. **Refresh:** Regenerate downstream from current upstream

**How to decide:** Did you intentionally edit upstream? If yes, reconcile. If no, refresh.

### "Command not found"

**Problem:** Typed `/my-command` but nothing happened.

**Solution:**
1. Check available commands: `ls commands/`
2. Use direct invocation: "Run skill-name"
3. Verify skill exists: `ls skills/`

**Common typos:**
- `/voc` not `/voice`
- `/ktlo` not `/ktlo-triage`
- `/charters` not `/charter`

### "No input files found"

**Problem:** Ran skill but no source files exist.

**Solution:**
1. Check expected directory:
   - `/ktlo` needs `inputs/jira/*.csv`
   - `/voc` needs `inputs/voc/*.md` or `*.csv`
   - `/charters` needs `outputs/truth_base/`, `outputs/insights/`, `outputs/ktlo/`
2. Export data from source systems (Jira, survey tool, etc.)
3. Verify file format (.md, .csv, .pdf, .txt)
4. Check file naming (avoid special characters)

### "Output doesn't match my needs"

**Problem:** Generated output isn't quite right for your workflow.

**Solution:**
1. Skills are customizable - edit `skills/[skill-name]/SKILL.md`
2. Modify output format, add/remove sections
3. Re-run skill with customizations
4. Version control your changes

**Example:** Add "Tech Debt Impact" section to KTLO triage:

```markdown
## Step 5: Assess Tech Debt Impact
For each tech debt ticket:
- Estimate engineering weeks to fix
- Identify systems affected
- Calculate opportunity cost
```

See: [skills/README.md](/Users/singhm/pm_os_superpowers/skills/README.md#customization)

### "CSV parsing failed"

**Problem:** Jira CSV export has formatting issues.

**Solution:**
1. Open CSV in text editor to check format
2. Ensure proper quoting for fields with commas
3. Verify headers match expected columns
4. Re-export from Jira with standard options

**Required columns:**
- Summary (required)
- Description (recommended)
- Priority (optional but helpful)
- Status (optional)
- Created (optional but helpful)

### "Learning system isn't updating skills"

**Problem:** Patterns extracted but skills not using them.

**Solution:**
1. Check `.claude/rules/learned/` for pattern files
2. Verify patterns are auto-loaded (they should be)
3. Restart Claude Code session to reload rules
4. Learning improves future runs, not retroactively

**Note:** Learning requires 5+ outputs before patterns can be extracted.

### "Everything shows as stale"

**Problem:** All outputs marked stale immediately after generation.

**Solution:**
1. Check if file sync tool (Dropbox, Drive) is touching files
2. Pause sync during PM OS usage
3. Check file modification times: `ls -lt inputs/voc/`
4. Disable auto-modification in sync settings

---

## Key Concepts Reference

### Evidence Discipline

**Rules:**
1. Never invent metrics, customers, or quotes
2. Every output includes Sources Used section
3. Every claim tagged: Evidence / Assumption / Open Question
4. Missing data explicitly stated before proceeding

**Claims Ledger format:**

| Claim | Type | Source |
|-------|------|--------|
| [statement] | Evidence/Assumption/Open Question | [file:line or "N/A"] |

### Dependency Tiers

**Tier 1 (Foundation):** Direct from inputs
- VOC synthesis, KTLO triage, Truth base

**Tier 2 (Planning):** Depends on Tier 1
- Quarterly charters, Exec updates

**Tier 3 (Execution):** Depends on Tier 2
- PRDs, GTM plans

**Cascading changes:** Tier 1 → Tier 2 → Tier 3

### Staleness States

**Current (✓):** Output generation time > source modification time

**Stale (⚠️):** Source modified after output generated

**Drift:** Downstream newer than upstream (manual edit detected)

### Output Metadata

**YAML header:**
```yaml
---
generated: YYYY-MM-DD HH:MM
skill: skill-name
sources:
  - path/to/source.md (modified: YYYY-MM-DD)
downstream:
  - path/to/dependent/output.md
---
```

---

## Command Quick Reference

### Daily Commands

| Command | Purpose | Time | Output |
|---------|---------|------|--------|
| `/ktlo` | Triage support backlog | 10 min | outputs/ktlo/ |
| `/voc` | Synthesize customer feedback | 10 min | outputs/insights/ |
| `/exec-update` | Generate exec update | 10 min | outputs/exec_updates/ |

### Weekly Commands

| Command | Purpose | Time | Output |
|---------|---------|------|--------|
| `/charters` | Plan the quarter | 20 min | outputs/roadmap/ |

### Senior PM Commands

| Command | Purpose | Time | Output |
|---------|---------|------|--------|
| `/stakeholders` | Map stakeholders | 30 min | outputs/stakeholders/ |
| `/gtm` | Create GTM launch plan | 60 min | outputs/gtm/ |
| `/strategy` | Write product strategy | 90 min | outputs/strategy/ |
| `/review` | Post-launch retrospective | 45 min | outputs/reviews/ |

### As-Needed Skills

| Invoke | Purpose | Output |
|--------|---------|--------|
| "Run building-truth-base" | Build product understanding | outputs/truth_base/ |
| "Run analyzing-kb-gaps" | Find KB gaps | outputs/insights/ |
| "Run writing-prds-from-charters for [charter]" | Write PRD | outputs/delivery/ |
| "Run prioritizing-work" | Prioritize work | outputs/roadmap/ |
| "Run competitive-analysis" | Analyze competitors | outputs/insights/ |
| "Run analyzing-data" | Data deep-dive | outputs/insights/ |
| "Run tracking-decisions" | Log major decisions | outputs/decisions/ |

---

## Resources

### Documentation

- **Main README:** [README.md](/Users/singhm/pm_os_superpowers/README.md) - Quick start
- **Full implementation guide:** [IMPLEMENTATION_COMPLETE.md](/Users/singhm/pm_os_superpowers/IMPLEMENTATION_COMPLETE.md)
- **Folder-specific guides:**
  - [inputs/README.md](/Users/singhm/pm_os_superpowers/inputs/README.md) - Adding source data
  - [outputs/README.md](/Users/singhm/pm_os_superpowers/outputs/README.md) - Understanding results
  - [history/README.md](/Users/singhm/pm_os_superpowers/history/README.md) - Versioning and learning
  - [skills/README.md](/Users/singhm/pm_os_superpowers/skills/README.md) - PM workflow library
  - [commands/README.md](/Users/singhm/pm_os_superpowers/commands/README.md) - Command shortcuts
  - [.claude/README.md](/Users/singhm/pm_os_superpowers/.claude/README.md) - Configuration deep-dive

### Support

- **Issues:** Report at https://github.com/anthropics/claude-code/issues
- **Questions:** Check folder READMEs for specific topics
- **Customization:** Edit skills and rules to fit your workflow

---

## Summary

**You've learned:**

1. ✓ What PM OS is and why it matters (evidence-based, modular, self-improving)
2. ✓ How to set up and verify structure (inputs → skills → outputs → history)
3. ✓ How to run your first analysis (KTLO triage with `/ktlo`)
4. ✓ How dependencies work (3-tier cascade, staleness tracking)
5. ✓ Daily workflow (KTLO, VOC, exec updates in 30 min)
6. ✓ Next steps (weekly planning, quarterly retrospectives, learning system)

**Ready to start?**

1. Drop files into `inputs/`
2. Run `/ktlo` or `/voc`
3. Review `outputs/` for results
4. Check `history/` for versioned trail

**Welcome to evidence-based PM practice!**
