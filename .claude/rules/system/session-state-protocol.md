# Session State Protocol

Session state is tracked in `nexa/state.json`. This is the single source of truth
for what is happening now, what just finished, and what should happen next.

## Required Fields

- `phase`: Current algorithm phase (OBSERVE/THINK/PLAN/BUILD/LEARN)
- `current_job`: Active work (or null when idle)
- `next_action`: One-line recommendation for the user
- `last_job`: Most recent completed job metadata
- `errors`: Recent failures (if any)

## When to Update State

1. **Start a skill/job**
   - Set `current_job` with id, skill, status=running
2. **Complete a skill/job**
   - Set `current_job` to null
   - Write `last_job` with result and timestamp
   - Update `phase` and `next_action` if needed
3. **Failure**
   - Append to `errors`
   - Set `last_job.result` = failed

## Session Resume Behavior

At session start:
- If `current_job` is running, report it and ask whether to resume or reset.
- If `last_job` failed, call out the error and recommend `pm-os scan` or rerun.

## Interaction With Hooks

`hooks/session-start.sh` reads only `nexa/state.json` for the greeting and status.
