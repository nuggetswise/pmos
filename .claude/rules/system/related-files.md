# Related Files Protocol

When modifying certain files, check and update related files to maintain coherence.

## File Relationship Map

| When You Change | Also Check/Update |
|-----------------|-------------------|
| `inputs/context/my-context.md` | Consider updating `outputs/stakeholders/*.md` (stakeholder list may have changed) |
| `CLAUDE.md` | Check `.claude/rules/` files for consistency |
| `.claude/rules/pm-core/evidence-rules.md` | Update skill templates that have Claims Ledger; check `.claude/output-styles/*.md` evidence sections |
| `.claude/rules/pm-core/output-metadata.md` | Update skill output templates that use metadata; check `.claude/output-styles/*.md` YAML section |
| `.claude/output-styles/*.md` | Ensure aligned with `evidence-rules.md` and `output-metadata.md` |
| `skills/*/SKILL.md` (any skill) | Update `skills/README.md` if skill purpose changed |
| `README.md` | Check `docs/GETTING_STARTED.md` for consistency |
| `nexa/state.json` (state + staleness) | Update `.claude/rules/system/output-destinations.md` |
| `outputs/decisions/TEMPLATE.md` | Update `skills/tracking-decisions/SKILL.md` |

## Enforcement Protocol

**Before completing any file modification:**

1. Check this table for related files
2. Read each related file
3. If inconsistency found:
   - Fix the inconsistency, OR
   - Ask user: "I noticed [file] may be inconsistent with your change. Should I update it?"

## Cascade Rules

Some changes cascade through multiple levels:

```
inputs/context/my-context.md
    ↓ (stakeholder list)
outputs/stakeholders/*.md
    ↓ (communication plan)
outputs/roadmap/*-charters.md (stakeholder section)
```

```
.claude/rules/pm-core/output-metadata.md
    ↓ (metadata format)
ALL skill SKILL.md files (output template sections)
    ↓ (generated outputs)
ALL outputs/*/*.md files (if regenerated)
```

## When NOT to Auto-Update

- **Outputs in history/**: These are snapshots, don't modify
- **User-maintained files**: `inputs/context/`, `inputs/voc/`, etc. - only user modifies
- **Frozen outputs**: If tracked, note in `nexa/state.json` or audit log

## Adding New Relationships

When creating a new file that depends on or affects other files:
1. Add relationship to this table
2. Document in the file's header which files it relates to
