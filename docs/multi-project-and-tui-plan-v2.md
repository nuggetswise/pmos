# PM OS: Multi-Project Management & TUI Implementation Plan (v2)

## Executive Summary

This plan details the implementation of two major architectural features:

1. **Multi-Project Management** - Support multiple independent PM workspaces with a shared global knowledge base
2. **Terminal User Interface (TUI)** - A rich dashboard inspired by PAI v2.3 for visual system monitoring

**Key Changes from v1:**
- Clearer schemas for project metadata and global state
- Enhanced command set with migration support
- Defined consolidation algorithm
- Separated `~/.pm-os/` from `~/.claude/` to avoid conflicts
- MVP-first approach with deferred enhancements

---

## Table of Contents

1. [Multi-Project Management](#1-multi-project-management)
   - [1.1 Architecture](#11-architecture)
   - [1.2 Schemas](#12-schemas)
   - [1.3 Commands](#13-commands)
   - [1.4 Global Knowledge Base](#14-global-knowledge-base)
   - [1.5 Implementation Phases](#15-implementation-phases)
2. [Terminal User Interface](#2-terminal-user-interface)
   - [2.1 Target Layout](#21-target-layout)
   - [2.2 Architecture](#22-architecture)
   - [2.3 Implementation Phases](#23-implementation-phases)
3. [Migration Strategy](#3-migration-strategy)
4. [Testing Plan](#4-testing-plan)
5. [Risk Register](#5-risk-register)
6. [Appendices](#6-appendices)

---

## 1. Multi-Project Management

### 1.1 Architecture

#### Directory Structure

```
~/.pm-os/                          # Global PM OS configuration
├── state.json                     # Active project, known projects list
├── memory/                        # Cross-project knowledge base
│   ├── patterns.jsonl             # Generalized patterns
│   ├── decisions.jsonl            # Cross-project decisions
│   └── vocabulary.jsonl           # Domain terms learned
└── config.json                    # User preferences (future)

~/PM_OS_Workspace/                 # Default workspace root
├── active-catalog/                # Project 1
│   ├── project.json               # Project metadata
│   ├── inputs/
│   ├── outputs/
│   ├── history/
│   ├── skills/
│   ├── .claude/
│   ├── .beads/
│   └── nexa/
├── side-project/                  # Project 2
│   └── ...
└── archived/                      # Archived projects
    └── old-project/
```

#### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Project Isolation** | Each project has complete, self-contained PM OS structure |
| **Portable Projects** | Projects can be moved, shared via git, or copied |
| **Global Learning** | Patterns extracted to `~/.pm-os/memory/` benefit all projects |
| **Backwards Compatible** | Existing single-project setups continue to work |
| **Cross-Platform** | All paths use `path.join()`, tested on macOS/Linux/Windows |

---

### 1.2 Schemas

#### Global State Schema

**File:** `~/.pm-os/state.json`

```json
{
  "version": 1,
  "active_project": {
    "path": "/Users/singhm/PM_OS_Workspace/active-catalog",
    "name": "active-catalog",
    "switched_at": "2026-01-22T14:30:00Z"
  },
  "known_projects": [
    {
      "path": "/Users/singhm/PM_OS_Workspace/active-catalog",
      "name": "active-catalog",
      "display_name": "Active Catalog",
      "created_at": "2026-01-15T10:00:00Z",
      "last_accessed": "2026-01-22T14:30:00Z",
      "status": "active"
    },
    {
      "path": "/Users/singhm/PM_OS_Workspace/side-project",
      "name": "side-project",
      "display_name": "Side Project",
      "created_at": "2026-01-10T09:00:00Z",
      "last_accessed": "2026-01-20T09:00:00Z",
      "status": "active"
    }
  ],
  "workspace_root": "/Users/singhm/PM_OS_Workspace",
  "consolidation": {
    "last_run": "2026-01-21T00:00:00Z",
    "patterns_count": 12,
    "decisions_count": 5
  }
}
```

**Field Definitions:**

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Schema version for migrations |
| `active_project.path` | string | Absolute path to current project |
| `active_project.name` | string | Directory name (slug) |
| `active_project.switched_at` | ISO date | When project was activated |
| `known_projects[]` | array | All registered projects |
| `workspace_root` | string | Default location for new projects |
| `consolidation.last_run` | ISO date | Last `pm-os consolidate` execution |

---

#### Project Metadata Schema

**File:** `<project>/project.json`

```json
{
  "version": 1,
  "name": "active-catalog",
  "display_name": "Active Catalog",
  "description": "PM work for Business Network + Catalogs product line",
  "created_at": "2026-01-15T10:00:00Z",
  "last_accessed": "2026-01-22T14:30:00Z",
  "status": "active",
  "archived_at": null,
  "tags": ["retail", "b2b", "catalog", "enterprise"],
  "settings": {
    "auto_mirror": true,
    "learning_enabled": true
  },
  "stats": {
    "skills_count": 15,
    "rules_count": 47,
    "outputs_count": 23,
    "beads_count": 156,
    "sessions_count": 12
  }
}
```

**Field Definitions:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | URL-safe slug (matches directory name) |
| `display_name` | string | Human-readable name |
| `description` | string | Brief project description |
| `status` | enum | `active` \| `archived` \| `template` |
| `tags` | string[] | For filtering and search |
| `settings` | object | Project-specific preferences |
| `stats` | object | Cached counts (updated on access) |

---

#### Global Pattern Schema

**File:** `~/.pm-os/memory/patterns.jsonl` (append-only)

```json
{"id":"pat_001","content":"VOC+KTLO convergence indicates strong charter signal","source_projects":["active-catalog","side-project"],"occurrences":5,"confidence":"high","first_seen":"2026-01-10T00:00:00Z","last_validated":"2026-01-22T00:00:00Z","tags":["voc","ktlo","charters"]}
{"id":"pat_002","content":"Charters with ≤3 bets have 83% approval rate","source_projects":["active-catalog"],"occurrences":3,"confidence":"medium","first_seen":"2026-01-15T00:00:00Z","last_validated":"2026-01-20T00:00:00Z","tags":["charters","prioritization"]}
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique pattern identifier |
| `content` | string | The pattern statement |
| `source_projects` | string[] | Projects where pattern was observed |
| `occurrences` | number | Total times pattern appeared |
| `confidence` | enum | `low` \| `medium` \| `high` |
| `first_seen` | ISO date | When first identified |
| `last_validated` | ISO date | Last time pattern was confirmed |
| `tags` | string[] | For categorization |

---

### 1.3 Commands

#### Command Overview

```
pm-os project <subcommand> [options]

Subcommands:
  create <name>      Create a new project
  switch <name>      Switch to a different project
  list               List all known projects
  current            Show current project info
  add <path>         Register an existing directory as a project
  migrate            Convert current directory to a managed project
  archive <name>     Archive a project (soft delete)
  delete <name>      Permanently delete a project
  info [name]        Show detailed project information
  health [name]      Check project structure integrity
```

#### Command Specifications

##### `pm-os project create <name>`

**Purpose:** Create a new project with standard PM OS structure.

**Options:**
- `--template <name>` - Use a project template (future)
- `--description <text>` - Set project description
- `--path <dir>` - Create in specific location (default: workspace root)
- `--switch` - Switch to new project after creation (default: true)

**Implementation:**

```typescript
async function projectCreate(name: string, options: CreateOptions) {
  // 1. Validate name (alphanumeric, hyphens, underscores)
  if (!/^[a-z0-9_-]+$/i.test(name)) {
    throw new Error('Project name must be alphanumeric with hyphens/underscores');
  }

  // 2. Determine project path
  const globalState = await loadGlobalState();
  const projectPath = options.path || path.join(globalState.workspace_root, name);

  // 3. Check if exists
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory already exists: ${projectPath}`);
  }

  // 4. Create directory structure
  await createProjectStructure(projectPath, name, options);

  // 5. Create project.json
  await createProjectMetadata(projectPath, {
    name,
    display_name: options.displayName || name,
    description: options.description || '',
    created_at: new Date().toISOString(),
    status: 'active',
  });

  // 6. Register in global state
  await registerProject(projectPath, name);

  // 7. Switch to new project (if --switch)
  if (options.switch !== false) {
    await switchProject(name);
  }

  console.log(`✓ Created project: ${name}`);
  console.log(`  Path: ${projectPath}`);
}
```

**Directory Structure Created:**

```
<name>/
├── project.json
├── CLAUDE.md                 # Project-specific instructions
├── inputs/
│   └── context/
│       ├── compass.md        # Template
│       ├── projects.md       # Template
│       ├── challenges.md     # Template
│       └── preferences.md    # Template
├── outputs/
│   ├── ingest/
│   ├── insights/
│   ├── roadmap/
│   └── delivery/
├── history/
│   ├── learnings/
│   ├── decisions/
│   └── sessions/
├── skills/                   # Symlink to shared skills? Or copy?
├── .claude/
│   └── rules/                # Project-specific rules
├── .beads/
│   └── insights.jsonl
└── nexa/
    ├── state.json
    └── sources.local.yaml
```

---

##### `pm-os project switch <name>`

**Purpose:** Change the active project.

**Implementation:**

```typescript
async function projectSwitch(nameOrPath: string) {
  const globalState = await loadGlobalState();

  // 1. Find project by name or path
  const project = globalState.known_projects.find(
    p => p.name === nameOrPath || p.path === nameOrPath
  );

  if (!project) {
    throw new Error(`Unknown project: ${nameOrPath}. Use 'pm-os project add' first.`);
  }

  // 2. Verify project exists
  if (!await fs.pathExists(project.path)) {
    throw new Error(`Project directory not found: ${project.path}`);
  }

  // 3. Update global state
  globalState.active_project = {
    path: project.path,
    name: project.name,
    switched_at: new Date().toISOString(),
  };

  // 4. Update last_accessed on project
  project.last_accessed = new Date().toISOString();

  await saveGlobalState(globalState);

  // 5. Update project.json
  const projectMeta = await loadProjectMetadata(project.path);
  projectMeta.last_accessed = new Date().toISOString();
  await saveProjectMetadata(project.path, projectMeta);

  console.log(`✓ Switched to: ${project.display_name || project.name}`);
  console.log(`  Path: ${project.path}`);
}
```

---

##### `pm-os project list`

**Purpose:** List all known projects.

**Options:**
- `--all` - Show all projects (default)
- `--active` - Show only active projects
- `--archived` - Show only archived projects
- `--json` - Output as JSON

**Output:**

```
PM OS Projects
══════════════

  ● active-catalog (active)          ← current
    ~/PM_OS_Workspace/active-catalog
    Last accessed: 2 hours ago

  ○ side-project (active)
    ~/PM_OS_Workspace/side-project
    Last accessed: 2 days ago

  ◌ old-project (archived)
    ~/PM_OS_Workspace/archived/old-project
    Archived: 2026-01-10

Total: 3 projects (2 active, 1 archived)
```

---

##### `pm-os project migrate`

**Purpose:** Convert the current directory into a managed PM OS project.

**Use Case:** Migrating existing `pm_os_superpowers` to the new multi-project system.

**Implementation:**

```typescript
async function projectMigrate(options: MigrateOptions) {
  const cwd = process.cwd();

  // 1. Check if already a project
  if (await fs.pathExists(path.join(cwd, 'project.json'))) {
    throw new Error('Directory is already a PM OS project');
  }

  // 2. Detect project name from directory
  const name = options.name || path.basename(cwd);

  // 3. Verify PM OS structure exists
  const requiredDirs = ['inputs', 'outputs', 'skills', '.claude'];
  const missingDirs = [];
  for (const dir of requiredDirs) {
    if (!await fs.pathExists(path.join(cwd, dir))) {
      missingDirs.push(dir);
    }
  }

  if (missingDirs.length > 0 && !options.force) {
    console.log(`Warning: Missing directories: ${missingDirs.join(', ')}`);
    console.log('Use --force to migrate anyway, or create these directories first.');
    return;
  }

  // 4. Create project.json
  await createProjectMetadata(cwd, {
    name,
    display_name: options.displayName || name,
    description: options.description || 'Migrated project',
    created_at: new Date().toISOString(),
    status: 'active',
  });

  // 5. Register in global state
  await registerProject(cwd, name);

  // 6. Set as active (optional)
  if (options.switch !== false) {
    await switchProject(name);
  }

  console.log(`✓ Migrated to managed project: ${name}`);
  console.log(`  Created: project.json`);
  console.log(`  Registered in: ~/.pm-os/state.json`);
}
```

---

##### `pm-os project add <path>`

**Purpose:** Register an existing directory as a PM OS project without modifying it.

**Use Case:** Projects stored outside the default workspace, or git clones.

```typescript
async function projectAdd(projectPath: string) {
  const absolutePath = path.resolve(projectPath);

  // 1. Verify directory exists
  if (!await fs.pathExists(absolutePath)) {
    throw new Error(`Directory not found: ${absolutePath}`);
  }

  // 2. Check if project.json exists (preferred)
  const hasProjectJson = await fs.pathExists(path.join(absolutePath, 'project.json'));

  // 3. Detect or prompt for name
  let name: string;
  if (hasProjectJson) {
    const meta = await loadProjectMetadata(absolutePath);
    name = meta.name;
  } else {
    name = path.basename(absolutePath);
    // Create minimal project.json
    await createProjectMetadata(absolutePath, {
      name,
      display_name: name,
      created_at: new Date().toISOString(),
      status: 'active',
    });
  }

  // 4. Register in global state
  await registerProject(absolutePath, name);

  console.log(`✓ Added project: ${name}`);
  console.log(`  Path: ${absolutePath}`);
}
```

---

##### `pm-os project health [name]`

**Purpose:** Validate project structure and report issues.

**Output:**

```
Project Health: active-catalog
══════════════════════════════

Structure Check:
  ✓ project.json exists
  ✓ inputs/context/ has 4 files
  ✓ outputs/ directory exists
  ✓ .claude/rules/ has 47 files
  ✓ nexa/state.json valid

Content Check:
  ✓ COMPASS dimensions complete
  ⚠ outputs/ingest/ empty (run pm-os scan)
  ✓ .beads/insights.jsonl has 156 entries

Recommendations:
  • Run 'pm-os scan' to ingest source documents
  • Consider archiving old session summaries (23 files older than 30 days)

Health Score: 92/100
```

---

### 1.4 Global Knowledge Base

#### Consolidation Algorithm

**Command:** `pm-os consolidate`

**Purpose:** Extract generalizable patterns from all projects and store in global memory.

**Algorithm:**

```typescript
async function consolidate() {
  const globalState = await loadGlobalState();
  const allPatterns: Map<string, PatternCandidate> = new Map();

  // 1. Scan all active projects
  for (const project of globalState.known_projects.filter(p => p.status === 'active')) {
    // Read learnings
    const learnings = await readLearnings(project.path);
    for (const learning of learnings) {
      extractPatterns(learning, project.name, allPatterns);
    }

    // Read high-rated outputs
    const beads = await readBeads(project.path);
    const highRatedOutputs = beads.filter(b => b.type === 'output-rating' && b.rating >= 4);
    for (const bead of highRatedOutputs) {
      extractPatternsFromRating(bead, project.name, allPatterns);
    }

    // Read decisions
    const decisions = await readDecisions(project.path);
    for (const decision of decisions) {
      extractPatternsFromDecision(decision, project.name, allPatterns);
    }
  }

  // 2. Filter patterns by promotion criteria
  const promotablePatterns = Array.from(allPatterns.values()).filter(p => {
    // Criterion 1: Appears in 2+ projects
    if (p.source_projects.size >= 2) return true;
    // Criterion 2: High occurrence in single project (5+)
    if (p.occurrences >= 5) return true;
    // Criterion 3: Associated with high-rated outputs (4+)
    if (p.avg_rating >= 4) return true;
    return false;
  });

  // 3. Deduplicate and merge similar patterns
  const mergedPatterns = deduplicatePatterns(promotablePatterns);

  // 4. Write to global memory
  await appendToGlobalPatterns(mergedPatterns);

  // 5. Update consolidation timestamp
  globalState.consolidation = {
    last_run: new Date().toISOString(),
    patterns_count: mergedPatterns.length,
    decisions_count: 0, // TODO: implement decision consolidation
  };
  await saveGlobalState(globalState);

  console.log(`✓ Consolidation complete`);
  console.log(`  Scanned: ${globalState.known_projects.length} projects`);
  console.log(`  Patterns found: ${allPatterns.size}`);
  console.log(`  Patterns promoted: ${mergedPatterns.length}`);
}
```

**Pattern Extraction Rules:**

| Source | Pattern Type | Extraction Method |
|--------|--------------|-------------------|
| `history/learnings/*.md` | Insight | Parse "Key Insights" section |
| `.beads/insights.jsonl` | Rating correlation | Find common traits of 4+ rated outputs |
| `history/decisions/*.md` | Decision pattern | Extract rationale and outcome |
| `.claude/rules/learned/*.md` | Explicit rule | Already codified, check if cross-project |

**Promotion Criteria:**

| Criterion | Threshold | Confidence |
|-----------|-----------|------------|
| Appears in 2+ projects | 2 projects | High |
| High occurrence (single project) | 5+ times | Medium |
| Associated with high ratings | avg ≥ 4.0 | Medium |
| Explicitly marked as global | User flag | High |

---

#### Loading Global Context

**When:** At session start, after loading project context.

**Implementation in Prompting:**

```typescript
async function loadSessionContext(projectPath: string) {
  // 1. Load project-specific context (high priority)
  const projectContext = await loadProjectContext(projectPath);

  // 2. Load global patterns (general wisdom)
  const globalPatterns = await loadGlobalPatterns();

  // 3. Merge with precedence
  return {
    // Project context takes priority
    compass: projectContext.compass,
    projects: projectContext.projects,
    challenges: projectContext.challenges,
    preferences: projectContext.preferences,

    // Global patterns as additional context
    global_patterns: globalPatterns.slice(0, 10), // Top 10 most relevant
    global_decisions: await loadGlobalDecisions().slice(0, 5),
  };
}
```

**Relevance Scoring for Global Patterns:**

```typescript
function scorePatternRelevance(pattern: GlobalPattern, currentContext: Context): number {
  let score = 0;

  // Tag overlap with current work
  const contextTags = extractTags(currentContext);
  const tagOverlap = pattern.tags.filter(t => contextTags.includes(t)).length;
  score += tagOverlap * 10;

  // Recency
  const daysSinceValidated = daysBetween(pattern.last_validated, new Date());
  score -= daysSinceValidated * 0.5;

  // Confidence
  if (pattern.confidence === 'high') score += 20;
  if (pattern.confidence === 'medium') score += 10;

  return score;
}
```

---

### 1.5 Implementation Phases

#### Phase 1.1: Foundation (MVP)

| Task | Description | Deliverable |
|------|-------------|-------------|
| 1.1.1 | Create `~/.pm-os/` directory structure | Directory + README |
| 1.1.2 | Implement global state read/write | `nexa/src/project/state.ts` |
| 1.1.3 | Implement project.json read/write | `nexa/src/project/metadata.ts` |
| 1.1.4 | Add project context loader | `nexa/src/project/context.ts` |

**Success Criteria:**
- Can read/write `~/.pm-os/state.json`
- Can read/write `<project>/project.json`
- Unit tests pass

---

#### Phase 1.2: Core Commands

| Task | Description | Deliverable |
|------|-------------|-------------|
| 1.2.1 | `pm-os project create` | Create project with full structure |
| 1.2.2 | `pm-os project switch` | Change active project |
| 1.2.3 | `pm-os project list` | List all projects |
| 1.2.4 | `pm-os project current` | Show current project |
| 1.2.5 | `pm-os project add` | Register external project |
| 1.2.6 | `pm-os project migrate` | Convert existing dir |

**Success Criteria:**
- Can create new project with `pm-os project create test-project`
- Can switch between projects
- All nexa commands respect active project

---

#### Phase 1.3: Command Integration

| Task | Description | Deliverable |
|------|-------------|-------------|
| 1.3.1 | Refactor `scan` for project context | Updated `scan.ts` |
| 1.3.2 | Refactor `mirror` for project context | Updated `mirror.ts` |
| 1.3.3 | Refactor `learn` for project context | Updated `learn.ts` |
| 1.3.4 | Refactor `status` for project context | Updated `status.ts` |
| 1.3.5 | Update all file path resolutions | Audit and fix all `process.cwd()` |

**Success Criteria:**
- All commands work correctly with non-cwd projects
- No hardcoded paths remain

---

#### Phase 1.4: Global Knowledge Base

| Task | Description | Deliverable |
|------|-------------|-------------|
| 1.4.1 | Define global pattern schema | Types + validation |
| 1.4.2 | Implement pattern extraction | `nexa/src/consolidate/extract.ts` |
| 1.4.3 | Implement `pm-os consolidate` | New command |
| 1.4.4 | Implement global context loading | Updated prompting |

**Success Criteria:**
- Consolidation extracts patterns from 2+ projects
- Global patterns loaded at session start

---

#### Phase 1.5: Polish & Migration

| Task | Description | Deliverable |
|------|-------------|-------------|
| 1.5.1 | Migrate `pm_os_superpowers` | Converted to managed project |
| 1.5.2 | `pm-os project health` command | Health check implementation |
| 1.5.3 | `pm-os project archive/delete` | Lifecycle commands |
| 1.5.4 | Update documentation | GETTING_STARTED.md, README |

**Success Criteria:**
- Existing project migrated without data loss
- Documentation reflects new architecture

---

## 2. Terminal User Interface

### 2.1 Target Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PM OS │ Product Management Operating System                                │
│  "Your second brain for product decisions"                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ██████╗ ███╗   ███╗     ██████╗ ███████╗                                │
│    ██╔══██╗████╗ ████║    ██╔═══██╗██╔════╝    "Nexa here, ready to go..." │
│    ██████╔╝██╔████╔██║    ██║   ██║███████╗                                │
│    ██╔═══╝ ██║╚██╔╝██║    ██║   ██║╚════██║    ● PM OS      v1.0          │
│    ██║     ██║ ╚═╝ ██║    ╚██████╔╝███████║    ✦ Skills     15            │
│    ╚═╝     ╚═╝     ╚═╝     ╚═════╝ ╚══════╝    ◈ Rules      47            │
│                                                 ⚡ Hooks      4             │
│                                                 ◆ Ingested   7             │
│                                                 ≡ Outputs    12            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  🤖 Claude Code v2.1.9 · Opus 4.5                                           │
│  📁 Project: active-catalog                                                 │
│     ~/PM_OS_Workspace/active-catalog                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ > Try "/voc" or "/ktlo" to get started                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ═══ NEXA STATUSLINE ════════════════════════════════════════════════════════│
│ PHASE: OBSERVE │ JOB: idle │ DAEMON: stopped │ ERRORS: 0                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ● CONTEXT: compass ● projects ● challenges ● preferences  │ 5 dims loaded  │
│ ◆ PWD: active-catalog │ Branch: main │ Age: 2h │ Mod: 11 │ New: 3          │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⊙ MEMORY: 📁47 Learnings │ ⚖️12 Decisions │ 📊8 Sessions │ 💎156 Beads     │
│ ✦ LEARNING: │ Today: 4.2 │ Week: 3.9 │ Month: 4.1 │ Trend: ↑              │
│   1d: ██▓▓░░██▓▓██░░▓▓██░░██▓▓░░██▓▓██                                     │
│   1w: ██████▓▓▓▓░░░░██████▓▓▓▓████░░██████                                 │
│  1mo: ████████████████▓▓▓▓▓▓▓▓░░░░░░████████████████                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💡 "Customer value first - solve real user pain, not hypothetical problems" │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture

#### Technology Stack

| Component | Choice | Version |
|-----------|--------|---------|
| UI Framework | `ink` | ^4.4.1 |
| React | `react` | ^18.2.0 |
| State | `zustand` | ^4.5.0 |
| File Watching | `chokidar` | ^3.6.0 |
| Styling | `chalk` | ^5.3.0 |
| Box Drawing | `ink-box` | ^2.0.0 |

#### Component Structure

```
nexa/src/ui/
├── App.tsx                 # Main application
├── store.ts                # Zustand state store
├── theme.ts                # Colors, icons, ASCII art
├── components/
│   ├── Header.tsx          # Logo, stats
│   ├── ProjectInfo.tsx     # Current project details
│   ├── CommandHint.tsx     # Suggested command
│   ├── StatusLine.tsx      # Phase, job, daemon
│   ├── ContextBar.tsx      # Loaded dimensions
│   ├── GitBar.tsx          # Branch, modified files
│   ├── MemoryBar.tsx       # Learnings, decisions, beads
│   ├── LearningHeatmap.tsx # Rating visualization
│   ├── Footer.tsx          # Quote/tip
│   └── HelpOverlay.tsx     # Keyboard shortcuts (?)
├── hooks/
│   ├── useFileWatcher.ts   # Watch for file changes
│   ├── useRefresh.ts       # Periodic refresh
│   └── useKeyboard.ts      # Keyboard handling
└── data/
    ├── collectors.ts       # Data collection functions
    └── formatters.ts       # Display formatting
```

### 2.3 Implementation Phases

*See `docs/TUI-implementation-plan.md` for detailed task breakdown.*

#### Phase 2.A: ESM Migration

- Update `package.json` with `"type": "module"`
- Update `tsconfig.json` for Node16 modules
- Refactor all imports to use `.js` extensions
- Replace `__dirname` with ESM equivalent
- Validate build succeeds

#### Phase 2.B: TUI Foundation

- Install dependencies (`ink`, `react`, `zustand`, `chokidar`)
- Create theme constants
- Create state store
- Build static component scaffold
- Wire up `pm-os ui` command

#### Phase 2.C: Dynamic Data

- Implement data collectors
- Connect store to file system
- Add file watching
- Implement refresh logic

#### Phase 2.D: Polish

- Handle terminal resize
- Add help overlay (`?` key)
- Add keyboard shortcuts
- Error boundaries
- Graceful exit handling

---

## 3. Migration Strategy

### Migrating Existing `pm_os_superpowers`

**Current State:**
- Single project in `/Users/singhm/pm_os_superpowers`
- No `project.json`
- State in `nexa/state.json`

**Migration Steps:**

1. **Initialize Global State**
   ```bash
   mkdir -p ~/.pm-os/memory
   # Create initial state.json
   ```

2. **Run Migration**
   ```bash
   cd /Users/singhm/pm_os_superpowers
   pm-os project migrate --name pm-os-superpowers --display-name "PM OS Superpowers"
   ```

3. **Verify**
   ```bash
   pm-os project current
   # Should show: pm-os-superpowers
   ```

4. **Optional: Move to Workspace**
   ```bash
   # If you want to use standard workspace
   mv /Users/singhm/pm_os_superpowers ~/PM_OS_Workspace/pm-os-superpowers
   pm-os project add ~/PM_OS_Workspace/pm-os-superpowers
   ```

### Backwards Compatibility

**Goal:** Existing single-project usage should continue to work.

**Implementation:**
- If `~/.pm-os/state.json` doesn't exist, use `process.cwd()` as project root
- If `project.json` doesn't exist in cwd, treat as unmanaged project
- All commands work with or without multi-project setup

---

## 4. Testing Plan

### Unit Tests

| Module | Tests |
|--------|-------|
| `project/state.ts` | Read/write global state, validation |
| `project/metadata.ts` | Read/write project.json, validation |
| `project/context.ts` | Context loading, precedence |
| `consolidate/extract.ts` | Pattern extraction accuracy |

### Integration Tests

| Test | Scenario |
|------|----------|
| Create + Switch | Create project A, create project B, switch between |
| Isolation | Modify files in A, verify B unchanged |
| Consolidation | Create patterns in A+B, consolidate, verify global |
| Migration | Migrate existing project, verify no data loss |

### Manual Testing Checklist

- [ ] `pm-os project create test-1` works
- [ ] `pm-os project create test-2` works
- [ ] `pm-os project switch test-1` works
- [ ] `pm-os project list` shows both
- [ ] `pm-os scan` respects active project
- [ ] `pm-os ui` shows correct project
- [ ] Consolidation produces valid patterns
- [ ] Global patterns appear in new sessions

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing workflows | Medium | High | Backwards compatibility mode, thorough testing |
| State file corruption | Low | High | Atomic writes, auto-backup |
| Path handling bugs (Windows) | Medium | Medium | Use path.join() everywhere, CI on Windows |
| Consolidation noise | Medium | Low | Human review step, confidence thresholds |
| TUI performance | Low | Medium | Debounce file watching, lazy loading |
| ESM migration breaks commands | Medium | High | Run full test suite after migration |

---

## 6. Appendices

### A. File Templates

#### `inputs/context/compass.md` Template

```markdown
# COMPASS: Mission, Goals, Beliefs

## Mission Statement

[Your product/team mission - what you're trying to achieve]

## Role

| Field | Value |
|-------|-------|
| Title | [Your title] |
| Scope | [What you own] |
| Reports To | [Manager] |
| Team | [Cross-functional partners] |

## Goals (This Quarter)

| Goal | Measure of Success | Status |
|------|-------------------|--------|
| [Goal 1] | [How you'll know] | Not Started |

## Beliefs (Decision Principles)

1. [Principle 1]
2. [Principle 2]
```

### B. Glossary

| Term | Definition |
|------|------------|
| **Project** | A self-contained PM OS workspace with inputs, outputs, and history |
| **Active Project** | The currently selected project for all commands |
| **Global Memory** | Cross-project knowledge base in `~/.pm-os/memory/` |
| **Consolidation** | Process of extracting generalizable patterns from projects |
| **Pattern** | A reusable insight that applies across projects |

### C. Command Quick Reference

```
# Project Management
pm-os project create <name>    # Create new project
pm-os project switch <name>    # Change active project
pm-os project list             # List all projects
pm-os project current          # Show current project
pm-os project migrate          # Convert cwd to project
pm-os project health           # Check project integrity
pm-os consolidate              # Extract cross-project patterns

# TUI
pm-os ui                       # Launch terminal dashboard

# Existing Commands (now project-aware)
pm-os scan                     # Scan active project sources
pm-os status                   # Show active project status
pm-os mirror                   # Mirror active project outputs
pm-os learn                    # Run learning on active project
```

---

*Document Version: 2.0*
*Last Updated: 2026-01-22*
*Author: Nexa (PM OS)*
