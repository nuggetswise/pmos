Nice — this is **actually** the “code before prompts” pivot you were aiming for. You now have a real deterministic spine (TS CLI + extractors + state), and Claude Code rules just *render* status / enforce conventions. That’s the right direction.

That said, if you want this to behave like a reliable “2nd brain” across **macOS + Windows** and keep **LLM calls minimal**, there are a few sharp edges I’d fix now (HV/LE only). I’m going to review what you pasted like a lead engineer doing a sanity check.

---

## What’s solid (keep)

* ✅ **Single source of truth:** `nexa/state.json`
* ✅ **sources.example.yaml** registry (prevents “copy into inputs”)
* ✅ **scan + status + optional watch** commands
* ✅ **outputs/ingest/** + **outputs/audit/** (correct separation)
* ✅ **extractors/** per filetype (good modularity)
* ✅ Claude rules updated to read `state.json` + deprecation notices (good cutover hygiene)

---

## Highest-value fixes / questions (no fluff)

### 1) “watch.ts” vs scan loop — choose one default path

Watch mode is often flaky on cloud-synced folders and network drives (Drive/OneDrive/SharePoint). Scan mode is boring but reliable.

**HV/LE recommendation**

* Make `scan` the canonical mechanism.
* Keep `watch` as *optional*, but implement it as “watch events → schedule scan” rather than “watch → ingest immediately”.

This avoids missed events and handles file write bursts.

**Spec change**

* `watch` should enqueue a debounced `scan` (with stability window) rather than processing each file event.

---

### 2) You need a stability window + “partial file write” guard (especially pptx/pdf)

Your earlier plan explicitly had “no edits for 90s.” I don’t see it called out here.

**HV/LE implementation rule**

* Don’t ingest a file until it’s been stable:

  * `(mtime unchanged AND size unchanged)` for `stability_window_sec` (default 90)
* Store stability tracking in state:

  * `pending: { path, first_seen_at, last_seen_mtime, last_seen_size }`

This prevents “read half-written files” on Windows and synced folders.

---

### 3) Hashing: avoid re-hashing giant PDFs every scan

You mentioned hashing utilities. Great—but do it smart:

**Two-stage fingerprint**

1. cheap: `(mtime, size)`
2. only when stable: compute content hash

Then cache `content_hash` keyed by `(path, mtime, size)` so repeated scans are cheap.

This is one of the biggest perf/cost wins.

---

### 4) Extractors: csv via xlsx is suspicious

You wrote: `csv.ts # .csv extraction (via xlsx)`

That’s workable but a little odd. It can break on messy CSVs unless you do explicit delimiter/quote handling.

**HV/LE recommendation**

* Use a dedicated CSV parser (`csv-parse` / `papaparse` / `fast-csv`)
* Only use `xlsx` for `.xlsx`/`.xls`

Otherwise you’ll get ingest failures that look random.

---

### 5) pptx extraction “via adm-zip” is usually incomplete

`adm-zip` can unzip PPTX, but you still need to parse the XML inside to extract slide text. If your current extractor is just pulling raw XML blobs, your deltas will be noisy.

**HV/LE baseline**

* Extract slide text by parsing `ppt/slides/slide*.xml` and reading `<a:t>` nodes
* If you’re already doing this, great—just make sure it’s explicit in docs.

---

### 6) State schema: you need *ingest index* + *latest artifacts* + *next action*

You said it “updated with ingest index and job info.” Good. Make sure you have these fields or you’ll hit “2nd brain” limitations:

Minimum state fields to support reliability:

* `daemon` or `runtime` (even if not a daemon, track last scan)
* `last_scan_at`
* `ingest_index[]` (source_path → ingest_path + hashes + status)
* `brief` (your 5 lines)
* `next_action`
* `errors[]` (last N failures; one-line each)

If you only store “last job”, you’ll lose continuity.

---

### 7) You added `input-rules.yaml` — great, but keep it deterministic

This file is a huge lever to reduce LLM calls.

**What it should do**

* Map file patterns → job types
* Decide whether a change warrants delta creation (material-change rules)
* Decide routing: VOC vs Jira vs “generic”

Keep it simple and auditable:

* regex/glob matching
* thresholds (“only run delta if >= N new issues”)
* always write decision into audit log (“skipped delta: no material change”)

---

---

## What I’d add next (still HV/LE, keeps LLM minimal)

### A) Material-change gate (so deltas don’t spam compute)

Even if deltas are “future,” implement the gate now because it’s core to cheap automation.

Example:

* If content hash changed but extracted text diff is < 2% → skip delta
* If Jira CSV has no new P0/P1 and no spike → skip delta
* Log “skipped” in `outputs/audit/auto-run-log.md`

### B) “Context packet” generator (code) to make PRDs cheap later

If you want PRDs/stories/docs with minimal LLM, generate a JSON packet from ingests:

* `outputs/intermediate/prd_packet.json`
* LLM uses that to write PRD in **one** call

This is what makes it still feel like a second brain without constant model usage.