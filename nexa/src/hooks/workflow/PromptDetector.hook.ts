
import { exec } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getProjectRoot } from '../../utils.js';

/**
 * Session-end detection patterns.
 *
 * Requirements:
 * - Must be at START of message or after punctuation (not mid-sentence)
 * - Must NOT match quoted/mentioned words like "bye/done/thanks"
 * - Short messages (< 50 chars) with these words are more likely session-end
 */

// Only match if the goodbye phrase is the MAIN content (short message)
// or starts the sentence (after . ! ? or at beginning)
function isSessionEndMessage(text: string): boolean {
  const normalized = text.toLowerCase().trim();

  // Very short messages that are clearly goodbye
  const shortGoodbyes = [
    'bye', 'goodbye', 'bye!', 'goodbye!',
    'thanks', 'thanks!', 'thank you', 'thank you!',
    'done', 'done!', "that's all", "that's it",
    'see you', 'see you!', 'later', 'later!',
    'end session', 'log off', 'sign off',
    'done for today', 'done for now',
  ];

  // If message is very short and matches a goodbye phrase exactly
  if (normalized.length < 30 && shortGoodbyes.some(g => normalized === g || normalized === g + '.')) {
    return true;
  }

  // If message STARTS with goodbye phrase (likely ending session)
  const startsWithGoodbye = /^(goodbye|bye|thanks|thank you|done|see you|that's all|that's it|later)\b/i;
  if (startsWithGoodbye.test(normalized) && normalized.length < 100) {
    return true;
  }

  // Don't match if the words appear mid-sentence or as quotes
  // (e.g., "the word 'bye' triggers..." should NOT match)
  return false;
}

interface UserPromptInput {
  prompt?: string;
  content?: string;
}

async function main() {
  const input = await readStdin();
  const data: UserPromptInput = JSON.parse(input);

  const userPrompt = data.prompt || data.content || '';

  if (isSessionEndMessage(userPrompt)) {
    const projectRoot = getProjectRoot();
    const summaryOutput = await runSummary(projectRoot);
    const summaryFile = parseSummaryOutput(summaryOutput);

    // Use systemMessage format (not hookSpecificOutput)
    const output = {
      systemMessage: buildAdditionalContext(summaryFile),
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    // No output if not a session-end message
    console.log('{}');
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let result = '';
    process.stdin.on('data', (chunk) => {
      result += chunk.toString();
    });
    process.stdin.on('end', () => {
      resolve(result);
    });
  });
}

function runSummary(projectRoot: string): Promise<string> {
  const command = `node ${path.join(projectRoot, 'nexa', 'dist', 'index.js')} summarize-session`;
  return new Promise((resolve) => {
    exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        // Log error but resolve with stdout/stderr to let the parsing attempt it
        console.error(`Error running summarize-session: ${error.message}`);
        resolve(stdout + stderr);
        return;
      }
      resolve(stdout);
    });
  });
}

function parseSummaryOutput(output: string): string | null {
  const match = output.match(/history\/sessions\/[^ ]+/);
  return match ? match[0] : null;
}

function buildAdditionalContext(summaryFile: string | null): string {
  if (summaryFile) {
    return `Session summary saved to ${summaryFile}. Have a great day!`;
  }
  return 'Session ending. Goodbye!';
}

main().catch(err => {
  console.error('Hook failed:', err);
  process.exit(1); // Exit with error code if something goes wrong
});
