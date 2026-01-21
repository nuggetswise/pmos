# Beads Storage

## Purpose

Atomic insights ("beads") extracted during PM OS sessions. Each bead is a small, self-contained piece of knowledge that can be connected to other beads.

## Files

| File | Purpose |
|------|---------|
| `insights.jsonl` | Append-only storage of beads (one JSON object per line) |
| `index.json` | Quick lookup index for efficient retrieval |
| `.gitignore` | Excludes beads from version control |

## Bead Format

Each line in `insights.jsonl` is a JSON object:

```json
{
  "id": "bead_20260120_143022_001",
  "type": "insight",
  "content": "Sync speed is top customer pain (3/7 VOC + 12 KTLO tickets)",
  "source": "synthesizing-voc",
  "created_at": "2026-01-20T14:30:22Z",
  "tags": ["sync", "performance", "customer-pain"],
  "confidence": "high",
  "connections": []
}
```

## Bead Types

| Type | Description |
|------|-------------|
| `insight` | Discovery or learning from analysis |
| `decision` | Choice made with rationale |
| `pattern` | Recurring theme across sources |
| `question` | Open question for future investigation |
| `output-rating` | User quality rating of a generated PM output (1-5 scale) |

### Output Rating Bead Schema

Output rating beads include additional fields for quality tracking:

```json
{
  "id": "bead_20260120_143000_001",
  "type": "output-rating",
  "content": "Requirements too vague, engineering won't be able to build",
  "source": "writing-prds-from-charters",
  "output_file": "outputs/delivery/prds/catalog-sync-v2.md",
  "rating": 2,
  "sentiment": "positive|neutral|negative",
  "tags": ["writing-prds-from-charters", "quality-2"],
  "created_at": "2026-01-20T14:30:00Z",
  "connections": []
}
```

**Additional Fields:**
- `output_file`: Relative path to the rated output
- `rating`: Integer 1-5 (1=needs major revision, 5=outstanding)
- `sentiment`: Derived from rating (1-2=negative, 3=neutral, 4-5=positive)
- `content`: Optional user comment explaining the rating

**Rating Scale:**
- 1 - Needs major revision
- 2 - Below expectations
- 3 - Meets expectations
- 4 - Exceeds expectations
- 5 - Outstanding, exactly what I needed

**Usage:** Weekly learning analyzes output-rating beads to identify quality patterns and improve future outputs.

## How Beads Are Created

Beads are created automatically by Claude during PM OS sessions:
1. After completing a skill (e.g., VOC synthesis)
2. When a decision is made
3. When a significant pattern is detected
4. When user rates an output (after PLAN/BUILD phase skills)

**No external scripts or APIs required** - Claude extracts and persists beads inline.

## Why Beads Aren't Version Controlled

Beads are:
- Personal to this PM instance
- Append-only (never edited, only added)
- Large over time (would bloat git history)
- Not shareable between users (personal learnings)

## Usage

Beads are loaded at session start to inform responses. Claude reads relevant beads based on:
- Current phase (OBSERVE, PLAN, BUILD, etc.)
- Active skill being run
- Tags matching current context

## See Also

- `.claude/rules/system/auto-capture.md` - Auto-capture protocol
- `.claude/rules/system/output-rating-capture.md` - Output quality rating protocol
- `history/learnings/` - Human-readable learning summaries
- `history/sessions/` - Session summaries
