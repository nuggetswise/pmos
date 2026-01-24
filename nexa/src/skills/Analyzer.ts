/**
 * @file nexa/src/skills/Analyzer.ts
 * @description The Analyzer skill class. Responsible for analyzing data,
 * synthesizing information, and generating insights.
 */
import * as fs from 'fs/promises';

export class Analyzer {
  /**
   * Loads a skill protocol and its inputs to prepare for AI execution.
   * This method DOES NOT contain any prompts itself. It only acts as a
   * host for the "Claude code native" SKILL.md file.
   */
  async run(skillPath: string, inputs: string[]): Promise<string> {
    console.log(`[Analyzer] Loading skill protocol: ${skillPath}`);

    // 1. Read the entire skill protocol from the .md file.
    const skillProtocol = await fs.readFile(skillPath, 'utf-8');

    // 2. Read the content of all specified input files.
    const inputContents = await Promise.all(
      inputs.map(async (path) => {
        try {
          const content = await fs.readFile(path, 'utf-8');
          return `--- INPUT FILE: ${path} ---\n${content}`;
        } catch (error) {
          console.warn(`[Analyzer] Warning: Could not read input file ${path}. Skipping.`);
          return `--- INPUT FILE: ${path} ---\n[Error: Could not read file.]`;
        }
      })
    );

    // 3. Combine the protocol and the inputs into a single string.
    const finalContext = [
      skillProtocol,
      ...inputContents
    ].join('\n\n---\n\n');

    console.log(`[Analyzer] Context for AI is prepared. AI execution is the next step.`);
    
    // In the future, this will trigger the AI. For now, we return the context
    // to prove the runner is working correctly.
    return finalContext;
  }
}
