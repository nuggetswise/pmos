# Learnings from Learning System Implementation - 2026-01-20

## Context
Implemented the PM OS Learning & History System to enable auto-capture of insights across sessions.

## Key Insights

1. **Claude-native architecture is simpler than external scripts**
   - PM OS runs entirely within Claude Code
   - No Python scripts or LLM API calls needed
   - Claude extracts insights inline during skill execution

2. **R.A.L.P.H. is a mental model, not a pipeline**
   - Read, Analyze, Learn, Propose, Harmonize describes how Claude processes information
   - Every skill already follows this pattern implicitly
   - Beads architecture makes "Learn" and "Harmonize" persistent

3. **Beads complement human-readable outputs**
   - `history/learnings/` = human-readable summaries
   - `.beads/insights.jsonl` = machine-readable atoms
   - Both serve different purposes in the learning loop

4. **Auto-capture must be selective**
   - Not every piece of information is a bead
   - Quality gates: Is it new? Useful? Actionable?
   - Avoid capturing obvious information or duplicates

5. **History structure enables learning**
   - `history/sessions/` for session summaries
   - `history/learnings/` for skill-specific insights
   - `history/decisions/` for decision logs
   - All feed into the learning system

## Patterns Observed
- Implementation decisions often come in pairs: "what to do" + "what NOT to do"
- Architecture plans written before understanding execution context tend to over-engineer

## Connections
- Links to: `.claude/rules/system/auto-capture.md` (auto-capture protocol)
- Links to: `beads_plan.md` (revised architecture)
- Links to: Custom History System diagram (user's mental model)

## Open Questions
- How many beads before index.json needs optimization?
- What's the right decay/relevance scoring for old beads?
- Should session summaries be generated automatically or on request?

---

## Claims Ledger

| Claim | Type | Source |
|-------|------|--------|
| PM OS runs entirely within Claude Code | Evidence | CLAUDE.md:1-10 |
| Original beads_plan.md proposed external Python scripts | Evidence | beads_plan.md (original):43-63 |
| Auto-capture rule created and functional | Evidence | .claude/rules/system/auto-capture.md |
| History directories exist | Evidence | history/sessions/, history/learnings/ |
| Beads storage initialized | Evidence | .beads/insights.jsonl, .beads/index.json |
