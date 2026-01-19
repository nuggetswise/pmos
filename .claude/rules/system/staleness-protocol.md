# Staleness Protocol

Staleness is inferred from source updates and output timestamps, not a manual
alerts file. Use `nexa/state.json` and `outputs/audit/auto-run-log.md` to
determine whether sources have changed since the last output.

## Before Responding to Any Request

1. Read `nexa/state.json` for the last scan time and current job status.
2. If the user requests a refresh-sensitive output, recommend `pm-os scan` to
   ingest recent source changes before regenerating.
3. If outputs are older than their inputs (based on output metadata), flag drift
   and ask whether to refresh upstream outputs first.

## Drift Detection (Practical Rule)

If an output's `generated` timestamp is older than any of its listed sources,
consider it stale and recommend a refresh of that output and any downstream
dependencies.
