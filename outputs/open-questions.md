---
generated: YYYY-MM-DD HH:MM
skill: manual (cross-skill aggregation)
last_reviewed: YYYY-MM-DD
temperature: hot
review_by: YYYY-MM-DD
---

# Open Questions Log

Centralized tracking of unknowns, assumptions, and dependencies across all PM outputs.

## Active Questions

| ID | Question | Status | Owner | Due Date | Impact | Next Action | Source Doc |
|----|----------|--------|-------|----------|--------|-------------|------------|
| OQ-001 | [Question] | Open | [Name/TBD] | YYYY-MM-DD | Critical/High/Med/Low | [Concrete next step] | [outputs/file.md] |

### Status Values
- `open` - Not yet started
- `in_progress` - Being investigated
- `blocked` - Waiting on external dependency
- `resolved` - Answer found (move to history)
- `dropped` - No longer relevant

### Impact Legend
| Impact | Meaning | Response SLA |
|--------|---------|--------------|
| **Critical** | Blocks launch or major decision | 48 hours |
| **High** | Degrades output quality significantly | 1 week |
| **Medium** | Creates assumptions that need validation | 2 weeks |
| **Low** | Nice to know, not blocking | When convenient |

## Resolution History

| ID | Question | Resolution | Resolved Date | Impact on Downstream |
|----|----------|------------|---------------|---------------------|
| OQ-000 | [Past question] | [Answer] | YYYY-MM-DD | [What changed] |

## Weekly Review Checklist
- [ ] All Critical/High items have owners
- [ ] Overdue items escalated
- [ ] Resolved items moved to history
- [ ] New questions from latest outputs added
