## Learnings from generating-quarterly-charters - 2026-01-21

### Context
Generated Q1 2026 charters based on VOC synthesis (7 customer interviews), KTLO triage (47 tickets), and truth base. Created 3 strategic bets with evidence-backed problem statements and success metrics.

### Key Insights
1. **VOC+KTLO convergence creates strongest signals** - All 3 selected charters had both VOC mentions (≥3/7 interviews) and KTLO evidence (≥10 tickets). Initiatives with only one signal type were deferred.

2. **Explicit non-scope prevents charter creep** - Including "What We're NOT Doing" section in charter helped clarify boundaries early. In past charters without this, scope crept during PRD phase.

3. **Risk sections easier with specific mitigations** - When risks had concrete mitigation actions (not just "monitor"), stakeholders had more confidence. Generic risks ("timeline might slip") were less useful.

4. **Evidence scoring made prioritization transparent** - Using High/Medium/Low evidence scores (based on source count and quantification) helped explain why certain initiatives beat alternatives in Strategic Reasoning section.

5. **Meta-prompt reasoning improved stakeholder alignment** - Showing "Options Evaluated" table with 5-7 candidates (not just final 3) helped stakeholders understand tradeoffs without needing to explain in meetings.

### Patterns Observed
- **High-rated charters** (from past ratings) consistently had ≤3 bets, clear evidence citations, and quantified success metrics
- **Charter candidates with competitive urgency** ("we're losing deals to X") tended to get prioritized over internal improvements
- **Dependencies named as "TBD"** correlated with later delays - worth clarifying dependencies before finalizing charter

### Connections to Past Work
- Links to: Q4 2025 charters (history/generating-quarterly-charters/Q4-2025-charters-2025-10-15.md)
- Builds on: VOC synthesis patterns showing sync speed as persistent theme across 3 quarters
- Relates to: Decision log about prioritizing customer pain over technical debt (outputs/decisions/2025-12-01-customer-first-prioritization.md)

### Open Questions Raised
- **How to handle initiatives with strong VOC but weak KTLO?** - Customer requests that don't show up in support tickets yet
- **What's the right evidence threshold for "High" score?** - Currently using 3+ sources, but is that calibrated correctly?
- **Should we track charter success rates?** - Would help validate which evidence patterns actually lead to successful outcomes

### Application to Future Work
- **Next charter cycle:** Aim for 5-7 candidates (not 10+) to keep evaluation manageable
- **When running this skill again:** Always include Strategic Reasoning section - high-rated outputs (4-5 stars) all had this
- **Before finalizing charters:** Verify dependencies are named (not "TBD") to avoid downstream delays
- **Consider:** Creating a "charter candidate backlog" between quarters to track initiatives that were evaluated but deferred

---

**This example shows the structure for learning entries. Real learnings will accumulate as skills are executed with post-skill reflection enabled.**
