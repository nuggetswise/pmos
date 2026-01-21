# Output Rating Capture Protocol

## Purpose

Enables systematic quality tracking by capturing user ratings after generating PM outputs. This closes the learning loop: user feedback → stored as beads → weekly analysis → improved patterns.

## When to Apply

After completing any **PLAN or BUILD phase skill** that generates a significant output:

| Skill | Output Type | Rating Prompt |
|-------|-------------|---------------|
| `generating-quarterly-charters` | Quarterly charters | "Rate this charter (1-5, or 'skip')" |
| `writing-prds-from-charters` | PRD | "Rate this PRD (1-5, or 'skip')" |
| `writing-product-strategy` | Product strategy | "Rate this strategy doc (1-5, or 'skip')" |
| `synthesizing-voc` | VOC synthesis | "Rate this VOC synthesis (1-5, or 'skip')" |
| `competitive-analysis` | Competitive analysis | "Rate this competitive analysis (1-5, or 'skip')" |
| `planning-gtm-launch` | GTM plan | "Rate this GTM plan (1-5, or 'skip')" |

## When NOT to Apply

- OBSERVE phase data collection (triaging-ktlo, building-truth-base) - too mechanical
- Exec updates (too frequent, not strategic)
- Quick answers or information retrieval
- User explicitly says "skip rating" or similar

## Rating Protocol

### Step 1: Complete the Skill Output

Generate the output normally following existing skill rules:
- Write to appropriate `outputs/` directory
- Include proper metadata (YAML frontmatter, sources, claims ledger)
- Run `pm-os mirror --quiet` to copy to history

### Step 2: Ask for Rating (Explicit)

Immediately after confirming output is complete, ask:

```
✅ [Output type] complete → [file path]

Rate this output (1-5, or 'skip'):
1 - Needs major revision
2 - Below expectations
3 - Meets expectations
4 - Exceeds expectations
5 - Outstanding, exactly what I needed

Your rating:
```

**Tone:** Simple, direct ask. Don't over-explain or pressure.

### Step 3: Capture Rating as Bead

If user provides a rating (not 'skip'), create a bead:

**File:** `.beads/insights.jsonl` (append-only)

**Bead Schema:**
```json
{
  "id": "bead_YYYYMMDD_HHMMSS_XXX",
  "type": "output-rating",
  "content": "[Optional user comment captured if provided]",
  "source": "skill-name",
  "output_file": "relative/path/to/output.md",
  "rating": 1-5,
  "sentiment": "positive|neutral|negative",
  "tags": ["skill-name", "quality-N"],
  "created_at": "ISO 8601 timestamp",
  "connections": []
}
```

**Sentiment Mapping:**
- Rating 1-2 → "negative"
- Rating 3 → "neutral"
- Rating 4-5 → "positive"

**Tags:**
- Always include: skill name (e.g., "generating-quarterly-charters")
- Always include: quality level (e.g., "quality-4")
- Optional: user-provided tags if relevant

### Step 4: Confirm Capture

Brief confirmation to user:
```
📊 Recorded rating: [N]/5 → .beads/insights.jsonl
```

## Example Flows

### Example 1: High Rating

```
User: /charters

Nexa: [Generates Q1-2026-charters.md]

Nexa: ✅ Quarterly charters complete → outputs/roadmap/Q1-2026-charters.md
      Mirrored to history/generating-quarterly-charters/Q1-2026-charters-2026-01-20.md

      Rate this charter (1-5, or 'skip'):
      1 - Needs major revision
      2 - Below expectations
      3 - Meets expectations
      4 - Exceeds expectations
      5 - Outstanding, exactly what I needed

      Your rating:

User: 5

Nexa: 📊 Recorded rating: 5/5 → .beads/insights.jsonl

      Great to hear! This charter's evidence-backed approach with clear
      success metrics aligns with high-quality patterns from past work.
```

### Example 2: Low Rating with Feedback

```
User: /prd for Catalog Sync

Nexa: [Generates PRD]

Nexa: ✅ PRD complete → outputs/delivery/prds/catalog-sync-v2.md

      Rate this PRD (1-5, or 'skip'):

User: 2 - the requirements are too vague, engineering won't be able to build from this

Nexa: 📊 Recorded rating: 2/5 → .beads/insights.jsonl

      Noted: "requirements too vague" - I'll capture this for learning analysis.
      Would you like me to revise the PRD with more specific requirements?
```

### Example 3: User Skips

