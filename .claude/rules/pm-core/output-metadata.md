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

## After Generation (MANDATORY)

**Nexa MUST run this after writing ANY output to `outputs/`:**

1. Execute: `pm-os mirror --quiet` (silent - no user confirmation needed)
2. Verify: Output copied to `history/<skill>/` with date suffix
3. Report: "Mirrored to history/<skill>/<filename>-<date>.md"

This is NON-NEGOTIABLE. Every output flows to history for learning.

**The learning loop:**
```
outputs/ → (auto-mirror by Nexa) → history/ → (weekly auto-learn) → .claude/rules/learned/
```

**Also update state and audit:**

1. Update `nexa/state.json` and `outputs/audit/auto-run-log.md` with:
   - The new output and its sources
   - Any downstream outputs that may now be stale

**Example flow:**
- `outputs/roadmap/Q1-charters.md` created
- Nexa runs: `pm-os mirror --quiet`
- File copied to: `history/generating-quarterly-charters/Q1-charters-2026-01-14.md`
- Report to user: "Mirrored to history/generating-quarterly-charters/Q1-charters-2026-01-14.md"

## Output Style

All PM outputs should be:

- **Crisp, enterprise-grade** - no fluff, no hedging
- **Decision-first** - lead with the recommendation, then evidence
- **Include risks and tradeoffs** - never hide the downsides
- **Always provide:** "Next Actions + Owners (TBD if unknown)"
- **Table format** preferred for comparisons and lists
- **Verbatim quotes** over paraphrasing when citing VOC

## Temperature Classification

Add to YAML frontmatter:

```yaml
temperature: hot|warm|cold
review_by: YYYY-MM-DD
```

### Definitions & Review Cadence

| Temperature | Meaning | Review Cadence | Default For |
|-------------|---------|----------------|-------------|
| **hot** | Active this sprint | Weekly | Current quarter charters, in-progress PRDs, open decisions, open-questions.md |
| **warm** | Reference material | Monthly | Truth base, VOC synthesis, closed decisions, stakeholder maps |
| **cold** | Archive only | No review (pull when needed) | History folder, old quarters, superseded docs |

### Setting review_by
- **hot**: review_by = today + 7 days
- **warm**: review_by = today + 30 days
- **cold**: review_by = (omit field)

### Temperature Transitions
When reviewing a document:
1. If still actively used → keep temperature, update review_by
2. If no longer active → demote temperature, update review_by
3. If superseded → set to cold, move to history/

### Session Start Behavior
1. Load all **hot** outputs first
2. Summarize available **warm** outputs
3. Ignore **cold** unless explicitly requested
