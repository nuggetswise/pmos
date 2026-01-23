# PM OS Terminal User Interface (TUI) Implementation Plan

## 1. Vision

Build a rich, persistent terminal dashboard inspired by PAI v2.3 that serves as the visual command center for PM OS. The TUI will display system state, context, memory, and learning metrics at a glance.

### Target Layout

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
│  🤖 Claude Code v2.1.9                                                      │
│     Opus 4.5 · Claude Max                                                   │
│     ~/pm_os_superpowers                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ > Try "/voc" or "/ktlo" to get started                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ═══ NEXA STATUSLINE ════════════════════════════════════════════════════════│
│ PHASE: OBSERVE │ JOB: idle │ DAEMON: stopped │ ERRORS: 0                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ● CONTEXT: compass ● projects ● challenges ● preferences  │ 5 dims loaded  │
│ ◆ PWD: pm_os_superpowers │ Branch: main │ Age: 2h │ Mod: 11 │ New: 3       │
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

---

## 2. Architecture

### 2.1 Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **UI Framework** | `ink` v4.x + `react` 18.x | Modern React-based terminal UI |
| **State** | `zustand` | Lightweight, hooks-based state management |
| **File Watching** | `chokidar` | Cross-platform file system events |
| **Styling** | `ink-box`, `chalk` | Box drawing and colors |
| **Module System** | ES Modules | Required by ink v4+ |

### 2.2 Directory Structure

```
nexa/src/
├── ui/
│   ├── App.tsx              # Main app component
│   ├── store.ts             # Zustand state store
│   ├── theme.ts             # Colors, styles, ASCII art
│   ├── hooks/
│   │   ├── useFileWatcher.ts
│   │   ├── useGitInfo.ts
│   │   └── useSystemStats.ts
│   ├── components/
│   │   ├── Header.tsx       # Logo, branding, stats
│   │   ├── ClaudeInfo.tsx   # Claude Code version info
│   │   ├── CommandHint.tsx  # Suggested command prompt
│   │   ├── StatusLine.tsx   # Phase, job, daemon status
│   │   ├── ContextBar.tsx   # Loaded context dimensions
│   │   ├── MemoryBar.tsx    # Learnings, decisions, beads
│   │   ├── LearningHeatmap.tsx # Quality ratings over time
│   │   └── Footer.tsx       # Quote/tip
│   └── utils/
│       ├── ascii.ts         # ASCII art generation
│       ├── heatmap.ts       # Heatmap rendering logic
│       └── format.ts        # Number/date formatting
└── index.ts                 # CLI entry point with 'ui' command
```

### 2.3 Data Sources

| Widget | Data Source | Update Trigger |
|--------|-------------|----------------|
| **Stats** | Count files in `skills/`, `.claude/rules/`, `outputs/` | On file change |
| **StatusLine** | `nexa/state.json` | File watch + 5s poll |
| **Context** | `inputs/context/*.md` existence | On file change |
| **Git Info** | `git status`, `git log` | On `.git` change |
| **Memory** | Count in `history/`, `.beads/insights.jsonl` | On file change |
| **Heatmap** | Parse `.beads/insights.jsonl` for ratings | On file change |
| **Quote** | Random from `inputs/context/compass.md` beliefs | On startup |

---

## 3. Implementation Phases

### Phase 2.A: ESM Migration (Prerequisite)

**Goal:** Migrate `nexa` from CommonJS to ES Modules.

#### Task 2.A.1: Audit Current Codebase

**Action:** Identify all files needing changes.

```bash
# Find all require() calls
grep -r "require(" nexa/src/

# Find all module.exports
grep -r "module.exports" nexa/src/

# Find __dirname and __filename usage
grep -r "__dirname\|__filename" nexa/src/
```

**Deliverable:** List of files and specific changes needed.

#### Task 2.A.2: Update Package Configuration

**File:** `nexa/package.json`

```json
{
  "type": "module",
  "exports": {
    ".": "./dist/index.js"
  }
}
```

**File:** `nexa/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "target": "ES2022",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

#### Task 2.A.3: Refactor Import Statements

**Change Pattern:**

```typescript
// BEFORE (CommonJS style)
import { foo } from './state';

