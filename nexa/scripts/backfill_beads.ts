#!/usr/bin/env node
/**
 * ============================================================
 * SCRIPT: backfill_beads
 * ============================================================
 * PURPOSE: Iterate through all files in the history/ directory,
 *          use Claude to extract insights, and create beads.
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { getProjectRoot } from '../src/utils.js';
import { glob } from 'glob';

async function getAllHistoryFiles(): Promise<string[]> {
  const root = getProjectRoot();
  const historyDir = path.join(root, 'history');
  const files = await glob('**/*.md', { cwd: historyDir, ignore: '**/README.md' });
  return files.map(file => path.join(historyDir, file));
}

function createPrompt(filePath: string, content: string): string {
  return `
[System]
Analyze the content of the file "${filePath}" and extract the key insights, decisions, or open questions.
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

File Content:
---
${content}
---
`;
}

async function main() {
  console.log('Starting backfill of beads from history...');

  const files = await getAllHistoryFiles();
  console.log(`Found ${files.length} files in history/`);

  const prompts: string[] = [];
  for (const file of files) {
    console.log(`Processing ${file}...`);
    const content = await fs.promises.readFile(file, 'utf-8');
    const prompt = createPrompt(file, content);
    prompts.push(prompt);
  }

  const root = getProjectRoot();
  const outputPath = path.join(root, 'backfill_prompts.txt');
  await fs.promises.writeFile(outputPath, prompts.join('\n\n---\n\n'));

  console.log(`
Backfill complete.

A file named "backfill_prompts.txt" has been created in the project root.

Next steps:
1. For each prompt in the file, run it through Claude.
2. Take the JSON output from Claude and run the following command:
   pm-os beads-create '<json-output>'
`);
}

main().catch(err => {
  console.error('Error during backfill:', err);
  process.exit(1);
});
