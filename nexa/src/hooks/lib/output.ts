/**
 * Output utilities for PM OS hooks
 *
 * Formats hook output for Claude Code consumption.
 */

import type { ClaudeHookOutput, HookResult } from '../types.js';

/**
 * Format context injection for Claude Code hooks
 *
 * Wraps content in a tag and creates the JSON output structure.
 */
export function formatContextInjection(
  eventName: string,
  content: string,
  tag?: string
): ClaudeHookOutput {
  const tagName = tag || eventName.replace(':', '-');
  const wrappedContent = `<${tagName}>\n${content}\n</${tagName}>`;

  return {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: wrappedContent,
    },
  };
}

/**
 * Format important context (wrapped in EXTREMELY_IMPORTANT tags)
 */
export function formatImportantContext(
  eventName: string,
  content: string
): ClaudeHookOutput {
  const wrappedContent = `<EXTREMELY_IMPORTANT>\n${content}\n</EXTREMELY_IMPORTANT>`;

  return {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: wrappedContent,
    },
  };
}

/**
 * Format hook result as JSON string for stdout
 */
export function formatHookOutput(result: HookResult): string {
  if (!result.contextInjection) {
    return '{}';
  }

  // Context injection should already be a ClaudeHookOutput-compatible string
  // or we need to wrap it
  try {
    // Try parsing as JSON first
    JSON.parse(result.contextInjection);
    return result.contextInjection;
  } catch {
    // Wrap raw content in standard format
    const output: ClaudeHookOutput = {
      hookSpecificOutput: {
        hookEventName: 'hook',
        additionalContext: result.contextInjection,
      },
    };
    return JSON.stringify(output, null, 2);
  }
}

/**
 * Create empty hook output (no context injection)
 */
export function createEmptyOutput(): string {
  return '{}';
}

/**
 * Escape string for JSON embedding
 */
export function escapeForJson(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Build session greeting block
 */
export interface GreetingData {
  phase: string;
  nextAction: string;
  lastJobId: string;
  lastJobResult: string;
  lastJobFinished: string;
  ingestCount: number;
  errorCount: number;
  recentSource: string | null;
  qualityTrend: string;
  activeWork: string[];
  blockers: string[];
  compassLoaded: number;
}

export function buildGreetingBlock(data: GreetingData): string {
  const recentSourceDisplay = data.recentSource || '*(none)*';
  const activeWorkDisplay = data.activeWork.length > 0
    ? data.activeWork.join('\n')
    : '*(No active work tracked)*';
  const blockersDisplay = data.blockers.length > 0
    ? data.blockers.join(', ')
    : '(none)';

  return `
👋 Nexa here - PM OS ready.

📚 Loaded: ${data.compassLoaded} context dimensions

📈 Output Quality: ${data.qualityTrend}

🔄 Phase: ${data.phase}
👉 Next: ${data.nextAction}

🧾 Last Job: ${data.lastJobId} (${data.lastJobResult})
🕒 Finished: ${data.lastJobFinished}

📥 Ingested Sources: ${data.ingestCount}
⚠️ Errors: ${data.errorCount}
📄 Latest Source: ${recentSourceDisplay}

🔥 Active Work:
${activeWorkDisplay}

⚠️ Needs Attention:
   Blockers: ${blockersDisplay}

Ready for your request.
`;
}

/**
 * Build session protocol reminder
 */
export function buildSessionProtocol(): string {
  return `BEFORE responding to user requests, you MUST:
1. Read nexa/state.json
2. If current_job is running, report status and ask whether to wait or proceed
3. If last job failed, call out the error and suggest pm-os scan
4. Then proceed with the user's request`;
}

/**
 * Build post-skill reflection signal
 */
export function buildPostSkillSignal(skillName: string, outputPath: string): string {
  return `Skill '${skillName}' completed.
Output at ${outputPath}.

**MANDATORY:** Run post-skill reflection protocol per .claude/rules/pm-core/post-skill-reflection.md:

1. Extract 3-5 key learnings from this work
2. Create learning entry in history/learnings/
3. Create insight beads in .beads/insights.jsonl
4. Request user rating (1-5) for this output
5. Detect and log any decisions made

This is NON-NEGOTIABLE for PLAN/BUILD phase skills.`;
}

/**
 * Build session end signal
 */
export function buildSessionEndSignal(summaryPath: string | null): string {
  if (summaryPath) {
    return `Session summary saved to ${summaryPath}. Have a great day!`;
  }
  return 'Session ending. Goodbye!';
}

/**
 * Format output for Stop hooks
 *
 * Stop hooks use systemMessage instead of hookSpecificOutput
 */
export function formatStopOutput(content: string): object {
  return {
    systemMessage: content,
  };
}

/**
 * Format output for SessionStart hooks
 *
 * SessionStart hooks use systemMessage instead of hookSpecificOutput
 */
export function formatSessionStartOutput(content: string): object {
  return {
    systemMessage: content,
  };
}

/**
 * Build auto-mirror notification
 */
export function buildAutoMirrorNotification(
  sourcePath: string,
  destPath: string
): string {
  return `📁 Mirrored: ${sourcePath} → ${destPath}`;
}

/**
 * Build rating capture prompt
 */
export function buildRatingPrompt(outputPath: string, outputType: string): string {
  return `✅ ${outputType} complete → ${outputPath}

Rate this output (1-5, or 'skip'):
1 - Needs major revision
2 - Below expectations
3 - Meets expectations
4 - Exceeds expectations
5 - Outstanding, exactly what I needed

Your rating:`;
}
