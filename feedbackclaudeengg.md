# PM OS Hooks Architecture Review Guide

**For**: AI Coding Agent  
**Purpose**: Review and harden the hooks architecture for production readiness  
**Context**: Single-user, single-machine PM workflow automation system  
**Approach**: Exploratory analysis first, then principled implementation

---

## Mission

Your job is to **review, understand, and harden** the hooks architecture in PM OS. This is a learning system that must be reliable, debuggable, and safe for autonomous execution.

**DO NOT jump to implementation.** First explore the codebase, understand the existing patterns, then apply engineering judgment to improve it.

---

## Phase 1: Discovery & Understanding

### Step 1: Explore the Repository Structure

Before making any changes, **scan and understand** the existing codebase:

```bash
# Examine the directory structure
tree -L 3

# Key areas to explore:
1. hooks/           # Hook implementations
2. .claude/rules/   # System rules and protocols
3. skills/          # Workflow definitions
4. outputs/audit/   # Tracking and logging
5. history/         # Versioned outputs
6. commands/        # CLI entry points
```

**Questions to answer:**

1. **What hooks currently exist?** List them and their purposes.
2. **How are hooks registered?** (Auto-discovery? Registry file? Hard-coded?)
3. **When do hooks execute?** (Pre-execution? Post-execution? Scheduled?)
4. **What files do hooks read/write?** (Map out data dependencies)
5. **Is there existing error handling?** (Look for try-catch patterns)
6. **Are there existing tests?** (Check for test files or test directories)

### Step 2: Read the Documentation

Study these files to understand the system's vision and constraints:

```bash
# Core documentation
README.md
IMPLEMENTATION_COMPLETE.md
.claude/README.md

# Specific to hooks
hooks/README.md          # (if exists)
.claude/rules/system/    # System protocols
outputs/README.md        # Output structure and dependencies

# Skills and workflows
skills/README.md
commands/README.md
```

**Questions to answer:**

1. **What is the product vision?** (PM OS as a "second brain")
2. **What are the core principles?** (Evidence-based, file-based, etc.)
3. **What constraints exist?** (Single-user, single-machine)
4. **What does "autonomous execution" mean here?** (Auto-learning, scheduled tasks)
5. **What user problems does the hook system solve?** (History tracking? Learning? Freshness?)

### Step 3: Trace Existing Workflows

Pick one workflow (e.g., `/ktlo`) and trace its execution end-to-end:

```bash
# Find the command definition
cat commands/ktlo.md    # or wherever commands are defined

# Find the skill
cat skills/triaging-ktlo/SKILL.md

# Find outputs
ls -la outputs/ktlo/
ls -la history/triaging-ktlo/

# Check audit logs
cat outputs/audit/auto-run-log.md
cat outputs/audit/freshness-state.json  # (if exists)
```

**Questions to answer:**

1. **What files are created when `/ktlo` runs?**
2. **Where are these files mirrored to?**
3. **What metadata is updated?**
4. **Is there evidence of hooks executing?** (Check logs)
5. **What happens if a file already exists?** (Overwrite? Versioning?)

### Step 4: Identify Current Pain Points

Look for evidence of existing issues:

```bash
# Check for error logs
cat outputs/audit/hook-errors.log     # (if exists)
cat outputs/audit/hook-trace.log      # (if exists)

# Look for TODO comments
grep -r "TODO" hooks/
grep -r "FIXME" hooks/
grep -r "HACK" hooks/

# Check git history for hook-related commits
git log --grep="hook" --oneline
```

**What to document:**

1. Any error logs you find
2. Any TODO/FIXME comments related to hooks
3. Any suspicious patterns (e.g., duplicate code, missing error handling)
4. Any GitHub issues mentioning hooks

---

## Phase 2: Risk Assessment

Based on your discovery phase, assess risks in **three categories**:

### Category 1: Safety & Reliability Risks

**Questions to investigate:**

1. **Hook Failure Impact**
   - What happens if a hook crashes mid-execution?
   - Does the main workflow succeed or fail?
   - Is there evidence of hook failures being logged?
   
2. **Data Consistency**
   - Can the system get into inconsistent states? (e.g., output exists but history missing)
   - Is there validation logic to detect inconsistencies?
   - How would a user recover from inconsistent state?

