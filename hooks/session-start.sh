#!/usr/bin/env bash
# SessionStart hook for PM OS
# Implements "Context First, Every Request" - loads 5 dimensions at startup
# Computes status DYNAMICALLY from source files (no static nexa-status.md)

set -euo pipefail

# Determine plugin root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ============================================================================
# DYNAMIC STATUS COMPUTATION (from source files, not static status file)
# ============================================================================

# Extract active work from projects.md
active_work=""
if [ -f "${PLUGIN_ROOT}/inputs/context/projects.md" ]; then
    # Get table rows under "## Active Initiatives"
    active_work=$(sed -n '/## Active Initiatives/,/^## /p' "${PLUGIN_ROOT}/inputs/context/projects.md" 2>/dev/null | \
        grep -E "^\|.*\|$" | \
        grep -v "^| Initiative" | \
        grep -v "^|---" | \
        head -5 || echo "")
fi
if [ -z "$active_work" ]; then
    active_work="  *(no active initiatives)*"
fi

# Extract blockers from challenges.md
blockers=""
if [ -f "${PLUGIN_ROOT}/inputs/context/challenges.md" ]; then
    blockers=$(sed -n '/## Active Blockers/,/^## /p' "${PLUGIN_ROOT}/inputs/context/challenges.md" 2>/dev/null | \
        grep -E "^\|.*\|$" | \
        grep -v "^| Blocker" | \
        grep -v "^|---" | \
        head -3 || echo "")
fi
if [ -z "$blockers" ]; then
    blockers="  *(no blockers)*"
fi

# Extract algorithm phase from session-state.md
algorithm_phase="OBSERVE"
recommended_next="building-truth-base"
if [ -f "${PLUGIN_ROOT}/outputs/session-state.md" ]; then
    phase_line=$(grep "Current Phase" "${PLUGIN_ROOT}/outputs/session-state.md" 2>/dev/null || echo "")
    if [ -n "$phase_line" ]; then
        algorithm_phase=$(echo "$phase_line" | cut -d'|' -f3 | tr -d ' ' || echo "OBSERVE")
    fi
    rec_line=$(grep "Recommended Next" "${PLUGIN_ROOT}/outputs/session-state.md" 2>/dev/null || echo "")
    if [ -n "$rec_line" ]; then
        recommended_next=$(echo "$rec_line" | cut -d'|' -f3 | xargs || echo "building-truth-base")
    fi
fi

# Extract stale outputs from alerts/stale-outputs.md
stale_outputs=""
if [ -f "${PLUGIN_ROOT}/alerts/stale-outputs.md" ]; then
    stale_outputs=$(sed -n '/## Stale Outputs/,/^## /p' "${PLUGIN_ROOT}/alerts/stale-outputs.md" 2>/dev/null | \
        grep -E "^\|.*\|$" | \
        grep -v "^| Output" | \
        grep -v "^|---" | \
        grep -v "none yet" | \
        head -3 || echo "")
fi
if [ -z "$stale_outputs" ]; then
    stale_outputs="  *(none)*"
fi

# Get recent decisions
recent_decisions=""
decision_files=$(ls -t "${PLUGIN_ROOT}/outputs/decisions/"*.md 2>/dev/null | grep -v "TEMPLATE" | head -3 || echo "")
if [ -n "$decision_files" ]; then
    for file in $decision_files; do
        filename=$(basename "$file" .md)
        recent_decisions="${recent_decisions}  • ${filename}\n"
    done
else
    recent_decisions="  *(no decisions recorded)*"
fi

# Compute next actions based on current phase
next_actions=""
case "$algorithm_phase" in
    "OBSERVE")
        next_actions="1. Run building-truth-base to establish product understanding
2. Continue customer discovery (synthesizing-voc)
3. Review KTLO queue (triaging-ktlo)"
        ;;
    "THINK")
        next_actions="1. Complete analysis (analyzing-kb-gaps, competitive-analysis)
2. Review insights before planning
3. Prepare for charter generation"
        ;;
    "PLAN")
        next_actions="1. Complete quarterly charters (generating-quarterly-charters)
2. Prioritize work across charters
3. Prepare for PRD writing"
        ;;
    "BUILD")
        next_actions="1. Write PRDs for charter bets (writing-prds-from-charters)
2. Verify completeness (verification-before-completion)
3. Prepare for engineering handoff"
        ;;
    *)
        next_actions="1. Run building-truth-base to start OBSERVE phase
2. Check inputs/context for configuration
3. Review CLAUDE.md for setup guidance"
        ;;
esac

# ============================================================================
# CONTEXT LOADING: 5 Dimensions (per Kai's "Context First" model)
# ============================================================================

