# Session State Protocol

## Purpose

Track "what was I doing right now" to enable resume after interruptions. Makes PM OS usable across real PM life: meetings interrupt you, context resets, you switch initiatives.

## Distinct From Initiative STATE.md

| File | Scope | Persistence | Purpose |
|------|-------|-------------|---------|
| initiative `STATE.md` | Initiative status | Permanent | Where is this initiative overall? |
| `outputs/session-state.md` | Current work session | Daily (ephemeral) | What was I doing right now? |

Session state should expire naturally (daily), while initiative state persists.

## When to Update Session State

| Trigger | Action |
|---------|--------|
| Starting a skill | Create/update session state with skill name, phase |
| Completing a step | Update progress (step X of Y) |
| Making a decision | Log in decisions section |
| Hitting a blocker | Log in blockers section |
| Completing a skill | Clear session state or mark complete |

## Session State File

Location: `outputs/session-state.md`

See template for structure.

## On Session Resume

When starting a new session:

1. Check if `outputs/session-state.md` exists and was modified today
2. If yes, offer resume:
   ```
   📍 Previous session detected:
   - Skill: [skill name]
   - Phase: [current phase]
   - Progress: [X of Y steps]
   - Blockers: [any blockers]

   Continue from where you left off, or start fresh?
   ```
3. If resuming:
   - Re-check staleness of sources used so far (sources may have changed)
   - Review any decisions made in previous session
   - Continue from last completed step

## Session Start Behavior (Updated)

**Before responding to any request:**

1. Read `alerts/stale-outputs.md` (existing protocol)
2. Check `outputs/session-state.md` for active session:
   - If exists and modified today → offer resume
   - If stale (modified before today) → ignore (let user start fresh)
3. Report any stale outputs
4. Then proceed with the user's request

## Clearing Session State

Session state should be cleared when:
- Skill completes successfully
- User explicitly says "start fresh" or "clear session"
- User starts a different skill (update to new skill)

Do NOT clear session state:
- On session end (let it persist for resume)
- On partial completion (needed for resume)

## Integration with Deviation Rules

If a deviation occurs during session:
1. Log deviation in session state decisions section
2. Follow deviation rules (`.claude/rules/pm-core/deviation-rules.md`)
3. If deviation requires user input, mark as blocker

## Example Session State Flow

```
Session 1: Start charter generation
├── Update session-state.md: skill=generating-quarterly-charters, phase=gathering
├── Complete Step 1 (gather sources) → update progress
├── [INTERRUPTION - meeting]
└── Session ends

Session 2: Resume
├── Check session-state.md → found, modified today
├── Offer: "Continue charter generation from Step 2?"
├── User: "yes"
├── Re-check source staleness
├── Continue from Step 2
├── Complete skill → clear session state
└── Session ends
```
