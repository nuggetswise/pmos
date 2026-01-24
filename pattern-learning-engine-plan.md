# Project Plan: Pattern Learning Engine

## 1. Objective

*   **Primary Goal:** To implement a "Pattern Learning Engine" that automatically discovers, learns, and encodes recurring patterns from the user's work and feedback. This will make the AI assistant more proactive, personalized, and context-aware.
*   **Secondary Goal:** To advance the PM OS to "Level 3: Workflows" on the AI Maturity Model by creating a closed feedback loop where the system learns from its own outputs and the user's explicit and implicit signals.
*   **Measurable Outcome:** The system will generate new, actionable `pattern` beads that are then used by the AI to improve the quality of its future outputs.

## 2. Scope

#### In Scope:
*   Developing a new `nexa/src/pattern-learning.ts` module to house the engine's logic.
*   Analyzing all existing bead types (`insight`, `decision`, `pattern`, `question`, `output-rating`) from the `.beads/insights.jsonl` log.
*   Implementing algorithms for:
    *   **Co-occurrence analysis:** Identifying which tags, keywords, and bead types frequently appear together.
    *   **Sentiment correlation:** Identifying the characteristics of positively-rated (`rating` >= 4) versus negatively-rated outputs.
    *   **Graph analysis:** Performing basic analysis of the `connections` between beads to identify common workflows and sequences.
*   Generating new `pattern` beads based on the analysis and storing them back into the `insights.jsonl` log.
*   Creating a mechanism for the core AI agent to query for and use `pattern` beads to guide its behavior.
*   Creating a new `learn:patterns` CLI command and deprecating the old `learn` command.

#### Out of Scope:
*   Real-time pattern detection. The engine will run as a batch process.
*   Advanced machine learning models (e.g., Graph Neural Networks). The initial implementation will use statistical and heuristic-based approaches.
*   A dedicated user interface for visualizing learned patterns. The primary output will be new `pattern` beads visible in the JSONL file.
*   Fundamental changes to the `Bead` data structure or the `insights.jsonl` storage format.

## 3. Deliverables

1.  A new `nexa/src/pattern-learning.ts` file containing the complete implementation of the learning engine.
2.  A new `learn:patterns` command registered in `nexa/src/index.ts`.
3.  Modifications to the core AI agent logic to enable it to search for and incorporate relevant `pattern` beads into its context during task execution.
4.  Unit tests for the new analysis and pattern generation functions.
5.  Updated project `README.md` documenting the new learning engine and its command.
6.  This `pattern-learning-engine-plan.md` document.

## 4. Timeline & Milestones

*   **Milestone 1: Foundational Analysis**
    *   Task 1.1: Create `nexa/src/pattern-learning.ts`.
    *   Task 1.2: Implement functions to read and index all beads from `insights.jsonl`.
    *   Task 1.3: Implement co-occurrence analysis to find frequently paired tags and keywords.

*   **Milestone 2: Sentiment-Driven Learning**
    *   Task 2.1: Implement sentiment correlation to identify characteristics of high-quality vs. low-quality outputs.
    *   Task 2.2: Implement the first version of pattern generation, creating `pattern` beads for simple rules (e.g., "Positively rated 'strategy' documents often include the tag 'OKRs'").

*   **Milestone 3: Workflow & Graph Analysis**
    *   Task 3.1: Implement logic to traverse the `connections` graph between beads.
    *   Task 3.2: Identify common sequences (e.g., a specific `insight` bead type frequently precedes a `decision` bead).
    *   Task 3.3: Generate more complex `pattern` beads that represent these learned workflows.

*   **Milestone 4: Integration & Actionability**
    *   Task 4.1: Create the `learn:patterns` command and integrate it into `nexa/src/index.ts`.
    *   Task 4.2: Design and implement the "action" mechanism that allows the AI to use learned patterns. This will involve modifying the prompt-building logic to search for and inject relevant `pattern` beads.
    *   Task 4.3: Deprecate and remove the old `learn` command.

*   **Milestone 5: Testing & Documentation**
    *   Task 5.1: Write unit and integration tests for the new engine.
    *   Task 5.2: Update all relevant project documentation.

## 5. Resources

*   **Data:** The existing `.beads/insights.jsonl` file. A minimum of 100 beads, with at least 10 `output-rating` beads, is recommended for meaningful analysis.
*   **Infrastructure:** The established Node.js/TypeScript development environment.

## 6. Risks & Mitigations

*   **Risk 1: Insufficient Data.** The engine may fail to find meaningful patterns if the bead log is too sparse.
    *   **Mitigation:** The system must be actively used to generate more beads. A backfill script to convert legacy `history/` files into beads can be created if necessary.

*   **Risk 2: Spurious or Obvious Patterns.** The initial heuristic approach may generate low-value patterns.
    *   **Mitigation:** We will implement a `confidence` score for generated patterns based on the statistical strength of the evidence. We will start with simple, high-confidence patterns and iteratively add more complex logic.

*   **Risk 3: Performance Degradation.** Analyzing a very large `insights.jsonl` file (>50,000 beads) may be slow.
    *   **Mitigation:** As this is a batch process, initial performance is a secondary concern. If performance becomes an issue, we can introduce caching or, in a future iteration, migrate to a more robust data store (e.g., SQLite).

## 7. Metrics for Success

*   **Pattern Generation Rate:** The engine successfully generates at least one new `pattern` bead for every 20 new insight, decision, or rating beads added to the log.
*   **Pattern Quality:** Over time, at least 50% of generated `pattern` beads are created with a `confidence` of 'medium' or 'high'.
*   **Performance:** The `learn:patterns` command completes execution in under 60 seconds for a repository of 10,000 beads.
*   **Output Quality Trend:** The `calculateQualityTrend` metric in `nexa/src/beads/repository.ts` shows a stable or upward trend in the average rating of AI outputs in the months following the engine's implementation.
 