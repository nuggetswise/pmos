# GEMINI.md: Project Intelligence for PM OS

## Project Overview

This repository, "PM OS" (Product Management Operating System), is a sophisticated, file-based framework designed to augment a Product Manager's workflow using an AI assistant. It provides a structured environment for turning raw inputs (like Jira tickets and customer feedback) into evidence-based insights, strategic plans, and product documents.

The system is a hybrid, consisting of two main parts:

1.  **The PM OS Framework (Non-Code):** A highly-organized set of Markdown files that define the AI's "skills," "rules," and "memory." This is the "software" that the AI runs on. It includes:
    *   `skills/`: A library of 15 core PM workflows (e.g., synthesizing customer voice, triaging backlogs, creating strategic charters).
    *   `.claude/`: The "brain" of the AI, containing core principles, domain vocabulary, and a learning system that adapts based on user interactions.
    *   `inputs/`: The designated location for all raw source material.
    *   `outputs/`: The working directory where the AI places its generated analyses and documents.
    *   `history/`: An archive of all past outputs, which is crucial for the system's learning loop.

2.  **The `nexa` CLI Tool (Code):** A TypeScript-based command-line interface (CLI) named `pm-os` located in the `nexa/` directory. This tool is the engine that powers the OS, responsible for:
    *   Scanning for new and modified input files.
    *   Extracting text from various document formats (PDF, DOCX, etc.).
    *   Managing the system's state (`nexa/state.json`).
    *   Mirroring completed work from `outputs/` to `history/`.
    *   Running the learning algorithm that analyzes the `history/` to generate new rules for the AI.

### Core Principle: The Learning Loop

The most powerful feature of this project is its closed learning loop:
1.  The user runs **skills** on **inputs**.
2.  The AI generates **outputs**.
3.  The `pm-os` tool mirrors these to **history**.
4.  Periodically, the `pm-os learn` command analyzes the **history** to identify patterns in the user's work and preferences.
5.  These patterns are saved as new, permanent rules in `.claude/rules/learned/`, making the AI smarter and more personalized over time.

## Using the System (Non-Code Workflows)

The primary way to interact with this project is by providing inputs and invoking the AI's skills.

### Daily Workflow Example

1.  **Add Inputs:** Place new Jira exports, interview notes, or other documents into the appropriate subdirectories within `inputs/`.
2.  **Scan Files:** Run the `pm-os scan` command (see below) to make the system aware of the new files.
3.  **Invoke a Skill:** Use a conversational command to run a workflow.
    *   `"What are customers saying?"` to run the `synthesizing-voc` skill.
    *   `"What's on fire in support?"` to run the `triaging-ktlo` skill.
    *   `"Generate an exec update"` to create a summary of the latest findings.
4.  **Review Outputs:** Check the `outputs/` directory for the generated Markdown files.

## Building and Running the `nexa` CLI (Code Project)

The `pm-os` CLI tool in the `nexa/` directory is a Node.js project built with TypeScript.

### Setup

1.  Navigate to the `nexa` directory:
    ```bash
    cd nexa
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Compile the TypeScript code:
    ```bash
    npm run build
    ```

### Key Commands

All commands are run from the root of the project (`/Users/singhm/pm_os_superpowers`). The `pm-os` executable is located in `nexa/dist/index.js`.

*   **Scan for new files:**
    ```bash
    node nexa/dist/index.js scan
    ```
    *Alias: `npm run scan --prefix nexa`*

*   **Check system status:**
    ```bash
    node nexa/dist/index.js status
    ```
    *Alias: `npm run status --prefix nexa`*

*   **Trigger the learning process:**
    ```bash
    node nexa/dist/index.js learn
    ```
    *Alias: `npm run learn --prefix nexa`*

*   **Search for content within documents:**
    ```bash
    node nexa/dist/index.js search "your-query"
    ```
    *Alias: `npm run search --prefix nexa -- "your-query"`*

## Development Conventions

*   **AI "Code" is in Markdown:** All skills, rules, and agent definitions are written in Markdown files with YAML frontmatter. Customizing the AI's behavior involves editing these files, not TypeScript.
*   **Evidence-Based Everything:** A core rule (`.claude/rules/pm-core/evidence-rules.md`) is that the AI must never invent facts. All claims in generated outputs should be tagged with their source.
*   **State is Centralized:** The entire state of the file-based system is tracked in `nexa/state.json`. If the system seems out of sync, this file is the first place to debug.
*   **Configuration:**
    *   Global configuration is in `sources.example.yaml`. Copy it to `sources.local.yaml` for local setup.
    *   AI behavior is configured in `.claude/settings.json`.
