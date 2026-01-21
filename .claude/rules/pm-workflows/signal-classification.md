# Signal Classification

## Purpose

Provides a structured framework for classifying insights gathered during discovery. Ensures consistent evidence tagging across all discovery outputs and downstream skills.

## When to Apply

- Running `/discover --analyze-docs` (document analysis)
- Running `/discover --synthesize` (signal synthesis)
- Processing interview notes for VOC synthesis
- Any time you're extracting insights from sources

## The Three Signal Types

| Type | Definition | Evidence Threshold | Example |
|------|------------|-------------------|---------|
| **EXPLICIT** | Directly stated in source | 1 source sufficient | "Sync takes 45 seconds" (from Jira ticket) |
| **INFERRED** | Pattern across multiple sources | 2+ sources required | Sales AND Support both mention competitor X |
| **IMPLICIT** | PM best practice gap | Professional judgment | No success metrics defined for shipped features |

---

## EXPLICIT Signals

### Definition

Facts, decisions, or statements directly stated in a source document or by a stakeholder.

### Characteristics

- Verbatim quotes or exact data
- Single source is sufficient
- No interpretation required
- Can be verified by re-reading source

### Examples

| Signal | Source | Why EXPLICIT |
|--------|--------|--------------|
| "Sync latency is 45 seconds" | Performance report | Exact metric stated |
| "We lost Acme to Syndigo" | Sales team | Direct statement |
| "Feature X was cut from Q3" | Roadmap deck | Explicit decision |
| "3 P0 bugs filed this week" | Jira export | Exact count |

### How to Capture

```markdown
| Claim | Type | Source |
|-------|------|--------|
| Sync latency is 45 seconds | EXPLICIT | perf-report-2026-01.pdf:12 |
| Lost Acme deal to Syndigo | EXPLICIT | sales-interview-2026-01-15.md |
```

### Quality Check

Before marking EXPLICIT:
- [ ] Can you point to the exact line/quote?
- [ ] Is this what the source actually says (not your interpretation)?
- [ ] Would someone else reading the source reach the same conclusion?

---

## INFERRED Signals

### Definition

Patterns, trends, or conclusions drawn from multiple sources that weren't explicitly stated by any single source.

### Characteristics

- Requires 2+ independent sources
- Involves pattern recognition
- Sources may not be aware of the pattern
- Confidence increases with more sources

### Examples

| Signal | Sources | Why INFERRED |
|--------|---------|--------------|
| "Sync speed is a systemic issue" | 12 Jira tickets + 3 customer interviews | Pattern across sources |
| "Competitor X is our main threat" | Sales (lost deals) + Marketing (positioning) | Multiple perspectives align |
| "Engineering team is stretched" | Delayed features + tech debt backlog | Indirect evidence |

### Confidence Levels

| Sources | Confidence | Action |
|---------|------------|--------|
| 2 sources | Low | Flag for validation |
| 3-4 sources | Medium | Include with caveat |
| 5+ sources | High | Treat as near-fact |

### How to Capture

```markdown
| Claim | Type | Source |
|-------|------|--------|
| Sync speed is top customer pain | INFERRED | jira-export.csv (12 tickets) + voc-synthesis.md (3/7 interviews) |
| Competitor X winning on speed | INFERRED | sales-interview.md + competitor-analysis.md |
```

### Quality Check

Before marking INFERRED:
- [ ] Do you have 2+ independent sources?
- [ ] Are sources actually independent (not citing each other)?
- [ ] Is the pattern real or confirmation bias?
- [ ] Have you noted confidence level?

---

## IMPLICIT Signals

### Definition

Gaps, missing practices, or professional standards not being met—identified through PM expertise rather than explicit evidence.

### Characteristics

- Based on PM best practices
- Absence of something expected
- Requires professional judgment
- Often "dog that didn't bark" insights

### Examples

| Signal | Observation | Why IMPLICIT |
|--------|-------------|--------------|
| "No success metrics for shipped features" | Roadmap shows features, no measurement plan | PM best practice gap |
| "No customer discovery before build" | PRDs exist without VOC references | Process gap |
| "No competitive positioning" | Marketing docs missing competitor comparison | Strategic gap |
| "No rollback plan" | Launch plan has no failure mode | Risk management gap |

