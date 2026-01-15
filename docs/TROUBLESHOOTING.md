# PM OS Troubleshooting Guide

This guide helps you resolve common issues with PM OS. Find your problem, follow the solution.

---

## Quick Diagnosis

Start here to identify what's wrong:

```
Issue with...
├─ Output staleness or drift       → Section: Staleness Issues
├─ Commands not working             → Section: Command Issues
├─ Missing or wrong output          → Section: Output Issues
├─ Learning system not running      → Section: Learning Issues
├─ Dependencies or source tracking  → Section: Dependency Issues
├─ File not found errors            → Section: Input Issues
└─ Everything else                  → Section: When to Ask for Help
```

---

## Staleness Issues

### My Output is Marked as Stale

**Symptoms:**
- Session starts with warning: "These outputs may be stale: [list]"
- Alert shows "⚠️ STALE" next to output in `alerts/stale-outputs.md`
- Claude warns output may have outdated information

**Cause:**
Source files were modified **after** the output was generated. For example:
- Output generated Jan 15 at 14:00
- Source file modified Jan 16 at 09:00
- Output now stale (missing new data)

**Solution:**

1. **Check which sources changed:**
   ```bash
   # Read the alerts file
   cat alerts/stale-outputs.md

   # Or check source modification times
   ls -lt inputs/voc/
   ls -lt outputs/insights/
   ```

2. **Refresh the output:**
   ```
   /voc               # Refresh VOC synthesis
   /ktlo              # Refresh KTLO triage
   /charters          # Refresh quarterly charters
   ```

3. **Verify refresh worked:**
   - Check `alerts/stale-outputs.md` - status should change to "✓ Current"
   - New output should include data from changed source files

4. **Check for cascading staleness:**
   - If Tier 1 output refreshed, check Tier 2 dependencies
   - Example: VOC synthesis refreshed → charters may now be stale
   - Refresh downstream outputs in order (Tier 1 → Tier 2 → Tier 3)

**Prevention:**
- Check staleness at session start (automatic)
- Refresh outputs regularly (weekly at minimum)
- Cascade refreshes: Foundation → Planning → Execution
- Pause file sync tools (Dropbox, Drive) during PM OS usage

**When to Ignore Staleness:**
- Source change was trivial (typo fix, formatting)
- New data doesn't affect conclusions
- Output still valid for current purpose
- You're mid-task and will refresh later

**Related:**
- [alerts/README.md](../alerts/README.md) - How staleness tracking works
- [outputs/README.md](../outputs/README.md) - Understanding output dependencies

---

### I See Drift Warnings

**Symptoms:**
- Warning: "⚠️ Drift detected: [output] is newer than its sources"
- Downstream output has later timestamp than upstream source
- Unclear which version is "correct"

**Cause:**
Drift occurs when a downstream output is **newer** than its upstream sources. This indicates:
1. **Manual edit:** You edited an upstream source after downstream was generated
2. **Out-of-sync update:** Downstream was regenerated but upstream wasn't
3. **Parallel work:** Multiple updates happening simultaneously

**Example:**
```
outputs/roadmap/Q1-charters.md (generated Jan 18)
  ← outputs/insights/voc-synthesis.md (generated Jan 15)
  ← You edit voc-synthesis.md on Jan 20

Result: Charter (Jan 18) older than VOC (Jan 20) → Drift detected
```

**Solution:**

1. **Understand what changed:**
   ```bash
   # Review the drift warning details
   cat alerts/stale-outputs.md

   # Compare versions if available
   diff history/synthesizing-voc/voc-synthesis-2026-01-15.md \
        outputs/insights/voc-synthesis.md
   ```

2. **Choose your approach:**

   **Option A: Reconcile (Keep downstream edits)**
   - Downstream changes are intentional and should be preserved
   - Update upstream to match downstream
   - Document decision in `outputs/decisions/`

   **Option B: Refresh (Regenerate from upstream)**
   - Upstream changes should propagate to downstream
   - Regenerate downstream from updated upstream
   - Overwrites any downstream manual edits

   **Option C: Cherry-pick**
   - Some changes from both versions are needed
   - Manually merge the two versions
   - Regenerate to establish clean baseline

3. **Execute your choice:**
   ```
   # For refresh approach:
   /charters          # Regenerate charters from updated VOC

   # For reconcile approach:
   # Manually edit upstream to match downstream
   # Then update alerts/stale-outputs.md to mark resolved
   ```

