# Alerts Directory

## Purpose

The `alerts/` directory contains **dependency tracking and staleness detection** - a single file that monitors when outputs need refreshing because their source files have changed.

**Why this matters:** In PM work, using stale data leads to bad decisions. The alerts system ensures you're always working with current information.

## Directory Structure

```
alerts/
└── stale-outputs.md   # Tracks output dependencies and staleness
```

## What is stale-outputs.md?

A lightweight dependency tracker that records:
- What outputs exist
- What inputs each output depends on
- When outputs were generated
- When source files were last modified
- Which outputs are stale (source newer than output)

**Think of it as:** A timestamp-based dependency graph.

## File Format

### Structure

```markdown
# Stale Outputs Tracker

**Last updated:** YYYY-MM-DD HH:MM

## Currently Tracked Outputs

| Output | Generated | Sources | Status |
|--------|-----------|---------|--------|
| outputs/insights/voc-synthesis-2026-01-15.md | 2026-01-15 14:30 | inputs/voc/*.md | ✓ Current |
| outputs/ktlo/ktlo-triage-2026-01-15.md | 2026-01-15 15:00 | inputs/jira/tickets.csv | ⚠️ STALE |
| outputs/roadmap/Q1-2026-charters.md | 2026-01-10 10:00 | outputs/insights/voc-*.md, outputs/ktlo/*.md | ⚠️ STALE |

## Stale Outputs (Need Refresh)

### outputs/ktlo/ktlo-triage-2026-01-15.md
**Reason:** Source file modified after output generation
- inputs/jira/tickets.csv modified 2026-01-16 (output generated 2026-01-15)

**Action:** Run `/ktlo` to refresh

### outputs/roadmap/Q1-2026-charters.md
**Reason:** Upstream dependency is stale
- outputs/ktlo/ktlo-triage-2026-01-15.md is stale (see above)

**Action:** Refresh KTLO first, then run `/charters`
```

## How Staleness Detection Works

### Staleness Check Flow

```
Session Start
     │
     ▼
┌────────────────────────┐
│ Session hook reads     │
│ alerts/stale-outputs.md│
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ For each output:       │
│ - Check generation time│
│ - Check source mod time│
│ - Compare timestamps   │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Source newer than      │
│ output?                │
└────────┬───────────────┘
         │
         ├──► YES: Mark STALE
         └──► NO:  Mark current
         │
         ▼
┌────────────────────────┐
│ Report to user:        │
│ "These outputs may be  │
│  stale: [list]"        │
└────────────────────────┘
```

### Staleness Example

**Scenario:**

1. **Day 1 (Jan 15):**
   - You run `/voc` at 14:30
   - Reads: `inputs/voc/interview-1.md` (modified Jan 10)
   - Generates: `outputs/insights/voc-synthesis-2026-01-15.md`
   - **Status:** ✓ Current

2. **Day 2 (Jan 16):**
   - You add `inputs/voc/interview-2.md` at 09:00
   - Session starts, checks staleness
   - `voc-synthesis` generated Jan 15, but `interview-2.md` modified Jan 16
   - **Status:** ⚠️ STALE

3. **User action:**
   - See stale warning
   - Run `/voc` to refresh
   - New synthesis includes interview-2.md
   - **Status:** ✓ Current again

## Drift Detection

**Drift** occurs when a **downstream output** is newer than its **upstream sources**.

### Drift Example

**Scenario:**

1. **Jan 15:** Generate VOC synthesis at 14:00
2. **Jan 18:** Generate Q1 charters at 10:00 (uses VOC synthesis from Jan 15)
3. **Jan 20:** Manually edit VOC synthesis at 12:00
4. **Drift detected:** Q1 charters (Jan 18) older than VOC synthesis (Jan 20)

**Options:**
- **Reconcile:** Keep charter changes, update VOC to align
- **Refresh:** Regenerate charters from updated VOC

**Why drift matters:** Indicates manual edits or out-of-sync updates. System can't auto-determine correct action.

## Dependency Tiers

PM OS has 3-tier dependency flow:

```
TIER 1: Direct from inputs
────────────────────────────────────
inputs/voc/*            → outputs/insights/voc-synthesis.md
inputs/jira/*           → outputs/ktlo/ktlo-triage.md
inputs/roadmap_deck/*   → outputs/truth_base/truth-base.md

TIER 2: Depends on Tier 1
────────────────────────────────────
outputs/truth_base/*    → outputs/roadmap/Q1-charters.md
outputs/insights/voc-*  → outputs/roadmap/Q1-charters.md
outputs/ktlo/*          → outputs/roadmap/Q1-charters.md

TIER 3: Depends on Tier 2
────────────────────────────────────
outputs/roadmap/*       → outputs/delivery/prds/*.md
```

**Cascading staleness:**
- If Tier 1 changes → Tier 2 becomes stale
- If Tier 2 changes → Tier 3 becomes stale

**Example:**
1. Add new Jira ticket → `ktlo-triage.md` becomes stale
2. Refresh KTLO → `Q1-charters.md` becomes stale (depends on KTLO)
3. Refresh charters → `prd-feature-x.md` becomes stale (depends on charter)

## Session Start Protocol

**Every session start:**

1. **Hook runs:** `hooks/session-start.sh` executes
2. **Reads:** `alerts/stale-outputs.md`
3. **Checks:** Source modification times vs output generation times
4. **Reports:** Stale outputs to user
5. **User decides:** Refresh now, or proceed with caution

