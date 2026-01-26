---
name: triage-backlog
description: Prioritizes and categorizes backlog items based on defined criteria.
trigger_phrases:
  - "triage backlog"
  - "prioritize tasks"
  - "what's on fire"
---

# Skill: Triage Backlog

## Overview
This skill processes backlog items from sources like Jira exports and applies a consistent prioritization framework. It helps identify the most critical items to focus on.

## When to Use
- When you have a list of backlog items to prioritize.
- When you need to prepare for sprint planning or a backlog grooming session.
- When you need to identify "quick wins" or items of high strategic value.

## Core Logic

**Step 1: Gather Context**

Follow `.claude/rules/pm-core/context-gathering.md`:
1. Detect Jira exports in `inputs/jira/` and previous triages in `outputs/ktlo/`
2. Present options to user
3. Read `.beads/insights.jsonl` for KTLO patterns
4. Proceed with selected context

**Step 2: Load Jira Export**

Read files from `inputs/jira/` (CSV preferred). Parse fields:
- Issue key, Summary, Status, Priority
- Component/Product area, Created/Updated dates
- Labels, Customer impact, Escalation flag

Note any missing columns.

**Step 3: Categorize into 5 Buckets**

| Bucket | Definition | Signals |
|--------|------------|---------|
| **1. Revenue/Renewal Risk** | Could cause churn or block deals | "customer threatening to leave", "blocker for renewal", escalation tags |
| **2. Customer Trust & Data Integrity** | Errors, data corruption, incorrect outputs | "data mismatch", "wrong values", "sync failed" |
| **3. Operational Burden** | High support volume, field escalations | Multiple linked tickets, repeat issues, "workaround" |
| **4. Paper Cuts (UX Friction)** | Annoyances that don't break things | "confusing", "should be easier", "unexpected" |
| **5. Tech Debt Blocking Roadmap** | Can't build new things until fixed | "refactor needed", "legacy", dependencies |

**Step 4: Score and Rank**

For each issue, note:
- Which bucket(s) it belongs to
- Severity (Critical/High/Medium/Low)
- Recency (last updated)
- Volume (linked tickets, duplicates)

**Step 5: Generate Output**

Write to `outputs/ktlo/ktlo-triage-YYYY-MM-DD.md`:

```markdown
---
generated: YYYY-MM-DD HH:MM
skill: triaging-ktlo
sources:
  - inputs/jira/export.csv (modified: YYYY-MM-DD)
downstream:
  - outputs/roadmap/Qx-YYYY-charters.md
---

# KTLO Triage: [Date]

## Executive Summary
[3 sentences: State of KTLO? What's most urgent?]

## Bucket Overview

| Bucket | Count | Critical | High | Med | Low |
|--------|-------|----------|------|-----|-----|
| 1. Revenue Risk | N | N | N | N | N |
| 2. Trust/Data | N | N | N | N | N |
| 3. Ops Burden | N | N | N | N | N |
| 4. Paper Cuts | N | N | N | N | N |
| 5. Tech Debt | N | N | N | N | N |
| **Total** | N | N | N | N | N |

## Top 20 Issues

| Rank | Key | Summary | Bucket | Severity | Why It Matters | Who Feels Pain | Next Step |
|------|-----|---------|--------|----------|----------------|----------------|-----------|
| 1 | ABC-123 | [summary] | 1 | Critical | [reason] | [persona] | [action] |

## Patterns Observed
1. **[Pattern]:** [Description] — Affected issues: [list keys]

## Recommendations

### STOP (Deprioritize/Close)
| Key | Reason |
|-----|--------|
| ... | [why this can be closed or deprioritized] |

### FIX (Address Soon)
| Key | Reason | Suggested Sprint |
|-----|--------|------------------|
| ... | [why urgent] | [Q1/Q2/etc] |

### DEFER (Later / Needs More Info)
| Key | Reason |
|-----|--------|
| ... | [why this can wait] |

## Unknowns / Missing Data
- [What columns were missing?]
- [What context would help?]

## Sources Used
- [file paths]

## Claims Ledger
| Claim | Type | Source |
|-------|------|--------|
| [Issue affects X customers] | Evidence/Unknown | [from ticket or "Not stated"] |
```

**Step 6: Copy to History & Update Tracker**

- Run `pm-os mirror --quiet` to copy to `history/triaging-ktlo/`
- Update `nexa/state.json` and append to `outputs/audit/auto-run-log.md`

## Post-Execution Protocol

After completing this skill, follow `.claude/rules/pm-core/post-skill-reflection.md`:

**Step 7: Post-Skill Reflection**

1. Extract 3-5 key learnings (recurring themes, systemic issues, patterns)
2. Create learning entry in `history/learnings/YYYY-MM-DD-triaging-ktlo.md`
3. Create insight beads in `.beads/insights.jsonl`
4. Detect and log any decisions made
5. Report capture completion to user

**Note:** Rating prompt is optional for KTLO triage (operational, not strategic).

## Quick Reference

| Bucket | Key Signal |
|--------|------------|
| 1. Revenue Risk | "churn", "renewal", escalation |
| 2. Trust/Data | "incorrect", "mismatch", "corruption" |
| 3. Ops Burden | Multiple tickets, workarounds |
| 4. Paper Cuts | "confusing", "annoying" |
| 5. Tech Debt | "refactor", "legacy", "blocker" |

## Common Mistakes

- **Missing buckets:** Only listing revenue risk → Check all 5 buckets
- **No severity:** "These are all important" → Rank by Critical/High/Med/Low
- **Guessing impact:** "This affects many customers" → Only state if in ticket
- **Ignoring patterns:** Treating each ticket independently → Group related issues
- **No next steps:** Just listing issues → Every issue needs suggested action

## Verification Checklist

- [ ] All Jira files read
- [ ] Issues categorized into 5 buckets
- [ ] Counts are accurate
- [ ] Top 20 ranked with reasons
- [ ] Stop/Fix/Defer recommendations provided
- [ ] Patterns identified and documented
- [ ] Unknown/missing data noted
- [ ] Metadata header complete
- [ ] Copied to history, tracker updated
