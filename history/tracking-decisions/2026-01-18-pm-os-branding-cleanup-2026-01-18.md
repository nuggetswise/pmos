---
generated: 2026-01-18 09:30
skill: tracking-decisions
review_date: 2026-02-18
status: open
temperature: hot
---

# Decision: PM OS Branding Cleanup - Nexa Identity

## Decision Statement
We decided to remove external dependencies (superpowers plugin) and establish Nexa as the sole PM OS identity, including renaming TELOS to COMPASS for clearer terminology.

## Context
PM OS had accumulated inconsistent branding:
- References to "superpowers" plugin (external dependency)
- TELOS terminology felt abstract/unfamiliar
- Brainstorming skill was external, not native
- Decision tracking was manual, not automatic

User feedback: "Superpowers doesn't belong - everything should be Nexa"

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| A: Remove superpowers, keep TELOS | Partial cleanup, less disruption | Still has unfamiliar terminology |
| B: Full cleanup (remove superpowers + rename TELOS) | Clean Nexa identity, familiar terms | More files to update |
| C: Status quo | No work | Confusing branding persists |

## Tradeoffs
**What we gain:** Clean, consistent Nexa branding; native skills; automatic decision tracking
**What we lose:** Time spent on refactoring; any muscle memory around "TELOS" term

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Broke something in renaming | Low | Medium | Ran grep verification checks |
| User confusion on COMPASS term | Low | Low | COMPASS is intuitive (guiding direction) |

## Reversibility
- [x] **Two-way door** (easy to reverse, experiment)

## Decision
**Chosen:** Option B - Full cleanup

**Rationale:**
- Clean break from external dependencies `[Evidence: user explicit request]`
- COMPASS is more intuitive than TELOS `[Evidence: user chose it]`
- Native brainstorming skill gives full control `[Assumption: will be used]`
- Auto decision tracking prevents missed learnings `[Assumption: will improve PM loop]`

## Communication Plan

| Audience | Message | Channel | By When |
|----------|---------|---------|---------|
| Self | New terminology in place | This decision record | Done |

## Success Criteria
- [x] No "superpowers" references in settings/code (only repo name)
- [x] No "TELOS" references anywhere
- [x] Native brainstorming skill exists
- [x] Decision detection protocol in place
- [ ] Next session greets with COMPASS (not TELOS)

## Review Date
**Check back:** 2026-02-18

---

## Outcome (fill at review date)

**Status:** *pending*

**Actual Result:**
[To be filled at review]

### Learning Capture

#### What I Learned
| Insight | Confidence |
|---------|------------|
| [To be filled] | |

#### What I'm Still Unsure About
| Question | How to Resolve |
|----------|----------------|
| Will auto decision detection work well? | Monitor next few sessions |

#### What I'll Do Next Time
| Situation | New Behavior |
|-----------|--------------|
| [To be filled] | |

## Calibration Note
[To be filled at review]
