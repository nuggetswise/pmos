#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: ScopeValidator
 * ============================================================
 * PURPOSE: Warn when file operations occur outside declared scope.
 *          Helps maintain PM OS file organization conventions.
 * TRIGGER: PreToolUse (before Write/Edit operations)
 *
 * INPUT:
 *   - Tool name and parameters from tool invocation
 *   - Current skill context (if available)
 *
 * OUTPUT:
 *   - hookSpecificOutput: Warning if scope violation detected
 *
 * SIDE EFFECTS:
 *   - None (warning only, does not block)
 *
 * ERROR HANDLING:
 *   - Always allows operation to proceed
 *   - Graceful handling of missing context
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - Runs before tool execution
 *   - Non-blocking advisory only
 * ============================================================
 */

import * as path from 'path';
import type { HookDefinition, HookContext, HookResult, HookMeta } from '../types.js';
import { formatContextInjection, logHookComplete } from '../lib/index.js';
import { getProjectRoot } from '../../utils.js';

export const meta: HookMeta = {
  id: 'scope-validator',
  trigger: 'output:created', // Treated as advisory on write
  intent: 'Warn on file operations outside PM OS conventions',
  guarantees: ['non-blocking', 'read-only', 'deterministic'],
  scope: {
    read: [],
    write: [],
  },
  userMessage: undefined, // Only shown if violation detected
};

/**
 * PM OS file organization rules
 */
interface ScopeRule {
  pattern: RegExp;
  description: string;
  allowed: boolean;
  suggestion?: string;
}

const SCOPE_RULES: ScopeRule[] = [
  // Allowed: outputs directories
  {
    pattern: /^outputs\/(?:roadmap|delivery|insights|ktlo|stakeholders|gtm|strategy|reviews|decisions|exec_updates|truth_base|discovery)\//,
    description: 'PM output directories',
    allowed: true,
  },
  // Allowed: history directories
  {
    pattern: /^history\//,
    description: 'History directory',
    allowed: true,
  },
  // Allowed: inputs (user-maintained, but skills shouldn't write here)
  {
    pattern: /^inputs\//,
    description: 'Inputs directory',
    allowed: false,
    suggestion: 'Inputs should be user-maintained. Consider writing to outputs/ instead.',
  },
  // Allowed: .beads
  {
    pattern: /^\.beads\//,
    description: 'Beads directory',
    allowed: true,
  },
  // Allowed: .claude/rules/learned
  {
    pattern: /^\.claude\/rules\/learned\//,
    description: 'Learned rules',
    allowed: true,
  },
  // Warning: .claude/rules (except learned)
  {
    pattern: /^\.claude\/rules\/(?!learned)/,
    description: 'Core rules',
    allowed: false,
    suggestion: 'Core rules should not be modified by skills. Use learned/ for pattern updates.',
  },
  // Warning: nexa source
  {
    pattern: /^nexa\/src\//,
    description: 'Nexa source code',
    allowed: false,
    suggestion: 'Daemon source code should be modified carefully by user, not skills.',
  },
  // Allowed: nexa state
  {
    pattern: /^nexa\/state\.json$/,
    description: 'State file',
    allowed: true,
  },
  // Warning: daemon-managed
  {
    pattern: /^outputs\/(?:ingest|audit|deltas)\//,
    description: 'Daemon-managed directories',
    allowed: false,
    suggestion: 'These directories are managed by pm-os daemon. Do not write directly.',
  },
  // Warning: skills (should be user-maintained)
  {
    pattern: /^skills\//,
    description: 'Skills directory',
    allowed: false,
    suggestion: 'Skills should be user-maintained. Consider using learned rules instead.',
  },
];

export async function run(ctx: HookContext): Promise<HookResult> {
  try {
    // Extract file path from payload
    const filePath = extractFilePath(ctx);
    if (!filePath) {
      return { success: true };
    }

    // Normalize path
    const root = getProjectRoot();
    const relativePath = path.isAbsolute(filePath)
      ? path.relative(root, filePath)
      : filePath;

    // Check against scope rules
    const violation = checkScope(relativePath);
    if (!violation) {
      return { success: true };
    }

    // Build warning
    const warning = buildScopeWarning(relativePath, violation);
    const output = formatContextInjection('PreToolUse', warning, 'scope-warning');

    await logHookComplete(
      meta.id,
      'PreToolUse',
      true,
      `Warning for ${relativePath}: ${violation.description}`
    );

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
    };
  } catch (error) {
    // Never block on errors
    return {
      success: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Extract file path from context
 */
function extractFilePath(ctx: HookContext): string | null {
  const payload = ctx.payload as any;

  // Various ways the path might be provided
  return payload?.filePath
    || payload?.path
    || payload?.file_path
    || payload?.tool_input?.file_path
    || null;
}

/**
 * Check path against scope rules
 */
function checkScope(relativePath: string): ScopeRule | null {
  // Normalize slashes
  const normalizedPath = relativePath.replace(/\\/g, '/');

  for (const rule of SCOPE_RULES) {
    if (rule.pattern.test(normalizedPath)) {
      if (!rule.allowed) {
        return rule;
      }
      // Matched an allowed rule, stop checking
      return null;
    }
  }

  // No rule matched - warn about unknown location
  return {
    pattern: /.*/,
    description: 'Unknown location',
    allowed: false,
    suggestion: 'This path is outside standard PM OS directories. Consider using outputs/ instead.',
  };
}

/**
 * Build scope warning message
 */
function buildScopeWarning(relativePath: string, rule: ScopeRule): string {
  return `⚠️ **Scope Advisory**

Writing to: \`${relativePath}\`
Category: ${rule.description}

${rule.suggestion || 'This location is outside standard PM OS conventions.'}

This is an advisory only - the operation will proceed.
Standard PM OS directories:
- \`outputs/\` - Generated artifacts (current)
- \`history/\` - Versioned output trail
- \`.beads/\` - Atomic insights
- \`.claude/rules/learned/\` - Auto-generated patterns`;
}

/**
 * Validate a path without running full hook
 */
export function validatePath(filePath: string): {
  valid: boolean;
  warning?: string;
} {
  const root = getProjectRoot();
  const relativePath = path.isAbsolute(filePath)
    ? path.relative(root, filePath)
    : filePath;

  const violation = checkScope(relativePath);
  if (violation) {
    return {
      valid: false,
      warning: violation.suggestion || `Writing to ${violation.description} is not recommended.`,
    };
  }

  return { valid: true };
}

// CLI execution
if (process.argv[1]?.endsWith('ScopeValidator.hook.js')) {
  // Parse stdin for tool invocation
  let inputData = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => inputData += chunk);
  process.stdin.on('end', async () => {
    try {
      const input = JSON.parse(inputData);
      const filePath = input.tool_input?.file_path || input.file_path || '';

      if (filePath) {
        const { buildHookContext, createOutputCreatedPayload } = await import('../lib/context.js');
        const ctx = buildHookContext(
          'output:created',
          createOutputCreatedPayload(filePath)
        );
        const result = await run(ctx);
        if (result.contextInjection) {
          console.log(result.contextInjection);
        }
      }
    } catch {
      console.log('{}');
    }
  });
}

export const ScopeValidatorHook: HookDefinition = { meta, run };
export default ScopeValidatorHook;