// AFTER (ESM - must include .js extension)
import { foo } from './state.js';
```

**Note:** Even though source is `.ts`, imports reference the compiled `.js` output.

#### Task 2.A.4: Replace __dirname

**File:** Any file using `__dirname`

```typescript
// BEFORE
const configPath = path.join(__dirname, '../config.json');

// AFTER
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '../config.json');
```

#### Task 2.A.5: Validate Build

```bash
cd nexa
npm run build
```

**Success Criteria:** Zero compilation errors.

---

### Phase 2.B: TUI Foundation

**Goal:** Create the basic TUI structure with static content.

#### Task 2.B.1: Install Dependencies

```bash
cd nexa
npm install ink@4 react@18 ink-box chalk zustand chokidar
npm install -D @types/react
```

**Pin versions in package.json:**

```json
{
  "dependencies": {
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "ink-box": "^2.0.0",
    "chalk": "^5.3.0",
    "zustand": "^4.5.0",
    "chokidar": "^3.6.0"
  }
}
```

#### Task 2.B.2: Create Theme Constants

**File:** `nexa/src/ui/theme.ts`

```typescript
import chalk from 'chalk';

export const colors = {
  primary: chalk.hex('#4A90D9'),      // Blue (like PAI logo)
  secondary: chalk.hex('#6BB3F0'),    // Light blue
  accent: chalk.hex('#F5A623'),       // Orange (highlights)
  success: chalk.hex('#7ED321'),      // Green
  warning: chalk.hex('#F8E71C'),      // Yellow
  error: chalk.hex('#D0021B'),        // Red
  muted: chalk.gray,
  text: chalk.white,
};

export const icons = {
  phase: '●',
  skills: '✦',
  rules: '◈',
  hooks: '⚡',
  ingested: '◆',
  outputs: '≡',
  context: '●',
  memory: '⊙',
  learning: '✦',
  quote: '💡',
  check: '✓',
  cross: '✗',
  arrow: '→',
};

export const ascii = {
  logo: `
    ██████╗ ███╗   ███╗     ██████╗ ███████╗
    ██╔══██╗████╗ ████║    ██╔═══██╗██╔════╝
    ██████╔╝██╔████╔██║    ██║   ██║███████╗
    ██╔═══╝ ██║╚██╔╝██║    ██║   ██║╚════██║
    ██║     ██║ ╚═╝ ██║    ╚██████╔╝███████║
    ╚═╝     ╚═╝     ╚═╝     ╚═════╝ ╚══════╝
  `,
};
```

#### Task 2.B.3: Create State Store

**File:** `nexa/src/ui/store.ts`

```typescript
import { create } from 'zustand';

interface PMOSState {
  // System stats
  skillCount: number;
  ruleCount: number;
  hookCount: number;
  ingestedCount: number;
  outputCount: number;

  // Status
  phase: string;
  currentJob: string | null;
  daemonStatus: 'running' | 'stopped';
  errorCount: number;

  // Context
  loadedContextFiles: string[];
  gitBranch: string;
  gitAge: string;
  modifiedFiles: number;
  newFiles: number;

  // Memory
  learningCount: number;
  decisionCount: number;
  sessionCount: number;
  beadCount: number;

  // Learning heatmap
  ratings: { timestamp: string; rating: number }[];
  ratingTrend: 'up' | 'down' | 'stable';
  avgRating: { today: number; week: number; month: number };

  // Quote
  quote: string;
  quoteAuthor: string;

  // Actions
  refresh: () => Promise<void>;
  setFromState: (state: Partial<PMOSState>) => void;
}

