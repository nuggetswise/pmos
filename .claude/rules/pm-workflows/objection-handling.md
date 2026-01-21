# Objection Handling

## Purpose

Patterns for handling pushback, challenges, and objections gracefully in PM communications. Use when stakeholders challenge your proposals, timelines, or priorities.

## When to Apply

- Stakeholder pushback on roadmap
- Budget/resource negotiations
- Technical feasibility debates
- Priority conflicts
- Any situation requiring `/reframe` skill

## Core Principles

### 1. Acknowledge Before Defending

**Defensive:** "That's not accurate because..."
**Acknowledging:** "I hear your concern about X. Here's what I've seen..."

Never skip acknowledgment. It signals you're listening, not just waiting to talk.

### 2. Separate Emotion from Content

Objections often have two layers:

| Layer | Example | Response |
|-------|---------|----------|
| **Emotion** | "This is reckless!" | Acknowledge the feeling |
| **Content** | "The timeline is too aggressive" | Address the substance |

Address emotion first, then content.

### 3. Find the Underlying Need

Every objection masks a need:

| Surface Objection | Underlying Need | Better Response |
|-------------------|-----------------|-----------------|
| "The timeline is too aggressive" | Confidence in delivery | "What would make you confident we can hit it?" |
| "We can't afford this" | Understanding of ROI | "Let me show you the cost of not doing this" |
| "This isn't our priority" | Alignment on strategy | "Help me understand what is—I want to align" |
| "Engineering will never agree" | Risk mitigation | "What if we got their buy-in first?" |

### 4. Reframe, Don't Rebut

**Rebuttal:** "No, you're wrong because..."
**Reframe:** "I see it differently. Here's another angle..."

Reframing invites dialogue. Rebuttal invites combat.

## The LAAR Framework

**L**isten → **A**cknowledge → **A**sk → **R**espond

### Listen

- Let them finish completely
- Note the specific concern (write it down if needed)
- Watch for emotional subtext

### Acknowledge

Templates:
- "I understand why you'd see it that way."
- "That's a fair concern. I've thought about it too."
- "You're right that [valid part of their objection]."

### Ask

Clarifying questions before responding:
- "Can you help me understand what specifically worries you?"
- "What would need to be true for you to feel comfortable with this?"
- "Is this about [timeline/resources/risk/something else]?"

### Respond

Only after L-A-A:
- Address the underlying need, not just surface objection
- Provide evidence where possible
- Offer a path forward together

## Common Objection Types and Responses

### Timeline Objections

**"This is too aggressive"**

| Step | Response |
|------|----------|
| Acknowledge | "You're right that it's ambitious." |
| Ask | "What specifically feels risky?" |
| Respond | "Here's how we've de-risked: [evidence]. What would make you more comfortable?" |

**"Why the rush?"**

| Step | Response |
|------|----------|
| Acknowledge | "Fair question—urgency should be justified." |
| Ask | "Are you concerned about quality, or questioning priority?" |
| Respond | "The urgency comes from [customer evidence/competitive pressure]. Here's the cost of waiting: [quantified impact]." |

### Resource Objections

**"We don't have budget for this"**

| Step | Response |
|------|----------|
| Acknowledge | "Budget is tight. I get it." |
| Ask | "Is this a 'no budget exists' or 'this isn't the priority for available budget'?" |
| Respond | "Here's the ROI case: [evidence]. What if we started smaller to prove value?" |

**"Engineering is at capacity"**

| Step | Response |
|------|----------|
| Acknowledge | "I know the team is stretched." |
| Ask | "What would we need to deprioritize to make room?" |
| Respond | "I'm happy to have that trade-off conversation. Here's what this enables vs. current work." |

### Priority Objections

**"This isn't aligned with company strategy"**

| Step | Response |
|------|----------|
| Acknowledge | "Strategic alignment is critical. Let me connect the dots." |
| Ask | "Which part feels misaligned?" |
| Respond | "Here's how this connects to [company goal]: [evidence]. What am I missing?" |

**"We have bigger problems to solve"**

| Step | Response |
|------|----------|
| Acknowledge | "Prioritization is hard. I want to make sure we're focused on the right things." |
| Ask | "What would you rank higher, and why?" |
| Respond | "Help me understand the trade-off. Here's what I see: [evidence for this priority]." |

### Technical Objections

**"This won't scale"**

| Step | Response |
|------|----------|
| Acknowledge | "Scalability is important. I want to get this right." |
| Ask | "What specific scenarios are you concerned about?" |
| Respond | "Here's how we've thought about scale: [technical approach]. What would give you confidence?" |

**"The architecture won't support this"**

| Step | Response |
|------|----------|
| Acknowledge | "I defer to your technical expertise here." |
| Ask | "What would need to change to make this possible?" |
| Respond | "Let's explore options together. What's the smallest version that would work?" |

## The Reframe Skill

**Usage:** `/reframe <objection>`

**Output Format:**

```markdown
## Objection
[Restated objection]

## Underlying Concern
[What they're really worried about]

## Acknowledgment
[Script for acknowledging their concern]

## Clarifying Questions
1. [Question to understand better]
2. [Question to uncover needs]

## Reframe Options

### Option 1: [Reframe angle]
[Response script]

### Option 2: [Reframe angle]
[Response script]

## Path Forward
[Suggested next step to move past the objection]
```

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
|--------------|--------------|---------|
| **Immediate defense** | Signals you're not listening | Acknowledge first |
| **"Yes, but..."** | Negates acknowledgment | "Yes, and here's another angle..." |
| **Over-explaining** | Sounds defensive | Keep responses concise |
| **Making it personal** | Escalates conflict | Stay on the issue, not the person |
| **Capitulating** | Loses credibility | Stand your ground with evidence |
| **Dismissing** | Alienates stakeholder | Every objection deserves response |

## When You're Wrong

Sometimes the objection is valid. Graceful responses:

- "You're right. I hadn't considered that. Let me rethink this."
- "That's a good point. Can we revisit this after I've dug deeper?"
- "I stand corrected. Here's what I'd change based on your feedback..."

Being wrong gracefully builds more trust than being right defensively.

## Quality Gates

Before responding to objection:

- [ ] Let them finish speaking completely
- [ ] Acknowledged their concern genuinely
- [ ] Asked clarifying question before defending
- [ ] Addressed underlying need, not just surface objection
- [ ] Offered path forward, not just defense
- [ ] Checked: Am I being defensive or curious?

## Integration

```
/reframe "The timeline is too aggressive"
```

Generates a structured response following LAAR framework.
