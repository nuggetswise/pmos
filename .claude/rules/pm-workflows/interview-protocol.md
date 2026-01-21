# Interview Protocol

## Purpose

Provides role-specific interview question templates and protocols for stakeholder discovery. Used by the `discovery` skill to generate customized interview guides.

## When to Apply

- Preparing for stakeholder interviews (`/discover --prep [role]`)
- Onboarding to a new product/team
- Gathering input for quarterly planning
- Investigating specific issues or gaps

## Core Principles

### 1. Context Before Questions

Always review what you know before interviewing:
- What documents have you analyzed?
- What patterns have emerged?
- What specific hypotheses need validation?

### 2. Three Question Types

Every interview should include:

| Type | Purpose | Example |
|------|---------|---------|
| **Evidence Validation** | Confirm what you think you know | "I've heard sync speed is an issue - is that accurate?" |
| **Gap Filling** | Learn what you don't know | "What feature do prospects ask for that we don't have?" |
| **Open Discovery** | Uncover unexpected insights | "What would make your job 10x easier?" |

### 3. Listen More Than Talk

- Aim for 80% them, 20% you
- Use silence as a tool (let them fill it)
- Follow their thread, not your script
- Note exact quotes, not paraphrases

---

## Role-Specific Protocols

### Sales Interviews

**Goal:** Understand win/loss patterns, competitive landscape, customer objections

**Who to interview:** Account Executives, Sales Engineers, Sales Leadership

**Core Questions:**

#### Evidence Validation
1. "I've seen [competitor X] mentioned in lost deals - what specifically do they have that we don't?"
2. "The roadmap shows [Feature Y] was prioritized - is that what customers are asking for?"
3. "Our metrics show [stat] - does that match what you see in the field?"

#### Gap Filling
4. "Which deals did we lose last quarter? What was the deciding factor?"
5. "What feature do prospects ask for that we don't have?"
6. "What's hardest to explain or demo?"
7. "Which customer segment is growing fastest?"

#### Open Discovery
8. "What would make your job 10x easier?"
9. "If you could change one thing about the product, what would it be?"
10. "What are customers excited about that we don't talk about enough?"

**Signals to Watch For:**
- Patterns in lost deals (same competitor? same feature gap?)
- Disconnect between roadmap and field needs
- Emerging customer segments
- Pricing/packaging issues

---

### Support/CS Interviews

**Goal:** Understand pain points, workarounds, churn signals

**Who to interview:** Support Leads, Customer Success Managers, Support Engineers

**Core Questions:**

#### Evidence Validation
1. "I see [X type of tickets] are common - is that the biggest pain point?"
2. "Are the issues I'm seeing in Jira representative of actual customer pain?"
3. "Is [Feature Y] actually helping customers, or causing more confusion?"

#### Gap Filling
4. "What are the top 3 tickets you see every week?"
5. "Which issues make customers angriest?"
6. "What workarounds do you tell customers to use?"
7. "Which customers are at churn risk? Why?"

#### Open Discovery
8. "What do you wish the product did differently?"
9. "What's the most creative workaround a customer has found?"
10. "If you could fix one thing tomorrow, what would it be?"

**Signals to Watch For:**
- Recurring pain points (systemic issues)
- Workarounds (product gaps)
- Churn predictors
- Hidden product strengths (features customers love)

---

### Marketing Interviews

**Goal:** Understand positioning, market perception, competitive messaging

**Who to interview:** Product Marketing, Content, Demand Gen

**Core Questions:**

#### Evidence Validation
1. "Our positioning is [X] - does that resonate in the market?"
2. "I've seen competitor [Y] position themselves as [Z] - is that working?"
3. "The messaging around [Feature X] - is it landing?"

#### Gap Filling
4. "What positioning resonates most with prospects?"
5. "Which customer segment is growing fastest?"
6. "What objections do we hear most in the market?"
7. "What's our competitors' strongest message against us?"

#### Open Discovery
8. "What content gets the most engagement? Why?"
9. "What story are customers telling about us?"
10. "What market trend should we be positioning against?"

**Signals to Watch For:**
- Positioning effectiveness (what resonates)
- Competitive messaging gaps
- Emerging market narratives
- Content performance patterns

---

### Customer Interviews

**Goal:** Understand actual usage, unmet needs, value perception

**Who to interview:** Power users, New users, Churned customers, Prospects

**Core Questions:**

#### Evidence Validation
1. "We built [Feature X] for [use case] - is that how you use it?"
2. "I've heard [pain point] is common - is that your experience?"
3. "Our value prop is [X] - does that match why you bought?"

#### Gap Filling
4. "Walk me through your workflow - where does our product fit?"
5. "What were you using before? What made you switch?"
6. "What's the most frustrating part of using [product]?"
7. "What would make you recommend us to a colleague?"

