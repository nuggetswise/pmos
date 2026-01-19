# History Directory

## Purpose

The `history/` directory contains **versioned copies of all outputs** - a complete trail of every charter, VOC synthesis, PRD, and analysis you've ever generated.

**Why this matters:** History enables you to:
- Track how your thinking evolved over time
- Compare versions to understand what changed
- Feed the learning system to extract success/failure patterns
- Reference past decisions when planning future work

## Directory Structure

```
history/
├── building-truth-base/              # Product understanding snapshots
├── synthesizing-voc/                 # VOC synthesis versions
├── triaging-ktlo/                    # KTLO triage reports
├── analyzing-kb-gaps/                # KB gap analyses
├── generating-quarterly-charters/    # Charter versions (v1, v2, v3...)
├── writing-prds-from-charters/       # PRD iterations
├── prioritizing-work/                # Prioritization exercises
├── competitive-analysis/             # Competitive analyses
├── analyzing-data/                   # Data deep-dives
├── planning-gtm-launch/              # GTM launch plans
├── stakeholder-management/           # Stakeholder maps
├── writing-product-strategy/         # Strategy documents
├── reviewing-launch-outcomes/        # Post-launch reviews
├── tracking-decisions/               # Decision logs
├── learning-from-history/            # Optional learning analysis reports
└── generating-exec-update/           # Exec updates
```

**Pattern:** History directory names mirror skill names.

## How History Works

### History Mirroring

Every time a skill runs:

1. **Generate output**: Skills write to `outputs/[type]/latest-file.md`
2. **Mirror to history**: Run `pm-os mirror` to copy to `history/[skill]/latest-file-YYYY-MM-DD.md`
3. **Update state/audit**: `nexa/state.json` and `outputs/audit/auto-run-log.md` updated with new version

**You never manually manage history files** - `pm-os mirror` handles it.

### Example: Charter Evolution

```
User runs /charters on Jan 10:
  → outputs/roadmap/Q1-2026-charters.md
  → history/generating-quarterly-charters/Q1-2026-charters-2026-01-10.md

User updates inputs, runs /charters again on Jan 15:
  → outputs/roadmap/Q1-2026-charters.md (overwrites)
  → history/generating-quarterly-charters/Q1-2026-charters-2026-01-15.md (new file)

User refines, runs /charters again on Jan 20:
  → outputs/roadmap/Q1-2026-charters.md (overwrites)
  → history/generating-quarterly-charters/Q1-2026-charters-2026-01-20.md (new file)
```

**Result:** You have v1 (Jan 10), v2 (Jan 15), v3 (Jan 20) in history.

## Usage

### Reviewing Past Work

**"What did I run last week?"**
```bash
ls -lt history/*/  # List all history files by modification time
```

**"Show me all VOC syntheses I've done"**
```bash
ls history/synthesizing-voc/
# voc-synthesis-2026-01-10.md
# voc-synthesis-2026-01-15.md
# voc-synthesis-2026-01-20.md
```

**"Find my Q1 charter versions"**
```bash
ls history/generating-quarterly-charters/ | grep Q1-2026
# Q1-2026-charters-2026-01-10.md
# Q1-2026-charters-2026-01-15.md
# Q1-2026-charters-2026-01-20.md
```

### Comparing Versions

**See what changed between charter versions:**
```bash
diff history/generating-quarterly-charters/Q1-2026-charters-2026-01-10.md \
     history/generating-quarterly-charters/Q1-2026-charters-2026-01-15.md
```

**Or use your editor's diff tool** (VS Code, vim, etc.)

### Pattern: Version Naming

History files follow this pattern:
```
[original-filename]-YYYY-MM-DD.md
```

**Examples:**
- `voc-synthesis-2026-01-15.md` → `voc-synthesis-2026-01-15-2026-01-15.md`
- `Q1-2026-charters.md` → `Q1-2026-charters-2026-01-15.md`
- `gtm-catalog-launch.md` → `gtm-catalog-launch-2026-01-15.md`

## Learning System Integration

### How History Feeds Learning

The learning system analyzes history to extract patterns:

1. **Pattern detection**: Looks for success/failure patterns across versions
2. **Success patterns**: What do approved outputs have in common?
3. **Failure patterns**: What causes revisions or rejections?
4. **Quantification**: "10/12 charters with ≤3 bets got approved (83%)"

### When Learning Runs

**Automatic:** Weekly via `hooks/weekly-learning.sh`
- Checks every 7 days
- Runs `pm-os learn --auto` when history has ≥5 files for a skill

**Manual (execution path):** You can trigger anytime
```
pm-os learn generating-quarterly-charters
```

### What Learning Produces

Learning writes to two places:

1. **Learned rules**: `.claude/rules/learned/[skill-name]-patterns.md`
   - Auto-loaded by Claude Code
   - Contains success/failure patterns with evidence
   - Quantified confidence levels

2. **Personal preferences**: `CLAUDE.local.md`
   - Your consistent choices (format, style, review cycle)
   - Domain-specific patterns
   - Not version controlled (personal to you)

