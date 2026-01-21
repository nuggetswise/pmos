# Weekly Learning Enhancement Specification

## Purpose

Extends the weekly learning job (`pm-os learn --auto`) to analyze output quality ratings and generate learned patterns about what makes high-quality PM outputs.

## Current State

The weekly learning job currently:
- Extracts patterns from historical outputs in `history/<skill>/`
- Writes learned rules to `.claude/rules/learned/`
- Runs on a 7-day cadence via `hooks/weekly-learning.sh`

## Enhancement Goal

Add rating analysis to identify:
1. Average quality per skill
2. Patterns in high-rated outputs (≥4/5)
3. Patterns in low-rated outputs (≤2/5)
4. Quality trends over time

## Data Source

**File:** `.beads/insights.jsonl`

**Format:** One JSON object per line (append-only)

**Relevant Bead Type:** `output-rating`

**Schema:**
```json
{
  "id": "bead_YYYYMMDD_HHMMSS_XXX",
  "type": "output-rating",
  "content": "Optional user comment",
  "source": "skill-name",
  "output_file": "relative/path/to/output.md",
  "rating": 1-5,
  "sentiment": "positive|neutral|negative",
  "tags": ["skill-name", "quality-N"],
  "created_at": "ISO 8601 timestamp",
  "connections": []
}
```

## Required Functionality

### 1. Read and Filter Rating Beads

**Function:** `readOutputRatings()`

**Logic:**
1. Read `.beads/insights.jsonl` line by line
2. Parse each line as JSON
3. Filter for `type === "output-rating"`
4. Return array of rating beads

**Error Handling:**
- If file doesn't exist → return empty array
- If line fails to parse → skip that line, log warning

### 2. Calculate Averages Per Skill

**Function:** `calculateSkillAverages(ratingBeads: Bead[])`

**Logic:**
1. Group ratings by `source` (skill name)
2. For each skill:
   - Calculate average: `sum(ratings) / count(ratings)`
   - Count total ratings
   - Round average to 1 decimal place

**Output Format:**
```typescript
{
  "synthesizing-voc": { average: 4.5, count: 8 },
  "generating-quarterly-charters": { average: 4.2, count: 5 },
  "writing-prds-from-charters": { average: 3.8, count: 3 }
}
```

### 3. Identify High-Quality Patterns

**Function:** `analyzeHighQualityPatterns(ratingBeads: Bead[])`

**Logic:**
1. Filter beads with `rating >= 4`
2. For each high-rated bead:
   - Read the actual output file (`output_file` field)
   - Extract structural patterns:
     - Does it have explicit customer quotes?
     - Does it have evidence links (file:line)?
     - Does it have a meta-prompt reasoning section?
     - Length of Claims Ledger (number of entries)
     - Presence of specific sections (Success Criteria, Risks, etc.)
3. Count pattern occurrences across high-rated outputs
4. Calculate percentage: `(outputs with pattern) / (total high-rated outputs)`

**Patterns to Look For:**

| Pattern | How to Detect | Example Finding |
|---------|---------------|-----------------|
| Explicit customer quotes | Search for `> "` (blockquote with quotes) | 8/10 high-rated VOC syntheses have explicit quotes |
| Evidence links | Count `file:line` or `source:line` patterns | 7/10 high-rated charters link evidence to claims |
| Meta-prompt reasoning | Check for "## Strategic Reasoning" section | 5/5 high-rated strategies include reasoning section |
| Large Claims Ledger | Count rows in Claims Ledger table | High-rated outputs avg 15 claims vs 8 for low-rated |
| Success metrics defined | Check for "Success Criteria" or "Success Metrics" | 9/10 high-rated charters have measurable metrics |

**Output Format:**
```typescript
{
  pattern: "Explicit customer quotes",
  occurrences: 8,
  total: 10,
  percentage: 80,
  skill: "synthesizing-voc"
}
```

### 4. Identify Low-Quality Patterns

**Function:** `analyzeLowQualityPatterns(ratingBeads: Bead[])`

**Logic:**
1. Filter beads with `rating <= 2`
2. For each low-rated bead:
   - Read `content` field (user comments)
   - Categorize feedback themes:
     - "too vague" → requirements clarity issue
     - "missing evidence" → evidence discipline issue
     - "no reasoning" → meta-prompt missing
     - "weak metrics" → success criteria issue
3. Count theme occurrences
4. Calculate percentage: `(feedback with theme) / (total low-rated outputs)`

**Common Feedback Themes:**

