/**
 * CSV Extractor
 *
 * Converts CSV files to structured text format.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { ExtractionResult } from '../types';

/**
 * Extract text from CSV files
 */
export async function extractCsv(filePath: string): Promise<ExtractionResult> {
  try {
    // Read the CSV file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON for processing
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (data.length === 0) {
      return {
        success: true,
        text: '(Empty CSV file)',
        metadata: {
          filename: path.basename(filePath),
          row_count: 0,
          column_count: 0,
        },
      };
    }

    // Get column headers
    const headers = Object.keys(data[0]);

    // Build text representation
    const lines: string[] = [];
    lines.push(`# CSV: ${path.basename(filePath)}`);
    lines.push('');
    lines.push(`Rows: ${data.length}, Columns: ${headers.length}`);
    lines.push(`Headers: ${headers.join(', ')}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Output each row as a structured block
    data.forEach((row, index) => {
      lines.push(`## Row ${index + 1}`);
      headers.forEach((header) => {
        const value = row[header];
        if (value !== undefined && value !== null && value !== '') {
          lines.push(`- **${header}**: ${value}`);
        }
      });
      lines.push('');
    });

    const text = lines.join('\n');
    const stats = await fs.promises.stat(filePath);

    return {
      success: true,
      text,
      metadata: {
        filename: path.basename(filePath),
        extension: '.csv',
        size_bytes: stats.size,
        modified_at: stats.mtime.toISOString(),
        row_count: data.length,
        column_count: headers.length,
        headers,
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
