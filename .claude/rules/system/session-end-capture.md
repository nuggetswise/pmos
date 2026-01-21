# Session End Capture

## Purpose

Automatically generates session summaries when users end a session, capturing meta-insights and connecting work across sessions. Completes the "nothing is ever forgotten" learning loop.

## When to Apply

Detect session end when user uses these phrases:
- "goodbye", "bye", "see you"
- "thanks", "thank you" (as closing, not mid-conversation)
- "done", "that's all", "that's it"
- "end session", "log off", "sign off"
- User hasn't responded for 5+ minutes (passive detection - optional)

**Do NOT trigger on:**
- Mid-conversation "thanks" (followed by more work)
- "done" with clarifying question after
- Brief pauses (under 5 minutes)

## The Protocol

When session end is detected:

### Step 1: Generate Session Summary

Create summary using template below and write to `history/sessions/YYYY-MM-DD-HH-MM-summary.md`:

```markdown
---
session_start: YYYY-MM-DD HH:MM
session_end: YYYY-MM-DD HH:MM
duration: [X] minutes
---

# Session Summary: YYYY-MM-DD HH:MM

## What Was Accomplished

### Skills Executed
- [skill-name]: [brief outcome]
- [skill-name]: [brief outcome]

### Outputs Created
- [file path]: [what it is]
- [file path]: [what it is]

### Non-Skill Work
- [Implementation/investigation done without skill]

## Key Decisions Made

| Decision | Rationale | Location |
|----------|-----------|----------|
| [Decision 1] | [Why] | [File or "Not logged"] |
| [Decision 2] | [Why] | [File or "Not logged"] |

## Insights Captured

**Learnings:**
- [Count] learning entries in `history/learnings/`
- [Count] insight beads in `.beads/insights.jsonl`

**Key Patterns:**
- [Pattern 1 observed this session]
- [Pattern 2 observed this session]

**Connections:**
- [How this session connected to past work]

## Output Ratings

**IMPORTANT: Only include ratings explicitly provided by the user during this session.**
**NEVER self-assign ratings. Nexa does not rate its own work.**

| Output | Rating | Feedback |
|--------|--------|----------|
| [file] | [user-provided 1-5] | [User comment if provided] |

**If no user-provided ratings this session:** Write "No outputs were rated by user this session"

**Quality Trend:**
- [If ratings exist: "Session avg: X/5, Overall avg: Y/5"]
- [If no ratings: "No outputs rated this session"]

## Open Items for Next Session

### Follow-Up Actions
- [ ] [Action 1 - what needs to happen next]
- [ ] [Action 2 - user mentioned but didn't start]

### Blocked/Waiting
- [Item waiting on external input]
- [Blocker identified but not resolved]

### Questions Raised
- [Open question 1]
- [Open question 2]

## Session Metadata

**Next Recommended Action:** [From nexa/state.json or based on open items]

**Files Modified:** [Count]

**Skills Used:** [Count]

**Capture Stats:**
- Learning entries: [N]
- Insight beads: [N]
- Decision logs: [N]
- Output ratings: [N]

## User Satisfaction Signal

[If user explicitly expressed satisfaction/frustration, note it here]
- Positive indicators: "great", "perfect", "exactly what I needed"
- Neutral: No signal
- Negative: "not quite right", "missing X", frustration language

**For next session:** [Any preferences or adjustments to note]
```

### Step 2: Create Session-Level Beads

For meta-insights that span the session (not specific to one skill), create beads:

**Examples of session-level insights:**
- "User prefers concise explanations over verbose detail" (preference)
- "3 skills revealed recurring sync speed theme" (pattern)
- "Decision-making accelerated when evidence tables used" (workflow)

**Bead schema:**
```json
{
  "id": "bead_YYYYMMDD_HHMMSS_XXX",
  "type": "insight|pattern|preference",
  "content": "Session-level insight",
  "source": "session-YYYY-MM-DD-HH-MM",
  "created_at": "ISO timestamp",
  "tags": ["session-meta", "tag2"],
  "confidence": "medium",
  "connections": ["bead_from_skill_1", "bead_from_skill_2"]
}
```

### Step 3: Update State

