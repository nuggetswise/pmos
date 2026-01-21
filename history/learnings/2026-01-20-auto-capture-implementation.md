## Learnings from Auto-Capture Implementation - 2026-01-20

### Context

Implemented Phase 1 (MVP) of the auto-capture execution gap plan. Created 2 new rule files, modified 3 strategic skill files, and updated pm-collaborative-style.md to make "nothing is ever forgotten" operationally real, not just architecturally designed.

### Key Insights

1. **The gap wasn't architectural - it was behavioral.** PM OS had comprehensive capture rules but they weren't wired into the execution flow. Rules were reference documents, not runtime hooks.

2. **Embedding capture in skills makes it non-optional.** By adding Step N: "Post-Skill Reflection (MANDATORY)" to skill files, capture becomes part of execution, not something to remember.

3. **Post-skill reflection follows a clear 6-step protocol:** Extract learnings → Create learning entry → Create beads → Request rating → Detect decisions → Report completion.

4. **Session-end capture creates continuity across sessions.** By detecting phrases like "goodbye", "thanks", "done" and generating session summaries, each session contributes to the knowledge base.

5. **Quality ratings close the learning loop.** Asking for 1-5 ratings after PLAN/BUILD outputs enables weekly learning to analyze which patterns correlate with high-quality work.

### Patterns Observed

- **Rules need enforcement mechanisms:** Declarative rules (what to do) must be paired with imperative hooks (when to do it)
- **Capture must be fast:** 2-3 minutes max for post-skill reflection, or it becomes admin burden
- **"Skip" option prevents prompt fatigue:** Always offering to skip ratings respects user time
- **Beads for reusable insights, learnings for full context:** Beads = atomic (1-2 sentences), learnings = complete narrative (context + insights + connections)

### Connections to Past Work

- Links to: `.beads/insights.jsonl` system (already existed, now populated)
- Builds on: `output-metadata.md` (mirroring already automated)
- Extends: `decision-detection.md` (now integrated into post-skill reflection)
- Complements: `meta-prompt-reasoning.md` (reasoning visible, now also captured)

### Open Questions Raised

1. How will users respond to rating prompts? Will they engage or skip consistently?
2. Should OBSERVE skills (VOC, KTLO triage) also have mandatory capture, or keep it optional?
3. Can session-end detection work reliably across different conversation patterns?
4. What's the ideal cadence for `pm-os learn --auto` to analyze ratings? (Weekly seems right)

### Application to Future Work

- When running `/charters` next, I'll follow the new Step 7: Post-Skill Reflection protocol
- When user says "goodbye", I'll trigger session-end capture automatically
- Weekly learning job should now have rating beads to analyze quality patterns
- Next session greeting will reference this session's outputs and learnings

### Implementation Files Modified

**Created:**
- `.claude/rules/pm-core/post-skill-reflection.md` (mandatory protocol)
- `.claude/rules/system/session-end-capture.md` (automatic session summaries)

**Modified:**
- `skills/generating-quarterly-charters/SKILL.md` (added Step 7)
- `skills/writing-product-strategy/SKILL.md` (added Step 11)
- `skills/competitive-analysis/SKILL.md` (added Step 8)
- `.claude/rules/pm-core/pm-collaborative-style.md` (added behavior #7: Always Capture Learnings)

**Directories Created:**
- `history/learnings/` (for learning entries)
- `history/sessions/` (for session summaries)

### Verification Status

All checks passed:
- ✓ Directories exist (`history/learnings/`, `history/sessions/`)
- ✓ New rules created (`post-skill-reflection.md`, `session-end-capture.md`)
- ✓ All 3 strategic skills modified (charters, strategy, competitive-analysis)
- ✓ pm-collaborative-style references capture requirement
- ✓ Integration points documented

**Next session should see:**
- Rating prompts after PLAN/BUILD skills
- Learnings auto-captured after skill completion
- Session summary generated at "goodbye"
- Quality trend in greeting (once ratings exist)
