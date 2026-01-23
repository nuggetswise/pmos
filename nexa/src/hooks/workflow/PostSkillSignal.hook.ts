#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: PostSkillSignal
 * ============================================================
 * PURPOSE: Signal Claude to run post-skill reflection protocol
 *          after a skill completes.
 * TRIGGER: skill:completed (Stop event after skill execution)
 *
 * INPUT:
 *   - skillName: Name of the completed skill
 *   - outputPath: Path to the generated output
 *
 * OUTPUT:
 *   - hookSpecificOutput: Instructions for post-skill reflection
 *
 * SIDE EFFECTS:
 *   - None (signaling only)
 *
 * ERROR HANDLING:
 *   - Always succeeds (signaling is best-effort)
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - Runs after AutoMirror
 *   - Triggers Claude's post-skill reflection
 * ============================================================
 */

import type { HookDefinition, HookContext, HookResult, HookMeta, SkillPayload } from '../types.js';
import {
  buildPostSkillSignal,
  formatContextInjection,
} from '../lib/index.js';

export const meta: HookMeta = {
  id: 'post-skill-signal',
  trigger: 'skill:completed',
  intent: 'Signal Claude to run post-skill reflection protocol',
  guarantees: ['non-blocking', 'idempotent', 'read-only'],
  scope: {
    read: [],
    write: [],
  },
  userMessage: undefined, // No user-visible message (handled by Claude)
};

// Skills that require post-skill reflection
const REFLECTION_REQUIRED_SKILLS = [
  // PLAN phase skills
  'generating-quarterly-charters',
  'prioritizing-work',
  // BUILD phase skills
  'writing-prds-from-charters',
  // Strategic skills
  'writing-product-strategy',
  'competitive-analysis',
  'planning-gtm-launch',
  // Optional OBSERVE skills with significant insights
  'synthesizing-voc',
  'building-truth-base',
];

// Skills where reflection is optional but encouraged
const REFLECTION_OPTIONAL_SKILLS = [
  'triaging-ktlo',
  'stakeholder-management',
  'generating-exec-update',
  'discover',
  'analyze',
];

export async function run(ctx: HookContext): Promise<HookResult> {
  const payload = ctx.payload as SkillPayload;

  try {
    const skillName = payload.skillName;
    const outputPath = payload.outputPath || '';

    // 1. Check if this skill requires reflection
    const requiresReflection = REFLECTION_REQUIRED_SKILLS.includes(skillName);
    const optionalReflection = REFLECTION_OPTIONAL_SKILLS.includes(skillName);

    if (!requiresReflection && !optionalReflection) {
      // No reflection needed for this skill
      return {
        success: true,
      };
    }

    // 2. Build reflection signal
    const signal = buildPostSkillSignal(skillName, outputPath);

    // 3. Add mandatory/optional context
    const importance = requiresReflection
      ? 'MANDATORY'
      : 'RECOMMENDED';

    const fullSignal = `${signal}

**Importance:** ${importance}`;

    const output = formatContextInjection(
      'skill:completed',
      fullSignal,
      'post-skill-reflection'
    );

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Detect if a skill completed from conversation context
 *
 * This is called by the prompt detector to identify skill completions.
 */
export function detectSkillCompletion(
  assistantMessage: string
): { skillName: string; outputPath: string } | null {
  // Look for patterns indicating skill completion
  const patterns = [
    // Output complete patterns
    /✅\s+(\w+(?:-\w+)*)\s+complete\s*→\s*([^\n]+)/i,
    // Mirrored patterns
    /Mirrored to history\/([^/]+)\/([^\n]+)/i,
    // Generic completion patterns
    /(?:completed|finished|generated)\s+(?:the\s+)?(\w+(?:-\w+)*)\s+(?:→|at|in)\s*([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = assistantMessage.match(pattern);
    if (match) {
      return {
        skillName: normalizeSkillName(match[1]),
        outputPath: match[2].trim(),
      };
    }
  }

  return null;
}

/**
 * Normalize skill name to match skill directory names
 */
function normalizeSkillName(name: string): string {
  // Map common variations to standard names
  const mappings: Record<string, string> = {
    'charter': 'generating-quarterly-charters',
    'charters': 'generating-quarterly-charters',
    'prd': 'writing-prds-from-charters',
    'prds': 'writing-prds-from-charters',
    'voc': 'synthesizing-voc',
    'ktlo': 'triaging-ktlo',
    'strategy': 'writing-product-strategy',
    'compete': 'competitive-analysis',
    'competitive': 'competitive-analysis',
    'gtm': 'planning-gtm-launch',
    'stakeholder': 'stakeholder-management',
    'stakeholders': 'stakeholder-management',
    'exec-update': 'generating-exec-update',
    'exec': 'generating-exec-update',
    'truth-base': 'building-truth-base',
    'truth': 'building-truth-base',
    'prioritize': 'prioritizing-work',
    'discovery': 'discover',
  };

  const lower = name.toLowerCase();
  return mappings[lower] || lower;
}

/**
 * Check if a skill requires reflection
 */
export function requiresReflection(skillName: string): boolean {
  const normalized = normalizeSkillName(skillName);
  return REFLECTION_REQUIRED_SKILLS.includes(normalized);
}

// CLI execution
if (process.argv[1]?.endsWith('PostSkillSignal.hook.js')) {
  // Parse stdin for skill info
  let inputData = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => inputData += chunk);
  process.stdin.on('end', async () => {
    try {
      const input = JSON.parse(inputData);
      const skillName = input.skillName || input.skill || '';
      const outputPath = input.outputPath || input.path || '';

      if (skillName) {
        const { buildHookContext, createSkillPayload } = await import('../lib/context.js');
        const ctx = buildHookContext(
          'skill:completed',
          createSkillPayload('skill:completed', skillName, outputPath, true)
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

export const PostSkillSignalHook: HookDefinition = { meta, run };
export default PostSkillSignalHook;