4. **Verify resolution:**
   - Check `alerts/stale-outputs.md` - drift warning should clear
   - Verify timestamps: downstream should be older or equal to upstream
   - Test that outputs reflect intended state

**Prevention:**
- Avoid manual edits to outputs (regenerate via skills instead)
- Refresh in dependency order (Tier 1 before Tier 2 before Tier 3)
- Use version control (git) to track changes
- Document decisions when reconciling drift

**When Drift is Acceptable:**
- Frozen outputs (intentionally not updating despite source changes)
- Work-in-progress manual refinements
- Testing changes before regenerating
- Documented divergence from upstream

**Related:**
- [alerts/README.md](../alerts/README.md) - Drift detection details
- [outputs/README.md](../outputs/README.md) - Dependency flow

---

### Everything Shows as Stale

**Symptoms:**
- All outputs marked stale immediately after generation
- Outputs show as stale even when nothing changed
- Staleness warnings every session

**Cause:**
File sync tools (Dropbox, Google Drive, OneDrive) are "touching" files - updating modification times without actual content changes.

**Solution:**

1. **Verify the problem:**
   ```bash
   # Check if file modification times are recent
   ls -lt inputs/voc/

   # All files modified within last few minutes?
   # → Sync tool is touching them
   ```

2. **Pause sync during PM OS usage:**
   - **Dropbox:** Preferences → Pause syncing
   - **Google Drive:** Settings → Pause
   - **OneDrive:** Settings → Pause sync

3. **Exclude PM OS from sync (alternative):**
   - Add `pm_os_superpowers/` to sync exclusions
   - Or move PM OS outside synced directory

4. **Disable auto-modification in sync settings:**
   - Check sync tool for "auto-organize" or "optimize" features
   - Disable features that touch file metadata

5. **Verify fix:**
   ```bash
   # Generate a fresh output
   /voc

   # Wait a few minutes
   # Check if it's still marked current
   cat alerts/stale-outputs.md
   ```

**Prevention:**
- Work in non-synced directory for PM OS
- Use git for version control instead of sync tools
- Configure sync to ignore modification time updates

**Related:**
- [alerts/README.md](../alerts/README.md) - Staleness detection logic

---

### Staleness Not Detected

**Symptoms:**
- Added new input file but output not marked stale
- Modified source but staleness system didn't notice
- Alerts file shows "✓ Current" when it shouldn't

**Cause:**
1. **Output metadata incomplete:** Output doesn't track the source file
2. **Alerts file not updated:** Skill didn't update `alerts/stale-outputs.md`
3. **New file not in tracked sources:** Added file outside expected input pattern

**Solution:**

1. **Check output metadata:**
   ```bash
   # Read the output file header
   head -20 outputs/insights/voc-synthesis.md
   ```

   Look for YAML frontmatter:
   ```yaml
   ---
   sources:
     - inputs/voc/interview-1.md (modified: 2026-01-10)
     - inputs/voc/interview-2.md (modified: 2026-01-11)
   ---
   ```

   Is your new file listed? If not, output doesn't know about it.

2. **Regenerate output to pick up new file:**
   ```
   /voc               # Will scan inputs/voc/ and include new file
   ```

3. **Verify new file is now tracked:**
   ```bash
   # Check output metadata again
   head -20 outputs/insights/voc-synthesis.md

   # Check alerts file
   cat alerts/stale-outputs.md
   ```

4. **If still not detected:**
   - Check file is in expected location (e.g., `inputs/voc/`)
   - Check file has correct extension (.md, .csv)
   - Check file permissions (readable?)
   - Manually add to sources in output metadata

**Prevention:**
- Place input files in standard locations
- Follow naming conventions (e.g., `inputs/voc/*.md`)
- Regenerate outputs after adding input files
- Check alerts file after regenerating

**Related:**
- [outputs/README.md](../outputs/README.md) - Output metadata standards
- [alerts/README.md](../alerts/README.md) - How staleness detection works

---

### Can't Resolve Drift

**Symptoms:**
- Drift detected but unclear which version is correct
- Both upstream and downstream have important changes
- Don't want to lose work from either version

**Cause:**
Parallel changes in both upstream and downstream without coordination.

**Solution:**

1. **Review both versions:**
   ```bash
   # Compare the two versions
   diff outputs/insights/voc-synthesis.md \
        outputs/roadmap/Q1-charters.md

   # Or use your editor's diff tool
   code --diff file1.md file2.md
   ```

2. **Identify what changed:**
   - What was edited in upstream? Why?
   - What's different in downstream? Why?
   - Are changes compatible or conflicting?

