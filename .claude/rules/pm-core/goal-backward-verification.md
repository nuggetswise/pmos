# Goal-Backward Verification

## Purpose

Prevents "completed but wrong" - the most expensive failure mode in PM work. Catches when all sections are filled but the output doesn't achieve its actual goal.

**This is NOT a replacement for Claims Ledger.** It's an additional layer:
- Claims Ledger: Are individual claims supported?
- Goal-backward: Does the whole output achieve its purpose?

## When to Apply

After completing any major PM output:
- Quarterly charters (`outputs/roadmap/Qx-YYYY-charters.md`)
- PRDs (`outputs/delivery/prds/*.md`)
- Truth base (`outputs/truth_base/truth-base.md`)
- VOC synthesis (`outputs/insights/voc-synthesis-*.md`)

## The Protocol

### Step 1: State the Goal
What outcome should this output achieve? (Not "what sections to fill" but "what problem does this solve?")

| Output Type | The Goal |
|-------------|----------|
| Charter | Stakeholders can explain the quarter's bets and why they matter |
| PRD | Engineering can build the right thing without coming back with questions |
| Truth base | New team member can understand product in 15 minutes |
| VOC synthesis | Product decisions can be grounded in customer evidence |

### Step 2: Derive Observable Truths (3-5 max)
If this output works, what should be true from user/stakeholder perspective?

**Charter example:**
- [ ] Stakeholder can explain the quarter's bets in 2 minutes
- [ ] Each bet has clear "we'll know it worked if..." statement
- [ ] Risks section would survive "what could kill this?" challenge
- [ ] Dependencies name actual teams (not all "TBD")

**PRD example:**
- [ ] Engineer can start work without asking "what do you mean by X?"
- [ ] Edge cases cover realistic failure scenarios
- [ ] Success metrics have measurement plan (not just targets)
- [ ] Rollout plan has exit criteria, not just entry

**Truth base example:**
- [ ] Someone unfamiliar can explain the product's value prop
- [ ] Open questions identify actual unknowns (not just padding)
- [ ] Terminology matches what the team actually uses

### Step 3: Check Required Artifacts
These are non-negotiable completion markers:

- [ ] All required sections populated (not stubs, not "TBD" everywhere)
- [ ] Claims Ledger has >10 entries with sources
- [ ] Sources Used lists actual files (not "various sources")
- [ ] Metadata header is complete (generated date, sources, downstream)

### Step 4: Validate Key Links
Where things typically break:

- [ ] Every problem statement → links to VOC/KTLO evidence
- [ ] Every success metric → has measurement method
- [ ] Every dependency → names actual team (not all "TBD")
- [ ] Every risk → has mitigation (not just "monitor")

### Step 5: Update Claims Ledger
Add verification outcome:

| Claim | Type | Source |
|-------|------|--------|
| Output achieves stated goal | Verified/Failed | Goal-backward check |
| Observable truths validated | Verified/Partial | [List which passed/failed] |

## Quick Checklist (5-8 items max)

For daily use, run this abbreviated version:

- [ ] Can I state the goal in one sentence (not the sections, the purpose)?
- [ ] Would a stakeholder say "yes, this answers my question"?
- [ ] Are there >3 meaningful entries in Claims Ledger with sources?
- [ ] Does every "TBD" have an owner and timeline?
- [ ] Did I cite actual files, not "various sources"?

## What Happens on Failure

If goal-backward verification fails:

1. **Partial failure (1-2 items):** Note in output's Open Questions, complete with caveat
2. **Significant failure (3+ items):** STOP, do not mark complete, ask user how to proceed
3. **Goal unclear:** STOP, clarify goal with user before proceeding

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
|--------------|--------------|---------|
| Checking all boxes = done | Sections filled ≠ goal achieved | State goal first, then check |
| "TBD" scattered throughout | Defers decisions, creates false completeness | Every TBD needs owner + timeline |
| Sources: "various" | Untraceable, unverifiable | List actual file paths |
| Skipping for "quick" outputs | Quick outputs still need to achieve their goal | Scale checklist, don't skip |
