/**
 * Markdown/Text Extractor
 *
 * Simple passthrough for markdown and plain text files.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ExtractionResult } from '../types.js';

/**
 * Extract text from markdown or plain text files
 */
export async function extractMarkdown(filePath: string): Promise<ExtractionResult> {
  try {
    const text = await fs.promises.readFile(filePath, 'utf-8');
    const stats = await fs.promises.stat(filePath);

    return {
      success: true,
      text,
      metadata: {
        filename: path.basename(filePath),
        extension: path.extname(filePath).toLowerCase(),
        size_bytes: stats.size,
        modified_at: stats.mtime.toISOString(),
        line_count: text.split('\n').length,
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