**Example learned pattern:**
```
## Success Pattern: Charter Brevity
**Observation:** Charters with ≤3 strategic bets get approved faster
**Evidence:** 10/12 successful charters (83%)
**Recommendation:** Default to 3 bets max per quarter
```

## Examples

### Example 1: Tracking Charter Refinement

You generate Q1 charters, get feedback, refine:

**Version 1** (Jan 10): Initial draft, 5 strategic bets
- Feedback: "Too much, focus"
- Saved to: `history/.../Q1-2026-charters-2026-01-10.md`

**Version 2** (Jan 12): Refined to 3 bets
- Feedback: "Better, needs metrics"
- Saved to: `history/.../Q1-2026-charters-2026-01-12.md`

**Version 3** (Jan 15): Added metrics, approved
- Saved to: `history/.../Q1-2026-charters-2026-01-15.md`

**Later:** Learning system analyzes all Q1 charter history:
- Detects pattern: 3 bets → approved, 5 bets → revision needed
- Writes pattern to `.claude/rules/learned/charter-patterns.md`
- Next time you generate charters, it defaults to 3 bets

### Example 2: VOC Synthesis Evolution

Track how your VOC synthesis improves:

**Week 1**: 3 interviews → thin synthesis
- `history/synthesizing-voc/voc-synthesis-2026-01-08.md`

**Week 2**: 6 interviews → richer themes
- `history/synthesizing-voc/voc-synthesis-2026-01-15.md`

**Week 3**: 10 interviews → clear patterns emerge
- `history/synthesizing-voc/voc-synthesis-2026-01-22.md`

**Learning:** Compare versions to see how themes solidified over time.

## Common Workflows

### Weekly Review

Look back at what you generated:
```bash
# What did I create last week?
find history/ -name "*.md" -mtime -7 -type f

# How many charters have I written?
ls history/generating-quarterly-charters/ | wc -l
```

### Quarterly Retrospective

Review your PM outputs for the quarter:
```bash
# All outputs from Q1 2026
find history/ -name "*2026-01-*.md" -o -name "*2026-02-*.md" -o -name "*2026-03-*.md"
```

### Learning Analysis

After 5+ outputs for a skill:
```
pm-os learn generating-quarterly-charters
```

Learning system will:
1. Read all charter files in history
2. Identify success/failure patterns
3. Write learned rules to `.claude/rules/learned/`
4. Update `CLAUDE.local.md` with preferences

## Common Issues

### Issue: "History directory is empty"

**Problem:** No skills have been run yet.

**Solution:**
1. Run a skill (e.g., `/voc` or `/ktlo`)
2. Check outputs/ for the generated file
3. History copy should appear in appropriate subdirectory

### Issue: "History file wasn't created"

**Problem:** Skill ran but no history copy made.

**Solution:**
1. Check if outputs/ file exists
2. Manually copy to history if needed:
   ```bash
   cp outputs/insights/voc-synthesis.md \
      history/synthesizing-voc/voc-synthesis-$(date +%Y-%m-%d).md
   ```
3. Report issue (should be automatic)

### Issue: "Too many history files, hard to navigate"

**Problem:** Lots of iterations creating clutter.

**Solution:**
1. Use `ls -lt` to sort by date (newest first)
2. Use grep to filter: `ls history/synthesizing-voc/ | grep "2026-01"`
3. Archive old files: Move to `history-archive/` if needed

### Issue: "Can't diff files with different names"

**Problem:** Filename structure changed between versions.

**Solution:**
1. Use directory-aware diff: `diff -r history/skill/ history/skill/`
2. Or manually specify files:
   ```bash
   diff file1.md file2.md
   ```

## Best Practices

1. **Don't delete history** - Learning system needs it
2. **Review monthly** - See how your thinking evolved
3. **Run learning analysis** - After 5+ outputs for any skill
4. **Compare versions** - Use diff to see what changed
5. **Archive, don't delete** - If cleaning up, move to archive directory

## Storage Considerations

History grows over time. Here's what to expect:

| Activity | Files per Quarter | Size Estimate |
|----------|-------------------|---------------|
| Daily VOC/KTLO | ~60 files | ~2-3 MB |
| Weekly charters | ~12 files | ~1 MB |
| Monthly PRDs | ~4-8 files | ~500 KB |
| Quarterly reviews | ~4 files | ~200 KB |

**Total per quarter:** ~70-80 files, ~4-5 MB (very lightweight)

**Recommendation:** Keep at least 1 year of history for learning patterns.

## Integration with PM OS

```
┌──────────┐
│ Skills   │ ← Run workflow
└────┬─────┘
     │
     ├────► outputs/[type]/latest.md       (Current version)
     │
     └────► history/[skill]/latest-YYYY-MM-DD.md  (Versioned copy)
                  │
                  ▼
            Learning System
                  │
                  ▼
      .claude/rules/learned/*.md  (Auto-loaded patterns)
      CLAUDE.local.md             (Personal preferences)
```

**See also:**
- [outputs/README.md](../outputs/README.md) - Understanding current outputs
- [.claude/README.md](../.claude/README.md) - Learning and rules system
- [Main README](../README.md) - Getting started guide
