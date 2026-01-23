/**
 * PDF Extractor
 *
 * Extracts text from PDF documents.
 * NOTE: This has been disabled as per user request.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ExtractionResult } from '../types.js';

/**
 * Extract text from PDF files (currently disabled)
 */
export async function extractPdf(filePath: string): Promise<ExtractionResult> {
  const text = `PDF extraction is currently disabled. File path: ${filePath}`;
  return Promise.resolve({
    success: true,
    text: text,
    metadata: {
      filename: path.basename(filePath),
      extension: '.pdf',
      note: 'Extraction disabled by user.',
    },
  });
}
