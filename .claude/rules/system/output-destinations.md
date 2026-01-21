# Output Destinations

This file tracks where different PM outputs are stored and their history directories.

## Output Type Mapping

| Output Type | Location | History |
|-------------|----------|---------|
| **Ingested documents** | `outputs/ingest/` | *(managed by daemon)* |
| **Delta summaries** | `outputs/deltas/` | *(managed by daemon)* |
| **Audit log** | `outputs/audit/` | *(append-only)* |
| Discovery outputs | `outputs/discovery/` | `history/discovery/` |
| Truth base | `outputs/truth_base/` | `history/building-truth-base/` |
| VOC synthesis | `outputs/insights/` | `history/synthesizing-voc/` |
| KB gap analysis | `outputs/insights/` | `history/analyze/kb/` |
| KTLO triage | `outputs/ktlo/` | `history/triaging-ktlo/` |
| Quarterly charters | `outputs/roadmap/` | `history/generating-quarterly-charters/` |
| PRDs | `outputs/delivery/` | `history/writing-prds-from-charters/` |
| Stakeholder maps | `outputs/stakeholders/` | `history/stakeholder-management/` |
| GTM docs | `outputs/gtm/` | `history/planning-gtm-launch/` |
| Product strategy | `outputs/strategy/` | `history/writing-product-strategy/` |
| Launch reviews | `outputs/reviews/` | `history/learn/reviews/` |
| Decisions | `outputs/decisions/` | `history/learn/decisions/` |
| Learning analysis | `outputs/learning/` | `history/learn/patterns/` |
| Data analysis | `outputs/insights/` | `history/analyze/data/` |
| Exec updates | `outputs/exec_updates/` | - |

## AG3 Daemon Outputs

The PM OS daemon (`pm-os` CLI) manages these directories automatically:

| Directory | Purpose | Managed By |
|-----------|---------|------------|
| `outputs/ingest/` | Extracted text from documents (docx, pdf, pptx, csv) | `pm-os scan` |
| `outputs/deltas/` | Change summaries by category (feedback, ops, roadmap) | Delta jobs |
| `outputs/audit/` | Append-only log of all daemon operations | All jobs |

### Ingest Directory Structure

```
outputs/ingest/
├── <hash>.txt           # Extracted text content
├── <hash>.meta.json     # Metadata (source path, extraction date, etc.)
└── ...
```

### Audit Log

`outputs/audit/auto-run-log.md` - Append-only log of all daemon operations:

```markdown
| Timestamp | Job ID | Type | Inputs | Result | Notes |
|-----------|--------|------|--------|--------|-------|
| 2026-01-18 10:30:15 | job_... | ingest | q1-feedback.pdf | ok | |
```

## History Rule

When writing to `outputs/`, also copy to `history/<skill>/` with date suffix.

Example: `outputs/roadmap/Q1-charters.md` → `history/generating-quarterly-charters/Q1-charters-2026-01-14.md`

**Exception:** Daemon-managed directories (`ingest/`, `deltas/`, `audit/`) do not use history copies - they are managed by the daemon's ingest index.

## Dependency Graph (AG3)

```
TIER 0: External Sources (scanned by daemon)
─────────────────────────────────────────────────────────────
~/Downloads/*.pdf,docx,pptx  ──▶  outputs/ingest/*.txt
~/Drive/PM/**/*              ──▶  outputs/ingest/*.txt
inputs/**/*                  ──▶  outputs/ingest/*.txt

TIER 1: Daemon Delta Jobs
─────────────────────────────────────────────────────────────
outputs/ingest/* (feedback)  ──▶  outputs/deltas/feedback-*.md
outputs/ingest/* (ops)       ──▶  outputs/deltas/ops-*.md
outputs/ingest/* (roadmap)   ──▶  outputs/deltas/roadmap-*.md

TIER 1.5: Discovery (structured extraction from ingest)
─────────────────────────────────────────────────────────────
outputs/ingest/*             ──▶  outputs/discovery/doc-analysis-*.md
outputs/discovery/*          ──▶  outputs/discovery/interview-guide-*.md
inputs/voc/* + discovery/*   ──▶  outputs/discovery/signals-*.md

TIER 2: LLM Skills (from deltas + context)
─────────────────────────────────────────────────────────────
outputs/deltas/*             ──▶  outputs/insights/voc-synthesis-*.md
outputs/deltas/*             ──▶  outputs/ktlo/ktlo-triage-*.md
outputs/discovery/*          ──▶  outputs/truth_base/truth-base.md
outputs/deltas/*             ──▶  outputs/truth_base/truth-base.md

TIER 3: Planning Skills
─────────────────────────────────────────────────────────────
outputs/truth_base/*         ──▶  outputs/roadmap/Qx-YYYY-charters.md
outputs/insights/voc-*       ──▶  outputs/roadmap/Qx-YYYY-charters.md
outputs/ktlo/*               ──▶  outputs/roadmap/Qx-YYYY-charters.md

TIER 4: Execution Skills
─────────────────────────────────────────────────────────────
outputs/roadmap/*            ──▶  outputs/delivery/prds/*.md
```

## State Tracking

**Single source of truth:** `nexa/state.json`

The daemon tracks:
- Ingest index (what files have been processed)
- Current job status
- Algorithm phase
- Next recommended action

This replaces the previous `outputs/session-state.md` and `alerts/stale-outputs.md` manual tracking.
