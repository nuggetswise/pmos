/**
 * Document Extractors Index
 *
 * Routes file types to appropriate extractors.
 */

import { ExtractionResult } from '../types';
import { getExtension } from '../utils';
import { extractMarkdown } from './markdown';
import { extractCsv } from './csv';
import { extractDocx } from './docx';
import { extractPdf } from './pdf';
import { extractPptx } from './pptx';

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
