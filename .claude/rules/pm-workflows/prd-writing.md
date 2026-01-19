---
paths:
  - "outputs/delivery/**/*.md"
  - "history/writing-prds-from-charters/**/*.md"
---

# PRD Writing Rules

## Before Writing
- Verify charter is up-to-date (check `pm-os status` / `nexa/state.json`)
- Confirm charter is approved
- Read stakeholder-map if exists

## Required Sections
- Problem statement (linked to charter)
- Success metrics (inherited from charter)
- Requirements (SHALL/SHOULD/MAY format)
- Edge cases and error handling
- Dependencies and constraints
- Acceptance criteria

## Evidence Requirements
- Link back to charter that spawned this PRD
- All requirements must trace to charter bets or VOC
- Claims ledger required
- No scope creep beyond charter

## Format Options
- `--format full`: Complete PRD for planning team
- `--format exec`: 1-page summary (problem, metrics, timeline)
- `--format eng`: Requirements + edge cases only

## Quality Gates
- Run verification-before-completion skill
- Ensure all SHALL requirements are testable
- Update `nexa/state.json` + audit log
