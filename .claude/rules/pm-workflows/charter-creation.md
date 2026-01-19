---
paths:
  - "outputs/roadmap/**/*.md"
  - "history/generating-quarterly-charters/**/*.md"
---

# Charter Creation Rules

## Required Sections
- Strategic bets (≤3 per quarter recommended)
- Success metrics (baseline + target format)
- Risks (with mitigation owner)
- Dependencies

## Evidence Requirements
- All bets must link to VOC or KTLO evidence
- Claims ledger required at end
- No invented metrics
- Source attribution for all claims

## Quality Gates
- Review with stakeholder-map before finalizing
- Run verification-before-completion skill
- Update `nexa/state.json` + audit log with dependencies

## Downstream Impact
When charters change:
- PRDs depending on this charter become stale
- Check `pm-os status` / `nexa/state.json` for affected outputs