3. **Choose merge strategy:**

   **Strategy A: Manual merge**
   ```bash
   # Copy upstream version
   cp outputs/insights/voc-synthesis.md \
      outputs/insights/voc-synthesis-backup.md

   # Edit upstream to incorporate downstream insights
   # Then regenerate downstream
   /charters
   ```

   **Strategy B: Keep both, reconcile later**
   - Add note to `alerts/stale-outputs.md` explaining drift
   - Mark as "frozen" (intentionally not syncing)
   - Schedule review meeting to reconcile

   **Strategy C: Start fresh**
   - Archive both versions
   - Regenerate from scratch with all latest inputs
   - Clean slate approach

4. **Document decision:**
   ```bash
   # Record what you decided and why
   echo "Q1 charters drift resolved on $(date)" >> outputs/decisions/drift-resolutions.md
   echo "Decision: [what you chose]" >> outputs/decisions/drift-resolutions.md
   echo "Rationale: [why]" >> outputs/decisions/drift-resolutions.md
   ```

5. **Update alerts:**
   - Mark drift as resolved in `alerts/stale-outputs.md`
   - Document which version is canonical

**Prevention:**
- Avoid manual edits (regenerate instead)
- Coordinate changes when multiple people work on PM OS
- Use git branches for experimental changes
- Document decisions for future reference

**Related:**
- [alerts/README.md](../alerts/README.md) - Drift detection
- [outputs/decisions/](../outputs/decisions/) - Decision log

---

## Command Issues

### Command Not Found

**Symptoms:**
- Typed `/my-command` but nothing happened
- Error: "Command not recognized"
- Claude doesn't respond to slash command

**Cause:**
1. **Command doesn't exist:** No file at `commands/my-command.md`
2. **Typo in command name:** `commands/my-comand.md` (missing 'm')
3. **Wrong format:** Command file not structured correctly

**Solution:**

1. **Check command exists:**
   ```bash
   # List all available commands
   ls commands/

   # Check specific command
   ls commands/ktlo.md
   ```

2. **Verify spelling:**
   - `/ktlo` ✓ (correct)
   - `/ktle` ✗ (typo)
   - `/KTLO` ✗ (case-sensitive)

3. **Check command format:**
   ```bash
   # Read command file
   cat commands/ktlo.md
   ```

   Should look like:
   ```markdown
   ---
   description: "Brief description"
   disable-model-invocation: true
   ---

   Read and follow skills/[skill-name]/SKILL.md exactly as presented.
   ```

4. **Use direct invocation as alternative:**
   ```
   Instead of: /ktlo
   Use: "Run triaging-ktlo"
   ```

5. **Create command if needed:**
   ```bash
   # Create new command file
   cat > commands/my-command.md << 'EOF'
   ---
   description: "What this does"
   disable-model-invocation: true
   ---

   Read and follow skills/my-skill/SKILL.md exactly as presented.
   EOF
   ```

**Prevention:**
- Use tab completion if available
- Check `commands/README.md` for available commands
- Use direct skill invocation when unsure

**Related:**
- [commands/README.md](../commands/README.md) - Command reference
- [skills/README.md](../skills/README.md) - Skill documentation

---

### Command Runs But Wrong Skill

**Symptoms:**
- Typed `/voc` but got KTLO triage output
- Command invokes unexpected skill
- Output doesn't match command name

**Cause:**
Command file references wrong skill in its content.

**Solution:**

1. **Check command definition:**
   ```bash
   cat commands/voc.md
   ```

   Look at the skill reference line:
   ```markdown
   Read and follow skills/[skill-name]/SKILL.md exactly as presented.
   ```

2. **Verify skill reference is correct:**
   - `/voc` should reference `skills/synthesizing-voc/SKILL.md`
   - If it says `skills/triaging-ktlo/SKILL.md`, that's the problem

3. **Fix command file:**
   ```bash
   # Edit command file
   cat > commands/voc.md << 'EOF'
   ---
   description: "Synthesize VOC into themes"
   disable-model-invocation: true
   ---

   Read and follow skills/synthesizing-voc/SKILL.md exactly as presented.
   EOF
   ```

4. **Test fix:**
   ```
   /voc
   ```
   Should now run correct skill.

**Prevention:**
- Copy existing command files as templates
- Double-check skill reference after creating command
- Test new commands immediately

**Related:**
- [commands/README.md](../commands/README.md) - Command structure

---

## Output Issues

### Output Missing Metadata

