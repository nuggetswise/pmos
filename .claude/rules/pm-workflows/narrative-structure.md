# Narrative Structure

## Purpose

Transform messy PM context into relatable narratives for stakeholder communication. Use when presenting strategy, justifying decisions, or building alignment.

## When to Apply

- Executive presentations
- Strategy documents
- Change management communications
- Stakeholder alignment meetings
- Any output with `--story-mode` flag

## The Schema: Context → Conflict → Resolution

Every compelling PM narrative follows this structure:

### 1. Context (The Setup)

**Goal:** Establish shared understanding of the current state.

| Element | Purpose | Example |
|---------|---------|---------|
| **Situation** | Where we are | "Active Catalog serves 500+ retailers with product data sync" |
| **Stakes** | Why it matters | "Catalog accuracy directly impacts PO success rates" |
| **History** | How we got here | "Built 5 years ago for GS1 soft goods, now expanding" |

**Pattern:**
```
We [current capability] for [audience].
This matters because [stakes].
We got here by [brief history].
```

### 2. Conflict (The Tension)

**Goal:** Create urgency by surfacing the gap between current and desired state.

| Element | Purpose | Example |
|---------|---------|---------|
| **Problem** | What's broken | "Sync takes 45 seconds, competitors do it in 5" |
| **Impact** | Who suffers | "Customers losing deals to faster alternatives" |
| **Constraint** | Why it's hard | "Legacy architecture wasn't built for real-time" |

**Pattern:**
```
But [problem statement].
This is costing us [quantified impact].
We can't simply [obvious solution] because [constraint].
```

### 3. Resolution (The Path Forward)

**Goal:** Present a credible path to the desired state.

| Element | Purpose | Example |
|---------|---------|---------|
| **Proposal** | What we'll do | "Rebuild sync layer with event-driven architecture" |
| **Evidence** | Why it'll work | "Pilot with Acme showed 90% latency reduction" |
| **Ask** | What we need | "2 engineers for 1 quarter, $50K infrastructure" |

**Pattern:**
```
We propose [solution].
We know this works because [evidence].
To make this happen, we need [specific ask].
```

## Output Structure

When `--story-mode` is applied, structure output as:

```markdown
## The Story

### Where We Are
[Context paragraph - 2-3 sentences]

### The Challenge
[Conflict paragraph - 2-3 sentences with quantified impact]

### Our Path Forward
[Resolution paragraph - proposal + evidence + ask]

---

## Supporting Evidence
[Standard evidence section with Claims Ledger]
```

## Examples

### Good Narrative

```markdown
## The Story

### Where We Are
Active Catalog powers product data sync for 500+ retailers across the Business
Network. Every successful PO starts with accurate catalog data—it's the foundation
of B2B commerce on our platform.

### The Challenge
But our sync is slow. 45 seconds per catalog update, while Syndigo delivers in 5.
Three major customers (Acme, Globex, Initech) cited sync speed in their last
renewal negotiations. We're bleeding competitive deals—$2M ARR at risk this quarter.

### Our Path Forward
We'll rebuild the sync layer using event-driven architecture. Our pilot with Acme
showed 90% latency reduction without data integrity issues. To ship this Q2, we
need 2 backend engineers and $50K for infrastructure upgrades.
```

### Bad Narrative (Anti-Pattern)

```markdown
## Executive Summary

The catalog sync feature has performance issues. We analyzed 47 tickets and found
that latency is above industry benchmarks. Our recommendation is to invest in
infrastructure improvements. The ROI analysis shows positive returns within 18 months.

Technical details: The current architecture uses batch processing with a 45-second
average latency. Competitors use event-driven architectures...
```

**Why it fails:**
- No emotional hook (starts with feature, not impact)
- No tension (just states facts)
- No clear ask (vague "investment")
- Buries the stakes in technical details

## Integration with Skills

### With `/exec-update`

```
/exec-update --story-mode
```

Transforms standard exec update into narrative format.

### With `/charters`

```
/charters --story-mode
```

Each charter bet gets Context → Conflict → Resolution framing.

### With `/strategy`

```
/strategy --story-mode
```

Full strategy doc structured as extended narrative.

## Quality Gates

Before finalizing narrative output:

- [ ] Context establishes shared understanding (no jargon assumed)
- [ ] Conflict creates genuine tension (not manufactured urgency)
- [ ] Resolution is specific and actionable (not vague commitments)
- [ ] Stakes are quantified where possible ($ impact, customer count)
- [ ] Evidence supports the proposed resolution
- [ ] Ask is concrete (people, money, time, decisions)

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Starting with solution** | No buy-in for the problem | Lead with conflict |
| **Vague stakes** | "It's important" | Quantify: "$2M ARR at risk" |
| **Technical rabbit holes** | Loses non-technical audience | Save details for appendix |
| **Manufactured urgency** | "Crisis" with no evidence | Use real data or acknowledge uncertainty |
| **Missing the ask** | Audience doesn't know what to do | End with specific request |
