# Mode: Crisis Communication

## Purpose

Tone and structure rules for high-stakes, time-sensitive communications where trust is at risk. Use when incidents occur, deadlines are missed, or stakeholders are escalated.

## When to Apply

- Production incidents affecting customers
- Missed commitments to stakeholders
- Customer escalations
- Security or compliance issues
- Any output with `--mode crisis` flag

## Core Principles

### 1. Lead with Impact, Not Cause

**Wrong:** "The database migration script had a bug that..."
**Right:** "Customer orders are delayed. Here's what we're doing..."

Stakeholders care about:
1. What's broken (impact)
2. What you're doing about it (action)
3. When it'll be fixed (timeline)
4. Why it happened (root cause) - last, if at all

### 2. Own It, Don't Hedge

**Wrong:** "There appears to have been an issue that may have affected..."
**Right:** "We broke catalog sync. It affected 47 customers for 3 hours."

| Hedging Language | Direct Language |
|------------------|-----------------|
| "There was an issue" | "We caused an outage" |
| "Some customers may have" | "47 customers experienced" |
| "We're looking into" | "We're fixing X by doing Y" |
| "Hopefully by end of day" | "Fix deployed by 5pm PT" |

### 3. Timelines Are Commitments

Only give timelines you can hit. If uncertain:

**Wrong:** "Should be fixed soon"
**Right:** "We'll have an update by 3pm. Fix timeline TBD pending investigation."

### 4. No Blame, Only Facts

**Wrong:** "The vendor's API change caused this"
**Right:** "The issue resulted from an external API change we didn't catch in testing"

Take responsibility for your system's resilience, even when external factors contributed.

## Output Structure

### Incident Update Format

```markdown
## [STATUS] Incident: [Brief Description]

**Status:** Investigating | Identified | Monitoring | Resolved
**Impact:** [Who/what is affected, quantified]
**Started:** [Timestamp]
**Last Update:** [Timestamp]

### What Happened
[1-2 sentences, impact-first]

### Current Status
[What we know, what we're doing]

### Next Steps
| Action | Owner | ETA |
|--------|-------|-----|
| [Specific action] | [Name] | [Time] |

### Timeline
- [HH:MM] - [Event]
- [HH:MM] - [Event]

---
*Next update: [Time] or when status changes*
```

### Stakeholder Escalation Format

```markdown
## Escalation: [Customer/Issue]

**Severity:** P0 | P1 | P2
**Customer Impact:** [Quantified]
**Business Risk:** [Revenue, relationship, legal]

### Situation
[What the customer is experiencing]

### Our Response
[Immediate actions taken]

### Ask
[What you need from this audience]

### Commitment
[What you're committing to and by when]
```

## Tone Guidelines

| Situation | Tone | Example |
|-----------|------|---------|
| Active incident | Calm urgency | "We're on it. Here's what we know." |
| Post-incident | Accountable | "We caused X. Here's how we'll prevent it." |
| Escalation | Empathetic + action | "I understand the impact. Here's our plan." |
| Timeline pressure | Honest | "I can commit to X by Y. Z is uncertain." |

## Communication Cadence

### During Active Incident

| Status | Update Frequency |
|--------|------------------|
| Investigating | Every 30 minutes |
| Identified | Every hour |
| Fix in progress | At key milestones |
| Resolved | Final summary |

### Stakeholder Updates

| Stakeholder | When to Update |
|-------------|----------------|
| Affected customers | Immediately, then at resolution |
| Internal leadership | Within 15 minutes of P0/P1 |
| Full team | Post-resolution, with learnings |

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
|--------------|--------------|---------|
| **Defensive tone** | Erodes trust | Own the issue |
| **Technical jargon** | Excludes stakeholders | Plain language impact |
| **Vague timelines** | Creates anxiety | Specific commitments or honest uncertainty |
| **Blame assignment** | Distracts from fix | Focus on resolution |
| **Over-communicating** | Noise drowns signal | Structured updates at set intervals |
| **Under-communicating** | Stakeholders assume worst | Regular updates even if "no change" |

## Quality Gates

Before sending crisis communication:

- [ ] Impact stated in first sentence
- [ ] No hedging language ("may have", "appears to")
- [ ] Timeline commitments are achievable
- [ ] No blame language (internal or external)
- [ ] Next update time specified
- [ ] Audience-appropriate detail level
- [ ] Proofread (typos erode confidence in crisis)

## Integration

Apply this mode to any skill output:

```
/exec-update --mode crisis
/stakeholders --mode crisis  # For escalation communication plan
```
