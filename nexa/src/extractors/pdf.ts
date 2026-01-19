/**
 * PDF Extractor
 *
 * Extracts text from PDF documents using pdf-parse.
 */

import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';
import { ExtractionResult } from '../types';

/**
 * Extract text from PDF files
 */
export async function extractPdf(filePath: string): Promise<ExtractionResult> {
  try {
    // Read the file
    const buffer = await fs.promises.readFile(filePath);

    // Extract text using pdf-parse
    const data = await pdf(buffer);

    const stats = await fs.promises.stat(filePath);

    // Build output with metadata header
    const output = [
      `# Document: ${path.basename(filePath)}`,
      '',
      `Pages: ${data.numpages}`,
      '',
      '---',
      '',
      data.text,
    ].join('\n');

    return {
      success: true,
      text: output,
      metadata: {
        filename: path.basename(filePath),
        extension: '.pdf',
        size_bytes: stats.size,
        modified_at: stats.mtime.toISOString(),
        page_count: data.numpages,
        pdf_version: data.info?.PDFFormatVersion,
        title: data.info?.Title,
        author: data.info?.Author,
        word_count: data.text.split(/\s+/).filter(Boolean).length,
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
