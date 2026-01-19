---
name: competitive-analysis
description: Use when you need to research competitors and produce a structured comparison of features, positioning, or market landscape.
---

# Competitive Analysis

## Overview

A structured protocol for researching competitors that requires source attribution, separates observations from inferences, and produces actionable comparison matrices.

## When to Use

- User asks about competitors or "the market"
- User needs to understand competitive positioning
- User wants a feature comparison matrix
- User is preparing for strategy discussions or investor meetings

## Core Pattern

**Step 1: Define Scope**

Gather from user:
- List of competitors to analyze (or ask for suggestions)
- Specific dimensions to compare (features, pricing, positioning, target market)
- Purpose of analysis (inform roadmap, sales enablement, investor deck)

**Step 2: Research Protocol**

For each competitor, collect:

| Category | What to Find | Source Type |
|----------|--------------|-------------|
| Product | Features, capabilities | Website, docs, demos |
| Pricing | Plans, tiers, pricing model | Pricing page |
| Positioning | Tagline, value prop, target market | Homepage, about page |
| Traction | Funding, customers, reviews | News, G2/Capterra, Crunchbase |

**Rules:**
- Only use publicly available information
- Cite source URL for every claim
- Mark anything uncertain as "Unverified"
- Do NOT guess or infer pricing/features

**Step 3: Feature Comparison Matrix**

| Feature | Our Product | Competitor A | Competitor B |
|---------|-------------|--------------|--------------|
| [Feature 1] | ✓ | ✓ | ✗ |
| [Feature 2] | ✗ | ✓ | ✓ |

**Legend:** ✓ = Has feature, ✗ = Missing, ~ = Partial, ? = Unknown

**Step 4: Positioning Map**

```
           Enterprise
               │
    [Comp A]   │  [Comp B]
               │
  ─────────────┼─────────────
               │
    [Us]       │  [Comp C]
               │
             SMB
     Simple       Complex
```

**Step 5: Generate Output**

Write to `outputs/insights/competitive-analysis-YYYY-MM-DD.md`:

```markdown
---
generated: YYYY-MM-DD HH:MM
skill: competitive-analysis
sources:
  - [URLs researched]
downstream:
  - outputs/roadmap/Qx-YYYY-charters.md
---

# Competitive Analysis: [Market/Category]

## Executive Summary
[2-3 sentences on competitive landscape]

## Competitors Analyzed
| Competitor | Website | Positioning |
|------------|---------|-------------|
| [Name] | [URL] | [One-line positioning] |

## Feature Comparison
| Feature | Us | Comp A | Comp B | Source |
|---------|-----|--------|--------|--------|
| [Feature 1] | ✓ | ✓ | ✗ | [URLs] |

**Legend:** ✓ = Has, ✗ = Missing, ~ = Partial, ? = Unknown

## Pricing Comparison
| Competitor | Model | Entry Price | Enterprise | Source |
|------------|-------|-------------|------------|--------|
| [Name] | [SaaS/Usage] | [$X/mo] | [Contact] | [URL] |

## Positioning Map
[ASCII diagram or description]

## Opportunities
- **[Gap we can exploit]** — Evidence: [source]

## Threats
- **[Competitor strength]** — Evidence: [source]

## Recommendations
[Only if supported by evidence]

## Research Date
[YYYY-MM-DD] — Note: Competitive info changes; re-run periodically

## Sources
| Competitor | URLs Researched |
|------------|-----------------|
| [Name] | [URL1], [URL2] |

## Claims Ledger
| Claim | Type | Source |
|-------|------|--------|
| [Has feature X] | Evidence | [URL] |
| [Pricing is $Y] | Evidence | [Pricing page URL] |
| [Targets enterprise] | Evidence/Inference | [About page or inference] |
```

**Step 6: Copy to History & Update Tracker**

- Copy to `history/competitive-analysis/competitive-analysis-YYYY-MM-DD.md`
- Update `nexa/state.json` and append to `outputs/audit/auto-run-log.md`

## Quick Reference

| Output | Location |
|--------|----------|
| Feature matrix | outputs/insights/ |
| Full analysis | outputs/insights/ |
| History | history/competitive-analysis/ |

## Common Mistakes

- **Guessing features:** "They probably have X" → Only claim what's documented
- **Missing sources:** Making claims without URLs → Every claim needs a source
- **Stale data:** Using 2-year-old info → Note date of source, flag if old
- **Inferring strategy:** "They're clearly targeting enterprise" → Only state what's explicit
- **Competitive FUD:** "They're bad at X" → Stick to factual comparisons
- **No research date:** Analysis without timestamp → Always include when researched

## Verification Checklist

- [ ] All competitors have source URLs
- [ ] Feature claims cite specific pages
- [ ] Pricing info from official pricing page (or marked Unknown)
- [ ] Analysis saved to outputs/insights/
- [ ] Date of research noted prominently
- [ ] Unverified claims marked as such
- [ ] Metadata header complete
- [ ] Copied to history, tracker updated

## Evidence Tracking

| Claim | Type | Source |
|-------|------|--------|
| [Has feature X] | Evidence | [URL to docs/page] |
| [Pricing is $Y] | Evidence | [Pricing page URL] |
| [Targets enterprise] | Evidence/Inference | [About page or "Inferred from..."] |
