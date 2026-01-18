Cool — restarting from *this* plan is the right move. I’m going to do two things:

1. **Review + tighten the plan** so it’s implementable, code-first, low LLM.
2. **Answer the “questions I need answered”** with defaults that fit your constraints (macOS + Windows, no copy/paste, no notifications, state-driven).

---

## 1) Review + tighten (what I’d change)

### A) Use a registry, but make it cross-platform + git-safe

* YAML is fine, but for Windows paths it can get messy with escaping.
* Best compromise: keep a **committed example** + **machine-local override**.

**Recommended**

* `nexa/sources.example.yaml` (committed)
* `nexa/sources.local.yaml` (gitignored; macOS)
* `nexa/sources.work.local.yaml` (gitignored; Windows)

Daemon loads: local > work.local > example.

### B) “Watcher” should be *scan-first* (HV/LE across macOS+Windows)

Filesystem watchers are platform-specific and fragile (network drives, OneDrive, Google Drive sync, etc.). A **scheduled scan** is boring but reliable.

**Rule**

* Scan every N seconds/minutes
* Detect changes by `(mtime, size)` and then confirm via `content_hash` once stable.

### C) Add a 2-step change detector to avoid thrash

Instead of hashing big PDFs repeatedly:

1. **Cheap fingerprint**: `(mtime, size)`
2. If stable for 90s → compute **content_hash** once and ingest

### D) Store ingest in `outputs/ingest/` (not next to source)

Storing next to original (`.ingest/`) breaks on work laptops + permissions + synced folders. Centralizing in repo is safer and consistent.

So: `outputs/ingest/<hash>.txt` + `<hash>.meta.json`

### E) Queue should carry “intent”, not files

Queue entries should refer to a **source_ref** (path + hash) and let jobs pull the ingest pointer from state/meta. That prevents weird race conditions.

---

## 2) Answers (defaults I’d implement)

### Q1) Which directories should be watched as sources (exact paths)?

**Default approach:** watch the places you naturally edit + export from.

On macOS (examples):

* `~/Downloads` (Jira exports, PDFs)
* `~/Library/CloudStorage/GoogleDrive-*/My Drive/PM` (or your Drive sync root)
* Your active project folders (where PRDs/decks live)

On Windows:

* `C:\Users\<you>\Downloads`
* `C:\Users\<you>\OneDrive\...` or `Google Drive\My Drive\...`
* Work project directories

**Important:** don’t watch your entire home folder. Too noisy and expensive.

### Q2) Recursive watch by default, or only specific files?

**Default:** recursive for *project folders*, non-recursive for noisy folders like Downloads.

* Downloads: `mode: non_recursive` + includes for specific patterns (`jira*.csv`, `*.pdf`, etc.)
* Drive/project folders: `mode: recursive` + includes for docx/pptx/pdf/csv

### Q3) Where should extracted text be stored?

**Default:** `outputs/ingest/` (inside repo), keyed by hash.

Why:

* consistent across macOS + Windows
* doesn’t require write permissions in source directories
* easy to cache/dedupe
* makes “code before prompts” easy (downstream always reads plain text)

### Q4) Automatic ingestion for all source types, or manual for some?

**Default:** auto-ingest **everything** that matches includes (`pdf/docx/pptx/csv/md/txt`).

But keep a **safety cap**:

* if PDF is huge (e.g., > 50MB) or takes too long → fail gracefully and set:

  * `state.next_action = "PDF ingest too large/slow: run /ingest <path> manually or split file"`

No popups. No prompts. Just state.

---

## Updated plan (tight version you can hand to junior engg)

### No-copy flow (registry + scan-based watcher)

* Add `nexa/sources*.yaml` registry listing absolute paths you already use.
* A scan loop runs every `scan_interval_sec`.
* On change: track `(mtime, size)` until stable for `stability_window_sec`.
* When stable: compute `content_hash`, run ingest once, store sidecar in `outputs/ingest/`.
* Update `nexa/state.json` with ingest pointer + latest artifact.
* Enqueue delta jobs automatically (VOC/Jira) only when **material change** is true.

### Example registry (macOS)

```yaml
version: 1
scan_interval_sec: 120
stability_window_sec: 90

sources:
  - path: "/Users/singhm/Downloads"
    include: ["jira*.csv","*.pdf","*.docx","*.pptx"]
    mode: "non_recursive"

  - path: "/Users/singhm/Drive/PM"
    include: ["**/*.docx","**/*.pptx","**/*.pdf","**/*.csv"]
    mode: "recursive"
```

### Code-first principles (PAI-inspired, private-repo friendly)

* Capabilities are modular (ingest, delta, staleness)
* Hooks are event-driven (scan tick → queue → daemon), not prompt-driven
* Status is deterministic (5-line brief from `state.json`)
* Observability via append-only audit log

You don’t need “packs for sharing”; the same structure helps **your coding agents** implement reliably.

---

## One last key decision (I’ll pick a default)

**Default I’d implement:** tiny Node/TS scripts (because PAI from Miessler uses TS).

* `tools/scan.ts`
* `tools/ingest.ts`
* `tools/diff.ts`
* `tools/state_update.ts`

Claude Code skills then orchestrate these tools, and only call the LLM for final writing.