#### Open Discovery
8. "What do you wish you could do that you can't today?"
9. "If you had a magic wand, what would you change?"
10. "What other tools do you use alongside ours? Why?"

**Signals to Watch For:**
- Actual vs. intended use cases
- Integration ecosystem
- Value perception (what they'd pay more for)
- Switching triggers (why they came, why they'd leave)

---

### Engineering Interviews

**Goal:** Understand technical constraints, debt, feasibility

**Who to interview:** Tech Leads, Architects, Senior Engineers

**Core Questions:**

#### Evidence Validation
1. "I've heard [system X] is a bottleneck - is that accurate?"
2. "The roadmap assumes we can build [Y] in [timeframe] - is that realistic?"
3. "Are there technical risks to [proposed approach] I should know about?"

#### Gap Filling
4. "What's the biggest technical debt slowing us down?"
5. "If you had a month of uninterrupted time, what would you fix?"
6. "What capabilities would unlock the most value?"
7. "What's the hardest part of our codebase to work with?"

#### Open Discovery
8. "What would you build if you had no constraints?"
9. "What's technically possible that product hasn't asked for?"
10. "What are we over-engineering that we could simplify?"

**Signals to Watch For:**
- Hidden technical constraints
- Feasibility reality vs. roadmap assumptions
- Quick wins (easy improvements)
- Architecture evolution needs

---

### Leadership Interviews

**Goal:** Understand strategy, priorities, political landscape

**Who to interview:** VP/Director level, GMs, Executives

**Core Questions:**

#### Evidence Validation
1. "I understand the priority is [X] - is that still accurate?"
2. "The strategy doc says [Y] - is that the current thinking?"
3. "I've heard [team Z] is the key dependency - is that right?"

#### Gap Filling
4. "What does success look like for this product in 12 months?"
5. "What are you most worried about?"
6. "Who else should I be talking to?"
7. "What's the one thing this product must get right?"

#### Open Discovery
8. "What's the biggest opportunity we're not pursuing?"
9. "What would change your mind about current priorities?"
10. "What do you wish the team understood better?"

**Signals to Watch For:**
- Actual vs. stated priorities
- Political dynamics
- Hidden constraints (budget, headcount, strategic shifts)
- Success criteria that aren't documented

---

## Interview Logistics

### Before the Interview

| Step | Action |
|------|--------|
| 1 | Review all relevant discovery outputs |
| 2 | Identify 3 hypotheses to validate |
| 3 | Prepare role-specific questions (customize from templates) |
| 4 | Set up note-taking (template below) |

### During the Interview

| Best Practice | Why |
|---------------|-----|
| Start with rapport (2-3 min) | Build trust, get better answers |
| State your goal for the conversation | Set expectations |
| Ask open questions first | Don't lead the witness |
| Capture verbatim quotes | Evidence > paraphrasing |
| Note surprises and follow-ups | Capture unexpected insights |
| End with "What didn't I ask?" | Uncover blind spots |

### After the Interview

| Step | Action |
|------|--------|
| 1 | Clean up notes within 24 hours |
| 2 | Save to `inputs/voc/interview-[role]-[date].md` |
| 3 | Update discovery signals if new patterns emerge |
| 4 | Schedule follow-ups if needed |

---

## Note-Taking Template

```markdown
# Interview: [Name] - [Role]
**Date:** YYYY-MM-DD
**Duration:** X min

## Context
[Why this interview, what we hoped to learn]

## Key Quotes
> "[Exact quote]"
- Context: [what prompted this]

> "[Exact quote]"
- Context: [what prompted this]

## Findings

### Validated
- [Hypothesis we confirmed]

### Invalidated
- [Hypothesis that was wrong]

### New Insights
- [Unexpected findings]

## Follow-Ups
- [ ] [Action item]
- [ ] [Question for next interview]

## Signals
| Signal | Type | Confidence |
|--------|------|------------|
| [insight] | EXPLICIT/INFERRED | High/Medium |
```

---

## Quality Gates

Before interview:
- [ ] Reviewed existing discovery outputs
- [ ] Customized questions for this specific person
- [ ] Have 3 hypotheses to validate
- [ ] Note template ready

After interview:
- [ ] Notes saved to inputs/voc/
- [ ] Key quotes captured verbatim
- [ ] Signals classified (EXPLICIT/INFERRED)
- [ ] Follow-ups scheduled

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
|--------------|--------------|---------|
| **Reading questions from a list** | Feels like interrogation | Have a conversation, use questions as guide |
| **Asking leading questions** | Biases responses | Ask open, then probe |
| **Interrupting** | Miss insights | Let silence work |
| **Paraphrasing quotes** | Loses evidence value | Capture exact words |
| **Not following up** | Misses depth | "Tell me more about that" |
| **Skipping context review** | Wastes their time | Know what you know first |
