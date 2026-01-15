#!/usr/bin/env bash
# SessionStart hook for PM OS

set -euo pipefail

# Determine plugin root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Read using-pm-os content
using_pm_os_content=$(cat "${PLUGIN_ROOT}/skills/using-pm-os/SKILL.md" 2>&1 || echo "Error reading using-pm-os skill")

# Staleness check reminder (per CLAUDE.md session start protocol)
staleness_reminder="<session-protocol>
BEFORE responding to user requests, you MUST:
1. Read alerts/stale-outputs.md
2. If any outputs are stale, report: 'These outputs may be stale: [list]. Say refresh <skill> to update.'
3. If any downstream output is newer than its sources, flag drift and ask to reconcile
4. Then proceed with the user's request
</session-protocol>"

# Escape outputs for JSON using pure bash
escape_for_json() {
    local input="$1"
    local output=""
    local i char
    for (( i=0; i<${#input}; i++ )); do
        char="${input:$i:1}"
        case "$char" in
            $'\\') output+='\\' ;;
            '"') output+='\"' ;;
            $'\n') output+='\n' ;;
            $'\r') output+='\r' ;;
            $'\t') output+='\t' ;;
            *) output+="$char" ;;
        esac
    done
    printf '%s' "$output"
}

using_pm_os_escaped=$(escape_for_json "$using_pm_os_content")
staleness_escaped=$(escape_for_json "$staleness_reminder")

# Output context injection as JSON
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have PM OS.\n\n${staleness_escaped}\n\n**Below is the full content of your 'using-pm-os' skill - your introduction to PM OS workflows:**\n\n${using_pm_os_escaped}\n</EXTREMELY_IMPORTANT>"
  }
}
EOF

exit 0
