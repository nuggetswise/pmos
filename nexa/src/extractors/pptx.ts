/**
 * PPTX Extractor
 *
 * Extracts text from PowerPoint presentations using adm-zip.
 * PPTX files are ZIP archives containing XML files.
 */

import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { ExtractionResult } from '../types.js';

/**
 * Extract text from PPTX files
 *
 * Text content is in ppt/slides/slide*.xml files.
 */
export async function extractPptx(filePath: string): Promise<ExtractionResult> {
  try {
    const stats = await fs.promises.stat(filePath);
    const buffer = await fs.promises.readFile(filePath);

    let text = '';
    let slideCount = 0;

    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const slideTexts: string[] = [];

    // Sort entries to ensure slides are in order
    const slideEntries = entries
      .filter(
        (entry) =>
          entry.entryName.startsWith('ppt/slides/slide') &&
          entry.entryName.endsWith('.xml')
      )
      .sort((a, b) => {
        const numA = parseInt(a.entryName.match(/slide(\d+)/)?.[1] || '0');
        const numB = parseInt(b.entryName.match(/slide(\d+)/)?.[1] || '0');
        return numA - numB;
      });

    for (const entry of slideEntries) {
      slideCount++;
      const content = entry.getData().toString('utf-8');

      // Extract text from <a:t> tags (PowerPoint text elements)
      const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
      const slideText = textMatches
        .map((match: string) => match.replace(/<\/?a:t>/g, ''))
        .filter((t: string) => t.trim())
        .join(' ');

      if (slideText.trim()) {
        slideTexts.push(`## Slide ${slideCount}\n\n${slideText}`);
      }
    }

    text = slideTexts.join('\n\n---\n\n');

    const output = [
      `# Presentation: ${path.basename(filePath)}`,
      '',
      `Slides: ${slideCount}`,
      '',
      '---',
      '',
      text || '(No text content extracted)',
    ].join('\n');

    return {
      success: true,
      text: output,
      metadata: {
        filename: path.basename(filePath),
        extension: '.pptx',
        size_bytes: stats.size,
        modified_at: stats.mtime.toISOString(),
        slide_count: slideCount,
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
