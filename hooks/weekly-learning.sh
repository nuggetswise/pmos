#!/usr/bin/env bash
# Weekly learning hook for PM OS
# Analyzes history/ directories to extract patterns and update learned rules

set -euo pipefail

# Determine plugin root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Learning tracking file
LEARNING_TRACKER="${PLUGIN_ROOT}/.claude/learning-last-run"
LEARNING_INTERVAL_DAYS=7

# Ensure .claude directory exists
mkdir -p "${PLUGIN_ROOT}/.claude/rules/learned"

# Check when learning was last run
should_run_learning() {
    if [[ ! -f "${LEARNING_TRACKER}" ]]; then
        return 0  # First time, should run
    fi

    local last_run=$(cat "${LEARNING_TRACKER}")
    local now=$(date +%s)
    local days_since=$(( (now - last_run) / 86400 ))

    if [[ $days_since -ge $LEARNING_INTERVAL_DAYS ]]; then
        return 0  # More than 7 days, should run
    fi

    return 1  # Too soon
}

# Count history files to decide if learning is worthwhile
count_history_files() {
    find "${PLUGIN_ROOT}/history" -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' '
}

# Main logic
main() {
    local history_count=$(count_history_files)

    # Only suggest learning if there are enough history files (at least 5)
    if [[ $history_count -lt 5 ]]; then
        # Not enough data yet, skip silently
        exit 0
    fi

    if should_run_learning; then
        local cli_cmd=()

        if command -v pm-os >/dev/null 2>&1; then
            cli_cmd=(pm-os learn --auto)
        elif [[ -f "${PLUGIN_ROOT}/nexa/dist/index.js" ]]; then
            cli_cmd=(node "${PLUGIN_ROOT}/nexa/dist/index.js" learn --auto)
        else
            exit 0
        fi

        "${cli_cmd[@]}" >/dev/null 2>&1 || true
    fi
}

# Allow manual invocation to force learning run
if [[ "${1:-}" == "--force" ]]; then
    rm -f "${LEARNING_TRACKER}"
fi

main
exit 0
