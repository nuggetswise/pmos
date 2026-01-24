/**
 * @file nexa/src/skills/Planner.ts
 * @description The Planner skill class. Responsible for creating
 * plans, breaking down tasks, and defining project milestones.
 */
import * as fs from 'fs/promises';

export class Planner {
  /**
   * Loads a skill protocol and its inputs to prepare for AI execution.
   */
  async run(skillPath: string, inputs: string[]): Promise<string> {
    console.log(`[Planner] Loading skill protocol: ${skillPath}`);

    const skillProtocol = await fs.readFile(skillPath, 'utf-8');

    const inputContents = await Promise.all(
      inputs.map(async (path) => {
        try {
          const content = await fs.readFile(path, 'utf-8');
          return `--- INPUT FILE: ${path} ---\n${content}`;
        } catch (error) {
          console.warn(`[Planner] Warning: Could not read input file ${path}. Skipping.`);
          return `--- INPUT FILE: ${path} ---\n[Error: Could not read file.]`;
        }
      })
    );

    const finalContext = [
      skillProtocol,
      ...inputContents
    ].join('\n\n---\n\n');

    console.log(`[Planner] Context for AI is prepared. AI execution is the next step.`);
    return finalContext;
  }
}
