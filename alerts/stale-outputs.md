# Staleness Tracker

This file tracks output dependencies and staleness. Claude checks this at session start.

---

## How It Works

1. Each output has **sources** (input files it was generated from)
2. If a source file is **modified after** the output was generated, the output is **stale**
3. If a downstream output is **newer than its sources**, flag **drift** (possible divergence)
4. Claude reports stale outputs and drift at session start
5. Say "refresh <skill-name>" to regenerate

---

## Dependency Graph

```
TIER 1 (Direct from inputs)
─────────────────────────────────────────────────────────────
inputs/voc/*              ──▶  outputs/insights/voc-synthesis-*.md
inputs/jira/*             ──▶  outputs/ktlo/ktlo-triage-*.md
inputs/roadmap_deck/*     ──▶  outputs/truth_base/truth-base.md
inputs/product_demo/*     ──▶  outputs/truth_base/truth-base.md
inputs/knowledge_base/*   ──▶  outputs/truth_base/truth-base.md
                          ──▶  outputs/insights/kb-gaps-*.md

TIER 2 (Depends on Tier 1 outputs)
─────────────────────────────────────────────────────────────
outputs/truth_base/*      ──▶  outputs/roadmap/Qx-*-charters.md
outputs/insights/voc-*    ──▶  outputs/roadmap/Qx-*-charters.md
outputs/ktlo/*            ──▶  outputs/roadmap/Qx-*-charters.md

TIER 3 (Depends on Tier 2 outputs)
─────────────────────────────────────────────────────────────
outputs/roadmap/*         ──▶  outputs/delivery/prds/*.md
```

---

## Currently Tracked Outputs

*This section is updated automatically when skills run.*

| Output | Generated | Sources | Status |
|--------|-----------|---------|--------|
| *(none yet)* | - | - | - |

---

## Stale Outputs

*Outputs that need refresh (source newer than output):*

| Output | Reason | Suggested Action |
|--------|--------|------------------|
| *(none yet)* | - | - |

---

## How to Update This File

When a skill runs:
1. Add/update the output in "Currently Tracked Outputs"
2. Record the generation timestamp
3. List all source files with their modification dates
4. Check if any downstream outputs are now stale (Tier 2/3)
5. Add stale outputs to the "Stale Outputs" section

When a source file changes:
1. Find all outputs that depend on it
2. Mark them as stale in "Stale Outputs"
3. Include cascading dependencies (if VOC changes, charters that used VOC are also stale)

When a downstream output changes:
1. If it is newer than its sources, record a drift warning in "Stale Outputs"
2. Use reason: "Drift - downstream newer than sources"
3. Suggested action: "Reconcile changes or refresh upstream outputs"
