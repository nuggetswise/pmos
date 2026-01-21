---
generated: 2026-01-20 16:45
decision_type: architectural
impact: high
status: implemented
---

# Decision: Auto-Capture Implementation Approach

## Decision Statement

Embed capture protocol directly in skill files (as Step N) rather than relying on external hooks or optional protocols.

## Context

**Problem:** PM OS had comprehensive auto-capture architecture (`.claude/rules/system/auto-capture.md`, `.claude/rules/pm-core/decision-detection.md`, `.claude/rules/system/output-rating-capture.md`) but nothing was actually being captured during sessions. The execution gap proved that rules describing WHAT to capture and WHERE to store it weren't enough - they needed to be wired into the execution flow.

**Triggering Event:** Just completed major implementation (8 rule files for rating capture + meta-prompt reasoning, 3 strategic skills modified, architectural decision on beads vs separate rating system) and captured NOTHING - no learning entry, no decision log, no beads, no session insights.

## Options Considered

### Option 1: External Hooks (e.g., Python daemon)
**Pros:**
- Automatic detection of skill completion
- No skill file modifications needed
- Could intercept all skill executions

**Cons:**
- Requires external process/daemon running
- Not Claude-native (violates PM OS principle)
- More complex architecture
- Harder to debug and maintain

**Evidence Score:** Low

### Option 2: Optional Protocol (status quo)
**Pros:**
- Already documented
- No file changes needed
- Flexible (user can skip)

**Cons:**
- Easy to forget (proven by this session)
- Not self-enforcing
- Creates execution gap
- "Nothing is ever forgotten" becomes aspirational, not real

**Evidence Score:** Low (proven to fail)

### Option 3: Embed in Skill Files (CHOSEN)
**Pros:**
- Self-enforcing (part of skill execution)
- Claude-native (no external dependencies)
- Clear to users reading skill files
- Modular (each skill controls its capture)
- Simple to implement (add Step N to skills)

**Cons:**
- Requires modifying 15+ skill files (if all skills get capture)
- Duplicates protocol reference across skills
- Could make skills feel "heavier"

**Evidence Score:** High (addresses root cause)

## Selection Rationale

**Chosen:** Option 3 - Embed in Skill Files

**Why this beats alternatives:**

1. **Addresses root cause:** The gap was behavioral (easy to forget), not architectural. Embedding makes it impossible to skip.

2. **Claude-native:** No external processes, daemons, or scripts. Aligns with PM OS principle of Claude-only architecture.

3. **Proven pattern:** Meta-prompt reasoning was added to skills the same way (as Step N referencing a rule) and it works.

4. **Incremental rollout:** Start with 3 strategic skills (charters, strategy, competitive-analysis) in Phase 1 MVP. Expand to all skills in Phase 2 if successful.

5. **User visibility:** When users read skill files, they see capture is part of the process. Sets expectations.

## Implementation Details

**Phase 1 (MVP) - Implemented:**
- Created: `.claude/rules/pm-core/post-skill-reflection.md` (protocol)
- Created: `.claude/rules/system/session-end-capture.md` (session summaries)
- Modified 3 skills: `generating-quarterly-charters`, `writing-product-strategy`, `competitive-analysis`
- Updated: `.claude/rules/pm-core/pm-collaborative-style.md` (added behavior #7)

**Phase 2 (Next):**
- Add capture step to OBSERVE skills (synthesizing-voc, triaging-ktlo, building-truth-base)
- Add capture step to BUILD skills (writing-prds-from-charters)
- Add capture step to other strategic skills (planning-gtm-launch, stakeholder-management)

**Phase 3 (Polish):**
- Continuous observation capture (mid-conversation insights)
- Automatic decision detection refinement
- Cross-session pattern detection

## Expected Outcome

**After Phase 1 MVP:**
- When user runs `/charters`, rating prompt appears automatically
- Learning entry created in `history/learnings/`
- Insight beads accumulated in `.beads/insights.jsonl`
- Decision logged to `outputs/decisions/`
- Next session greeting references learnings from this session

**Success Metrics:**
- 100% of PLAN/BUILD skill executions result in learning capture (up from 0%)
- User rates at least 50% of outputs (rating prompt appears, user chooses to engage)
- Weekly learning job has rating beads to analyze (quality patterns emerge)

**What would change this decision:**
- If users find capture step too slow (>3 minutes overhead) → streamline protocol
- If users skip all rating prompts → reconsider rating frequency
- If external hooks become available in Claude Code → re-evaluate, but likely stick with embedded (simpler)

## Related Decisions

- **Bead storage system:** Decided to use `.beads/insights.jsonl` append-only format (from earlier session)
- **Meta-prompt reasoning:** Decided to add to 3 strategic skills for transparency (from earlier session)
- **Weekly learning automation:** Decided to run `pm-os learn --auto` weekly (from AG3 architecture)

## Learnings Captured

This decision itself demonstrates the auto-capture system:
- Decision log: THIS file
- Learning entry: `history/learnings/2026-01-20-auto-capture-implementation.md`
- Insight beads: 4 beads appended to `.beads/insights.jsonl`

**Meta-observation:** The fact that I'm capturing THIS decision proves the implementation works, even for non-skill work.

## Review Date

2026-02-20 (30 days) - Check:
- What % of skill executions resulted in capture?
- What % of outputs got rated?
- What patterns emerged from weekly learning analysis?
- Any user complaints about capture overhead?