**Symptoms:**
- Output file has no YAML header
- Can't determine when output was generated
- Can't see what sources were used
- Staleness system doesn't track output

**Cause:**
1. **Manual edit removed metadata:** Someone edited file and deleted header
2. **Old output format:** File created before metadata standards
3. **Skill error:** Skill failed to write metadata

**Solution:**

1. **Check if metadata exists:**
   ```bash
   head -20 outputs/insights/voc-synthesis.md
   ```

   Should start with:
   ```yaml
   ---
   generated: YYYY-MM-DD HH:MM
   skill: synthesizing-voc
   sources:
     - inputs/voc/file1.md (modified: YYYY-MM-DD)
   downstream:
     - outputs/roadmap/Q1-charters.md
   ---
   ```

2. **Regenerate with metadata:**
   ```
   /voc               # Regenerate (modern skills include metadata)
   ```

3. **Or add metadata manually:**
   ```bash
   # Edit file to add YAML header at the top
   cat > temp.md << 'EOF'
   ---
   generated: 2026-01-15 14:30
   skill: synthesizing-voc
   sources:
     - inputs/voc/interview-1.md (modified: 2026-01-10)
     - inputs/voc/interview-2.md (modified: 2026-01-11)
   downstream:
     - outputs/roadmap/Q1-charters.md
   ---
   EOF

   # Prepend to existing file
   cat temp.md outputs/insights/voc-synthesis.md > new.md
   mv new.md outputs/insights/voc-synthesis.md
   rm temp.md
   ```

4. **Update alerts file:**
   ```bash
   # Add output to tracking
   # Edit alerts/stale-outputs.md
   ```

**Prevention:**
- Don't manually edit output files (regenerate instead)
- Always use skills to generate outputs
- Check for metadata after manual operations

**Why Metadata Matters:**
- Enables staleness detection
- Shows dependency chain
- Tracks evidence sources
- Enables learning system
- Documents output provenance

**Related:**
- [outputs/README.md](../outputs/README.md) - Metadata standards
- [.claude/rules/pm-core/output-metadata.md](../.claude/rules/pm-core/output-metadata.md) - Requirements

---

### Output Format Doesn't Match My Needs

**Symptoms:**
- Output is too verbose or too brief
- Format doesn't match stakeholder expectations
- Missing sections you need
- Too much detail in some areas

**Cause:**
Skills have default output formats that may not match your specific needs.

**Solution:**

1. **Customize skill prompt:**
   ```
   "Run synthesizing-voc but format as:
   - Executive summary (3 bullets max)
   - Top 5 themes only
   - Each theme: name, evidence count, example quote"
   ```

2. **Use output style:**
   ```bash
   # If custom output style exists
   /output-style pm-executive

   # Then run command
   /voc
   ```

3. **Edit skill file directly:**
   ```bash
   # Create custom version
   cp skills/synthesizing-voc/SKILL.md \
      skills/synthesizing-voc/SKILL.custom.md

   # Edit SKILL.custom.md to change format
   # Update command to reference custom version
   ```

4. **Post-process output:**
   ```
   "Reformat outputs/insights/voc-synthesis.md as:
   - 1-page executive format
   - Table format for themes
   - Remove detailed evidence"
   ```

5. **Document preference for learning:**
   ```bash
   # Add to personal preferences
   echo "## VOC Format Preference" >> CLAUDE.local.md
   echo "- Executive summary format (3 bullets)" >> CLAUDE.local.md
   echo "- Top 5 themes only" >> CLAUDE.local.md
   ```

**Prevention:**
- Document format preferences in `CLAUDE.local.md`
- Learning system will pick up patterns over time
- Create custom output styles for recurring needs

**Related:**
- [.claude/README.md](../.claude/README.md) - Custom output styles
- [skills/README.md](../skills/README.md) - Customizing skills

---

### Can't Find Latest Output

**Symptoms:**
- Multiple output files with different dates
- Don't know which is current
- Confused by file naming

**Cause:**
PM OS versions outputs with date suffixes. Multiple versions can exist.

**Solution:**

1. **Sort by modification time:**
   ```bash
   # List outputs newest first
   ls -lt outputs/insights/

   # Top file = latest
   ```

2. **Check alerts file:**
   ```bash
   # Shows currently tracked outputs
   cat alerts/stale-outputs.md

   # Look in "Currently Tracked Outputs" table
   ```

3. **Check output directory README:**
   ```bash
   # Most recent file without history/ prefix
   ls outputs/insights/ | grep voc-synthesis | tail -1
   ```

