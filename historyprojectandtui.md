# Plan: Multi-Project Management

## 1. Overview

This plan details the implementation of two major architectural features for the PM OS:

1.  **Multi-Project Management:** A hybrid architecture that provides both strong project isolation for active work and a global knowledge base for cross-project learning.


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

**Core Technical Challenge:** The chosen `ink` library is a modern ES Module (ESM), but the `nexa` project is a CommonJS (CJS) module. This conflict must be resolved before any UI code can be successfully integrated.

**Strategic Decision:** A one-time migration of the `nexa` project to ES Modules will be performed. This aligns the project with the standards of its dependencies and modern Node.js best practices, ensuring future maintainability.

---

### Phase 2.A: Project Modernization (ESM Migration Prerequisite)

**Goal:** Get the `nexa` project to build successfully as a modern ES Module project. This is a foundational refactoring task.

*   **Task 2.A.1: Configure Project for ESM**
    *   **File:** `nexa/package.json`
    *   **Change:** Add the property `"type": "module"` to define the project as an ES Module.
    *   **File:** `nexa/tsconfig.json`
    *   **Change:** Update the `compilerOptions` to set `"module": "Node16"`, `"moduleResolution": "Node16"`, and `"jsx": "react-jsx"`.

*   **Task 2.A.2: Refactor for ESM Syntax**
    *   **File(s):** All `.ts` files in `nexa/src/` and its subdirectories.
    *   **Change:** Append the `.js` file extension to all relative import paths (e.g., `import { X } from './state'` becomes `import { X } from './state.js'`).
    *   **File:** `nexa/src/utils.ts` (and any other files using `__dirname`).
    *   **Change:** Replace the CJS-specific `__dirname` variable with the standard ESM equivalent: `const __dirname = path.dirname(url.fileURLToPath(import.meta.url));`.

*   **Task 2.A.3: Validate Migration**
    *   **Action:** From the project root, run `npm run build --prefix nexa`.
    *   **Success Criteria:** The command must complete with zero compilation errors.

---

### Phase 2.B: TUI Feature Implementation

**Goal:** Build the TUI on the stable ESM foundation.

*   **Task 2.B.1: Install Dependencies & Create Entrypoint**
    *   **Action:** Run `npm install ink react @types/react --save-dev` from the `nexa` directory to ensure all dependencies are present.
    *   **File (New):** `nexa/src/ui.tsx`
    *   **Content:** Create a basic, static TUI layout scaffold using Ink components. This will serve as the foundation for dynamic widgets.

*   **Task 2.B.2: Wire up the `ui` Command**
    *   **File:** `nexa/src/index.ts`
    *   **Change:** Add a `case 'ui':` to the main switch statement. This case will import the main `App` component from `./ui.js` and use Ink's `render()` function to start the application.

*   **Task 2.B.3: Implement Dynamic "Project Dashboard" Widget**
    *   **File:** `nexa/src/ui.tsx`
    *   **Changes:**
        1.  Add logic to read and parse the `inputs/context/projects.md` file.
        2.  Use Ink components to render the data in a structured way (e.g., a table).
        3.  Implement `useInput` from Ink to handle keyboard events for navigation and editing.
        4.  Add file system logic to write updated data back to `projects.md` upon user action.

*   **Task 2.B.4: Implement Other Dynamic Widgets & File Watching**
    *   **File:** `nexa/src/ui.tsx`
    *   **Action:** Add the `chokidar` library if it's not already a dependency.
    *   **Changes:**
        1.  Build out the UI structure for the "Context," "Memory," and "Learning" panels.
        2.  Implement file-watching logic using `chokidar` to monitor the active project directory for changes.
        3.  When a file changes, trigger a state update to re-render the relevant TUI widget.

*   **Task 2.B.5: Implement Command Execution**
    *   **File:** `nexa/src/ui.tsx`
    *   **Changes:**
        1.  Create a dedicated component for command input.
        2.  Use Node.js's `child_process.spawn` to execute `nexa` commands entered by the user.
        3.  Create a scrollable panel component to stream `stdout` and `stderr` from the spawned child process, displaying real-time command output.

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