export const useStore = create<PMOSState>((set, get) => ({
  // Initial values
  skillCount: 0,
  ruleCount: 0,
  hookCount: 0,
  ingestedCount: 0,
  outputCount: 0,
  phase: 'OBSERVE',
  currentJob: null,
  daemonStatus: 'stopped',
  errorCount: 0,
  loadedContextFiles: [],
  gitBranch: 'main',
  gitAge: '0h',
  modifiedFiles: 0,
  newFiles: 0,
  learningCount: 0,
  decisionCount: 0,
  sessionCount: 0,
  beadCount: 0,
  ratings: [],
  ratingTrend: 'stable',
  avgRating: { today: 0, week: 0, month: 0 },
  quote: 'Customer value first',
  quoteAuthor: 'PM OS',

  refresh: async () => {
    // Implementation in Task 2.C
  },

  setFromState: (newState) => set(newState),
}));
```

#### Task 2.B.4: Create Main App Component

**File:** `nexa/src/ui/App.tsx`

```tsx
import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { useStore } from './store.js';
import { Header } from './components/Header.js';
import { ClaudeInfo } from './components/ClaudeInfo.js';
import { CommandHint } from './components/CommandHint.js';
import { StatusLine } from './components/StatusLine.js';
import { ContextBar } from './components/ContextBar.js';
import { MemoryBar } from './components/MemoryBar.js';
import { LearningHeatmap } from './components/LearningHeatmap.js';
import { Footer } from './components/Footer.js';

export const App: React.FC = () => {
  const refresh = useStore((state) => state.refresh);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      <ClaudeInfo />
      <CommandHint />
      <StatusLine />
      <ContextBar />
      <MemoryBar />
      <LearningHeatmap />
      <Footer />
    </Box>
  );
};
```

#### Task 2.B.5: Wire Up CLI Command

**File:** `nexa/src/index.ts` (add case)

```typescript
case 'ui':
  const { render } = await import('ink');
  const { App } = await import('./ui/App.js');
  const { createElement } = await import('react');
  render(createElement(App));
  break;
```

#### Task 2.B.6: Create Static Components (Scaffold)

Create placeholder components in `nexa/src/ui/components/`:

**Header.tsx:**
```tsx
import React from 'react';
import { Box, Text } from 'ink';
import { colors, ascii, icons } from '../theme.js';
import { useStore } from '../store.js';

export const Header: React.FC = () => {
  const { skillCount, ruleCount, hookCount, ingestedCount, outputCount } = useStore();

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="blue" padding={1}>
      <Box justifyContent="center">
        <Text color="blue" bold>PM OS</Text>
        <Text color="gray"> │ Product Management Operating System</Text>
      </Box>
      <Box justifyContent="center">
        <Text color="cyan" italic>"Your second brain for product decisions"</Text>
      </Box>
      <Box marginTop={1}>
        <Box width="50%">
          <Text>{colors.primary(ascii.logo)}</Text>
        </Box>
        <Box flexDirection="column" width="50%">
          <Text color="cyan">"Nexa here, ready to go..."</Text>
          <Text> </Text>
          <Text>{icons.phase} PM OS      <Text color="green">v1.0</Text></Text>
          <Text>{icons.skills} Skills     <Text color="yellow">{skillCount}</Text></Text>
          <Text>{icons.rules} Rules      <Text color="yellow">{ruleCount}</Text></Text>
          <Text>{icons.hooks} Hooks      <Text color="yellow">{hookCount}</Text></Text>
          <Text>{icons.ingested} Ingested   <Text color="yellow">{ingestedCount}</Text></Text>
          <Text>{icons.outputs} Outputs    <Text color="yellow">{outputCount}</Text></Text>
        </Box>
      </Box>
    </Box>
  );
};
```

**StatusLine.tsx:**
```tsx
import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../store.js';
import { colors } from '../theme.js';

export const StatusLine: React.FC = () => {
  const { phase, currentJob, daemonStatus, errorCount } = useStore();

  const phaseColor = {
    OBSERVE: 'cyan',
    THINK: 'yellow',
    PLAN: 'blue',
    BUILD: 'green',
    LEARN: 'magenta',
  }[phase] || 'white';

  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1}>
      <Text bold>═══ NEXA STATUSLINE ═══</Text>
      <Text> </Text>
      <Text>PHASE: <Text color={phaseColor}>{phase}</Text></Text>
      <Text> │ </Text>
      <Text>JOB: <Text color="cyan">{currentJob || 'idle'}</Text></Text>
      <Text> │ </Text>
      <Text>DAEMON: <Text color={daemonStatus === 'running' ? 'green' : 'gray'}>{daemonStatus}</Text></Text>
      <Text> │ </Text>
      <Text>ERRORS: <Text color={errorCount > 0 ? 'red' : 'green'}>{errorCount}</Text></Text>
    </Box>
  );
};
```

**LearningHeatmap.tsx:**
```tsx
import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../store.js';

