# PM OS Hooks

## Overview

This directory contains scripts that automate and enhance PM OS by hooking into specific Claude Code events. These hooks are the foundation of the system's "proactive assistant" capabilities.

## Configuration

**IMPORTANT:** Claude Code reads hooks from settings files, NOT from `hooks.json` in this directory.

### Settings File Locations (in order of precedence)

1. `~/.claude/settings.json` - User-level settings (applies to all projects)
2. `.claude/settings.json` - Project-level settings (version controlled)
3. `.claude/settings.local.json` - Local project settings (not committed)

### Current Configuration

The hooks are configured in both `~/.claude/settings.json` (for this user) and `.claude/settings.json` (for portability). See the [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks) for the full specification.

## Available Hooks

### `session-start.sh`

**Event:** `SessionStart` (startup, resume, clear, compact)

This is a critical script that runs at the beginning of every user session. Its jobs are:
1. Run `pm-os session-start` to record the session start time
2. Run `pm-os scan` in background to pick up new documents
3. Read `nexa/state.json` to get current PM OS status
4. Construct a `<session-greeting>` context block injected into Claude
5. Mandate the exact greeting format the AI must display

### `prompt-detector.sh`

**Event:** `UserPromptSubmit` (every user message)

Detects session-end phrases in user messages and triggers session capture:
1. Reads the user's prompt from stdin (JSON format per Claude Code hooks spec)
2. Checks for patterns like "goodbye", "thanks", "done for today"
3. If detected, runs `pm-os summarize-session` to create a draft summary
4. Outputs JSON with `hookSpecificOutput` to inject context telling Claude to complete the summary

### `session-end.sh`

**Event:** `SessionEnd` (actual session termination)

Runs when the session actually terminates (user closes terminal, runs `/exit`, etc.):
1. Runs `pm-os summarize-session` synchronously
2. Outputs JSON with `hookSpecificOutput` for context injection

**Note:** `SessionEnd` only fires on actual termination, not when user says "goodbye". Use `prompt-detector.sh` (via `UserPromptSubmit`) for phrase detection.

### `weekly-learning.sh`

**Event:** `SessionStart`

Implements the automated, long-term learning loop:
1. Checks if at least 7 days have passed since the last learning run
2. Checks if there are enough documents in `history/` to make learning worthwhile
3. If conditions met, executes `pm-os learn --auto` to generate personalized rules

## Hook Output Format

Per Claude Code hooks spec, hooks output JSON with `hookSpecificOutput`:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<context-tag>Content injected into Claude...</context-tag>"
  }
}
```

This `additionalContext` gets injected into Claude's context, allowing hooks to provide information or instructions.

## Environment Variables

Available in hook commands (per Claude Code docs):

- `CLAUDE_PROJECT_DIR` - Absolute path to project root
- `CLAUDE_CODE_REMOTE` - "true" if remote (web), empty if local CLI
- `CLAUDE_ENV_FILE` - (SessionStart/Setup only) File for persisting environment variables

## File Descriptions

| File | Purpose |
|------|---------|
| `hooks.json` | **DEPRECATED** - Documentation only, not read by Claude Code |
| `run-hook.cmd` | Cross-platform wrapper for running .sh scripts |
| `session-start.sh` | Session start greeting and status injection |
| `prompt-detector.sh` | Detects "goodbye" phrases, triggers session capture |
| `session-end.sh` | Runs on actual session termination |
| `weekly-learning.sh` | Weekly automated learning trigger |

## Adding New Hooks

1. Create a new shell script in this directory
2. Add the hook configuration to `.claude/settings.json`:

```json
{
  "hooks": {
    "EventName": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/hooks/your-script.sh"
          }
        ]
      }
    ]
  }
}
```

3. Also update `~/.claude/settings.json` for user-level configuration
4. Update this README with documentation

## Testing Hooks

Enable debug mode to see hook execution:

```bash
claude --debug
```

This shows which hooks are registered, execution details, and output/errors.

## References

- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks)
