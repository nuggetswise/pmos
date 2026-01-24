/**
 * @file nexa/src/skills/Reviewer.ts
 * @description The Reviewer skill class. Responsible for reviewing
 * existing documents, providing feedback, and suggesting improvements.
 */
import * as fs from 'fs/promises';

export class Reviewer {
  /**
   * Loads a skill protocol and the file to be reviewed to prepare for AI execution.
   */
  async run(skillPath: string, fileToReview: string): Promise<string> {
    console.log(`[Reviewer] Loading skill protocol: ${skillPath}`);

    const skillProtocol = await fs.readFile(skillPath, 'utf-8');

    let fileContent = '';
    try {
      fileContent = await fs.readFile(fileToReview, 'utf-8');
    } catch (error) {
      console.error(`[Reviewer] Error: Could not read file to review at ${fileToReview}.`);
      throw error;
    }

    const finalContext = [
      skillProtocol,
      `--- DOCUMENT TO REVIEW: ${fileToReview} ---`,
      fileContent
    ].join('\n\n---\n\n');

    console.log(`[Reviewer] Context for AI is prepared. AI execution is the next step.`);
    return finalContext;
  }
}
