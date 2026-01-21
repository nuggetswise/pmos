# Plan: Multi-Project Management and Terminal User Interface (TUI)

## 1. Overview

This plan details the implementation of two major architectural features for the PM OS:

1.  **Multi-Project Management:** A hybrid architecture that provides both strong project isolation for active work and a global knowledge base for cross-project learning.
2.  **Terminal User Interface (TUI):** A rich, persistent, and dynamic dashboard for interacting with the active project, as inspired by the `pai-v23-hero.png` image.

These features will be developed sequentially.

---

## 2. Feature 1: Multi-Project Management (Hybrid Architecture)

**Objective:** To refactor the system to support multiple, independent projects while enabling a global, cross-project "second brain."

### Phase 1.1: Local Project Workspace

*   **Task 1.1.1: Define the Workspace Directory Structure**
    *   **Action:** Establish `~/PM_OS_Workspace/` as the default root for all projects.
    *   **Action:** Each project will be a subdirectory (e.g., `~/PM_OS_Workspace/project-superpowers/`) containing the full PM OS structure (`inputs/`, `outputs/`, `history/`, etc.).

*   **Task 1.1.2: Implement Active Project State**
    *   **Action:** Create a state file at `~/.claude/state.json` to store the absolute path to the currently active project.
    *   **Action:** Modify the core `nexa` application to read this `active_project_path` on startup and scope all file system operations to this path.

*   **Task 1.1.3: Create the `pm-os project` Command**
    *   **Action:** Implement a `pm-os project` command group.
    *   **Sub-commands:** `create`, `switch`, `list`, `current`.

### Phase 1.2: Global Knowledge Base

*   **Task 1.2.1: Define the Global Knowledge Base Structure**
    *   **Action:** Establish `~/.claude/memory/` as the location for the global, cross-project knowledge base.
    *   **Action:** This directory will contain files for aggregated data, such as `global_patterns.md` and `global_decisions.md`.

*   **Task 1.2.2: Implement the `pm-os consolidate` Command**
    *   **Action:** Create a new command, `pm-os consolidate`.
    *   **Action:** This command will scan all project directories in the `~/PM_OS_Workspace/`.
    *   **Action:** It will read the `learnings/` and `decisions/` from each project, then extract, generalize, and save high-level patterns into the Global Knowledge Base files.

*   **Task 1.2.3: Update Core Prompting Logic**
    *   **Action:** Modify the system's core prompts to load context from two sources:
        1.  **Local Context (High Priority):** All files from the active project.
        2.  **Global Context (General Wisdom):** The files within `~/.claude/memory/`.

### Phase 1.3: Integration and Verification

*   **Task 1.3.1: Refactor Existing Commands**
    *   **Action:** Ensure all `nexa` commands correctly use the `active_project_path` for their operations.

*   **Task 1.3.2: Manual Verification**
    *   **Action:** Verify project isolation as previously planned.
    *   **Action:** Verify global learning by creating patterns in two separate projects, running `pm-os consolidate`, and then confirming the AI can reference the consolidated pattern while working in a third project.

---

## 3. Feature 2: Terminal User Interface (TUI)

**Objective:** To build a rich, terminal-based dashboard that serves as the primary, interactive interface for the PM OS.

### Phase 2.1: Scaffolding and Technology Selection

*   **Task 2.1.1: Choose and Integrate a TUI Framework**
    *   **Action:** Select **Ink** (`https://github.com/vadimdemedes/ink`) as the TUI framework and add it to `nexa/package.json`.

*   **Task 2.1.2: Create the TUI Application Entry Point**
    *   **Action:** Create the `pm-os ui` command to launch the TUI application (`nexa/src/ui.tsx`).

*   **Task 2.1.3: Build the Static UI Layout**
    *   **Action:** Create placeholder panels for "AI Statusline," "Context," "Memory," "Learning," and a command input box.

### Phase 2.2: Dynamic and Interactive Widgets

*   **Task 2.2.1: Connect TUI to Project State**
    *   **Action:** The TUI will read `~/.claude/state.json` on startup to identify and display data from the active project.