### Common Implicit Gaps to Look For

| Category | What's Missing | Why It Matters |
|----------|---------------|----------------|
| **Measurement** | Success metrics, baselines, tracking | Can't know if you succeeded |
| **Evidence** | VOC, customer interviews, data | Decisions based on assumptions |
| **Process** | Discovery, validation, retrospectives | No learning loop |
| **Risk** | Contingencies, rollback plans, dependencies | Blind to failure modes |
| **Communication** | Stakeholder updates, decision logs | No shared context |

### How to Capture

```markdown
| Claim | Type | Source |
|-------|------|--------|
| No success metrics for Q3 features | IMPLICIT | PM best practice: shipped features in roadmap-Q3.pptx have no measurement plan |
| Customer discovery skipped | IMPLICIT | PM best practice: PRDs reference no VOC sources |
```

### Quality Check

Before marking IMPLICIT:
- [ ] Is this a recognized PM best practice?
- [ ] Is the gap actually consequential?
- [ ] Could there be a reason it's missing (you just don't see it)?
- [ ] Have you flagged it for validation?

---

## Classification Decision Tree

```
Is the claim directly stated in a source?
    │
   YES → EXPLICIT
    │
   NO
    │
    ▼
Is there a pattern across 2+ sources?
    │
   YES → INFERRED (note confidence level)
    │
   NO
    │
    ▼
Is this a PM best practice gap?
    │
   YES → IMPLICIT
    │
   NO
    │
    ▼
Don't include (speculation without basis)
```

---

## Integration with Claims Ledger

Every discovery output must include a Claims Ledger with signal classification:

```markdown
## Claims Ledger

| Claim | Type | Source | Confidence |
|-------|------|--------|------------|
| Sync latency is 45 seconds | EXPLICIT | perf-report.pdf:12 | - |
| Sync is top customer pain | INFERRED | Jira (12) + VOC (3/7) | High |
| No measurement plan exists | IMPLICIT | PM best practice | Medium |
```

### Confidence Column

- **EXPLICIT**: Omit (single source = fact)
- **INFERRED**: Low / Medium / High (based on source count)
- **IMPLICIT**: Medium (professional judgment)

---

## Signal Validation

### EXPLICIT → No validation needed
Already stated; just cite accurately.

### INFERRED → Validate with stakeholders
- "I'm seeing a pattern that X. Does that match your experience?"
- Look for confirming or disconfirming evidence

### IMPLICIT → Validate the gap exists
- "I notice there's no [X]. Is that intentional or an oversight?"
- Could be missing from your view but exists elsewhere

---

## Common Mistakes

| Mistake | Problem | Correction |
|---------|---------|------------|
| **Calling inference explicit** | Overclaims evidence | Check: is it in ONE source verbatim? |
| **Single source as inferred** | Underclaims evidence | If it's stated clearly, it's EXPLICIT |
| **Implicit without expertise** | Random gaps flagged | Only flag recognized PM practice gaps |
| **No source for explicit** | Untraceable | Always include file:line |
| **Confirmation bias in inferred** | Seeing patterns that aren't there | Actively seek disconfirming evidence |

---

## Quality Gates

Before completing any discovery output:

- [ ] Every claim is classified (EXPLICIT / INFERRED / IMPLICIT)
- [ ] EXPLICIT claims have exact source citations
- [ ] INFERRED claims have 2+ sources listed
- [ ] INFERRED claims have confidence level
- [ ] IMPLICIT claims reference PM best practice
- [ ] Claims Ledger is complete
- [ ] No unclassified claims remain

---

## Relationship to Evidence Rules

Signal classification is **complementary** to the core evidence rules in `.claude/rules/pm-core/evidence-rules.md`:

| Evidence Rules | Signal Classification |
|----------------|----------------------|
| Evidence / Assumption / Open Question | EXPLICIT / INFERRED / IMPLICIT |
| Applies to all PM outputs | Specific to discovery phase |
| Focuses on claim reliability | Focuses on source type |

**Mapping:**
- EXPLICIT → Evidence
- INFERRED (high confidence) → Evidence
- INFERRED (low confidence) → Assumption
- IMPLICIT → Assumption or Open Question

When moving from discovery to downstream skills (VOC synthesis, charters), translate signal classifications to the standard evidence tags.
