/**
 * DOCX Extractor
 *
 * Extracts text from Microsoft Word documents using mammoth.
 */

import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';
import { ExtractionResult } from '../types.js';

/**
 * Extract text from DOCX files
 */
export async function extractDocx(filePath: string): Promise<ExtractionResult> {
  try {
    // Read the file
    const buffer = await fs.promises.readFile(filePath);

    // Extract text using mammoth
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    // Get warnings if any
    const warnings = result.messages
      .filter((m) => m.type === 'warning')
      .map((m) => m.message);

    const stats = await fs.promises.stat(filePath);

    // Build output with metadata header
    const output = [
      `# Document: ${path.basename(filePath)}`,
      '',
      '---',
      '',
      text,
    ].join('\n');

    return {
      success: true,
      text: output,
      metadata: {
        filename: path.basename(filePath),
        extension: '.docx',
        size_bytes: stats.size,
        modified_at: stats.mtime.toISOString(),
        word_count: text.split(/\s+/).filter(Boolean).length,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      metadata: {},
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