# Read COMPASS: Mission, Goals, Beliefs
compass_content=$(cat "${PLUGIN_ROOT}/inputs/context/compass.md" 2>/dev/null || echo "# COMPASS not configured")

# Read PROJECTS: Current Work
projects_content=$(cat "${PLUGIN_ROOT}/inputs/context/projects.md" 2>/dev/null || echo "# PROJECTS not configured")

# Read CHALLENGES: Obstacles
challenges_content=$(cat "${PLUGIN_ROOT}/inputs/context/challenges.md" 2>/dev/null || echo "# CHALLENGES not configured")

# Read PREFERENCES: Your Style
preferences_content=$(cat "${PLUGIN_ROOT}/inputs/context/preferences.md" 2>/dev/null || echo "# PREFERENCES not configured")

# Read HISTORY: Past Decisions (from outputs/decisions/)
history_files=$(ls -t "${PLUGIN_ROOT}/outputs/decisions/"*.md 2>/dev/null | grep -v "TEMPLATE" | head -5 || echo "")
history_summary=""
if [ -n "$history_files" ]; then
    for file in $history_files; do
        filename=$(basename "$file")
        history_summary="${history_summary}- ${filename}\n"
    done
else
    history_summary="*(no decisions recorded yet)*"
fi

# Read using-pm-os content
using_pm_os_content=$(cat "${PLUGIN_ROOT}/skills/using-pm-os/SKILL.md" 2>&1 || echo "Error reading using-pm-os skill")

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
# BUILD CONTEXT INJECTION (greeting FIRST, then context)
# ============================================================================

# Pre-computed greeting with dynamic values - THIS GOES FIRST
greeting_block="<session-greeting>
You are Nexa, operating PM OS. At session start, greet the user with loaded context summary.

**YOUR CONTEXT IS LOADED - Use it to inform EVERY response:**

## COMPASS (Mission, Goals, Beliefs)
${compass_content}

## PROJECTS (Current Work)
${projects_content}

## CHALLENGES (Obstacles)
${challenges_content}

## PREFERENCES (Your Style)
${preferences_content}

## HISTORY (Recent Decisions)
${history_summary}

## Algorithm Phase
Current: ${algorithm_phase}
Recommended Next: ${recommended_next}

---

**MANDATORY GREETING - YOUR FIRST OUTPUT MUST BE:**

\`\`\`
👋 Nexa here - PM OS ready.

📚 Loaded: 5 context dimensions

🔄 Algorithm Phase: ${algorithm_phase}
   Recommended: ${recommended_next}

🔥 Active Work:
${active_work}

⚠️ Needs Attention:
   Blockers: ${blockers}
   Stale: ${stale_outputs}

📋 Next Actions:
${next_actions}

Ready for your request.
\`\`\`

**ABSOLUTE REQUIREMENT:** You MUST output this greeting BEFORE doing anything else. Even if the user's first message is an action request, you output the greeting FIRST, then address their request. No exceptions. This is not optional.

**CRITICAL:** Your goals drive every response. Check COMPASS before answering.
</session-greeting>"

# Staleness check reminder
staleness_reminder="<session-protocol>
BEFORE responding to user requests, you MUST:
1. Read alerts/stale-outputs.md
2. If any outputs are stale, report: 'These outputs may be stale: [list]. Say refresh <skill> to update.'
3. If any downstream output is newer than its sources, flag drift and ask to reconcile
4. Then proceed with the user's request
</session-protocol>"

# Algorithm enforcement reminder
algorithm_reminder="<algorithm-enforcement>
BEFORE running any skill, check prerequisites per .claude/rules/pm-core/algorithm-enforcement.md:

- THINK skills require OBSERVE outputs (truth base, VOC, KTLO)
- PLAN skills require OBSERVE or THINK outputs
- BUILD skills HARD REQUIRE a charter (PLAN output)
- LEARN skills require completed work

Current phase: ${algorithm_phase}
If user requests a skill outside current phase, check prerequisites and warn/block accordingly.
</algorithm-enforcement>"

# ============================================================================
# OUTPUT JSON
# ============================================================================

using_pm_os_escaped=$(escape_for_json "$using_pm_os_content")
greeting_escaped=$(escape_for_json "$greeting_block")
staleness_escaped=$(escape_for_json "$staleness_reminder")
algorithm_escaped=$(escape_for_json "$algorithm_reminder")

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have PM OS.\n\n${greeting_escaped}\n\n${staleness_escaped}\n\n${algorithm_escaped}\n\n**Below is the full content of your 'using-pm-os' skill - your introduction to PM OS workflows:**\n\n${using_pm_os_escaped}\n</EXTREMELY_IMPORTANT>"
  }
}
EOF

exit 0
