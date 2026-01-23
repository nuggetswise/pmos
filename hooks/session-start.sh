#!/usr/bin/env bash
# SessionStart hook for PM OS
# Reads only nexa/state.json for runtime state and greeting content.

set -euo pipefail

# Determine plugin root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
STATE_PATH="${PLUGIN_ROOT}/nexa/state.json"

# --- AUTO CAPTURE ---
# Run scanner in the background to pick up new/modified files.
if [[ -f "${PLUGIN_ROOT}/nexa/dist/index.js" ]]; then
    (cd "${PLUGIN_ROOT}" && node nexa/dist/index.js session-start >/dev/null 2>&1)
    (cd "${PLUGIN_ROOT}" && node nexa/dist/index.js scan >/dev/null 2>&1 &)
fi
# --- END AUTO CAPTURE ---

# Defaults (used if state.json missing or partial)
phase="OBSERVE"
next_action="Run pm-os scan to ingest new sources"
last_id="none"
last_result="n/a"
last_finished="n/a"
ingest_count="0"
error_count="0"
recent_ingest=""

if [ -f "${STATE_PATH}" ]; then
    IFS=$'\0' read -r phase next_action last_id last_result last_finished ingest_count error_count recent_ingest < <(
        python - "${STATE_PATH}" <<'PY'
import json
import sys

state = json.load(open(sys.argv[1]))
phase = state.get("phase") or "OBSERVE"
next_action = state.get("next_action") or "Run pm-os scan to ingest new sources"
last = state.get("last_job") or {}
last_id = last.get("id") or "none"
last_result = last.get("result") or "n/a"
last_finished = last.get("finished_at") or "n/a"
ingest_index = state.get("ingest_index") or []
ingest_count = str(len(ingest_index))
error_count = str(len(state.get("errors") or []))
recent_ingest = ""
if ingest_index:
    recent_ingest = ingest_index[-1].get("source_path") or ""

print("\0".join([
    phase,
    next_action,
    last_id,
    last_result,
    last_finished,
    ingest_count,
    error_count,
    recent_ingest,
]))
PY
    )
fi

if [ -z "${recent_ingest}" ]; then
    recent_ingest="*(none)*"
fi

# ============================================================================
# JSON ESCAPE FUNCTION
# ============================================================================

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

# ============================================================================
# BUILD CONTEXT INJECTION (greeting FIRST, then protocol)
# ============================================================================

greeting_block="<session-greeting>
You are Nexa, operating PM OS. At session start, greet the user with the runtime state from nexa/state.json.

**YOUR CONTEXT IS LOADED - Use it to inform EVERY response:**

## Runtime State
Phase: ${phase}
Next Action: ${next_action}
Last Job: ${last_id} (${last_result})
Last Finished: ${last_finished}
Ingested Sources: ${ingest_count}
Errors: ${error_count}
Recent Source: ${recent_ingest}

---

**MANDATORY GREETING - YOUR FIRST OUTPUT MUST BE:**

\`\`\`
👋 Nexa here - PM OS ready.

🔄 Phase: ${phase}
👉 Next: ${next_action}

🧾 Last Job: ${last_id} (${last_result})
🕒 Finished: ${last_finished}

📥 Ingested Sources: ${ingest_count}
⚠️ Errors: ${error_count}
📄 Latest Source: ${recent_ingest}

Ready for your request.
\`\`\`

**ABSOLUTE REQUIREMENT:** You MUST output this greeting BEFORE doing anything else. Even if the user's first message is an action request, you output the greeting FIRST, then address their request. No exceptions. This is not optional.
</session-greeting>"

state_reminder="<session-protocol>
BEFORE responding to user requests, you MUST:
1. Read nexa/state.json
2. If current_job is running, report status and ask whether to wait or proceed
3. If last job failed, call out the error and suggest pm-os scan
4. Then proceed with the user's request
</session-protocol>"

# Algorithm enforcement reminder
algorithm_reminder="<algorithm-enforcement>
BEFORE running any skill, check prerequisites per .claude/rules/pm-core/algorithm-enforcement.md:

- THINK skills require OBSERVE outputs (truth base, VOC, KTLO)
- PLAN skills require OBSERVE or THINK outputs
- BUILD skills HARD REQUIRE a charter (PLAN output)
- LEARN skills require completed work

Current phase: ${phase}
If user requests a skill outside current phase, check prerequisites and warn/block accordingly.
</algorithm-enforcement>"

# ============================================================================
# OUTPUT JSON
# ============================================================================

greeting_escaped=$(escape_for_json "$greeting_block")
state_escaped=$(escape_for_json "$state_reminder")
algorithm_escaped=$(escape_for_json "$algorithm_reminder")

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have PM OS.\n\n${greeting_escaped}\n\n${state_escaped}\n\n${algorithm_escaped}\n</EXTREMELY_IMPORTANT>"
  }
}
EOF

exit 0
