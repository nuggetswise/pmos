#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: DecisionSignal
 * ============================================================
 * PURPOSE: Capture decision records and store as beads when
 *          decisions are logged.
 * TRIGGER: decision:logged (when decision file is created)
 *
 * INPUT:
 *   - decisionPath: Path to the decision file
 *   - title: Brief title of the decision
 *
 * OUTPUT:
 *   - .beads/insights.jsonl: Appended decision bead
 *   - hookSpecificOutput: Confirmation of capture
 *
 * SIDE EFFECTS:
 *   - Appends bead to insights file
 *   - Updates state with decision metadata
 *
 * ERROR HANDLING:
 *   - Graceful handling of malformed decision files
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - May be triggered by PostSkillSignal decision detection
 *   - Decision data used by weekly learning
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import type { HookDefinition, HookContext, HookResult, HookMeta, DecisionLoggedPayload } from '../types.js';
import {
  logHookComplete,
  formatContextInjection,
  updateState,
  loadState,
} from '../lib/index.js';
import { createDecisionBead } from '../../beads/index.js';
import { getProjectRoot, isoNow } from '../../utils.js';

export const meta: HookMeta = {
  id: 'decision-signal',
  trigger: 'decision:logged',
  intent: 'Capture decision records as beads for learning',
  guarantees: ['non-blocking', 'idempotent'],
  scope: {
    read: ['outputs/decisions/**/*.md'],
    write: ['.beads/insights.jsonl', 'nexa/state.json', 'outputs/audit/hook-log.md'],
  },
  userMessage: '📝 Decision logged',
};

export async function run(ctx: HookContext): Promise<HookResult> {
  const payload = ctx.payload as DecisionLoggedPayload;
  const filesRead: string[] = [];
  const filesModified: string[] = [];

  try {
    const { decisionPath, title } = payload;

    // 1. Read decision file for context
    const root = getProjectRoot();
    const absolutePath = path.isAbsolute(decisionPath)
      ? decisionPath
      : path.join(root, decisionPath);

    let decisionContent = '';
    let tags: string[] = [];

    try {
      decisionContent = await fs.promises.readFile(absolutePath, 'utf-8');
      filesRead.push(decisionPath);

      // Extract tags from content
      tags = extractDecisionTags(decisionContent);
    } catch {
      // Decision file might not exist yet or be readable
      // Still create bead with title only
    }

    // 2. Create decision bead
    const summary = title || extractDecisionSummary(decisionContent);
    const bead = await createDecisionBead(
      summary,
      'decision-logging',
      decisionPath,
      tags
    );
    filesModified.push('.beads/insights.jsonl');

    // 3. Update state with latest decision
    const state = await loadState();
    // Store last decision info in brief or add a decisions field if needed
    await updateState({
      next_action: `Decision logged: ${title}. Continue with next task.`,
    });
    filesModified.push('nexa/state.json');

    // 4. Log to audit
    await logHookComplete(
      meta.id,
      'decision:logged',
      true,
      `Decision: ${title}`
    );

    // 5. Build confirmation
    const confirmation = `📝 Logged decision: ${title}
   → ${decisionPath}

Bead ID: ${bead.id}
Tags: ${tags.join(', ') || 'none'}`;

    const output = formatContextInjection('decision:logged', confirmation, 'decision-captured');

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
      filesModified,
    };
  } catch (error) {
    await logHookComplete(meta.id, 'decision:logged', false, String(error));

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      filesRead,
      filesModified,
    };
  }
}

/**
 * Extract tags from decision content
 */
function extractDecisionTags(content: string): string[] {
  const tags: string[] = [];

  // Look for explicit tags in frontmatter or content
  const tagMatch = content.match(/tags?:\s*\[?([^\]\n]+)\]?/i);
  if (tagMatch) {
    const tagStr = tagMatch[1];
    const extracted = tagStr.split(/[,\s]+/).filter(t => t.trim());
    tags.push(...extracted);
  }

  // Add implicit tags based on content
  if (content.toLowerCase().includes('architecture')) tags.push('architecture');
  if (content.toLowerCase().includes('priority') || content.toLowerCase().includes('prioritiz')) tags.push('prioritization');
  if (content.toLowerCase().includes('charter')) tags.push('planning');
  if (content.toLowerCase().includes('prd')) tags.push('execution');
  if (content.toLowerCase().includes('strategy')) tags.push('strategy');
  if (content.toLowerCase().includes('scope')) tags.push('scope');

  return [...new Set(tags)]; // Deduplicate
}

/**
 * Extract decision summary from content
 */
function extractDecisionSummary(content: string): string {
  // Try to find a decision statement
  const patterns = [
    /## Decision\s*\n+([^\n]+)/i,
    /Decision:\s*([^\n]+)/i,
    /We (?:have )?(?:decided|chose|selected|agreed) (?:to )?([^\n.]+)/i,
    /# ([^\n]+)/, // Fall back to title
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim().slice(0, 100);
    }
  }

  return 'Untitled decision';
}

/**
 * Detect decision context from assistant message
 *
 * Returns decision info if a decision was made.
 */
export function detectDecisionFromMessage(message: string): {
  title: string;
  isHighConfidence: boolean;
} | null {
  // High confidence patterns (auto-log)
  const highConfidencePatterns = [
    /📝\s*(?:Logged )?decision:\s*([^\n]+)/i,
    /Decision logged:\s*([^\n]+)/i,
    /Completed charter with \d+ bets/i,
    /PRD complete/i,
  ];

  for (const pattern of highConfidencePatterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        title: match[1]?.trim() || 'Decision made',
        isHighConfidence: true,
      };
    }
  }

  // Medium confidence patterns (ask user)
  const mediumConfidencePatterns = [
    /(?:let's go with|decided to|choosing|selected)\s+([^\n.]+)/i,
    /(?:implementing|using|applying)\s+(?:option|approach|strategy)\s*(?:\w+)?:?\s*([^\n.]+)/i,
  ];

  for (const pattern of mediumConfidencePatterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        title: match[1]?.trim() || 'Potential decision',
        isHighConfidence: false,
      };
    }
  }

  return null;
}

/**
 * Generate decision file path
 */
export function generateDecisionPath(title: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  return `outputs/decisions/${date}-${slug}.md`;
}

// CLI execution
if (process.argv[1]?.endsWith('DecisionSignal.hook.js')) {
  // Parse stdin for decision info
  let inputData = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => inputData += chunk);
  process.stdin.on('end', async () => {
    try {
      const input = JSON.parse(inputData);
      const decisionPath = input.decisionPath || input.path || '';
      const title = input.title || '';

      if (decisionPath || title) {
        const { buildHookContext, createDecisionLoggedPayload } = await import('../lib/context.js');
        const ctx = buildHookContext(
          'decision:logged',
          createDecisionLoggedPayload(
            decisionPath || generateDecisionPath(title),
            title
          )
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

export const DecisionSignalHook: HookDefinition = { meta, run };
export default DecisionSignalHook;