```
User: /voc

Nexa: [Generates VOC synthesis]

Nexa: ✅ VOC synthesis complete → outputs/insights/voc-synthesis-2026-01-20.md

      Rate this output (1-5, or 'skip'):

User: skip

Nexa: No problem. If you'd like to rate it later after review, just let me know.
```

## Storing User Comments

If user provides qualitative feedback with their rating, capture it in the `content` field:

```json
{
  "id": "bead_20260120_143000_001",
  "type": "output-rating",
  "content": "Requirements too vague, engineering won't be able to build from this",
  "source": "writing-prds-from-charters",
  "output_file": "outputs/delivery/prds/catalog-sync-v2.md",
  "rating": 2,
  "sentiment": "negative",
  "tags": ["writing-prds-from-charters", "quality-2", "requirements-clarity"],
  "created_at": "2026-01-20T14:30:00Z"
}
```

**Extracting feedback:**
- Look for explanatory text after the rating number
- Common patterns: "[rating] - [reason]", "[rating] because [reason]"
- Capture verbatim in `content` field

## Weekly Learning Integration

The weekly learning job (`pm-os learn --auto`) should:

1. **Read all output-rating beads** from `.beads/insights.jsonl`
2. **Calculate averages per skill:**
   - `synthesizing-voc: 4.5/5 (8 ratings)`
   - `generating-quarterly-charters: 4.2/5 (5 ratings)`
3. **Identify high-quality patterns:**
   - What do 5-star outputs have in common?
   - Read the actual output files with high ratings
   - Extract patterns (e.g., "explicit customer quotes", "clear success metrics")
4. **Identify low-quality patterns:**
   - What do 1-2 star outputs have in common?
   - Common feedback themes (e.g., "too vague", "missing evidence")
5. **Write learned patterns** to `.claude/rules/learned/quality-patterns.md`

See implementation spec in `nexa/src/learn.ts` enhancement task.

## Quality Gates

Before marking this protocol as implemented:

- [ ] Output rating prompt appears after PLAN/BUILD skill completion
- [ ] User can provide rating (1-5) or skip
- [ ] Rating stored as bead in `.beads/insights.jsonl` with correct schema
- [ ] User comments captured in `content` field if provided
- [ ] Confirmation message sent to user after capture
- [ ] Weekly learning can read and analyze rating beads

## Integration with Existing Systems

### Related Files

| File | Relationship |
|------|--------------|
| `.claude/rules/system/auto-capture.md` | General capture protocol (this is a specific type) |
| `.claude/rules/pm-core/output-metadata.md` | Output generation standards |
| `.claude/rules/system/session-greeting.md` | Will show quality trend based on ratings |
| `nexa/src/learn.ts` | Weekly learning analyzes rating beads |

### State Updates

After capturing a rating:
- No change to `nexa/state.json` (ratings are learning signals, not state)
- Append to `.beads/insights.jsonl` only

## User Preferences

Respect user preferences if set in `CLAUDE.local.md` or `inputs/context/preferences.md`:

```yaml
output_ratings:
  enabled: true|false
  auto_prompt: true|false  # If false, only ask if user says "rate this"
  skills: [list]           # Only ask for specific skills
```

**Default:** Enabled for all PLAN/BUILD skills, prompt automatically.

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
|--------------|--------------|---------|
| **Asking too frequently** | User fatigue, stops rating | Only PLAN/BUILD outputs |
| **Over-explaining ratings** | Wastes time | Simple 1-5 scale, clear labels |
| **Guilting user to rate** | Feels pressured | "or 'skip'" always offered |
| **Not capturing comments** | Lose valuable context | Parse and store qualitative feedback |
| **Ignoring low ratings** | Miss improvement signals | Prioritize learning from 1-2 star outputs |

## Why This Matters

**Without rating capture:**
- No signal on output quality
- Can't tell if PM OS is improving
- Users regenerate outputs blindly
- Learning is disconnected from satisfaction

**With rating capture:**
- Clear quality signal per skill
- Trending quality visible to user
- High-rated patterns identified and reinforced
- Low-rated patterns fixed systematically
- User sees PM OS improving over time

**The learning loop closes:**
```
Generate Output
    ↓
User Rates (1-5)
    ↓
Store as Bead
    ↓
Weekly Learning Analyzes
    ↓
Extract Quality Patterns
    ↓
Update Learned Rules
    ↓
Future Outputs Use Patterns
    ↓
Quality Trends Up ↑
```

This is how enterprise teams build systematic quality improvement.
