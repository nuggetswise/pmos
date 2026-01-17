# Inputs Directory

## Purpose

The `inputs/` directory is where you drop source files for PM analysis. This is the entry point of your workflow - everything starts here.

**Why this matters:** PM OS operates on evidence-based decision making. The better your input data, the more accurate your insights, charters, and PRDs will be.

## Directory Structure

```
inputs/
├── context/          # YOUR context - role, constraints, stakeholders (user-maintained)
├── voc/              # Voice of Customer - feedback, interviews, surveys
├── jira/             # Support tickets and bug reports
├── roadmap_deck/     # Strategy presentations, product plans
├── product_demo/     # Demo notes, feature walkthroughs
└── knowledge_base/   # KB articles, support documentation
```

## User vs System Boundary

| Directory | Maintained By | Purpose |
|-----------|---------------|---------|
| `context/` | **You** | Your role, constraints, stakeholders, decision principles |
| `voc/`, `jira/`, etc. | **You** (from external sources) | Product/customer data for analysis |

**Key principle:** `context/` is about YOU. Other directories are about the PRODUCT and CUSTOMERS.

## Usage

### When to Add Files

| Directory | What to Add | When |
|-----------|-------------|------|
| `context/` | Your role, stakeholders, constraints, decision principles | At setup, update quarterly |
| `voc/` | Customer feedback, interview transcripts, survey results | After customer calls, surveys, user research |
| `jira/` | Exported tickets (CSV format preferred) | Weekly or when triaging backlog |
| `roadmap_deck/` | Strategy slides, roadmap presentations, planning docs | When onboarding or strategy updates |
| `product_demo/` | Demo scripts, feature walkthroughs, training materials | After demos or when documenting features |
| `knowledge_base/` | Exported KB articles, help documentation | When analyzing support gaps |

### File Formats

**Recommended formats:**
- **Text/Markdown**: `.md`, `.txt` - Easiest to process
- **CSV**: `.csv` - Great for structured data (Jira exports, survey results)
- **PDF**: `.pdf` - For presentations and documents (note: will be converted)
- **Avoid**: Binary formats, locked documents, large media files

### File Naming Best Practices

Use descriptive, dated filenames:

**Good examples:**
- `inputs/voc/customer-interview-acme-corp-2026-01-15.md`
- `inputs/jira/support-tickets-2026-01.csv`
- `inputs/roadmap_deck/Q1-2026-product-strategy.pdf`

**Avoid:**
- Generic names: `feedback.csv`, `tickets.csv`
- Special characters: `feedback@2024.csv`, `notes#1.md`
- Spaces in filenames (use hyphens instead)

## Examples

### Example 1: Adding VOC Feedback

You just finished customer interviews. Here's how to add them:

1. **Export transcripts** from your interview tool (Gong, Zoom, etc.)
2. **Save to inputs/voc/** with descriptive names:
   ```
   inputs/voc/interview-buyer-retailer-a-2026-01-15.md
   inputs/voc/interview-supplier-brand-x-2026-01-16.md
   inputs/voc/interview-ops-manager-2026-01-17.md
   ```
3. **Run synthesis:** `/voc` or "Run synthesizing-voc"
4. **Review output:** `outputs/insights/voc-synthesis-2026-01-17.md`

### Example 2: Adding Jira Tickets

Time to triage your support backlog:

1. **Export from Jira:**
   - Go to Jira → Issues → Search → Export → CSV
   - Include columns: Summary, Description, Priority, Created, Status
2. **Save to inputs/jira/**:
   ```
   inputs/jira/support-backlog-2026-01-15.csv
   ```
3. **Run triage:** `/ktlo`
4. **Review output:** `outputs/ktlo/ktlo-triage-2026-01-15.md`

### Example 3: CSV Structure for Jira Export

Your Jira CSV should look like this:

```csv
Issue Key,Summary,Description,Priority,Status,Created
PROD-123,"Catalog sync fails","Users report catalog not syncing...",High,Open,2026-01-10
PROD-124,"Search returns no results","Search is broken for...",Medium,Open,2026-01-11
```

Minimum required columns:
- **Summary** - Short description
- **Description** - Full details
- **Priority** (optional but helpful)
- **Status** (optional)
- **Created** (optional but helpful for trends)

## What Happens to Input Files

1. **Skills read** input files when invoked
2. **Outputs are generated** in `outputs/` directories
3. **Metadata tracks** which inputs were used (YAML header)
4. **Staleness detection** monitors when inputs change
5. **History preserves** input snapshots (via output metadata)

**Important:** Input files are never modified by PM OS. They're read-only.

## Common Issues

### Issue: "No input files found"

**Problem:** You ran a skill but no input files exist.

**Solution:**
1. Check the expected input directory (e.g., `inputs/voc/` for VOC synthesis)
2. Verify files are in the correct subdirectory
3. Ensure files have readable format (.md, .csv, .pdf, .txt)

### Issue: "CSV parsing failed"

**Problem:** Jira CSV export has formatting issues.

**Solution:**
1. Open CSV in a text editor to check format
2. Ensure proper quoting for fields with commas
3. Verify headers match expected columns
4. Re-export from Jira with standard options

### Issue: "Output marked as stale immediately"

**Problem:** Output is stale right after generation.

**Solution:**
1. Check file modification times: `ls -lt inputs/voc/`
2. Ensure input files aren't being auto-modified by sync tools
3. If using Dropbox/Drive, wait for sync to complete before running skills

## Best Practices

1. **Organize by date**: Add date suffixes to files for easy tracking
2. **Don't delete inputs**: Keep historical data for learning system
3. **Consistent naming**: Use hyphens, lowercase, descriptive names
4. **Regular updates**: Update VOC weekly, KTLO when triaging, roadmap quarterly
5. **Clean exports**: Verify CSV structure before running skills

## Integration with PM OS

```
┌─────────────┐
│   inputs/   │ ← You drop files here
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   skills/   │ ← Skills read inputs
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  outputs/   │ ← Generated insights
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  history/   │ ← Versioned trail
└─────────────┘
```

**See also:**
- [outputs/README.md](../outputs/README.md) - Understanding your results
- [skills/README.md](../skills/README.md) - Available PM workflows
- [Main README](../README.md) - Getting started guide
