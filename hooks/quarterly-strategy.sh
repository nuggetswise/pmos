#!/usr/bin/env bash
# Quarterly strategy hook for PM OS
# Checks if a new quarter has started and triggers the strategy skill.

set -euo pipefail

# Determine plugin root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "$(dirname "${SCRIPT_DIR}/.." && pwd)"

# Strategy tracking file
STRATEGY_TRACKER="${PLUGIN_ROOT}/.claude/strategy-last-run"
STRATEGY_INTERVAL_DAYS=90 # Roughly a quarter

# Ensure .claude directory exists
mkdir -p "${PLUGIN_ROOT}/.claude/"

# Check when strategy was last run
should_run_strategy() {
    if [[ ! -f "${STRATEGY_TRACKER}" ]]; then
        return 0  # First time, should run
    fi

    local last_run=$(cat "${STRATEGY_TRACKER}")
    local now=$(date +%s)
    local days_since=$(( (now - last_run) / 86400 ))

    if [[ $days_since -ge $STRATEGY_INTERVAL_DAYS ]]; then
        return 0  # More than 90 days, should run
    fi

    return 1  # Too soon
}

# Main logic
main() {
    if should_run_strategy; then
        # This is where you would trigger the strategy generation.
        # For now, we'll just touch the tracker file.
        # In a real implementation, you might use a command to call the AI with the 'strategy' skill.
        echo "Running quarterly strategy generation..."
        date +%s > "${STRATEGY_TRACKER}"
    fi
}

main
exit 0
