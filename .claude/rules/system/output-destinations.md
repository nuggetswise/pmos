# Output Destinations

This file tracks where different PM outputs are stored and their history directories.

## Output Type Mapping

| Output Type | Location | History |
|-------------|----------|---------|
| Truth base | `outputs/truth_base/` | `history/building-truth-base/` |
| VOC synthesis | `outputs/insights/` | `history/synthesizing-voc/` |
| KB gap analysis | `outputs/insights/` | `history/analyzing-kb-gaps/` |
| KTLO triage | `outputs/ktlo/` | `history/triaging-ktlo/` |
| Quarterly charters | `outputs/roadmap/` | `history/generating-quarterly-charters/` |
| PRDs | `outputs/delivery/` | `history/writing-prds-from-charters/` |
| Stakeholder maps | `outputs/stakeholders/` | `history/stakeholder-management/` |
| GTM docs | `outputs/gtm/` | `history/planning-gtm-launch/` |
| Product strategy | `outputs/strategy/` | `history/writing-product-strategy/` |
| Launch reviews | `outputs/reviews/` | `history/reviewing-launch-outcomes/` |
| Decisions | `outputs/decisions/` | `history/tracking-decisions/` |
| Learning analysis | `outputs/learning/` | `history/learning-from-history/` |
| Exec updates | `outputs/exec_updates/` | - |

## History Rule

When writing to `outputs/`, also copy to `history/<skill>/` with date suffix.

Example: `outputs/roadmap/Q1-charters.md` → `history/generating-quarterly-charters/Q1-charters-2026-01-14.md`

## Dependency Graph

```
inputs/voc/* ──────────────┬──▶ outputs/insights/voc-synthesis-*.md
inputs/jira/* ─────────────┼──▶ outputs/ktlo/ktlo-triage-*.md
inputs/roadmap_deck/* ─────┼──▶ outputs/truth_base/truth-base.md
inputs/knowledge_base/* ───┤
inputs/product_demo/* ─────┘
                           │
                           ▼
           outputs/roadmap/Qx-YYYY-charters.md
                           │
                           ▼
           outputs/delivery/prds/*.md
```

When upstream sources change, downstream outputs become stale.
