#!/usr/bin/env bash
# UserPromptSubmit hook for PM OS
# Detects session-end phrases and triggers session summary capture.
#
# Per Claude Code docs, this hook receives JSON via stdin with the user's prompt.
# If we detect a "goodbye" pattern, we trigger summary generation and inject context.

set -euo pipefail

# Determine paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Read JSON input from stdin
input=$(cat)

# Extract the user's prompt text from the hook input
# The hook input has format: { "prompt": "user's message", ... }
# We need to extract the prompt field
user_prompt=$(echo "$input" | python3 -c "
import json
import sys
try:
    data = json.load(sys.stdin)
    # UserPromptSubmit provides prompt in different ways
    # Check for 'prompt' or 'content' field
    prompt = data.get('prompt', data.get('content', ''))
    print(prompt.lower())
except:
    print('')
" 2>/dev/null || echo "")

# Check for session-end phrases
if echo "$user_prompt" | grep -qiE '\b(goodbye|bye|see you|done for (today|now)|that.s (all|it)|end session|log off|sign off)\b'; then
    # This looks like a session end - trigger summary generation

    if [[ -f "${PROJECT_ROOT}/nexa/dist/index.js" ]]; then
        # Run summarize-session and capture the output file path
        summary_output=$(cd "${PROJECT_ROOT}" && node nexa/dist/index.js summarize-session 2>&1 || echo "")
        summary_file=$(echo "$summary_output" | grep -oE 'history/sessions/[^ ]+' || echo "")
    fi

    # Output JSON to inject context into Claude
    if [[ -n "$summary_file" ]]; then
        cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "<session-end-detected>Session end detected. A draft summary was created at ${summary_file}.

CRITICAL RULES FOR FILLING IN THE SUMMARY:
1. ONLY fill in sections where you have ACTUAL data from THIS session
2. For 'Outputs Created' - ONLY list files YOU actually created/modified this session
3. For 'Skills Executed' - ONLY list skills YOU actually ran (e.g., /charters, /prd)
4. For 'Key Decisions Made' - ONLY decisions explicitly discussed this session
5. For 'Open Items' - ONLY items that emerged from THIS session's work
6. DO NOT pull generic data from projects.md, challenges.md, or other COMPASS context files
7. If you don't have specific data for a section, write '(No data from this session)' - do NOT infer

ACTION REQUIRED: You MUST use the Read tool to read ${summary_file}, then use the Edit tool to fill in the AI sections with actual session data, then acknowledge the session end.</session-end-detected>"
  }
}
EOF
    else
        # No summary file but still detected session end
        cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "<session-end-detected>Session end detected. Complete any pending capture and acknowledge the session end to the user.</session-end-detected>"
  }
}
EOF
    fi
fi

# Exit 0 to allow the prompt to proceed (never block)
exit 0
