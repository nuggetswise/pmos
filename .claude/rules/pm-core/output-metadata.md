# Output Metadata Standards

Every PM output file must include proper metadata for tracking dependencies and staleness.

## Required YAML Frontmatter

Every output file must start with:

```yaml
---
generated: YYYY-MM-DD HH:MM
skill: <skill-name>
sources:
  - path/to/source1.md (modified: YYYY-MM-DD)
  - path/to/source2.csv (modified: YYYY-MM-DD)
downstream:
  - path/to/dependent/output.md
---
```

## After Generation

After generating any output:

1. Update `alerts/stale-outputs.md` with:
   - The new output and its sources
   - Any downstream outputs that may now be stale

2. Copy to history:
   - When writing to `outputs/`, also copy to `history/<skill>/` with date suffix
   - Example: `outputs/roadmap/Q1-charters.md` → `history/generating-quarterly-charters/Q1-charters-2026-01-14.md`

## Output Style

All PM outputs should be:

- **Crisp, enterprise-grade** - no fluff, no hedging
- **Decision-first** - lead with the recommendation, then evidence
- **Include risks and tradeoffs** - never hide the downsides
- **Always provide:** "Next Actions + Owners (TBD if unknown)"
- **Table format** preferred for comparisons and lists
- **Verbatim quotes** over paraphrasing when citing VOC
