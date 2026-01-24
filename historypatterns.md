# Project Plan: PM OS v2 "The Second Brain"

## 1. Objective

The primary objective is to refactor the PM OS from a static, file-based system into a reactive, memory-driven "Second Brain." This will be accomplished by:
1.  Implementing a **"Beads" architecture** for storing atomic knowledge.
2.  Developing a **"Task Management Layer"** that allows the AI to create and execute its own plans.
3.  Building a **"Pattern Learning Engine"** to create emergent intelligence from the system's memory.

This refactor will advance the PM OS to "Level 3: Workflows" on the AI Maturity Model by enabling AI self-planning and continuous learning.

## 2. Scope

#### In Scope:
*   **Knowledge Layer:** A robust, append-only `insights.jsonl` log for storing knowledge beads (insights, decisions, patterns).
*   **Tasking Layer:** A `tasks.jsonl` log for the AI to manage its own execution plans, inspired by `steveyegge/beads`.
*   **Extraction Strategy:** A hybrid hook (`ExtractBeadsFromOutput`) that uses both regex and AI to capture knowledge from documents.
*   **Skill Execution:**
    *   Consolidating the 15 legacy skills into 4 flexible "Skill Runner" classes (`Analyzer`, `Drafter`, `Reviewer`, `Planner`).
    *   These runners will execute "Claude code native" `SKILL.md` files, not replace them.
*   **Task Management CLI:** A new `nexa tasks` command group for the AI to interact with the tasking layer.
*   **Learning Engine:** A `nexa learn:patterns` command that analyzes the knowledge layer to discover and store new patterns.

#### Out of Scope:
*   A graphical user interface beyond the existing TUI.
*   Real-time, multi-user collaboration features.

## 3. Deliverables

1.  **Beads Architecture:**
    *   A `nexa/src/beads` module with repositories for `insights.jsonl` and `tasks.jsonl`.
    *   An `ExtractBeadsFromOutput.hook.ts` for hybrid knowledge capture.
2.  **Skill Architecture:**
    *   A `nexa/src/skills` module with the four new Skill Runner classes.
    *   Archived legacy skills in `legacy_skills/`.
3.  **Tasking Architecture:**
    *   A new `nexa tasks` command group in the CLI.
    *   Updated Skill Runner classes that use the tasking layer for execution.
4.  **Learning Architecture:**
    *   A `nexa/src/pattern-learning.ts` module.
    *   A `nexa learn:patterns` command.
5.  **Documentation:**
    *   A `CHANGELOG.md`.
    *   A `docs/architecture.md` with the new data flow diagram.
    *   This updated project plan.

## 4. Timeline & Milestones

*   **Milestone 1: Knowledge Layer (Beads)** - **COMPLETED**
    *   Task 1.1: Implement Bead data types and repository.
    *   Task 1.2: Implement the hybrid `ExtractBeadsFromOutput` hook.

*   **Milestone 2: Skill Layer (Runners)** - **IN PROGRESS**
    *   Task 2.1: Archive the 15 legacy skill folders.
    *   Task 2.2: Implement the four new skill classes (Analyzer, Drafter, Reviewer, Planner).
    *   Task 2.3: Convert a few critical `SKILL.md` files to be used by the new runners (as a pilot).

*   **Milestone 3: Tasking Layer (AI Scheduler)**
    *   Task 3.1: Define the `task` bead schema and create its repository.
    *   Task 3.2: Implement the `nexa tasks` CLI commands (`create`, `ready`, `complete`, `dep`).
    *   Task 3.3: Update the Skill Runner classes to incorporate the "Plan/Execute" loop using the new tasking system.

*   **Milestone 4: Learning Layer (Pattern Engine)**
    *   Task 4.1: Implement foundational analysis (co-occurrence, sentiment) in `pattern-learning.ts`.
    *   Task 4.2: Implement workflow analysis by traversing bead `connections`.
    *   Task 4.3: Implement the `learn:patterns` command.
    *   Task 4.4: Make learned patterns actionable by injecting them into the AI's context.

*   **Milestone 5: Data Migration & Integration**
    *   Task 5.1: Create/update a `migrate_history.ts` script to backfill `insight` beads from the `history/` directory.
    *   Task 5.2: Ensure all layers (Knowledge, Skill, Task, Learning) are integrated and working end-to-end.

## 5. Metrics for Success

*   **Maintenance Reduction:** Number of skill-related files reduced from >15 to ~8.
*   **AI Transparency:** The AI's execution plan is visible and auditable in `tasks.jsonl` before execution begins.
*   **AI Robustness:** The AI can successfully resume an interrupted task by reading the state from `tasks.jsonl`.
*   **Pattern Quality:** The Pattern Learning Engine generates at least 1 new, high-confidence pattern for every 25 insight/decision beads created.
*   **Output Quality Trend:** The average user rating for AI outputs shows a stable or upward trend.

## 6. Risks & Mitigation

*   **Risk 1: AI Fails to Plan:** The AI might struggle to break down a `SKILL.md` into a coherent task graph.
    *   **Mitigation:** Start with very structured `SKILL.md` files. The "planning" prompt will be heavily engineered with clear examples. We can manually create the first few task graphs as a baseline.

*   **Risk 2: Infinite Loops or Stalled Execution:** A bug in the task dependency logic or the AI's execution could cause it to get stuck.
    *   **Mitigation:** Implement a "max retries" or timeout for tasks. The `nexa tasks` CLI will include commands for a human to manually inspect the task graph and resolve issues (`nexa tasks show`, `nexa tasks reset`).

*   **Risk 3: Performance of JSONL files:** As the bead logs grow, reading them entirely into memory could become slow.
    *   **Mitigation:** For initial implementation, this is acceptable. If performance becomes an issue, we can introduce an SQLite caching layer, as demonstrated in `steveyegge/beads`.