const ratingToBlock = (rating: number): string => {
  if (rating >= 4.5) return '██';
  if (rating >= 3.5) return '▓▓';
  if (rating >= 2.5) return '░░';
  return '  ';
};

const ratingToColor = (rating: number): string => {
  if (rating >= 4.5) return 'green';
  if (rating >= 3.5) return 'yellow';
  if (rating >= 2.5) return 'orange';
  return 'gray';
};

export const LearningHeatmap: React.FC = () => {
  const { avgRating, ratingTrend, ratings } = useStore();

  const trendIcon = ratingTrend === 'up' ? '↑' : ratingTrend === 'down' ? '↓' : '→';
  const trendColor = ratingTrend === 'up' ? 'green' : ratingTrend === 'down' ? 'red' : 'gray';

  // Group ratings by time period for heatmap
  const renderHeatmapRow = (period: string, data: number[]) => (
    <Box>
      <Text color="gray">{period.padStart(4)}: </Text>
      {data.map((r, i) => (
        <Text key={i} color={ratingToColor(r)}>{ratingToBlock(r)}</Text>
      ))}
    </Box>
  );

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
      <Box>
        <Text color="magenta">✦ LEARNING:</Text>
        <Text> │ </Text>
        <Text>Today: <Text color="yellow">{avgRating.today.toFixed(1)}</Text></Text>
        <Text> │ </Text>
        <Text>Week: <Text color="yellow">{avgRating.week.toFixed(1)}</Text></Text>
        <Text> │ </Text>
        <Text>Month: <Text color="yellow">{avgRating.month.toFixed(1)}</Text></Text>
        <Text> │ </Text>
        <Text>Trend: <Text color={trendColor}>{trendIcon}</Text></Text>
      </Box>
      {renderHeatmapRow('1d', [4, 3, 5, 4, 3, 4, 5, 4, 3, 4])}
      {renderHeatmapRow('1w', [4, 4, 3, 3, 2, 4, 5, 4, 4, 5, 4, 3])}
      {renderHeatmapRow('1mo', [4, 4, 4, 4, 3, 3, 3, 2, 2, 3, 4, 4, 4, 4, 4, 5])}
    </Box>
  );
};
```

*(Similar pattern for ClaudeInfo, CommandHint, ContextBar, MemoryBar, Footer)*

---

### Phase 2.C: Dynamic Data

**Goal:** Connect widgets to live data sources.

#### Task 2.C.1: Implement Data Collection Functions

**File:** `nexa/src/ui/data/collectors.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function countSkills(projectRoot: string): Promise<number> {
  const skills = await glob('skills/**/SKILL.md', { cwd: projectRoot });
  return skills.length;
}

export async function countRules(projectRoot: string): Promise<number> {
  const rules = await glob('.claude/rules/**/*.md', { cwd: projectRoot });
  return rules.length;
}

export async function countHooks(projectRoot: string): Promise<number> {
  try {
    const hooksFile = path.join(projectRoot, 'hooks/hooks.json');
    const content = await fs.readFile(hooksFile, 'utf-8');
    const hooks = JSON.parse(content);
    return Object.keys(hooks).length;
  } catch {
    return 0;
  }
}

export async function countIngested(projectRoot: string): Promise<number> {
  const files = await glob('outputs/ingest/*.txt', { cwd: projectRoot });
  return files.length;
}

export async function countOutputs(projectRoot: string): Promise<number> {
  const files = await glob('outputs/**/*.md', { cwd: projectRoot });
  return files.length;
}