*   **Task 2.2.2: Implement Interactive Project Dashboard**
    *   **Action:** Create a new "Project Dashboard" widget in the TUI.
    *   **Action:** This widget will parse and display the tables from the active project's `inputs/context/projects.md` file.
    *   **Action:** The user will be able to navigate the tables (initiatives, focus, etc.) with arrow keys and press keys (e.g., `e` to edit status, `n` to add a new item).
    *   **Action:** When changes are made in the TUI, the application will automatically rewrite the `projects.md` file with the updated data. This makes the Markdown file a persistence layer that the user no longer needs to edit by hand.

*   **Task 2.2.3: Implement Other Dynamic Widgets**
    *   **Action:** Build out the other widgets (Context, Memory, Learning) to display real-time data from the active project.

*   **Task 2.2.4: Implement File Watching for Real-Time Updates**
    *   **Action:** Use a library like `chokidar` to watch the active project. When files change, the relevant TUI widgets will automatically re-render.

### Phase 2.3: Command Execution and Interactivity

*   **Task 2.3.1: Implement the Command Input Component**
    *   **Action:** Build the logic for the command input box.

*   **Task 2.3.2: Execute Commands as Child Processes**
    *   **Action:** Execute `nexa` commands entered in the TUI as child processes, passing the active project context.

*   **Task 2.3.3: Display Command Output**
    *   **Action:** Create a scrollable panel to stream the `stdout` and `stderr` from command execution.

---

## 4. Onboarding and Documentation

**Objective:** To create a simple and reliable installation process for new users on all major operating systems.

*   **Task 4.1: Create the `pm-os setup` Command**
    *   **Action:** Implement a new command `pm-os setup` within the `nexa` TypeScript application.
    *   **Requirement:** The script must be cross-platform. Use Node.js APIs like `os.homedir()` and `path.join()` to ensure it works correctly on **Windows**, macOS, and Linux.
    *   **Functionality:**
        1.  Verify prerequisites (`git`, `node`).
        2.  Create the user-specific workspace directory in their home folder (`~/PM_OS_Workspace/`).
        3.  Create the global config directory (`~/.claude/`).
        4.  Prompt the user for their name and to create their first project.
        5.  Create the initial `state.json` file, setting the new project as the active one.

*   **Task 4.2: Create `GETTING_STARTED.md` Document**
    *   **Action:** Create a new file at `docs/GETTING_STARTED.md`.
    *   **Content:** The document will contain a full, step-by-step guide for new users:
        1.  **Prerequisites:** `git`, `node`, `npm`.
        2.  **Clone:** `git clone ...`
        3.  **Install Dependencies:** `cd nexa && npm install && npm run build`
        4.  **Link Command:** `npm link` (from within the `nexa` directory).
        5.  **Initialize:** `pm-os setup`
    *   **Requirement:** The guide must include notes for Windows users where necessary to ensure a smooth setup experience.

---

## Appendix: Impact and Refactoring Strategy

This appendix clarifies how the major impacts identified in the initial analysis will be addressed by the tasks in this plan.

### A.1 Core Logic Refactoring (`nexa/src/`)

*   **Impact:** The current core application logic assumes the project is the current working directory. This is the highest-risk area of the refactoring.
*   **Action Plan:**
    *   **Task 1.1.2** (`Implement Active Project State`) and **Task 1.3.1** (`Refactor Existing Commands`) explicitly cover this.
    *   A dedicated service or module will be created within `nexa/src` to manage the project context. This module will be responsible for reading `~/.claude/state.json` and providing the `active_project_path` to the rest of the application.
    *   All file system access will be refactored to use this new service, removing all reliance on `process.cwd()`.

### A.2 AI System Refactoring (`skills/` & `.claude/rules/`)

*   **Impact:** All skill prompts and potentially some rules assume a single project context.
*   **Action Plan:**
    *   **Task 1.2.3** (`Update Core Prompting Logic`) directly addresses the modification of all `skills/**/SKILL.md` files to ensure they load both the local project context and the new global knowledge base.
    *   During **Phase 1.3** (`Integration and Verification`), a specific review of all `.claude/rules/` will be conducted to identify and update any rules that contain hardcoded paths or brittle, single-project assumptions.

### A.3 Documentation (`README.md`, etc.)

*   **Impact:** Existing documentation will become outdated.
*   **Action Plan:**
    *   **Task 4.2** (`Create GETTING_STARTED.md`) covers the creation of the primary new user documentation.
    *   A final action item within **Phase 4** will be to review and update the root `README.md` and any other key documentation to reflect the new multi-project architecture and point users to the new `GETTING_STARTED.md` guide.

