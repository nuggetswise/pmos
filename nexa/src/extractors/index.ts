/**
 * Document Extractors Index
 *
 * Routes file types to appropriate extractors.
 */

import { ExtractionResult } from '../types.js';
import { getExtension } from '../utils.js';
import { extractMarkdown } from './markdown.js';
import { extractCsv } from './csv.js';
import { extractDocx } from './docx.js';
import { extractPdf } from './pdf.js';
import { extractPptx } from './pptx.js';

/**
 * Extract text from a file based on its extension
 */
export async function extractFile(filePath: string): Promise<ExtractionResult> {
  const ext = getExtension(filePath);

  switch (ext) {
    case 'md':
    case 'txt':
      return extractMarkdown(filePath);

    case 'csv':
      return extractCsv(filePath);

    case 'docx':
      return extractDocx(filePath);

    case 'pdf':
      return extractPdf(filePath);

    case 'pptx':
      return extractPptx(filePath);

    default:
      return {
        success: false,
        text: '',
        metadata: {},
        error: `Unsupported file type: ${ext}`,
      };
  }
}

export { extractMarkdown, extractCsv, extractDocx, extractPdf, extractPptx };
