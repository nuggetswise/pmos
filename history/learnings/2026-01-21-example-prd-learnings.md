---
session_date: 2026-01-21
skill: writing-prds-from-charters
example: true
---

# Example PRD Learnings - 2026-01-21

**Note:** This is an example learning entry showing the expected format. Actual learnings will be generated when running the writing-prds-from-charters skill.

## Context

Example of what learnings might look like after generating a PRD for a catalog sync performance charter.

## Key Insights

1. **Edge cases section took longest** - 40% of PRD time was identifying edge cases; having VOC-derived scenarios speeds this up
2. **Success metrics need measurement plan** - PRDs with "Target: 95% under 5s" but no HOW to measure got engineering pushback
3. **Rollout plan exit criteria matter** - PRDs without clear rollback triggers had longer review cycles
4. **Charter assumptions surfaced gaps** - 3 assumptions from charter became "needs validation" items in PRD
5. **Cross-referencing KTLO helped** - Linking PRD requirements to specific KTLO tickets increased credibility

## Patterns Observed

- High-rated PRDs (4.5+/5) included detailed edge cases from actual customer scenarios
- PRDs that referenced specific VOC quotes in requirements rationale got faster approval
- Requirements using SHALL/SHOULD/MAY format were clearer to engineering than prose
- PRDs with >20 requirements took 2x longer to review than those with 10-15

## Connections to Past Work

- Edge case patterns similar to those identified in KTLO triage (sync failure scenarios)
- Measurement approach informed by VOC synthesis (customers care about perceived speed)
- Rollout strategy built on truth base constraints (legacy system compatibility)

## Open Questions Raised

- Should we template edge cases by category (data sync, API, UI)?
- How to balance comprehensive requirements vs. PRD readability?
- When to split large PRDs into multiple documents?

## Application to Future Work

- Pre-gather VOC quotes before starting PRD to speed edge case identification
- Always include "how we'll measure" for each success metric
- Consider PRD length target of 10-15 requirements for faster review
- Reference KTLO ticket IDs in requirements to show evidence backing

## Quality Correlation

Based on rated PRD outputs, these patterns correlate with higher ratings:

| Pattern | Rating Correlation |
|---------|-------------------|
| Detailed edge cases from real scenarios | +0.8 rating points |
| Measurement plan for each metric | +0.5 rating points |
| KTLO ticket references | +0.3 rating points |
| Clear rollback criteria | +0.4 rating points |
| >20 requirements | -0.6 rating points |

---

*This example demonstrates the learning capture format. Real learnings accumulate as you use PM OS skills.*