| Theme | Keywords | Example Finding |
|-------|----------|-----------------|
| Requirements clarity | "vague", "unclear", "engineering can't build" | 5/7 low-rated PRDs cited vague requirements |
| Evidence gaps | "missing evidence", "no sources", "assumptions" | 4/6 low-rated charters lacked VOC links |
| Weak metrics | "can't measure", "no success criteria", "unclear target" | 3/5 low-rated charters had unmeasurable goals |
| Missing reasoning | "why this choice", "no alternatives", "unclear rationale" | 4/4 low-rated strategies lacked meta-prompt reasoning |

**Output Format:**
```typescript
{
  theme: "Requirements clarity",
  occurrences: 5,
  total: 7,
  percentage: 71,
  skill: "writing-prds-from-charters"
}
```

### 5. Write Learned Quality Patterns

**Function:** `writeQualityPatterns()`

**Output File:** `.claude/rules/learned/quality-patterns.md`

**Format:**
```markdown
---
generated: YYYY-MM-DD HH:MM
last_analysis: YYYY-MM-DD
rating_count: [total ratings analyzed]
---

# Learned Quality Patterns

Auto-generated from output ratings. Last updated: YYYY-MM-DD

## Skill Quality Summary

| Skill | Avg Rating | Count | Status |
|-------|------------|-------|--------|
| synthesizing-voc | 4.5/5 | 8 | ✅ High |
| generating-quarterly-charters | 4.2/5 | 5 | ✅ High |
| writing-prds-from-charters | 3.8/5 | 3 | 🟡 Medium |
| competitive-analysis | 3.2/5 | 2 | 🟡 Medium |

**Legend:**
- ✅ High (≥4.0)
- 🟡 Medium (3.0-3.9)
- 🔴 Low (<3.0)

## High-Quality Patterns (≥4/5)

### Synthesizing VOC (4.5/5, 8 ratings)

**What high-rated outputs have:**
- Explicit customer quotes (8/10 outputs, 80%)
- Evidence links with file:line (7/10 outputs, 70%)
- Claims Ledger with ≥15 entries (6/10 outputs, 60%)

**Recommendation:** Continue prioritizing verbatim quotes and detailed evidence attribution.

### Generating Quarterly Charters (4.2/5, 5 ratings)

**What high-rated outputs have:**
- Meta-prompt reasoning section (5/5 outputs, 100%)
- Measurable success criteria (4/5 outputs, 80%)
- Evidence scoring for options (4/5 outputs, 80%)

**Recommendation:** Meta-prompt transparency correlates strongly with quality.

## Low-Quality Patterns (≤2/5)

### Writing PRDs from Charters (3.8/5, 3 ratings)

**What low-rated outputs lacked:**
- Requirements clarity (2/3 low-rated, 67%)
- Engineering-actionable specs (2/3 low-rated, 67%)

**Common feedback:**
- "Requirements too vague, engineering can't build from this" (2 mentions)
- "Missing edge cases" (1 mention)

**Recommendation:** Add more specific SHALL/SHOULD requirements, expand edge cases section.

## Quality Trends

| Time Period | Avg Rating | Count | Trend |
|-------------|------------|-------|-------|
| Last 30 days | 4.2 | 18 | ↑ |
| Previous 30 days | 3.8 | 12 | - |

**Overall:** Quality trending up (+0.4 average)

## Next Review

Run `pm-os learn --auto` weekly to update these patterns.
```

## Integration Points

### Update `nexa/src/learn.ts`

Add new command: `pm-os learn --quality`

**Execution flow:**
1. Read rating beads from `.beads/insights.jsonl`
2. Calculate skill averages
3. Analyze high-quality patterns
4. Analyze low-quality patterns
5. Write to `.claude/rules/learned/quality-patterns.md`
6. Log to audit: "Quality patterns analysis complete"

### Update `pm-os learn --auto`

Modify to run both:
1. Existing pattern extraction from `history/`
2. **New:** Quality pattern analysis from ratings

**Command:**
```bash
pm-os learn --auto
# Internally runs:
# 1. pm-os learn --patterns
# 2. pm-os learn --quality  (new)
```

### Update Weekly Hook

File: `hooks/weekly-learning.sh`

No changes needed - already calls `pm-os learn --auto`

## Error Handling

| Error | Handling |
|-------|----------|
| `.beads/insights.jsonl` missing | Log warning, write "No ratings yet" to quality-patterns.md |
| No rating beads found | Write "No output ratings captured yet" to quality-patterns.md |
| Output file in bead doesn't exist | Skip that rating, log warning |
| Malformed JSON in insights.jsonl | Skip that line, log warning, continue |
| Write permission denied | Log error, fail gracefully |

## Quality Gates

Before marking this feature complete:

- [ ] `pm-os learn --quality` command exists
- [ ] Reads and parses `.beads/insights.jsonl` correctly
- [ ] Calculates skill averages accurately
- [ ] Identifies high-quality patterns (≥4/5 outputs)
- [ ] Identifies low-quality patterns (≤2/5 outputs)
- [ ] Writes to `.claude/rules/learned/quality-patterns.md`
- [ ] Integrates with `pm-os learn --auto`
- [ ] Handles missing/malformed data gracefully
- [ ] Logs to audit trail

## Testing Plan

### Test Case 1: No Ratings Yet

**Setup:** Empty or missing `.beads/insights.jsonl`

**Expected Output:**
```markdown
# Learned Quality Patterns

No output ratings captured yet. Use the output rating protocol after generating PM outputs.
```

### Test Case 2: Ratings for Single Skill

**Setup:** `.beads/insights.jsonl` with 3 ratings for `synthesizing-voc` (ratings: 5, 4, 5)

**Expected Output:**
```markdown
## Skill Quality Summary

| Skill | Avg Rating | Count | Status |
|-------|------------|-------|--------|
| synthesizing-voc | 4.7/5 | 3 | ✅ High |
```

### Test Case 3: Mixed Ratings

**Setup:** 10 ratings across 3 skills (2 high-rated, 1 low-rated)

**Expected Output:**
- Skill averages calculated correctly
- High-quality patterns section has findings
- Low-quality patterns section has findings
- Trend analysis (if enough data)

### Test Case 4: Malformed Data

**Setup:** `.beads/insights.jsonl` with 1 malformed JSON line and 2 valid lines

**Expected Output:**
- Processes 2 valid lines
- Logs warning about malformed line
- Continues execution

## Future Enhancements

**Phase 2 (not in this spec):**
- Correlation analysis: Which specific patterns correlate with 5-star ratings?
- Skill-specific recommendations: Auto-generate checklist for each skill
- Sentiment analysis: Parse user comments with NLP for themes
- Time-series trends: Track quality month-over-month

**Phase 3 (not in this spec):**
- Real-time feedback: Show quality patterns in session greeting
- Auto-improve: Use patterns to modify skill templates automatically
- Comparative analysis: "Your VOC syntheses rate 0.5 higher than average"

## Dependencies

**NPM Packages (if needed):**
- `fs` (Node.js built-in) - file reading
- `path` (Node.js built-in) - path manipulation
- No external dependencies required (pure TypeScript/Node.js)

**Files Read:**
- `.beads/insights.jsonl` - rating data
- `outputs/**/*.md` - actual output files (to analyze patterns)

**Files Written:**
- `.claude/rules/learned/quality-patterns.md` - learned patterns
- `outputs/audit/auto-run-log.md` - audit entry

## Example Command Usage

```bash
# Manual quality analysis
pm-os learn --quality

# Auto mode (includes quality + other learnings)
pm-os learn --auto

# Weekly cron (already configured)
# Runs: pm-os learn --auto
# (no manual intervention needed)
```

## Success Metrics

This enhancement is successful when:

1. **Quality patterns file exists** after running `pm-os learn --auto`
2. **Skill averages are accurate** (manually verify against beads)
3. **High-quality patterns identified** (at least 3 patterns if 10+ ratings exist)
4. **Low-quality patterns identified** (at least 2 themes if 5+ low ratings exist)
5. **Session greeting shows quality trend** (reads from quality-patterns.md)
6. **User sees improvement over time** (ratings trend up as patterns are applied)

## Implementation Priority

**Priority 1 (MVP):**
- Read rating beads ✓
- Calculate skill averages ✓
- Write basic quality-patterns.md ✓

**Priority 2 (Full):**
- Analyze high-quality patterns ✓
- Analyze low-quality patterns ✓
- Trend analysis ✓

**Priority 3 (Polish):**
- Detailed feedback theme extraction
- Correlation analysis
- Skill-specific recommendations

## Notes for Implementer

- This is TypeScript code in `nexa/src/learn.ts`
- Use existing patterns from `nexa/src/` for consistency
- Follow existing audit logging conventions
- Reuse existing file I/O utilities if available
- Keep execution fast (<5 seconds for 100 ratings)
- Write defensive code (handle missing/malformed data gracefully)

## Related Files

| File | Relationship |
|------|--------------|
| `.claude/rules/system/output-rating-capture.md` | Defines how ratings are captured |
| `.beads/README.md` | Documents bead schema |
| `.claude/rules/system/session-greeting.md` | Displays quality trend |
| `hooks/weekly-learning.sh` | Triggers this analysis weekly |
