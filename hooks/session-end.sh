#!/usr/bin/env bash
# SessionEnd hook for PM OS
# Runs when the actual session terminates (user closes terminal, /exit, etc.)
# Triggers session summary generation and outputs JSON for context injection.

set -euo pipefail

# Determine paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

summary_file=""

if [[ -f "${PROJECT_ROOT}/nexa/dist/index.js" ]]; then
    # Run summarize-session synchronously and capture output
    summary_output=$(cd "${PROJECT_ROOT}" && node nexa/dist/index.js summarize-session 2>&1 || echo "")
    summary_file=$(echo "$summary_output" | grep -oE 'history/sessions/[^ ]+' || echo "")
fi

# Output JSON with hookSpecificOutput so Claude sees the result
if [[ -n "$summary_file" ]]; then
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionEnd",
    "additionalContext": "<session-end-capture>Session ending. Summary draft created at ${summary_file}.

CRITICAL: When completing the summary:
- ONLY use data from THIS session (what you actually did)
- DO NOT pull from projects.md, challenges.md, or COMPASS files
- If no data for a section, write '(No data from this session)'

ACTION REQUIRED: You MUST use the Read tool to read the summary file, then use the Edit tool to complete it.</session-end-capture>"
  }
}
EOF
else
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionEnd",
    "additionalContext": "<session-end-capture>Session ending. Summary generation completed.</session-end-capture>"
  }
}
EOF
fi

exit 0