4. **Use consistent naming:**
   - Latest version: `outputs/insights/voc-synthesis.md` (no date)
   - Or: Latest date suffix = current version

**Prevention:**
- Use `outputs/` for current version only
- Historical versions in `history/` directory
- Check alerts file for canonical current outputs

**Related:**
- [outputs/README.md](../outputs/README.md) - File naming conventions
- [alerts/README.md](../alerts/README.md) - Tracking current outputs

---

### Output Keeps Showing as Stale

**Symptoms:**
- Refresh output but it's immediately stale again
- Can't get output to show as current
- Staleness loop

**Cause:**
1. **Sync tool touching files:** File sync updating modification times
2. **Cascading staleness:** Downstream depends on stale upstream
3. **Missing source:** Output doesn't include all relevant inputs

**Solution:**

1. **Check for file sync issues:**
   ```bash
   # Check if files modified recently
   ls -lt inputs/voc/

   # If all files modified in last few minutes:
   # → Pause sync tool
   ```

2. **Check dependency chain:**
   ```bash
   # Is this a Tier 2/3 output?
   cat alerts/stale-outputs.md

   # Example: Charters depend on VOC
   # If VOC is stale, charters will be stale too
   # Fix: Refresh VOC first, THEN charters
   ```

3. **Refresh in dependency order:**
   ```
   # Tier 1: Foundation
   /voc
   /ktlo

   # Tier 2: Planning
   /charters

   # Tier 3: Execution
   # Run PRD skill
   ```

4. **Verify all sources included:**
   ```bash
   # Check output metadata
   head -20 outputs/insights/voc-synthesis.md

   # All input files listed in sources?
   # If not, regenerate to pick them up
   ```

**Prevention:**
- Pause sync tools during PM OS work
- Refresh in dependency order
- Check alerts file before important work

**Related:**
- [alerts/README.md](../alerts/README.md) - Dependency tiers

---

### Claims Ledger is Empty

**Symptoms:**
- Output has no "Claims Ledger" section
- Missing evidence tags (Evidence/Assumption/Open Question)
- Can't verify claims

**Cause:**
1. **Old output format:** Created before claims ledger requirement
2. **Manual edit:** Someone removed claims section
3. **Skill error:** Skill didn't generate claims ledger

**Solution:**

1. **Regenerate output:**
   ```
   /voc               # Modern skills include claims ledger
   ```

2. **Add claims ledger manually:**
   ```markdown
   ## Claims Ledger

   | Claim | Type | Source |
   |-------|------|--------|
   | [your claim 1] | Evidence | inputs/voc/file.md:45 |
   | [your claim 2] | Assumption | Needs validation |
   | [your claim 3] | Open Question | Unknown |
   ```

3. **Check evidence rules:**
   ```bash
   cat .claude/rules/pm-core/evidence-rules.md
   ```

**Prevention:**
- Always use skills to generate outputs
- Don't manually edit outputs
- Check for claims ledger after generation

**Why Claims Ledger Matters:**
- Enables verification of claims
- Distinguishes facts from assumptions
- Shows evidence trail
- Prevents invented data
- Critical for evidence-based PM

**Related:**
- [.claude/rules/pm-core/evidence-rules.md](../.claude/rules/pm-core/evidence-rules.md)
- [outputs/README.md](../outputs/README.md) - Claims ledger section

---

### History File Wasn't Created

**Symptoms:**
- Ran skill but no file in `history/[skill]/`
- Output exists in `outputs/` but not versioned
- Learning system can't find history

**Cause:**
1. **Skill error:** Skill didn't copy to history
2. **Directory doesn't exist:** `history/[skill]/` directory missing
3. **Permission issue:** Can't write to history directory

**Solution:**

1. **Check if output exists:**
   ```bash
   ls outputs/insights/voc-synthesis.md
   ```

2. **Check history directory:**
   ```bash
   ls history/synthesizing-voc/
   ```

3. **Manually copy to history:**
   ```bash
   # Create history directory if needed
   mkdir -p history/synthesizing-voc/

   # Copy output with date suffix
   cp outputs/insights/voc-synthesis.md \
      history/synthesizing-voc/voc-synthesis-$(date +%Y-%m-%d).md
   ```

4. **Verify permissions:**
   ```bash
   # Check directory is writable
   ls -ld history/synthesizing-voc/

   # Should show: drwxr-xr-x (directory with write permission)
   ```

5. **Check disk space:**
   ```bash
   df -h .
   ```

