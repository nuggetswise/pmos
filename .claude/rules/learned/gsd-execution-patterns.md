---
generated: 2026-01-17 14:30
skill: learning-from-history
analyzed_skill: gsd-integration
sample_size: 1
sources:
  - enggfeedback.md (modified: 2026-01-17)
  - inputs/context/my-context.md (modified: 2026-01-16)
temperature: warm
review_by: 2026-02-17
---

# Learned Patterns: GSD Execution Integration

## Analysis Summary

- **Analysis type:** External methodology comparison
- **Domain:** PM OS execution-layer improvements
- **Confidence:** Medium (single analysis, needs validation through use)
- **Context:** PM for legacy product in KTLO mode with constant interruptions (biweekly sprints, weekly discovery)

## Patterns to Adopt (P0)

### Pattern 1: Goal-Backward Verification

**What:** Start from outcome, verify it exists and works (not just "sections completed")

**Evidence:** Eng feedback Value 9/10, Effort 2/10

**Apply to:** generating-quarterly-charters, writing-prds-from-charters, building-truth-base

**Implementation:** 5-8 checkbox verification at end of each skill

**Integration with Evidence Discipline:** Goal-backward verification feeds Claims Ledger - adds row "Output achieves stated goal | Verified/Failed | Goal-backward check"

### Pattern 2: Session State Tracking

**What:** Track current work, decisions made, blockers, resume instructions

**Evidence:** Eng feedback Value 8/10; user context shows constant interruptions (biweekly sprints, weekly discovery)

**Implementation:**
- Ephemeral session-state.md (daily expiry)
- Distinct from initiative STATE.md (permanent)
- On resume: re-check staleness of sources used so far

### Pattern 3: Deviation Rules

**What:** 4 prioritized rules for handling off-plan situations

**Evidence:** Eng feedback Value 7/10; legacy KTLO product = frequent deviations

**Implementation:** .claude/rules/pm-core/deviation-rules.md

| Priority | Situation | Action |
|----------|-----------|--------|
| 1 | Missing source file | Pause, ask user |
| 2 | Conflicting data | Flag in Open Questions, use most recent |
| 3 | Scope creep mid-skill | Document as "Out of Scope", continue |
| 4 | Fundamental assumption invalidated | STOP, checkpoint with user |

### Pattern 4: Step Checkpoints (not token %)

**What:** Checkpoint after specific steps, not at token percentages

**Evidence:** Eng feedback - token % not measurable without tooling

**Implementation:** Add checkpoint markers to long skills (after Step X, not at 60%/70%)

## Patterns to Skip

### XML Task Formatting

**Why skip:** Solves codebase problem, not PM problem. Checklists suffice.

**Evidence:** Eng feedback Value 2/10, Effort 7/10

### 11 Specialized Agents

**Why skip:** Mode prompts within skills accomplish same goal with less ceremony.

**Evidence:** Eng feedback Value 4/10, Effort 9/10

### Wave-Based Execution (as infrastructure)

**Why skip (mostly):** PM work is mostly sequential (inputs -> truth base -> charters -> PRDs)

**Exception:** Document as pattern for specific parallel cases:
- Multi-segment VOC analysis
- Alternative charter framings
- Parallel competitive analysis

**Evidence:** Eng feedback Value 3/10; my assessment Value 5/10 for pattern documentation

## Critical Analysis Log

### Where Position Changed

| Item | Original | Revised | Reasoning |
|------|----------|---------|-----------|
| Session state | P1 | P0 | User has biweekly sprints, weekly discovery = constant interruptions. Daily usability depends on resume capability. |
| Deviation rules | P1 | P0 | Legacy product in KTLO mode = deviations are daily reality, not edge case. |
| Context budget | Token % | Step checkpoints | Claude Code doesn't expose token count. Step-based checkpoints are implementable. |

### Where I Disagree With Engineering

| Item | Eng Says | My Position | Reasoning |
|------|----------|-------------|-----------|
| Wave execution | Skip entirely (Value 3) | Document as pattern (Value 5) | PM work CAN be parallelized in specific cases. Not infrastructure, but worth documenting. |

### What Engineering Missed

1. **Evidence discipline integration** - How goal-backward verification feeds Claims Ledger
2. **Staleness on resume** - If resuming mid-skill, need to re-check source freshness
3. **User context prioritization** - Which skills get verification first should be informed by user's current priorities

## Sources Used

- enggfeedback.md (engineering review with Value/Effort scores)
- inputs/context/my-context.md (user role, constraints, operating cadence)
- GSD repo: github.com/glittercowboy/get-shit-done (24 commands, 11 agents - reviewed externally)
- Daniel Miessler Personal AI Infrastructure (memory system concept - "History feeds future context")

## Claims Ledger

| Claim | Type | Source |
|-------|------|--------|
| Goal-backward verification is Value 9, Effort 2 | Evidence | enggfeedback.md:29-42 |
| Session state is Value 8, Effort 2-3 | Evidence | enggfeedback.md:46-57 |
| Deviation rules is Value 7, Effort 2 | Evidence | enggfeedback.md:61-69 |
| User has biweekly sprints, weekly discovery | Evidence | inputs/context/my-context.md:42-44 |
| Legacy product 5+ years without significant innovation | Evidence | inputs/context/my-context.md:35 |
| Token % not measurable without tooling | Evidence | enggfeedback.md:79-86 |
| Wave execution has parallel use cases in PM | Assumption | Needs validation through use |
| XML task formatting is over-engineering for PM | Evidence | enggfeedback.md:139-143 |
| 11 specialized agents is overkill | Evidence | enggfeedback.md:145-149 |
