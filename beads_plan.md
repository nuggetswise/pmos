# Plan: Beads Architecture (Claude-Native)

## 1. Overview

### Objective
Implement a granular, Claude-native "Beads" architecture for PM OS that captures atomic insights during normal skill execution - no external scripts or APIs required.

### Key Insight: Claude-Native vs External Scripts

**PM OS runs entirely within Claude Code.** This means:
- Claude itself extracts and atomizes insights during skill execution
- No external Python scripts or LLM API calls needed
- Atomization happens inline, not as a separate batch process
- Rules govern behavior, not feature flags

### Architecture Comparison

| beads_plan.md (Original) | Correct Architecture (Claude-Native) |
|--------------------------|--------------------------------------|
| `nexa/ingest_beads.py` with LLM API calls | Claude extracts beads during skill runs |
| Atomization during `pm-os scan` | Atomization happens inline by Claude |
| Feature flags in `.claude/settings.local.json` | Rules-based behavior in `.claude/rules/` |
| Separate R.A.L.P.H. pipeline | R.A.L.P.H. is Claude's mental model during execution |

### Value Proposition

| Feature | Before (File-Based) | After (Beads + Auto-Capture) |
|---------|---------------------|------------------------------|
| **Data Granularity** | Entire files are the unit | Each bead is a single insight |
| **Change Detection** | Hash-based (brittle) | Semantic comparison by Claude |
| **Staleness** | Noisy (any file change = stale) | Precise (only meaningful changes) |
| **Traceability** | Cite entire source file | Cite specific `bead_id` |
| **Learning** | None (insights lost each session) | Persistent (beads accumulate) |

---

## 2. Implementation (Completed)

### What Was Built

#### 2.1: Auto-Capture Rule
**File:** `.claude/rules/system/auto-capture.md`

Instructs Claude to capture learnings automatically:
- After skill completion → Extract 3-5 key insights
- After decisions → Log decision with rationale
- At session end → Summarize session

#### 2.2: History Structure
**New directories:**
```
history/
├── sessions/       # Session summaries
├── learnings/      # Extracted patterns by date
└── decisions/      # Decision logs (existing)
```

#### 2.3: Beads Storage
**Directory:** `.beads/`
```
.beads/
├── insights.jsonl  # Atomic insights (append-only)
├── index.json      # Quick lookup index
├── .gitignore      # Exclude from version control
└── README.md       # Documentation
```

---

## 3. R.A.L.P.H. as Claude's Mental Model

R.A.L.P.H. isn't an external pipeline - it's how Claude processes information during skill execution:

| Step | What Claude Does |
|------|------------------|
| **R**ead | Read source files specified in skill |
| **A**nalyze | Extract atomic insights (beads) |
| **L**earn | Compare to existing beads for novelty |
| **P**ropose | Prepare output + new beads |
| **H**armonize | Write output, append beads, update history |

### Example: VOC Synthesis with R.A.L.P.H.

```
User: /voc

Claude (internally):
1. READ: inputs/voc/*.md, existing .beads/insights.jsonl
2. ANALYZE: Extract customer themes, pain points
3. LEARN: Check if these insights are new vs existing beads
4. PROPOSE: Draft synthesis, identify new beads to create
5. HARMONIZE: Write synthesis to outputs/, append beads to .beads/

Output: VOC synthesis + "Learning captured" notification
```

---

## 4. Bead Schema

```json
{
  "id": "bead_20260120_143022_001",
  "type": "insight|decision|pattern|question",
  "content": "Sync speed is top customer pain (3/7 VOC + 12 KTLO)",
  "source": "synthesizing-voc",
  "created_at": "2026-01-20T14:30:22Z",
  "tags": ["sync", "performance", "customer-pain"],
  "confidence": "high|medium|low",
  "connections": ["bead_id_1", "bead_id_2"]
}
```

### Bead Types

| Type | When Created |
|------|--------------|
| `insight` | Discovery during analysis |
| `decision` | Choice made with rationale |
| `pattern` | Recurring theme across sources |
| `question` | Open question for future work |

---

## 5. How Beads Flow Through PM OS

```
Active Work Session (user + Claude)
        │
        ▼
┌─────────────────────┐
│  SKILL EXECUTION    │
│  (Claude runs /voc, │
│   /ktlo, /charters) │
└─────────────────────┘
        │
        ├──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
┌─────────────────────┐            ┌─────────────────────┐
│  outputs/           │            │  AUTO-CAPTURE       │
│  (skill output)     │            │  (Claude extracts   │
│                     │            │   beads inline)     │
└─────────────────────┘            └─────────────────────┘
                                           │
                                           ▼
                               ┌─────────────────────────────────┐
                               │  HISTORY & KNOWLEDGE REPOSITORY │
                               │  ├── history/sessions/          │
                               │  ├── history/learnings/         │
                               │  ├── history/decisions/         │
                               │  └── .beads/insights.jsonl      │
                               └─────────────────────────────────┘
                                           │
                                           ▼
                               ┌─────────────────────┐
                               │  FUTURE SESSION     │
                               │  (Claude loads      │
                               │   relevant beads)   │
                               └─────────────────────┘
```

---

## 6. Session Loading Protocol

At session start, Claude should:

1. **Read state:** `nexa/state.json`
2. **Load recent learnings:** `history/learnings/` (last 7 days)
3. **Load relevant beads:** `.beads/insights.jsonl` filtered by:
   - Current phase (OBSERVE, PLAN, BUILD, etc.)
   - Tags matching current context
4. **Surface connections:** Reference past insights when relevant

---

## 7. Migration Path

### Phase 1: Foundation (DONE)
- [x] Auto-capture rule created
- [x] History directories created
- [x] Beads storage initialized

### Phase 2: Adoption (Next)
- [ ] Claude begins capturing beads after skill runs
- [ ] Session summaries saved at session end
- [ ] Learnings directory populated

### Phase 3: Utilization
- [ ] Session start loads relevant beads
- [ ] Skill outputs cite bead_ids for traceability
- [ ] Patterns emerge across sessions

### Phase 4: Intelligence
- [ ] Bead connections created automatically
- [ ] Decay/relevance scoring implemented
- [ ] Semantic search across beads

---

## 8. Quality Gates

Before capturing a bead:
- [ ] Is this genuinely new or useful?
- [ ] Does it have clear source/context?
- [ ] Would future sessions benefit?
- [ ] Is it specific enough to be actionable?

**Don't capture:**
- Obvious information
- Duplicates
- Implementation details without insight
- Temporary notes

---

## 9. Relationship to Existing Systems

| System | Relationship |
|--------|--------------|
| `nexa/state.json` | Tracks current session state |
| `outputs/decisions/` | Formal decision documents (human-readable) |
| `.beads/insights.jsonl` | Atomic decision beads (machine-readable) |
| `.claude/rules/learned/` | Persistent PM patterns extracted from beads |
| `history/<skill>/` | Versioned skill outputs |
| `history/learnings/` | Human-readable learning summaries |

---

## 10. Key Architectural Decision

**Why Claude-native, not external scripts?**

1. **Simplicity:** No Python dependencies, no LLM API keys, no background processes
2. **Context:** Claude has full conversation context when extracting insights
3. **Quality:** Claude understands PM domain better than generic extraction
4. **Integration:** Beads are created as part of normal skill execution, not batch
5. **Consistency:** Same Claude instance extracts and uses beads

**R.A.L.P.H.** is not a separate system - it's a mental model for how Claude processes information. Every skill run already follows this pattern implicitly; the beads architecture just makes the "L" (Learn) and "H" (Harmonize) steps persistent.