**Prevention:**
- Check history after running skills
- Ensure history directories exist
- Monitor disk space

**Related:**
- [history/README.md](../history/README.md) - History versioning
- [outputs/README.md](../outputs/README.md) - Automatic versioning

---

## Learning Issues

### Learning Hook Not Running

**Symptoms:**
- Expected weekly learning analysis but didn't happen
- No learned patterns in `.claude/rules/learned/`
- No updates to `CLAUDE.local.md`

**Cause:**
1. **Not enough history:** Need ≥5 outputs per skill for meaningful patterns
2. **Hook not configured:** `hooks/weekly-learning.sh` not set up
3. **Learning tracker not updated:** Last learning date not tracked

**Solution:**

1. **Check history count:**
   ```bash
   # Need at least 5 files per skill
   ls history/generating-quarterly-charters/ | wc -l

   # If < 5: Generate more outputs first
   ```

2. **Check learning tracker:**
   ```bash
   # Look for tracking file
   cat .learning-tracker

   # Or check history/learning-from-history/
   ls history/learning-from-history/
   ```

3. **Force learning manually:**
   ```
   "Analyze patterns from generating-quarterly-charters history"
   ```

4. **Check hook configuration:**
   ```bash
   # Check session hook
   cat hooks/session-start.sh

   # Should include learning trigger logic
   ```

5. **Verify output location:**
   ```bash
   # Check for learning outputs
   ls outputs/learning/
   ls .claude/rules/learned/
   ```

**Prevention:**
- Run skills regularly to build history
- Trigger learning manually after 5+ outputs
- Check learning tracker periodically

**Related:**
- [history/README.md](../history/README.md) - Learning system
- [.claude/README.md](../.claude/README.md) - Learned patterns

---

### No Learned Patterns Generated

**Symptoms:**
- Learning analysis ran but `.claude/rules/learned/` still empty
- No pattern files created
- Expected patterns but none appeared

**Cause:**
1. **Insufficient sample size:** < 5 outputs analyzed
2. **No clear patterns:** Outputs too varied to extract patterns
3. **Learning error:** Analysis failed or couldn't identify patterns
4. **Output location:** Patterns written elsewhere

**Solution:**

1. **Check learning output:**
   ```bash
   # Look for learning analysis report
   ls outputs/learning/
   cat outputs/learning/patterns-*.md
   ```

2. **Review analysis:**
   - Did learning find any patterns?
   - What was the sample size?
   - Were patterns too weak to codify?

3. **Generate more history:**
   ```bash
   # Need more samples for stronger patterns
   # Continue using skill, building history
   ```

4. **Run learning with `--force` flag:**
   ```
   "Analyze patterns from generating-quarterly-charters history with force flag"
   ```

5. **Check for patterns in analysis output:**
   ```bash
   # Even if no rules file, analysis may contain insights
   grep -i "pattern" outputs/learning/patterns-*.md
   ```

**Prevention:**
- Build substantial history (10+ outputs recommended)
- Use skills consistently (variations make pattern detection harder)
- Review learning outputs even if no rules generated

**When Patterns Won't Generate:**
- Early in PM OS usage (< 5 outputs)
- Highly varied outputs (no consistency)
- Experimental work (not production patterns)
- Intentional variation (testing different approaches)

**Related:**
- [history/README.md](../history/README.md) - Learning requirements
- [.claude/README.md](../.claude/README.md) - Pattern generation

---

## Dependency Issues

### Can't Determine What Output Depends On

**Symptoms:**
- Don't know what sources an output uses
- Need to understand dependency chain
- Want to know what's affected by source change

**Cause:**
Missing or incomplete metadata in output files.

**Solution:**

1. **Check output metadata:**
   ```bash
   # Read YAML header
   head -20 outputs/roadmap/Q1-charters.md
   ```

   Look for `sources:` section:
   ```yaml
   sources:
     - outputs/truth_base/truth-base.md (modified: 2026-01-05)
     - outputs/insights/voc-synthesis.md (modified: 2026-01-15)
     - outputs/ktlo/ktlo-triage.md (modified: 2026-01-15)
   ```

2. **Check alerts file:**
   ```bash
   # Shows dependency relationships
   cat alerts/stale-outputs.md

   # Look in "Dependency Graph" section
   ```

3. **Ask Claude:**
   ```
   "What does Q1-charters.md depend on?"
   ```

4. **Trace dependencies manually:**
   ```bash
   # Check what inputs were used
   grep -r "inputs/voc" outputs/insights/voc-synthesis.md

   # Check what Tier 1 outputs were used
   grep -r "outputs/insights" outputs/roadmap/Q1-charters.md
   ```