3. **Concurrent Execution**
   - What happens if two workflows run simultaneously?
   - Are there file locks on shared resources?
   - Could file corruption occur?

**Document your findings:**

Create a file: `HOOKS_RISK_ASSESSMENT.md`

```markdown
## Safety & Reliability Risks

### Risk 1: [Name]
- **Severity**: High / Medium / Low
- **Likelihood**: High / Medium / Low
- **Current State**: [What you found in the code]
- **Evidence**: [File paths, code snippets, or "None found"]
- **Recommended Action**: [Your proposal]

[Repeat for each risk you identify]
```

### Category 2: Debuggability Risks

**Questions to investigate:**

1. **Observability**
   - Can you tell which hooks ran for a given workflow?
   - Is execution time tracked?
   - Are hook failures distinguishable from workflow failures?

2. **Testing**
   - Are there unit tests for hooks?
   - Can hooks be tested in isolation?
   - Is there a way to simulate hook failures?

3. **Traceability**
   - Can you trace a file back to the workflow that created it?
   - Is there a log of hook execution history?

### Category 3: Autonomous Execution Risks

**Questions to investigate:**

1. **Learning Loop Safety**
   - What prevents infinite loops in auto-learning?
   - Are there rate limits on rule generation?
   - How are malformed learned rules handled?

2. **Resource Exhaustion**
   - What if history/ grows to 1000+ files?
   - Are there performance limits on learning analysis?
   - Could auto-learning consume excessive compute/memory?

3. **Corruption Recovery**
   - What if learned rules become corrupted?
   - Can the system boot with bad rules?
   - Is there a rollback mechanism?

---

## Phase 3: Propose Solutions

After completing risk assessment, propose solutions **based on what you found**.

### Solution Template

For each risk you identified:

```markdown
## Proposed Solution: [Risk Name]

### Problem Statement
[Clearly describe the problem in 2-3 sentences]

### Current Implementation
[What the code does now - cite specific files/functions]

### Proposed Approach
[Your recommended solution - explain WHY this approach]

### Alternatives Considered
[Other solutions you thought of and why you didn't choose them]

### Implementation Complexity
- **Effort**: Small / Medium / Large
- **Risk**: Low / Medium / High (risk of breaking existing functionality)
- **Dependencies**: [What else needs to change]

### Questions for Senior Engineer
[Specific clarifications you need before implementing]
```

### Guiding Principles for Solutions

When proposing solutions, follow these principles:

1. **Align with PM OS Vision**
   - File-based, no databases
   - Evidence-based, never invent data
   - Single-user, single-machine
   - Autonomous learning over time

2. **Prefer Simple Over Complex**
   - Simple lock files > complex distributed locks
   - Bash scripts > heavyweight frameworks (if bash exists already)
   - Explicit > implicit (clear execution order > magic)

3. **Fail Safely**
   - Hooks should not crash workflows
   - Missing files should be handled gracefully
   - Bad learned rules should not prevent booting

4. **Make the Invisible Visible**
   - Log hook execution
   - Make state inspectable
   - Provide debugging commands

