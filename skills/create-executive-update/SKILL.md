---
name: create-executive-update
description: Generates a high-level executive summary of product progress and insights.
trigger_phrases:
  - "executive update"
  - "product status report"
  - "summary for leadership"
---

# Skill: Create Executive Update

## Overview
This skill generates a concise, high-level summary of product progress, key metrics, and strategic insights for a leadership audience.

## When to Use
- When you need to provide a regular status update to executives or stakeholders.
- When you need to summarize the key outcomes of a recent launch or a quarter.
- When you need to distill complex information into a brief, digestible format.

## Core Logic

**Step 1: Gather Latest Outputs**

Read most recent files from:
- `outputs/roadmap/` (latest charter)
- `outputs/insights/` (latest VOC synthesis)
- `outputs/ktlo/` (latest KTLO triage)
- `outputs/decisions/` (recent decisions)

Note what's unavailable.

**Step 2: Extract Key Information**

From each source:
- **Problems:** What are we solving? (from charters/VOC)
- **Metrics:** Current vs target KPIs (from charters)
- **Risks:** Top risks and mitigations (from charters/KTLO)
- **Timeline:** This week + quarter milestones (from charters)
- **Decisions:** Recent decisions and outcomes (from decisions/)

**Step 3: Generate 1-Page Summary**

Strict 1-page constraint. Write to `outputs/exec_updates/exec-update-YYYY-MM-DD.md`:

```markdown
---
generated: YYYY-MM-DD HH:MM
skill: generating-exec-update
sources:
  - outputs/roadmap/Q1-2026-charters.md (modified: YYYY-MM-DD)
  - outputs/insights/voc-synthesis-2026-01.md (modified: YYYY-MM-DD)
  - outputs/ktlo/ktlo-triage-2026-01-14.md (modified: YYYY-MM-DD)
downstream:
  - (sent to stakeholders)
---

# Executive Update: [Date]

## Top 3 Problems We're Solving

1. **[Problem 1]** - [Why it matters in 1 sentence]
   - **Evidence:** [Source: file:line]

2. **[Problem 2]** - [Why it matters in 1 sentence]
   - **Evidence:** [Source: file:line]

3. **[Problem 3]** - [Why it matters in 1 sentence]
   - **Evidence:** [Source: file:line]

## Key Metrics

| Metric | Current | Target | Status | Trend |
|--------|---------|--------|--------|-------|
| [KPI 1] | [Value] | [Goal] | 🟢/🟡/🔴 | ↗/→/↘ |
| [KPI 2] | [Value] | [Goal] | 🟢/🟡/🔴 | ↗/→/↘ |
| [KPI 3] | [Value] | [Goal] | 🟢/🟡/🔴 | ↗/→/↘ |

**Status Legend:** 🟢 On track | 🟡 At risk | 🔴 Blocked
**Trend Legend:** ↗ Improving | → Stable | ↘ Declining

## Top 3 Risks

| Risk | Impact | Mitigation | Owner | Status |
|------|--------|------------|-------|--------|
| [Risk 1] | High/Med/Low | [Mitigation plan] | [Name or TBD] | 🟢/🟡/🔴 |
| [Risk 2] | High/Med/Low | [Mitigation plan] | [Name or TBD] | 🟢/🟡/🔴 |
| [Risk 3] | High/Med/Low | [Mitigation plan] | [Name or TBD] | 🟢/🟡/🔴 |

## Timeline

### This Week
- [Key milestone 1]
- [Key milestone 2]

### This Quarter
- [Major initiative 1]
- [Major initiative 2]

## Recent Decisions
- **[Decision]:** [Outcome] - [Impact]
- **[Decision]:** [Outcome] - [Impact]

## Sources Used
- [file path]

## Claims Ledger
| Claim | Type | Source |
|-------|------|--------|
| [Problem is top priority] | Evidence | [file:line] |
| [Metric target] | Evidence | [file:line] |
```

**Step 4: Copy to History**

- Run `pm-os mirror --quiet` to copy to `history/generating-exec-update/`

## Post-Execution Protocol

After completing this skill, follow `.claude/rules/pm-core/post-skill-reflection.md`:

**Step 5: Post-Skill Reflection**

1. Extract 3-5 key learnings (what resonated, format improvements)
2. Create learning entry in `history/learnings/YYYY-MM-DD-generating-exec-update.md`
3. Create insight beads in `.beads/insights.jsonl`
4. Request output rating (1-5 or skip)
5. Detect and log any strategic framing decisions
6. Report capture completion to user

## One-Page Constraint

**This is strict. If you exceed 1 page:**
- Remove non-critical risks (keep top 3 only)
- Condense timeline (only this week + this quarter)
- Use shorter problem statements
- Use metric abbreviations (e.g., "NPS" not "Net Promoter Score")
- Combine decisions if similar

## Status & Trend Indicators

**Status (emoji):**
- 🟢 On track - No concerns
- 🟡 At risk - Needs attention but mitigable
- 🔴 Blocked - Action required immediately

**Trend (arrow):**
- ↗ Improving - Moving toward target
- → Stable - Consistent, no change
- ↘ Declining - Moving away from target

## Quick Reference

| Item | Rule |
|------|------|
| Page limit | Strict 1 page |
| Top problems | Exactly 3 |
| Top risks | Exactly 3 |
| Metrics | 3-5 KPIs only |
| Reading time | <2 minutes |
| Format | Tables + bullets, no paragraphs |
| Evidence | Every claim cited (file:line) |

## Common Mistakes

- **Over 1 page:** Trim non-critical items
- **Too many risks:** Keep only top 3
- **Vague metrics:** Use specific numbers (not "improving satisfaction")
- **Missing status emojis:** Use 🟢/🟡/🔴 for every metric/risk
- **No evidence citation:** Every claim needs source attribution
- **Unclear timeline:** This week specific, quarter strategic
