# PM OS Daemon (nexa/)

The PM OS daemon (`pm-os` CLI) handles document scanning, extraction, and state management for your PM workflow.

## Overview

PM OS daemon provides:
- **Document scanning** - Monitors configured sources for new/changed files
- **Text extraction** - Extracts text from PDF, DOCX, PPTX, CSV files
- **State management** - Single source of truth in `state.json`
- **History mirroring** - Copies outputs to history for learning
- **Pattern learning** - Analyzes history to generate learned rules

## Quick Start

```bash
# 1. Install dependencies
cd nexa && npm install && npm run build

# 2. Set up sources (first time only)
cp sources.example.yaml sources.local.yaml
# Edit sources.local.yaml with your document paths

# 3. Scan for documents
pm-os scan

# 4. Check status
pm-os status
```

## CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `scan` | Scan sources and ingest new documents | `pm-os scan` |
| `status` | Show 5-line state brief | `pm-os status` |
| `watch` | Start background watch mode | `pm-os watch` |
| `search` | Search filenames and full text | `pm-os search "pricing"` |
| `mirror` | Copy outputs to history/ | `pm-os mirror` |
| `learn` | Analyze history and write learned rules | `pm-os learn synthesizing-voc` |
| `init` | Initialize state.json | `pm-os init` |
| `help` | Show help message | `pm-os help` |

### Command Details

**`pm-os scan`**
- Reads `sources.local.yaml` for configured document paths
- Finds new/changed files (by content hash)
- Extracts text to `outputs/ingest/`
- Updates `state.json` ingest index

**`pm-os status`**
- Shows 5-line daemon brief:
  - Daemon status (running/stopped)
  - Algorithm phase (OBSERVE/THINK/PLAN/BUILD/LEARN)
  - Current job (or idle)
  - Latest delta summary
  - Next recommended action

**`pm-os mirror [--quiet]`**
- Copies outputs from `outputs/` to `history/<skill>/` with date suffix
- Use `--quiet` flag for silent operation (used by Nexa after skill runs)
- Required for the learning loop to work

**`pm-os learn <skill>` or `pm-os learn --auto`**
- Analyzes history files for a specific skill
- Extracts success/failure patterns
- Writes learned rules to `.claude/rules/learned/`
- `--auto` mode runs learning across all skills with sufficient history

## State Management

**Single source of truth:** `nexa/state.json`

### state.json Schema

| Field | Type | Description |
|-------|------|-------------|
| `version` | number | Schema version (currently 1) |
| `daemon.status` | string | stopped \| running |
| `daemon.pid` | number \| null | Process ID when running |
| `daemon.last_heartbeat_at` | ISO date \| null | Last watch mode heartbeat |
| `daemon.started_at` | ISO date \| null | When daemon started |
| `phase` | string | OBSERVE \| THINK \| PLAN \| BUILD \| VERIFY \| LEARN |
| `current_job` | object \| null | Active job (type, id, status, started_at, inputs) |
| `brief.top_themes` | array | Top themes from recent analysis |
| `brief.risk_flags` | array | Current risk flags |
| `brief.latest_delta` | string \| null | Summary of latest change |
| `next_action` | string | Recommended next step |
| `ingest_index` | array | Processed documents (source_path, content_hash, status) |
| `last_job` | object \| null | Most recent completed job |
| `errors` | array | Recent errors (last 10) |

### Example state.json

```json
{
  "version": 1,
  "daemon": {
    "status": "stopped",
    "pid": null,
    "last_heartbeat_at": null,
    "started_at": null
  },
  "phase": "OBSERVE",
  "current_job": null,
  "brief": {
    "top_themes": [],
    "risk_flags": [],
    "latest_delta": null
  },
  "next_action": "Run 'pm-os scan' to scan for new documents",
  "ingest_index": [],
  "last_job": null,
  "errors": []
}
```

## Configuration

### sources.local.yaml

Configure document sources (gitignored - your local paths):

```yaml
sources:
  - path: ~/Downloads
    patterns:
      - "*.pdf"
      - "*.docx"
  - path: ~/Drive/PM
    patterns:
      - "**/*.pptx"
      - "**/*.csv"
  - path: ./inputs
    patterns:
      - "**/*"
    exclude:
      - "context/**"  # Don't scan context files
```

**Important:** `inputs/context/` is excluded by default - it contains your personal context, not documents to scan.

### input-rules.yaml

Routes ingested documents to appropriate jobs:

```yaml
rules:
  - pattern: "*feedback*"
    job: delta-feedback
  - pattern: "*roadmap*"
    job: delta-roadmap
  - pattern: "*ops*"
    job: delta-ops
  - default:
    job: ingest
```

## Automation

### Auto-Mirror (After Skills)

Nexa automatically runs `pm-os mirror --quiet` after generating any output to `outputs/`. No manual intervention required.

### Auto-Learn (Weekly)

The weekly learning hook (`hooks/weekly-learning.sh`) runs `pm-os learn --auto` on a 7-day cadence.

**The complete learning loop:**
```
External docs → pm-os scan → outputs/ingest/
Skills run → outputs/<type>/ → pm-os mirror → history/<skill>/
Weekly → pm-os learn --auto → .claude/rules/learned/
```

## Directory Structure

```
nexa/
├── state.json            # Single source of truth (gitignored)
├── sources.example.yaml  # Source configuration template
├── sources.local.yaml    # Your sources (gitignored)
├── input-rules.yaml      # Input → job routing
├── src/                  # TypeScript source
│   ├── index.ts          # CLI entry point
│   ├── state.ts          # State management
│   ├── scanner.ts        # File scanning
│   ├── ingest.ts         # Text extraction
│   ├── mirror.ts         # History mirroring
│   ├── learn.ts          # Pattern learning
│   ├── search.ts         # Full-text search
│   ├── watch.ts          # Watch mode
│   └── utils.ts          # Utilities
├── package.json          # Node dependencies
└── tsconfig.json         # TypeScript config
```

## Troubleshooting

### "No new files to process"

- Check `sources.local.yaml` exists and has valid paths
- Verify file patterns match your documents
- Files may already be in the ingest index (check `state.json`)

### "Extraction failed"

- Check file permissions
- Verify file isn't corrupted
- See `outputs/audit/auto-run-log.md` for error details

### State appears stale

- Run `pm-os scan` to refresh
- Check `state.json` timestamps
- If state is corrupted, run `pm-os init` to reset

### Mirror not working

- Verify outputs exist in `outputs/` directories
- Check skill name matches history directory naming
- Review warnings in mirror output

## Development

```bash
# Install dependencies
cd nexa && npm install

# Build TypeScript
npm run build

# Run directly
npx ts-node src/index.ts status

# Link globally (optional)
npm link
```

## See Also

- [outputs/README.md](../outputs/README.md) - Output directory structure
- [history/README.md](../history/README.md) - History and learning
- [.claude/rules/README.md](../.claude/rules/README.md) - Rules system
- [Main README](../README.md) - Getting started guide