export async function loadState(projectRoot: string) {
  try {
    const statePath = path.join(projectRoot, 'nexa/state.json');
    const content = await fs.readFile(statePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function getGitInfo(projectRoot: string) {
  try {
    const { stdout: branch } = await execAsync('git branch --show-current', { cwd: projectRoot });
    const { stdout: status } = await execAsync('git status --porcelain', { cwd: projectRoot });

    const lines = status.trim().split('\n').filter(Boolean);
    const modified = lines.filter(l => l.startsWith(' M') || l.startsWith('M ')).length;
    const newFiles = lines.filter(l => l.startsWith('??')).length;

    return {
      branch: branch.trim(),
      modifiedFiles: modified,
      newFiles: newFiles,
    };
  } catch {
    return { branch: 'unknown', modifiedFiles: 0, newFiles: 0 };
  }
}

export async function countMemory(projectRoot: string) {
  const learnings = await glob('history/learnings/*.md', { cwd: projectRoot });
  const decisions = await glob('history/decisions/*.md', { cwd: projectRoot });
  const sessions = await glob('history/sessions/*.md', { cwd: projectRoot });

  let beadCount = 0;
  try {
    const beadPath = path.join(projectRoot, '.beads/insights.jsonl');
    const content = await fs.readFile(beadPath, 'utf-8');
    beadCount = content.trim().split('\n').filter(Boolean).length;
  } catch {}

  return {
    learningCount: learnings.length,
    decisionCount: decisions.length,
    sessionCount: sessions.length,
    beadCount,
  };
}

export async function loadRatings(projectRoot: string) {
  try {
    const beadPath = path.join(projectRoot, '.beads/insights.jsonl');
    const content = await fs.readFile(beadPath, 'utf-8');
    const beads = content.trim().split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .filter(b => b.type === 'output-rating');

    return beads.map(b => ({
      timestamp: b.created_at,
      rating: b.rating,
    }));
  } catch {
    return [];
  }
}

export function getContextFiles(projectRoot: string): string[] {
  // These are always loaded at session start
  return ['compass', 'projects', 'challenges', 'preferences'];
}

export function getRandomQuote(): { quote: string; author: string } {
  const quotes = [
    { quote: 'Customer value first - solve real user pain', author: 'PM OS' },
    { quote: 'Evidence before opinions, always', author: 'PM OS' },
    { quote: 'The best PM work is invisible to the user', author: 'Unknown' },
    { quote: 'Ship early, learn fast', author: 'PM Proverb' },
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
```

#### Task 2.C.2: Implement Store Refresh

**File:** `nexa/src/ui/store.ts` (update refresh function)

```typescript
import * as collectors from './data/collectors.js';

// Inside create():
refresh: async () => {
  const projectRoot = process.cwd();

  const [
    skillCount,
    ruleCount,
    hookCount,
    ingestedCount,
    outputCount,
    state,
    gitInfo,
    memory,
    ratings,
  ] = await Promise.all([
    collectors.countSkills(projectRoot),
    collectors.countRules(projectRoot),
    collectors.countHooks(projectRoot),
    collectors.countIngested(projectRoot),
    collectors.countOutputs(projectRoot),
    collectors.loadState(projectRoot),
    collectors.getGitInfo(projectRoot),
    collectors.countMemory(projectRoot),
    collectors.loadRatings(projectRoot),
  ]);

  const quote = collectors.getRandomQuote();

  set({
    skillCount,
    ruleCount,
    hookCount,
    ingestedCount,
    outputCount,
    phase: state?.phase || 'OBSERVE',
    currentJob: state?.current_job?.id || null,
    daemonStatus: state?.daemon?.status || 'stopped',
    errorCount: state?.errors?.length || 0,
    loadedContextFiles: collectors.getContextFiles(projectRoot),
    ...gitInfo,
    ...memory,
    ratings,
    quote: quote.quote,
    quoteAuthor: quote.author,
    // Calculate rating averages (simplified)
    avgRating: calculateAverages(ratings),
    ratingTrend: calculateTrend(ratings),
  });
},
```

#### Task 2.C.3: Implement File Watching

**File:** `nexa/src/ui/hooks/useFileWatcher.ts`

```typescript
import { useEffect } from 'react';
import chokidar from 'chokidar';
import { useStore } from '../store.js';

export function useFileWatcher() {
  const refresh = useStore((state) => state.refresh);

  useEffect(() => {
    const projectRoot = process.cwd();

    const watcher = chokidar.watch([
      `${projectRoot}/nexa/state.json`,
      `${projectRoot}/outputs/**/*.md`,
      `${projectRoot}/history/**/*.md`,
      `${projectRoot}/.beads/insights.jsonl`,
      `${projectRoot}/skills/**/SKILL.md`,
      `${projectRoot}/.claude/rules/**/*.md`,
    ], {
      ignoreInitial: true,
      persistent: true,
    });

    watcher.on('all', () => {
      refresh();
    });

    return () => {
      watcher.close();
    };
  }, [refresh]);
}
```

**Update App.tsx to use the hook:**

```tsx
import { useFileWatcher } from './hooks/useFileWatcher.js';

export const App: React.FC = () => {
  useFileWatcher();
  // ... rest of component
};
```

---

### Phase 2.D: Polish and UX

**Goal:** Add finishing touches for a polished experience.

#### Task 2.D.1: Handle Terminal Resize

```tsx
import { useStdout } from 'ink';

export const App: React.FC = () => {
  const { stdout } = useStdout();
  const [columns, setColumns] = useState(stdout?.columns || 80);

  useEffect(() => {
    const handleResize = () => setColumns(stdout?.columns || 80);
    stdout?.on('resize', handleResize);
    return () => stdout?.off('resize', handleResize);
  }, [stdout]);

  // Pass columns to components for responsive layout
};
```

#### Task 2.D.2: Add Help Overlay (Keyboard: ?)

```tsx
import { useInput } from 'ink';

const [showHelp, setShowHelp] = useState(false);

useInput((input, key) => {
  if (input === '?') setShowHelp(!showHelp);
  if (key.escape) setShowHelp(false);
  if (input === 'q') process.exit(0);
  if (input === 'r') refresh();
});
```

#### Task 2.D.3: Add Graceful Exit Handling

```tsx
useEffect(() => {
  const cleanup = () => {
    // Close file watchers, clear intervals
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  return () => {
    process.off('SIGINT', cleanup);
    process.off('SIGTERM', cleanup);
  };
}, []);
```

#### Task 2.D.4: Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error }: { error: Error }) => (
  <Box>
    <Text color="red">Error: {error.message}</Text>
    <Text color="gray">Press 'r' to refresh or 'q' to quit</Text>
  </Box>
);

// Wrap App in ErrorBoundary
```

---

## 4. Testing Plan

| Test | Method | Success Criteria |
|------|--------|------------------|
| Build succeeds | `npm run build` | Zero errors |
| TUI launches | `pm-os ui` | Dashboard renders |
| Stats accurate | Compare to `ls` counts | Numbers match |
| State updates | Modify `state.json` | UI refreshes |
| Git info correct | Run `git status` | Matches UI |
| Resize works | Resize terminal | Layout adapts |
| Exit clean | Ctrl+C | No hanging processes |

---

## 5. Future Enhancements (Not in Scope)

- Interactive skill execution from TUI
- Split pane with command output
- Real-time session streaming
- Multi-project switcher panel
- Mouse support for panel navigation

---

## 6. Dependencies Summary

```json
{
  "dependencies": {
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "ink-box": "^2.0.0",
    "chalk": "^5.3.0",
    "zustand": "^4.5.0",
    "chokidar": "^3.6.0",
    "glob": "^10.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0"
  }
}
```

---

## 7. Timeline Estimate

| Phase | Tasks | Complexity |
|-------|-------|------------|
| **2.A: ESM Migration** | 5 tasks | Medium |
| **2.B: TUI Foundation** | 6 tasks | Medium |
| **2.C: Dynamic Data** | 3 tasks | Medium |
| **2.D: Polish** | 4 tasks | Low |

**Total:** 18 tasks across 4 phases.

---

## 8. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| ESM migration breaks existing commands | Run full test suite after migration |
| Ink rendering issues on Windows | Test on Windows early, use cross-platform colors |
| File watcher performance | Debounce refresh, limit watched paths |
| Terminal compatibility | Support 80x24 minimum, graceful degradation |