Update `nexa/state.json`:
- Set `current_job` to null (session ending)
- Update `last_job` with session summary info
- Update `next_action` based on open items

### Step 4: Respond to User

Acknowledge the session end with brief summary:

```
Session summary saved → history/sessions/YYYY-MM-DD-HH-MM-summary.md

This session:
- [N] outputs created
- [N] learnings captured
- [N] decisions logged

Top insight: [Most significant learning from session]

See you next time!
```

**Keep it brief** - user is leaving, don't overload them.

## Session Greeting Integration

At next session start, the greeting should reference the last session:

```
👋 Nexa here - PM OS ready.

Last session (YYYY-MM-DD): [Brief summary of what was done]
- Open items: [Count from last session summary]
- Quality trend: [If ratings exist]

[Rest of normal greeting]
```

This creates continuity across sessions.

## Quality Gates

Before completing session end capture:

- [ ] Session summary file created in `history/sessions/`
- [ ] All outputs from session listed
- [ ] Key decisions documented (or noted as "not logged")
- [ ] Capture stats calculated (learnings, beads, decisions, ratings)
- [ ] Open items for next session identified
- [ ] Next recommended action updated in state
- [ ] Session-level beads created (if applicable)
- [ ] User acknowledged with brief confirmation

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
|--------------|--------------|---------|
| **Verbose summary** | User is leaving, don't delay | Keep confirmation brief |
| **Forcing session end** | User said "thanks" mid-work | Check context before triggering |
| **No open items** | Next session starts blind | Always capture what's next |
| **Missing capture stats** | Can't see learning velocity | Count learnings/beads/decisions |
| **Generic summaries** | "We did some work" | Specific: what outputs, what insights |

## Example Flow

```
User: That's perfect, thanks! I'm done for today.

Nexa: --- DETECTING SESSION END ---
      Trigger: "thanks" + "done for today"
      Confirmed: Session end

      --- GENERATING SUMMARY (internal) ---
      Outputs: Q1-2026-charters.md, competitive-analysis-2026-01-20.md
      Learnings: 2 entries, 4 beads
      Decisions: 1 logged (charter prioritization)
      Ratings: 1 (charters: 5/5)
      Open items: Run /prd for Charter 1, schedule stakeholder review
      --- END SUMMARY ---

      Writing: history/sessions/2026-01-20-16-30-summary.md
      Updating: nexa/state.json

Nexa: Session summary saved → history/sessions/2026-01-20-16-30-summary.md

      This session:
      - 2 outputs created (charters, competitive analysis)
      - 2 learnings captured
      - 1 decision logged

      Top insight: VOC+KTLO convergence creates strong charter signals

      See you next time!
```

## Passive Session End (Optional)

If user hasn't responded for 5+ minutes and there's work to capture:

1. **Wait 5 minutes of silence**
2. **Generate summary** (same protocol)
3. **Don't interrupt user** - just save summary
4. **Next session greeting** will reference it

This ensures capture happens even if user closes tab without saying goodbye.

**Implementation note:** This requires session timeout detection, which may not be available in all environments. If not available, only trigger on explicit phrases.

## Relationship to Other Rules

| Rule | Relationship |
|------|-------------|
| `.claude/rules/system/session-greeting.md` | Next session references this summary |
| `.claude/rules/system/auto-capture.md` | This is session-level capture |
| `.claude/rules/pm-core/post-skill-reflection.md` | Skills capture individual, this captures session |
| `nexa/state.json` | Updated with session end metadata |

## Why This Matters

**Without session-end capture:**
- Sessions end with no record of what happened
- Next session starts cold
- Cross-session patterns invisible
- No measure of session productivity

**With session-end capture:**
- Every session contributes to knowledge base
- Next session has context
- Patterns visible across time
- Session productivity measurable

**The experience:**
- Session 1: "Let me analyze your VOC" (no memory)
- Session 2: "Last time we found 3 themes. Let's build on that..." (continuity)
- Session 5: "You've rated 8 outputs avg 4.6/5. Your high-rated charters all have X..." (learning)

This is what makes PM OS a true 2nd brain - **nothing is ever forgotten**, session to session.
