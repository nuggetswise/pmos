---
name: synthesize-customer-voice
description: Aggregates and synthesizes customer feedback from various sources.
trigger_phrases:
  - "synthesize customer voice"
  - "customer feedback summary"
  - "what are customers saying"
---

# Skill: Synthesize Customer Voice

## Overview
This skill converts raw Voice of Customer (VOC) data from various sources into decision-grade themes, insights, and opportunities. It follows a strict protocol to ensure that all findings are evidence-based.

## When to Use
- When you have raw customer feedback (e.g., interview transcripts, support tickets, survey results).
- When you need to understand the core themes and pain points emerging from the feedback.
- When preparing for roadmap planning, feature prioritization, or strategic reviews.

## Core Logic

**Step 1: Gather Context**

Follow `.claude/rules/pm-core/context-gathering.md`:
1. Detect VOC files in `inputs/voc/` and previous syntheses in `outputs/insights/`
2. Present options to user
3. Read `.beads/insights.jsonl` for VOC patterns
4. Proceed with selected context

**Step 2: Validate Sources**

1. List all selected files
2. Count total sources
3. **If fewer than 3 sources:**
   - State: "Insufficient sources (found N, need 3+)"
   - List what you found
   - Ask user for more data or to proceed with caveat
4. Read each file completely

**Step 3: Tag Verbatims (Internal)**

Create index:
- Verbatim Quote → Source File → User/Segment (if known)

**DO NOT** summarize or paraphrase at this stage.

**Step 4: Identify Themes**

Find patterns appearing in **3+ separate sources**. For each theme:

| Required | Rule |
|----------|------|
| Core pain point | One sentence, factual |
| Frequency | Exact count of sources |
| Quotes | Up to 3 verbatim (if fewer, say so) |
| Segment | Only if explicitly stated |
| Impact | Only if user explicitly stated |

**Step 5: Generate Output**

Write to `outputs/insights/voc-synthesis-YYYY-MM-DD.md`:

```markdown
---
generated: YYYY-MM-DD HH:MM
skill: synthesizing-voc
sources:
  - inputs/voc/interview-1.md (modified: YYYY-MM-DD)
  - inputs/voc/interview-2.md (modified: YYYY-MM-DD)
downstream:
  - outputs/roadmap/Qx-YYYY-charters.md
---

# VOC Synthesis: [Date]

## Summary
[2-3 sentences: what did we learn?]

## Themes

| Theme | Frequency | Segment | Impact | Confidence |
|-------|-----------|---------|--------|------------|
| [Theme 1] | N sources | Explicit/Unknown | Explicit/Unknown | High/Med/Low |

## Voice of the Customer

### Theme 1: [Name]
**Pain point:** [One sentence]

> "[Verbatim quote 1]"
> — Source: [filename], [user/segment if known]

### Theme 2: [Name]
...

## Top 5 Opportunities
1. **[Opportunity]** — Evidence: [N sources mention this]

## Terminology Gaps / Misconceptions
1. **[Term/Concept]** — What users say vs. what we mean

## What to Validate Next
- [ ] [Specific hypothesis to test]
- [ ] [Question to ask in next interview]

## Recommended Actions
[Only if supported by 3+ sources. Otherwise: "No recommendations; need more data."]

## Sources Used
- [file paths]

## Claims Ledger
| Claim | Type | Source |
|-------|------|--------|
| ... | Evidence | [file:line] |
```

**Step 6: Copy to History & Update Tracker**

- Run `pm-os mirror --quiet` to copy to `history/synthesizing-voc/`
- Update `nexa/state.json` and append to `outputs/audit/auto-run-log.md`

## Signal Classification

Apply `.claude/rules/pm-workflows/signal-classification.md`:
- **EXPLICIT**: Direct customer quotes, specific metrics stated
- **INFERRED**: Patterns across 2+ sources (mark confidence level)
- **IMPLICIT**: PM best practice gaps (missing success metrics, etc.)

## Post-Execution Protocol

After completing this skill, follow `.claude/rules/pm-core/post-skill-reflection.md`:

**Step 7: Post-Skill Reflection**

1. Extract 3-5 key learnings from this VOC synthesis
2. Create learning entry in `history/learnings/YYYY-MM-DD-synthesizing-voc.md`
3. Create insight beads in `.beads/insights.jsonl`
4. Request output rating (1-5 or skip)
5. Detect and log any decisions made
6. Report capture completion to user

## Anti-Hallucination Rules (Non-Negotiable)

- **Minimum 3 sources:** No theme without 3+ sources
- **Verbatim quotes only:** Never paraphrase or summarize customer words
- **Source attribution:** Every quote includes filename and user/segment if known
- **Exact counts:** "N sources mention this", not "many" or "some"
- **Segment/Impact marked Unknown:** Only if not explicitly stated
- **PII redacted:** Redact names/emails/identifying info as `[REDACTED]`
- **No invented data:** Never invent customer names, quotes, or statistics

## Quick Reference

| Item | Value |
|------|-------|
| Minimum sources | 3 |
| Quote format | Verbatim with source attribution |
| PII handling | Redact as `[REDACTED]` |
| Theme threshold | Appears in 3+ sources |
| Frequency | Exact count: "N sources mention" |

## Common Mistakes

- **Summarizing instead of quoting** → Use verbatim quotes
- **Single source themes** → Requires 3+ sources minimum
- **Invented segments** → Only if explicitly stated
- **Vague impact claims** → Say "Unknown" if not stated
- **Paraphrasing** → Direct quotes with source attribution
