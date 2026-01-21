# Auto-Capture Protocol

## Purpose

Automatically capture learnings, insights, and decisions during PM OS sessions. This enables the "nothing is ever forgotten" principle - every session contributes to the knowledge repository.

## When to Capture

Capture happens **automatically** at these moments:

| Trigger | What to Capture | Where to Store |
|---------|-----------------|----------------|
| Skill completion | Key insights, patterns found | `history/learnings/` |
| Decision made | Decision context, rationale, expected outcome | `history/decisions/` |
| Session end (explicit) | Session summary, key takeaways | `history/sessions/` |
| Significant insight | Atomic insight (bead) | `.beads/insights.jsonl` |

## Capture Protocol

### After Completing Any Skill

1. **Extract 3-5 key insights** from the work just completed
2. **Identify patterns** that connect to previous learnings
3. **Log decisions** if any were made (explicit or implicit)
4. **Create atomic beads** for significant, reusable insights

### Insight Extraction Template

```markdown
## Learnings from [Skill Name] - YYYY-MM-DD

### Context
[Brief description of what was done]

### Key Insights
1. [Insight 1]
2. [Insight 2]
3. [Insight 3]

### Patterns Observed
- [Pattern that might apply to future work]

### Connections
- Links to: [previous learnings if any]

### Open Questions
- [Questions raised by this work]
```

### Bead Format (insights.jsonl)

Each line is a JSON object:

```json
{
  "id": "bead_YYYYMMDD_HHMMSS_XXX",
  "type": "insight|decision|pattern|question",
  "content": "The atomic insight or learning",
  "source": "skill/session that produced this",
  "created_at": "ISO timestamp",
  "tags": ["tag1", "tag2"],
  "confidence": "high|medium|low",
  "connections": ["bead_id_1", "bead_id_2"]
}
```

## Storage Structure

```
history/
├── sessions/           # Session summaries
│   └── YYYY-MM-DD-summary.md
├── learnings/          # Extracted patterns by date
│   └── YYYY-MM-DD-[skill].md
└── decisions/          # Decision logs
    └── YYYY-MM-DD-[title].md

.beads/
├── insights.jsonl      # Atomic insights (append-only)
├── index.json          # Quick lookup index
└── .gitignore          # Exclude from version control
```

## Auto-Capture Behavior

### High Confidence (Always Capture)

- Completing PLAN or BUILD phase skills (charters, PRDs)
- Explicit decisions logged via `learn --decision`
- Strategic insights from competitive analysis
- Patterns found in VOC synthesis

### Medium Confidence (Capture + Notify)

- Interesting patterns during OBSERVE phase
- Connections between disparate sources
- Unexpected findings during analysis

### Low Confidence (Skip)

- Routine file operations
- Information gathering without synthesis
- Clarifying questions

## Session Summary Protocol

When user explicitly ends session (says goodbye, thanks, done):

1. Generate session summary:
   - What was accomplished
   - Key decisions made
   - Insights captured
   - Open items for next session

2. Save to `history/sessions/YYYY-MM-DD-summary.md`

3. Update `.beads/insights.jsonl` with any final atomic insights

## Loading Learnings

At session start, Claude should:

1. Read recent entries from `history/learnings/` (last 7 days)
2. Load relevant beads from `.beads/insights.jsonl` based on current phase
3. Reference past learnings when making recommendations

## Integration with Existing Systems

| System | Integration |
|--------|-------------|
| `nexa/state.json` | Session state tracking |
| `outputs/decisions/` | Formal decision documents |
| `.claude/rules/learned/` | Persistent PM pattern rules |
| `history/<skill>/` | Skill-specific output history |

## Quality Gates

Before capturing any insight:

- [ ] Is this genuinely new or useful?
- [ ] Does it have a clear source/context?
- [ ] Would future sessions benefit from knowing this?
- [ ] Is it specific enough to be actionable?

**Don't capture:**
- Obvious information
- Duplicates of existing learnings
- Implementation details without broader insight
- Temporary/session-specific notes

## Example Capture Flow

```
User: Run /voc synthesis

Claude: [Completes VOC synthesis]

Auto-capture triggered:
- Extracted: "3/7 customers mentioned sync speed as top pain"
- Pattern: "Sync speed theme consistent with KTLO triage (12 tickets)"
- Decision: None (this was analysis, not a choice)

Saved to: history/learnings/2026-01-20-synthesizing-voc.md
Bead created: {"id": "bead_20260120_143022_001", "type": "insight", "content": "Sync speed is top customer pain (3/7 VOC + 12 KTLO tickets)", ...}

Claude: VOC synthesis complete. Key finding: Sync speed appears in both VOC (3/7 interviews) and KTLO (12 tickets) - strong signal for Q1 charter consideration.

📝 Learning captured → history/learnings/2026-01-20-synthesizing-voc.md
```

## Why This Matters

Without auto-capture:
- Same insights get re-discovered session after session
- Patterns across time are invisible
- Decision rationale is lost
- "Why did we do X?" becomes unanswerable

With auto-capture:
- Knowledge compounds over time
- Patterns emerge across sessions
- Future decisions are informed by past learnings
- PM judgment improves systematically
