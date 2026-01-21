# PM OS Hooks

## Overview

This directory contains scripts that automate and enhance the PM OS by hooking into specific events, such as the start of a session. These hooks are the foundation of the system's "proactive assistant" capabilities.

## How It Works

The hooks are defined and triggered by the `hooks.json` file. An external runner (part of the IDE or editor plugin) monitors for events (like a new session starting) and uses the `run-hook.cmd` wrapper to execute the appropriate scripts.

This architecture allows for event-driven automation, such as providing a status update at the start of a session or running a learning process on a schedule.

## File Descriptions

### `hooks.json`

The central manifest for all hooks. It maps events (e.g., `SessionStart`) to the scripts that should be executed when that event occurs. Currently, it triggers both `session-start.sh` and `weekly-learning.sh` upon session start.

### `run-hook.cmd`

A cross-platform wrapper script that can execute shell scripts (`.sh`) in both Windows (via Git Bash) and Unix-like environments (macOS, Linux). This allows the core logic to be written once in portable shell scripts.

### `session-start.sh`

This is a critical script that runs at the beginning of every user session. Its primary jobs are:
1.  Read the `nexa/state.json` file to get the current status of the PM OS (current phase, next recommended action, last job status, etc.).
2.  Construct a special `<session-greeting>` context block that is injected into the AI's prompt.
3.  Mandate the exact greeting and status report that the AI **must** display as its very first output, ensuring the user always has immediate context.

### `weekly-learning.sh`

This script implements the automated, long-term learning loop for the PM OS. When triggered, it:
1.  Checks if at least 7 days have passed since the last learning run by reading the timestamp in `.claude/learning-last-run`.
2.  Checks if there are enough documents in the `history/` directory to make learning worthwhile.
3.  If both conditions are met, it executes the `pm-os learn --auto` command, which analyzes the user's past work and generates new, personalized rules in the `.claude/rules/learned/` directory.

## Adding New Hooks

To add a new automated behavior:
1.  Create a new shell script (e.g., `my-new-hook.sh`) with the desired logic.
2.  Add a new entry in `hooks.json` to define when your script should be triggered.