**Prevention:**
- Always use skills to generate outputs (includes metadata)
- Maintain metadata when editing
- Check dependency graph in alerts file

**Dependency Tiers:**
```
TIER 1: inputs/* → outputs/insights/, outputs/ktlo/, outputs/truth_base/
TIER 2: Tier 1 outputs → outputs/roadmap/
TIER 3: Tier 2 outputs → outputs/delivery/
```

**Related:**
- [alerts/README.md](../alerts/README.md) - Dependency tracking
- [outputs/README.md](../outputs/README.md) - Metadata standards

---

## Input Issues

### No Input Files Found

**Symptoms:**
- Skill runs but says "No input files found"
- Error: "No data in inputs/voc/"
- Output empty or missing data

**Cause:**
1. **Empty input directory:** No files in expected location
2. **Wrong location:** Files in wrong directory
3. **Wrong format:** Files don't match expected pattern

**Solution:**

1. **Check input directory exists and has files:**
   ```bash
   # List input files
   ls inputs/voc/
   ls inputs/jira/
   ls inputs/roadmap_deck/
   ```

2. **Verify file format:**
   - VOC inputs: `.md` files in `inputs/voc/`
   - KTLO inputs: `.csv` files in `inputs/jira/`
   - Truth base inputs: `.pdf`, `.md`, `.txt` in `inputs/roadmap_deck/`, etc.

3. **Add input files:**
   ```bash
   # Create directory if needed
   mkdir -p inputs/voc/

   # Add your input files
   cp ~/path/to/interview.md inputs/voc/
   ```

4. **Check file naming:**
   - Use descriptive names: `interview-customer-1.md`
   - Avoid special characters: `!@#$%^&*()`
   - Use hyphens not spaces: `customer-feedback.md` not `customer feedback.md`

5. **Verify file permissions:**
   ```bash
   # Files should be readable
   ls -l inputs/voc/

   # Should show: -rw-r--r-- (readable)
   ```

**Prevention:**
- Set up input directories before first use
- Check README files for expected file formats
- Use standard naming conventions

**Related:**
- [inputs/README.md](../inputs/README.md) - Input file structure
- Main README - Setup instructions

---

### CSV Parsing Failed

**Symptoms:**
- KTLO skill fails with CSV error
- Error: "Could not parse inputs/jira/tickets.csv"
- Output missing KTLO data

**Cause:**
1. **Invalid CSV format:** Missing quotes, extra commas, wrong encoding
2. **Empty file:** File exists but has no content
3. **Wrong delimiter:** Using semicolons instead of commas

**Solution:**

1. **Check CSV format:**
   ```bash
   # View first few lines
   head -5 inputs/jira/tickets.csv
   ```

   Should look like:
   ```csv
   Title,Type,Priority,Description
   "Bug: Sync failing","Bug","High","Catalog sync stops after 100 items"
   "Feature: Add filter","Feature","Medium","Users want to filter by category"
   ```

2. **Validate CSV:**
   ```bash
   # Check for issues
   # - Consistent column count
   # - Proper quoting
   # - No special characters in headers
   ```

3. **Re-export from Jira:**
   - Use CSV export (not Excel)
   - UTF-8 encoding
   - Comma delimiter
   - Quote text fields

4. **Fix common issues:**
   ```bash
   # Remove BOM (byte order mark)
   sed -i '1s/^\xEF\xBB\xBF//' inputs/jira/tickets.csv

   # Convert Windows line endings
   dos2unix inputs/jira/tickets.csv
   ```

5. **Test with minimal CSV:**
   ```bash
   # Create simple test file
   cat > inputs/jira/test.csv << 'EOF'
   Title,Type,Priority
   "Test Bug","Bug","High"
   "Test Feature","Feature","Low"
   EOF

   # Run KTLO with test file
   /ktlo
   ```

**Prevention:**
- Use standard CSV export from Jira
- UTF-8 encoding always
- Test CSV with small sample first
- Keep backups of working CSV files

**Related:**
- [inputs/README.md](../inputs/README.md) - CSV format requirements

---

## When to Ask for Help

If you've tried the solutions above and still have issues, you might need assistance.

### Escalate When:

1. **Data corruption:**
   - Files won't open or contain garbage
   - Git repository corrupted
   - Can't recover from backup

2. **System-level issues:**
   - Permissions errors you can't fix
   - Disk full or disk errors
   - Claude Code won't start