5. **Respect Existing Patterns**
   - Use the same language/style as existing hooks
   - Follow existing file organization
   - Reuse existing utilities (don't reinvent)

---

## Phase 4: Implementation Guidelines

Once your solution proposals are approved, implement them **incrementally**.

### Incremental Implementation Strategy

**DO:**
- ✅ Implement one risk category at a time (Safety first, then Debuggability, then Autonomous)
- ✅ Write tests BEFORE implementing fixes (if tests don't exist)
- ✅ Add logging/observability EARLY (helps debug your changes)
- ✅ Commit after each working increment
- ✅ Document decisions in code comments

**DON'T:**
- ❌ Rewrite everything at once
- ❌ Change multiple subsystems simultaneously
- ❌ Add dependencies without justification
- ❌ Assume edge cases won't happen
- ❌ Skip testing because "it's just a small change"

### Testing Strategy

For each change you make:

1. **Unit Test**: Test the hook in isolation
2. **Integration Test**: Test the hook in a full workflow
3. **Failure Test**: Simulate failures (missing files, corrupted data, concurrent access)
4. **Performance Test**: Ensure no significant slowdown

### Code Review Checklist

Before considering a change complete:

- [ ] Error handling covers all failure modes
- [ ] Shared files use appropriate locking
- [ ] Logging provides enough information to debug issues
- [ ] Tests exist and pass
- [ ] Documentation updated (READMEs, code comments)
- [ ] No regressions in existing workflows

---

## Phase 5: Validation

After implementation, validate your changes:

### Validation Checklist

**Functional Validation:**
- [ ] Run all existing workflows (`/ktlo`, `/voc`, `/charters`, etc.)
- [ ] Verify outputs are correct
- [ ] Check history/ is properly mirrored
- [ ] Confirm audit logs are updated

**Robustness Validation:**
- [ ] Simulate hook failures (temporarily break a hook)
- [ ] Verify workflow still completes
- [ ] Check errors are logged properly
- [ ] Test concurrent execution (two terminals running workflows)
- [ ] Manually corrupt a learned rule
- [ ] Verify system still boots

**Performance Validation:**
- [ ] Measure hook execution time
- [ ] Test with large history/ (simulate 100+ files)
- [ ] Verify no noticeable slowdown

**Documentation Validation:**
- [ ] All new commands documented
- [ ] READMEs updated
- [ ] Architecture decisions recorded

---

## Questions for Senior Engineer

As you work through this review, you'll likely need clarifications. **Ask questions early and often.**

### Architecture & Design Questions

Before implementing anything, confirm:

1. **Hook Execution Model**
   - "I found [X pattern] for hook execution. Is this intentional or should I standardize it?"
   - "Should hooks run synchronously (blocking) or asynchronously (non-blocking)?"
   - "What's the intended execution order for hooks? Is order important?"

2. **Error Handling Philosophy**
   - "When a hook fails, should the workflow fail or continue?"
   - "Should all hook errors be logged, or only critical ones?"
   - "Is there a difference between 'expected failures' (missing optional file) and 'unexpected failures' (corruption)?"

3. **Performance Trade-offs**
   - "I can add file locking, but it will slow down workflows by ~50ms. Is this acceptable?"
   - "Learning analysis takes 2 seconds with 100 history files. Should I optimize this or is it fine?"

### Implementation Questions

When you have multiple viable approaches:

4. **Technology Choices**
   - "I see some hooks use Node.js and others use Bash. Should I standardize on one?"
   - "For file locking, should I use a library (`proper-lockfile`) or implement from scratch?"
   - "Should I create a shared utility library for hooks, or keep each hook self-contained?"

5. **User Experience**
   - "Should validation auto-fix issues by default, or require explicit `--fix` flag?"
   - "How verbose should hook logging be in normal mode vs debug mode?"
   - "Should users be notified when hooks fail, or just log silently?"

### Scope Questions

If you discover issues beyond hooks:

6. **Out-of-Scope Issues**
   - "I found [X issue] in skills/ that affects hooks. Should I fix it or document it separately?"
   - "The CLI entry point has no error handling. Is that in scope for this review?"

---

## Success Criteria

Your review is complete when you can confidently answer:

- ✅ **Safety**: Can hooks fail without breaking workflows?
- ✅ **Consistency**: Can the system detect and recover from inconsistent state?
- ✅ **Concurrency**: Can multiple workflows run safely without file corruption?
- ✅ **Debuggability**: Can you trace hook execution and diagnose failures?
- ✅ **Testing**: Do hooks have adequate test coverage?
- ✅ **Autonomy**: Is auto-learning protected from infinite loops and corruption?
- ✅ **Performance**: Do hooks complete in reasonable time (even with 100+ history files)?
- ✅ **Documentation**: Can a new developer understand the hook system from docs?

---

## Deliverables

Submit these artifacts when complete:

1. **HOOKS_RISK_ASSESSMENT.md** - Your findings from Phase 2
2. **HOOKS_SOLUTION_PROPOSALS.md** - Your proposed solutions from Phase 3
3. **Pull Request(s)** - Your implementation with tests and documentation
4. **HOOKS_VALIDATION_REPORT.md** - Test results from Phase 5

---

## Final Notes

**This is an exploratory engineering task, not a checklist to execute blindly.**

Your value as an AI engineer is:
- **Understanding** the existing system deeply
- **Identifying** risks that aren't obvious
- **Proposing** solutions aligned with the product vision
- **Implementing** changes that improve robustness without breaking things

**When in doubt:**
1. Read more code
2. Ask clarifying questions
3. Test your assumptions
4. Document your reasoning

**Good luck!** 🚀