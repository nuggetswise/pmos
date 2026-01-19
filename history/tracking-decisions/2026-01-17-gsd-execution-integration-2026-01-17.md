---
generated: 2026-01-17 10:00
skill: tracking-decisions
review_date: 2026-04-17
status: open
temperature: warm
---

# Decision: Adopt GSD Execution-Layer Patterns for PM OS

## Decision Statement
We decided to integrate 4 execution-layer primitives from GSD (goal-backward verification, session state tracking, deviation rules, step checkpoints) into PM OS because the planning layer is strong but execution hygiene gaps cause context rot, incomplete verification, and lost work during interruptions.

## Context
PM OS has robust **planning-layer** capabilities:
- Evidence discipline with Claims Ledger
- Staleness tracking via dependency graphs
- Modular skills with verification checklists

However, daily usage revealed **execution-layer** gaps:
- Context degrades in long sessions (context rot)
- "Completed" outputs sometimes miss the actual goal (verification gap)
- Interruptions (meetings, context switches) lose work state
- No guidance for handling off-plan situations (missing sources, conflicting data)

Engineering review of GSD patterns identified targeted additions that address these gaps without importing GSD's full complexity (24 commands, 11 agents, TDD assumptions).

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| A: Import full GSD system | Comprehensive execution coverage | 24 commands, 11 agents = massive complexity for PM work |
| B: Cherry-pick P0 primitives (chosen) | Highest ROI mechanics, minimal ceremony | Won't have wave-based parallelism, specialized agents |
| C: Do nothing (status quo) | No implementation effort | Execution gaps persist, daily usability suffers |

## Tradeoffs
**What we gain:**
- Goal-backward verification catches "completed but wrong" (highest-value failure mode)
- Session resume works with real PM life (constant interruptions)
- Deviation rules prevent flailing when sources conflict or are missing
- Step checkpoints mitigate context rot in long sessions

**What we lose:**
- Wave-based parallelism (low value for PM work - dependencies are social/data, not code)
- XML task plans + atomic commits (solves codebase problems, not PM problems)
- Specialized agents (11 agents is overkill - mode prompts suffice)

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Adds ceremony without value | Low | Medium | Keep each primitive small (4 rules, 5-8 checkboxes max) |
| Double state confusion (session vs initiative) | Medium | Low | Clear documentation: nexa/state.json is ephemeral (daily), initiative STATE.md is permanent |
| Token % tracking unreliable | High | Low | Implement as step checkpoints, not token percentages |

## Reversibility
- [x] **Two-way door** (easy to reverse, experiment)

All primitives are modular files in `.claude/rules/`. Can remove any that prove unhelpful.

## Decision
**Chosen:** Option B - Cherry-pick P0 primitives

**Rationale:**
- Goal-backward verification (Value 9, Effort 2) has highest ROI `[Evidence: enggfeedback.md:29-42]`
- Session state tracking (Value 8, Effort 2-3) matches user context: constant interruptions from sprints, discovery `[Evidence: inputs/context/my-context.md:42-44, enggfeedback.md:46-57]`
- Deviation rules (Value 7, Effort 2) critical for legacy KTLO product where unexpected situations are common `[Evidence: enggfeedback.md:63-69]`
- Token % not measurable without tooling, so implement as step-based checkpoints `[Evidence: enggfeedback.md:79-86]`

## Communication Plan

| Audience | Message | Channel | By When |
|----------|---------|---------|---------|
| Self (PM) | New execution primitives available | CLAUDE.md update | 2026-01-17 |
| Future sessions | Auto-loaded via .claude/rules/ | Rule files | Automatic |

## Success Criteria
- [ ] Goal-backward verification triggers on charter/PRD/truth-base completion
- [ ] Session resume works: interrupt mid-skill → restart → resume prompt appears
- [ ] Deviation rules fire on missing source or conflicting data
- [ ] No increase in ceremony time (primitives feel natural, not burdensome)

## Review Date
**Check back:** 2026-04-17

---

## Sources Used
- enggfeedback.md
- inputs/context/my-context.md

## Claims Ledger

| Claim | Type | Source |
|-------|------|--------|
| Goal-backward verification Value 9, Effort 2 | Evidence | enggfeedback.md:29-42 |
| Session state Value 8, Effort 2-3 | Evidence | enggfeedback.md:46-57 |
| Deviation rules Value 7, Effort 2 | Evidence | enggfeedback.md:63-69 |
| User has constant interruptions (sprints, discovery) | Evidence | inputs/context/my-context.md:42-44 |
| Token % not measurable without tooling | Evidence | enggfeedback.md:79-86 |
| PM work dependencies are social/data, not parallelizable like code | Assumption | inferred from PM workflow nature |
| Step checkpoints sufficient proxy for context budget | Assumption | engineering recommendation |