**User sees:**
```
⚠️ Stale outputs detected:
- outputs/insights/voc-synthesis-2026-01.md (source inputs/voc/feedback.csv changed)
- outputs/roadmap/Q1-2026-charters.md (depends on stale VOC synthesis)

Say "refresh voc" to update, or proceed with caution.
```

## Usage

### Checking Staleness Manually

```
"What outputs are stale?"
```

Claude Code reads `alerts/stale-outputs.md` and reports.

### Refreshing Stale Outputs

When staleness is detected:

```
/voc               # Refresh VOC synthesis
/ktlo              # Refresh KTLO triage
/charters          # Refresh quarterly charters
```

### Understanding Dependencies

```
"What does Q1-charters.md depend on?"
```

Claude Code checks metadata header:

```yaml
---
sources:
  - outputs/truth_base/truth-base.md (modified: 2026-01-05)
  - outputs/insights/voc-synthesis-2026-01-15.md (modified: 2026-01-15)
  - outputs/ktlo/ktlo-triage-2026-01-15.md (modified: 2026-01-15)
---
```

## Automatic Updates

The stale-outputs.md file is **automatically updated** when skills run:

### After Skill Execution

```
You run /voc
     │
     ▼
┌────────────────────────┐
│ Skill generates output │
│ outputs/insights/      │
│ voc-synthesis.md       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Skill updates          │
│ alerts/stale-outputs.md│
│ with:                  │
│ - Output path          │
│ - Generation time      │
│ - Source files used    │
│ - Source mod times     │
└────────────────────────┘
```

**You never manually edit this file** - skills manage it.

## Common Workflows

### Morning Routine

Session starts automatically checks staleness:

```
✓ No stale outputs detected. All current.
```

or

```
⚠️ Stale outputs detected:
- outputs/insights/voc-synthesis-2026-01.md

Run /voc to refresh.
```

### Before Important Decisions

Check dependencies before using outputs for decisions:

```
"Is Q1-charters.md current?"
```

Response:
```
Q1-charters.md generated 2026-01-10 10:00
Depends on:
  ✓ truth_base/truth-base.md (current)
  ⚠️ insights/voc-synthesis.md (stale - source changed 2026-01-15)
  ✓ ktlo/ktlo-triage.md (current)

Recommendation: Refresh VOC synthesis before relying on charters.
```

### Weekly Review

Check overall staleness status:

```
"What needs refreshing?"
```

Gets complete staleness report from alerts file.

## Common Issues

### Issue: "Everything shows as stale"

**Problem:** All outputs marked stale immediately after generation.

**Solution:**
1. Check if file sync tool (Dropbox, Drive) is touching files
2. Pause sync during PM OS usage
3. Check file modification times: `ls -lt inputs/voc/`
4. Disable auto-modification in sync settings

### Issue: "Staleness not detected"

**Problem:** Added new input file but output not marked stale.

**Solution:**
1. Verify alerts/stale-outputs.md is tracking the output
2. Check if output metadata header includes the new input
3. Manually run skill to pick up new input
4. Staleness only detected for known dependencies

### Issue: "Can't resolve drift"

**Problem:** Drift detected but unclear which version is correct.

**Solution:**
1. Review edit history to understand changes
2. Compare versions: `diff output-old.md output-new.md`
3. Decide: Keep downstream edits or regenerate from upstream
4. Document decision in `outputs/decisions/`

### Issue: "Alerts file is huge"

**Problem:** Too many tracked outputs, file is cluttered.

**Solution:**
1. Archive old outputs: Move completed work to archive
2. Remove obsolete entries from alerts file
3. Focus on active work only
4. Historical outputs don't need active tracking

## Best Practices

1. **Check staleness at session start** - Don't skip the warnings
2. **Refresh before important decisions** - Use current data
3. **Cascade refreshes** - Tier 1 → Tier 2 → Tier 3 order
4. **Document drift resolutions** - Track why you chose reconcile vs refresh
5. **Archive completed work** - Remove from active tracking

## Troubleshooting Staleness

### Flowchart

```
Output marked stale?
    │
    ├─► Source file actually changed?
    │   ├─► YES: Refresh output (/voc, /ktlo, /charters)
    │   └─► NO: Check if sync tool touched file
    │
    ├─► Upstream dependency stale?
    │   ├─► YES: Refresh upstream first, then downstream
    │   └─► NO: Check metadata header accuracy
    │
    └─► Drift detected?
        ├─► Manual edit? → Reconcile or document
        └─► Out-of-sync? → Refresh to realign
```

## Integration with PM OS

```
┌──────────┐
│ Inputs   │ ← Source files
└────┬─────┘
     │
     ▼
┌──────────┐
│ Skills   │ ← Generate outputs
└────┬─────┘
     │
     ├────► outputs/       (Current)
     │
     ├────► history/       (Versioned)
     │
     └────► alerts/stale-outputs.md  (Track dependencies)
              │
              ▼
         Session Start Hook
              │
              ▼
         Staleness Check
              │
              ▼
         Report to User
```

**Staleness tracking ensures evidence-based PM work** - always current data, never stale insights.

## See Also

- [outputs/README.md](../outputs/README.md) - Understanding your results
- [.claude/README.md](../.claude/README.md) - Staleness protocol rules
- [Main README](../README.md) - Getting started guide