3. **Conceptual confusion:**
   - Don't understand PM OS workflow
   - Unclear what skill to use
   - Need guidance on PM best practices

4. **Bugs:**
   - Skill consistently fails
   - Output format broken
   - Feature not working as documented

5. **Custom needs:**
   - Need custom skill for your domain
   - Need integration with external tool
   - Need team/multi-user setup

### How to Report Issues:

**Include:**
1. **What you tried:** Commands run, steps taken
2. **What happened:** Actual result, error messages
3. **What you expected:** Intended result
4. **Context:** Which skill, what inputs, what outputs
5. **Environment:** OS, Claude Code version, directory structure

**Example:**
```
Issue: VOC synthesis shows no themes

What I tried:
- Ran /voc command
- Checked inputs/voc/ has 3 interview files
- Verified files are readable

What happened:
- Output generated but "Themes" section empty
- Claims ledger shows "No evidence found"

What I expected:
- 3-5 themes extracted from interviews
- Evidence from interview files

Context:
- Skill: synthesizing-voc
- Inputs: 3 .md files in inputs/voc/
- Output: outputs/insights/voc-synthesis-2026-01-15.md

Environment:
- macOS 14.2
- Claude Code 1.x
- PM OS directory structure intact
```

---

## Diagnostic Flowchart

Use this to narrow down your issue:

```
Start here
    │
    ├─ Output related? ────────────────────┐
    │   ├─ Stale/drift warnings?           │ → Staleness Issues
    │   ├─ Missing metadata?               │ → Output Issues
    │   ├─ Wrong format?                   │ → Output Issues
    │   └─ Can't find latest?              │ → Output Issues
    │
    ├─ Command related? ───────────────────┐
    │   ├─ Command not found?              │ → Command Issues
    │   ├─ Wrong skill runs?               │ → Command Issues
    │   └─ Command fails?                  │ → See error message
    │
    ├─ Learning related? ──────────────────┐
    │   ├─ Hook not running?               │ → Learning Issues
    │   ├─ No patterns generated?          │ → Learning Issues
    │   └─ Need more history?              │ → Keep using skills
    │
    ├─ Input related? ─────────────────────┐
    │   ├─ No files found?                 │ → Input Issues
    │   ├─ CSV parse error?                │ → Input Issues
    │   └─ Permission denied?              │ → Check file permissions
    │
    ├─ Dependency related? ────────────────┐
    │   ├─ Can't understand chain?         │ → Dependency Issues
    │   ├─ Cascading staleness?            │ → Staleness Issues
    │   └─ Drift confusion?                │ → Staleness Issues
    │
    └─ Something else? ────────────────────┘ → When to Ask for Help
```

---

## Quick Reference

### Most Common Issues & Fixes

| Issue | Quick Fix |
|-------|-----------|
| Output stale | `/voc`, `/ktlo`, or `/charters` to refresh |
| Drift warning | Choose: refresh downstream OR reconcile manually |
| Command not found | Use direct: "Run [skill-name]" |
| No input files | Add files to `inputs/voc/` or appropriate directory |
| Missing metadata | Regenerate output with skill |
| Learning not running | Need ≥5 history files, trigger manually |
| Everything stale | Pause file sync tool (Dropbox, Drive) |
| Can't find latest | `ls -lt outputs/[type]/` (newest first) |

### Essential Commands

```bash
# Check staleness
cat alerts/stale-outputs.md

# List available commands
ls commands/

# Check input files
ls -R inputs/

# Check output history
ls -lt outputs/

# Find latest output
ls -lt outputs/insights/ | head -1

# View output metadata
head -20 outputs/insights/voc-synthesis.md

# Check dependency chain
grep -A5 "sources:" outputs/roadmap/Q1-charters.md
```

---

## See Also

- [Main README](../README.md) - Getting started with PM OS
- [alerts/README.md](../alerts/README.md) - Staleness and drift details
- [outputs/README.md](../outputs/README.md) - Output structure and metadata
- [history/README.md](../history/README.md) - Learning system and versioning
- [commands/README.md](../commands/README.md) - Command reference
- [.claude/README.md](../.claude/README.md) - Configuration and rules
- [inputs/README.md](../inputs/README.md) - Input file formats

---

**Remember:** PM OS is file-based and deterministic. Most issues come from:
1. Mismatched timestamps (staleness)
2. Missing metadata (can't track dependencies)
3. File location errors (wrong directory)

Check these three areas first before deeper troubleshooting.
