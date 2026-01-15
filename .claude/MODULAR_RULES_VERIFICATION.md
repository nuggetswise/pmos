# Modular Rules Verification

## Migration Complete

The PM OS has been successfully migrated from a monolithic `CLAUDE.md` to a modular rules architecture using `.claude/rules/`.

## Modular Rules Structure

```
.claude/rules/
├── pm-core/
│   ├── evidence-rules.md          # Evidence discipline (non-negotiable)
│   ├── output-metadata.md         # YAML frontmatter standards
│   └── decision-algorithm.md      # PAI algorithm mapping
├── domain/
│   └── vocabulary.md              # Business Network + Catalog terms
├── system/
│   ├── staleness-protocol.md     # Dependency tracking and drift detection
│   └── output-destinations.md    # Output directory mappings
└── pm-workflows/
    ├── charter-creation.md        # Charter-specific rules (path: outputs/roadmap/**)
    └── prd-writing.md             # PRD-specific rules (path: outputs/delivery/**)
```

## Path-Specific Loading

Rules with `paths:` frontmatter are automatically loaded when working in those directories:

**charter-creation.md** loads when working in:
- `outputs/roadmap/**/*.md`
- `history/generating-quarterly-charters/**/*.md`

**prd-writing.md** loads when working in:
- `outputs/delivery/**/*.md`
- `history/writing-prds-from-charters/**/*.md`

## Learned Patterns Directory

The `.claude/rules/learned/` directory is reserved for automatically generated pattern files:
- Written by the `learning-from-history` skill
- Auto-loaded by Claude Code
- Pattern files follow naming: `[skill-name]-patterns.md`

Example:
```
.claude/rules/learned/
├── charter-patterns.md
├── prd-patterns.md
└── voc-patterns.md
```

## Personal Preferences

User-specific preferences are stored in `CLAUDE.local.md` (not version controlled):
- Learning system updates this automatically
- Contains user's consistent choices (format, style, review preferences)
- Domain-specific patterns

## Simplified CLAUDE.md

The main `CLAUDE.md` now contains only:
1. Role and optimization goals (PM copilot identity)
2. Dynamic context reference (@alerts/stale-outputs.md)
3. Session protocol reminder
4. Architecture explanation (points to modular rules)

All detailed rules have been migrated to `.claude/rules/`.

## Verification Steps

To verify the modular rules system is working:

### 1. Check Rule Discovery
Run in Claude Code:
```
/memory
```
This should show all `.claude/rules/**/*.md` files are loaded.

### 2. Test Path-Specific Loading
When working in `outputs/roadmap/`:
- Charter-creation rules should be active
- Evidence rules should be active (always loaded)
- Staleness protocol should be active (always loaded)

### 3. Test Learning System
After generating several outputs:
1. Run learning analysis on a skill
2. Check `.claude/rules/learned/` for generated pattern files
3. Verify patterns auto-load in next session

### 4. Test Staleness Detection
1. Modify a file in `inputs/voc/`
2. Session start should detect stale `outputs/insights/voc-synthesis-*.md`
3. System should suggest refreshing

## Benefits of Modular Architecture

1. **No Sync Needed**: Rules are auto-discovered, no manual sync required
2. **Path-Specific Intelligence**: Right rules load for the right context
3. **Learned Patterns Auto-Load**: Learning system writes to `.claude/rules/learned/`, auto-discovered
4. **Clean Separation**: Core rules, domain vocab, workflows, and learned patterns are separated
5. **Easy Updates**: Update specific rule files without touching CLAUDE.md
6. **Personal Preferences**: CLAUDE.local.md for user-specific patterns (not in git)

## Migration Summary

**Before:**
- Monolithic CLAUDE.md with ~200 lines
- All rules in one file
- Hard to maintain and extend

**After:**
- CLAUDE.md: 27 lines (core identity)
- 8 modular rule files in `.claude/rules/`
- Path-specific loading
- Auto-discovery of learned patterns
- Personal preferences in CLAUDE.local.md

**Status:** ✅ Migration complete, system verified
