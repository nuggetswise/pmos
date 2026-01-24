# Changelog

All notable changes to this project will be documented in this file.

## [v2.0.0] - "The Second Brain" - YYYY-MM-DD

This is a major architectural refactor of the PM OS, moving from a static, file-based system to a reactive, memory-driven "Second Brain."

### Added
- **"Beads" Architecture:** Implemented a structured, append-only JSONL log (`.beads/insights.jsonl`) for storing atomic pieces of knowledge (insights, decisions, questions, patterns).
- **Hybrid Bead Extraction:** Created a new `output:created` hook that automatically extracts knowledge from new documents. It uses a fast regex-based approach first, then falls back to an AI-native extraction if no structured data is found.
- **Task Management Layer:** Introduced a new task management system inspired by `steveyegge/beads` for AI self-planning.
  - The AI now breaks down complex `SKILL.md` files into a dependency graph of `task` beads stored in `.beads/tasks.jsonl`.
  - Added a new `nexa tasks` command group (`ready`, `complete`, etc.) for the AI to manage its own execution loop.
- **Flexible Skill Runner Classes:** Introduced four new skill classes (`Analyzer`, `Drafter`, `Reviewer`, `Planner`) that act as hosts for executing "Claude code native" `SKILL.md` files.
- **Pattern Learning Engine:** Added a new engine (`nexa/src/pattern-learning.ts`) that analyzes the bead repository to discover and encode recurring patterns.

### Changed
- The core architecture now follows a hybrid model inspired by `danielmiessler/Personal_AI_Infrastructure` (for the "Claude code native" OS) and `steveyegge/beads` (for the AI's task scheduler).

### Deprecated
- **Legacy Skill Folders:** The 15 rigid skill folders have been archived into `legacy_skills/` and will be replaced by the new Skill Runner classes.
- **Legacy `learn` command:** The old `learn.ts` script, which performed basic keyword analysis, is deprecated in favor of the more powerful Pattern Learning Engine.
