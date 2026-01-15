# Session Start Protocol

## Before Responding to Any Request

**ALWAYS check staleness first:**

1. Read `alerts/stale-outputs.md`
2. If any outputs are stale, report: "These outputs may be stale: [list]. Say 'refresh <skill>' to update."
3. If any downstream output is newer than its sources, report drift and ask to reconcile or refresh upstream
4. Then proceed with the user's request

## Staleness Check Format

```
⚠️ Stale outputs detected:
- outputs/insights/voc-synthesis-2026-01.md (source inputs/voc/feedback.csv changed)
- outputs/roadmap/Q1-2026-charters.md (depends on stale VOC synthesis)

Say "refresh synthesizing-voc" to update, or proceed with caution.
```

## Drift Detection

Drift occurs when a downstream output is newer than its sources. This may indicate:
- Manual edits that diverged from upstream
- Missing upstream refresh

```
⚠️ Drift detected:
- outputs/delivery/prds/feature-x.md is newer than outputs/roadmap/Q1-charters.md

Options:
1. Reconcile: Keep PRD changes, update charter to match
2. Refresh: Regenerate PRD from charter
```

## Frozen Outputs

Some outputs may be intentionally frozen (not updated despite stale sources):

Check `alerts/stale-outputs.md` for frozen section before reporting staleness.
