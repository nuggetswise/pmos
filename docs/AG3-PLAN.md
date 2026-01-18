# AG3 Execution Plan (AI Engineer, No-Notifications, Low-Manual-Work)

## Goal
Make PM OS feel instant and always aware while requiring near-zero manual upkeep.

## Non-Negotiables
- No notifications, no digests, no popups.
- One source of truth: `nexa/state.json`.
- Status is always rendered from state (startup hook + `/status`).
- Auto-runs are append-only; no canonical rewrites without explicit command.

## User Flow (After)
1. Drop files anywhere under `inputs/`.
2. Watcher waits for a stability window (no edits for 90s) and ignores temp files.
3. System auto-runs delta extraction in the background.
4. At session start or `/status`, you see a 5-line brief from `nexa/state.json`.
5. If something is stale, it shows as a single next action in the brief.
6. You never open status markdowns to stay informed.

## System of Record
`nexa/state.json` is the only live state. All UIs read it, nothing else updates status.

Minimal schema:
```json
{
  "version": 1,
  "daemon": { "status": "running", "pid": 12345, "last_heartbeat_at": "..." },
  "phase": "OBSERVE",
  "next_action": "Review VOC delta (2 mins)",
  "latest_artifacts": [
    { "type": "delta", "path": "outputs/deltas/2026-01-18-voc-delta.md", "created_at": "..." }
  ],
  "brief": {
    "top_themes": ["pricing confusion", "missing export", "latency"],
    "risk_flags": ["churn risk: enterprise", "SLA breach signals"],
    "latest_delta": "VOC: 3 themes, 1 risk"
  },
  "last_job": { "id": "job_...", "result": "ok", "finished_at": "..." }
}
```

## Deprecations
- `outputs/session-state.md` is no longer written or read.
- `alerts/stale-outputs.md` is no longer written or read.

## Architecture (Minimal)
- Watcher: watches `inputs/**`, ignores temp files, and only triggers after a 90s stability window.
- Queue: append-only `nexa/commands.queue.jsonl`.
- Daemon: consumes queue, updates `nexa/state.json`, writes artifacts.
- Extractors: `voc-delta`, `jira-delta` write to `outputs/deltas/`.
- Audit log: append-only `outputs/audit/auto-run-log.md`.

## Input Handling (No Manual Gating)
- No `ready/` or `drafts/` folders required.
- Optional ignore list: `inputs/.pmosignore` (newline-delimited globs).
- Always ignore common temp files: `.DS_Store`, `*.swp`, `*.tmp`, `~*`.

### Stability Window (90s)
The watcher only enqueues a job after a file has not changed for 90 seconds. This prevents
partial or rapidly-edited files from triggering multiple runs and removes the need for
manual "ready" gating.

## Job Behavior
- Idempotency: dedupe by `{job_type, input_path, input_mtime}` or content hash.
- Rate limiting: max 1 auto-run per 10 minutes (queue otherwise).
- Outputs are append-only; canonical docs never auto-rewritten.

## Staleness
- Scan declared `sources` frontmatter on canonical outputs (if present).
- If stale, update only `nexa/state.json.next_action` and audit log.
- No notifications, no popups, no auto-rewrite.

## Ingest (Docx/PDF/PPT/Links)
- Watcher detects new files by extension and runs a local text extractor before delta jobs.
- Extracted text is written as a sidecar in `outputs/ingest/` and indexed in `nexa/state.json`.
- Supported local extractors:
  - `.docx` via `python-docx`
  - `.pptx` via `python-pptx`
  - `.pdf` via `PyPDF2` (fast) or `pdfplumber` (better layout)
- Links dropped in `inputs/` are treated as link artifacts:
  - Stored in `nexa/state.json` as pending when network access is unavailable.
  - If network access is enabled later, a fetch/ingest job can run automatically.
- Failures update `nexa/state.json.next_action` with a short remediation note; no popups.

## Integration Point
`hooks/session-start.sh` reads only `nexa/state.json` and prints the brief.

## User Flow Change (From Current State)
- Session start reads only `nexa/state.json`; it no longer scans `outputs/session-state.md`
  or `alerts/stale-outputs.md`.
- `/status` prints a short brief from `nexa/state.json`; no status markdowns needed.
- Staleness is computed by the daemon and written into `nexa/state.json.next_action`.
- Skills update `nexa/state.json` + `outputs/audit/auto-run-log.md`; no manual alert updates.

## Files To Update (Docs + Skills)
Core docs:
- `alerts/README.md`
- `outputs/README.md`
- `skills/README.md`
- `docs/GETTING_STARTED.md`
- `docs/TROUBLESHOOTING.md`
- `CLAUDE.md`

Workflow docs:
- `docs/workflows/weekly-planning.md`
- `docs/workflows/launch-planning.md`
- `docs/workflows/post-launch-review.md`
- `docs/workflows/quarterly-strategy.md`

Skills (remove `alerts/stale-outputs.md` and `outputs/session-state.md` references):
- `skills/building-truth-base/SKILL.md`
- `skills/synthesizing-voc/SKILL.md`
- `skills/triaging-ktlo/SKILL.md`
- `skills/generating-quarterly-charters/SKILL.md`
- `skills/writing-prds-from-charters/SKILL.md`
- `skills/writing-product-strategy/SKILL.md`
- `skills/planning-gtm-launch/SKILL.md`
- `skills/stakeholder-management/SKILL.md`
- `skills/analyzing-data/SKILL.md`
- `skills/analyzing-kb-gaps/SKILL.md`
- `skills/prioritizing-work/SKILL.md`

## Phased Delivery
1) State + Status
   - Define `nexa/state.json` schema.
   - Update `hooks/session-start.sh` to read only state.
   - Implement `/status` to render the 5-line brief.
2) Pipeline
   - Watcher -> queue -> daemon.
   - Implement `voc-delta` and `jira-delta` extractors.
   - Append audit log entries on every run.
3) Staleness
   - Scheduled scan.
   - Update state `next_action` only.

## Done Criteria
- Session start shows accurate status without reading any markdowns.
- Dropping a VOC/Jira file creates a delta and updates the brief.
- You can operate without ever opening a status MD file.
