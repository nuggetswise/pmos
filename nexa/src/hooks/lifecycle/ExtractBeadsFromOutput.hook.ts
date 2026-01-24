/**
 * @file nexa/src/hooks/lifecycle/ExtractBeadsFromOutput.hook.ts
 * @description Hook that triggers when a new output file is created. It implements
 * a hybrid strategy to extract beads:
 * 1. First, it tries a fast, local regex-based extraction for structured data.
 * 2. If no beads are found, it falls back to prompting the AI to perform a
 *    more comprehensive, AI-native extraction.
 */

import * as fs from 'fs/promises';
import { extractBeadsWithRegex, createBeadsFromExtraction } from '../../extractors/regex-bead-extractor.js';
import { appendBead } from '../../beads/repository.js';
import type { HookDefinition, HookContext, HookResult, HookMeta, OutputCreatedPayload } from '../types.js';
import { logHookStart, logHookComplete, formatContextInjection } from '../lib/index.js';

export const meta: HookMeta = {
  id: 'extract-beads-from-output',
  trigger: 'output:created',
  intent: 'Extracts insights, decisions, and questions from new outputs to populate the knowledge base.',
  guarantees: ['non-blocking'],
  scope: {
    read: ['outputs/**/*.md', 'history/**/*.md'], // Can read from outputs or history
    write: ['.beads/insights.jsonl', 'outputs/audit/hook-log.md'],
  },
  userMessage: '🔎 Extracting knowledge...',
};

export async function run(ctx: HookContext): Promise<HookResult> {
  await logHookStart(meta.id, ctx.event);
  const payload = ctx.payload as OutputCreatedPayload;

  try {
    const content = await fs.readFile(payload.filePath, 'utf-8');
    const source = payload.skillName || 'unknown';

    // 1. Attempt regex extraction
    const extracted = extractBeadsWithRegex(content, source);

    if (extracted.length > 0) {
      // Regex found beads, so we store them and we're done.
      const newBeads = createBeadsFromExtraction(extracted, source, payload.filePath);
      for (const bead of newBeads) {
        await appendBead(bead);
      }
      const message = `Successfully extracted and stored ${newBeads.length} new bead(s) via regex.`;
      await logHookComplete(meta.id, ctx.event, true, message);
      return { success: true, filesModified: ['.beads/insights.jsonl'] };
    } else {
      // 2. Fallback to AI-native extraction
      console.log('No structured beads found by regex, falling back to AI-native extraction.');

      const prompt = `
[System]
The skill "${source}" has produced the output file: ${payload.filePath}.
No structured insights were found, so your task is to analyze the unstructured content of this output and extract the key insights, decisions, or open questions.

Present them as a JSON array of objects in the following format.

- For insights: { "type": "insight", "content": "..." }
- For decisions: { "type": "decision", "content": "..." }
- For questions: { "type": "question", "content": "..." }

Example:
[
  { "type": "insight", "content": "Customer feedback indicates a strong demand for a dark mode feature." },
  { "type": "decision", "content": "We will prioritize dark mode implementation in the next sprint." },
  { "type": "question", "content": "What is the estimated engineering effort for the dark mode feature?" }
]

Your JSON response will be captured to populate the project's knowledge base.
If no meaningful insights, decisions, or questions are found, return an empty array [].
`;
      const output = formatContextInjection(
        'output:created',
        prompt,
        'insight-extraction-prompt'
      );

      await logHookComplete(meta.id, ctx.event, true, 'Prompted AI for insight extraction.');
      return {
        success: true,
        contextInjection: JSON.stringify(output, null, 2),
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `Error processing new document ${payload.filePath}: ${errorMessage}`;
    console.error(fullMessage);
    await logHookComplete(meta.id, ctx.event, false, fullMessage);
    return { success: false, error: fullMessage };
  }
}

export const ExtractBeadsFromOutputHook: HookDefinition = { meta, run };
export default ExtractBeadsFromOutputHook;
