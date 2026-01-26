# PROJECTS: Q1 2026 Active Initiatives

## Summary
This file tracks the status of Q1 initiatives tied to quarterly goals. Updated by PM OS or manually as projects progress.

## Active Initiatives

### 1. Customer Discovery Program
**Status:** In Progress
**Goal (from compass.md):** Restart product management via customer discovery (10+ interviews)
**Owner:** PM
**Start Date:** 2026-01-15
**Target Date:** 2026-02-28
**Blockers:** Customer interview pipeline (Sales/CS)

**Progress:**
- [ ] Customer interview pipeline established (blocking)
- [ ] 5+ interviews completed
- [ ] 10+ interviews completed
- [ ] VOC synthesis completed (`/voc` skill)
- [ ] Signals documented for charter planning

**Dependent Skills:**
- `/discover --prep [role]` — Interview prep by role
- `/voc` — VOC synthesis

**Related Files:**
- `inputs/context/compass.md` - Q1 goals
- `outputs/discovery/` - Analysis & interview guides

---

### 2. Competitive Analysis
**Status:** Not Started
**Goal (from compass.md):** Assess competitive position vs Syndigo, PIM tools
**Owner:** PM + Product Marketing
**Start Date:** (Planned)
**Target Date:** 2026-02-07 (Timebox: 2 weeks)
**Blockers:** None

**Progress:**
- [ ] Competitive analysis document drafted (`/competitive-analysis` skill)
- [ ] Syndigo positioning mapped
- [ ] PIM tools landscape analyzed
- [ ] Competitive gaps identified
- [ ] Positioning recommendations made

**Dependent Skills:**
- `/competitive-analysis` — Market landscape research

**Related Files:**
- `outputs/insights/` - Competitive analysis output

---

### 3. Vision Document & Product Strategy
**Status:** Not Started
**Goal (from compass.md):** Define future vision and growth strategy
**Owner:** PM
**Start Date:** (Planned)
**Target Date:** 2026-03-15
**Blockers:** Competitive analysis (needed as input)

**Progress:**
- [ ] Competitive analysis completed (prerequisite)
- [ ] Strategy document drafted (`/strategy` skill)
- [ ] 3-5 year vision + strategic pillars defined
- [ ] Capability roadmap created
- [ ] Leadership alignment on vision

**Dependent Skills:**
- `/strategy` — 3-5 year product strategy

**Related Files:**
- `outputs/strategy/` - Strategy document

---

### 4. Charter Definition & Alignment
**Status:** Not Started
**Goal (from compass.md):** Align on vision document and product charter
**Owner:** PM
**Start Date:** (Planned - after vision doc)
**Target Date:** 2026-03-31
**Blockers:** Customer discovery, competitive analysis, vision doc

**Progress:**
- [ ] Customer discovery complete (VOC synthesis done)
- [ ] Competitive analysis complete
- [ ] Vision document approved
- [ ] Charter candidates identified (`/charters` skill)
- [ ] Q2 charters prioritized
- [ ] Leadership alignment on charters

**Dependent Skills:**
- `/charters` — Quarterly charter generation
- `/prd` — PRD writing for approved charters

**Related Files:**
- `outputs/roadmap/` - Q1 charters output
- `outputs/delivery/prds/` - PRDs from charters

---

### 5. Metrics Baseline Definition
**Status:** Not Started
**Goal (from compass.md):** Conduct customer interviews and usage data audit
**Owner:** PM + Analytics
**Start Date:** (Planned)
**Target Date:** 2026-02-28
**Blockers:** Analytics team availability

**Progress:**
- [ ] Current metric baseline measured
- [ ] Growth KPIs identified
- [ ] Usage KPIs identified
- [ ] Adoption KPIs identified
- [ ] Commercial success KPIs identified
- [ ] Dashboard created

**Dependent Skills:**
- `/analyze --data` — Data analysis & dashboard setup

**Related Files:**
- Dashboard (TBD location)

---

### 6. Technology Validation
**Status:** Not Started
**Goal (from compass.md):** Validate hypotheses and select technology
**Owner:** PM + Engineering
**Start Date:** (Planned - mid Q1)
**Target Date:** 2026-03-15
**Blockers:** Vision/strategy clarity needed first

**Progress:**
- [ ] Technology options evaluated
- [ ] Feasibility studies completed
- [ ] Engineering tech spike results
- [ ] Technology recommendation made
- [ ] Go/No-go decision for AI features

**Dependent Skills:**
- `/discover --prep engineering` — Engineering discovery
- `/prd` — Technical requirements documentation

**Related Files:**
- (Tech spike results TBD)

---

## Blocked Items (Waiting on Dependencies)

| Item | Blocker | Status | Owner |
|------|---------|--------|-------|
| Customer Discovery Program | Interview pipeline establishment | 🔴 Blocked | Sales/CS |
| Metrics Baseline | Analytics team availability | 🟡 Pending | Analytics Lead |

## Timeline Dependencies

```
Customer Discovery → VOC Synthesis → Charter Definition
    (Jan-Feb)           (Feb)         (Mar)
        ↓
Competitive Analysis → Vision/Strategy → Charter Approval
    (Feb)                (Feb-Mar)        (Mar)

Metrics Baseline (Parallel track, Feb-Mar)
Technology Validation (Mid Q1, after vision clarity)
```

## Key Risks to Monitor

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Customer interview pipeline not established | Can't gather VOC evidence | Escalate to Sales/Director | 🔴 Active |
| Metrics baseline undefined | Can't measure success | Assign analytics owner | 🟡 At Risk |
| Competitive analysis too time-consuming | Misses charter deadline | Timebox to 2 weeks | 🟢 Mitigating |
| Leadership alignment on strategy delays charters | Q2 planning delayed | Early alignment meetings | 🟢 Mitigating |

## Success Criteria (Project Complete)

All of the following must be true by end of Q1:
- [ ] 10+ customer interviews completed and synthesized
- [ ] Competitive positioning document complete
- [ ] Vision document approved by leadership
- [ ] Q2 charters drafted and aligned
- [ ] Metrics baseline established and tracked
- [ ] Technology decisions made for AI features
- [ ] Team aligned on Q2 priorities

---

**Last Updated:** 2026-01-24
**Next Review:** 2026-01-31
