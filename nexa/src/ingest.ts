/**
 * PM OS Document Ingestion
 *
 * Extracts text from documents and stores them in outputs/ingest/.
 */

import * as fs from 'fs';
import * as path from 'path';
import { extractFile } from './extractors';
import { addIngestEntry, getOutputPaths, setCurrentJob, completeCurrentJob, logError } from './state';
import { generateJobId, isoNow, ensureDir } from './utils';
import { ScanResult, JobType } from './types';
import { appendAuditLog } from './audit';

/**
 * Ingest a single file
 */
export async function ingestFile(scanResult: ScanResult): Promise<boolean> {
  const { path: filePath, hash, jobType } = scanResult;
  const outputPaths = getOutputPaths();

  // Ensure output directory exists
  await ensureDir(outputPaths.ingest);
  await ensureDir(outputPaths.audit);

  const jobId = generateJobId('ingest');

  try {
    // Set current job
    await setCurrentJob('ingest', jobId, [filePath]);

    console.log(`Extracting: ${path.basename(filePath)}`);

    // Extract text
    const result = await extractFile(filePath);

    if (!result.success) {
      console.error(`  Failed: ${result.error}`);

      // Log error to state
      await logError({
        timestamp: isoNow(),
        job_id: jobId,
        source_path: filePath,
        error_message: result.error || 'Unknown extraction error',
      });

      // Log failure to ingest index
      await addIngestEntry({
        source_path: filePath,
        ingest_path: '',
        content_hash: hash,
        fingerprint: scanResult.fingerprint || '',
        status: 'failed',
        extracted_at: isoNow(),
      });

      await appendAuditLog(jobId, 'ingest', [filePath], 'failed', result.error);
      await completeCurrentJob(false);
      return false;
    }

    // Generate output filename from hash (first 12 chars)
    const hashShort = hash.replace('sha256:', '').slice(0, 12);
    const outputFile = path.join(outputPaths.ingest, `${hashShort}.txt`);
    const metaFile = path.join(outputPaths.ingest, `${hashShort}.meta.json`);

    // Write extracted text
    await fs.promises.writeFile(outputFile, result.text);

    // Write metadata
    const metadata = {
      source_path: filePath,
      content_hash: hash,
      extracted_at: isoNow(),
      job_type: jobType,
      ...result.metadata,
    };
    await fs.promises.writeFile(metaFile, JSON.stringify(metadata, null, 2));

    // Update ingest index
    await addIngestEntry({
      source_path: filePath,
      ingest_path: outputFile,
      content_hash: hash,
      fingerprint: scanResult.fingerprint || '',
      status: 'ok',
      extracted_at: isoNow(),
    });

    console.log(`  Saved: ${path.basename(outputFile)}`);

    await appendAuditLog(jobId, 'ingest', [filePath], 'ok');
    await completeCurrentJob(true);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`  Error: ${errorMsg}`);

    // Log error to state
    await logError({
      timestamp: isoNow(),
      job_id: jobId,
      source_path: filePath,
      error_message: errorMsg,
    });

    await appendAuditLog(jobId, 'ingest', [filePath], 'failed', errorMsg);
    await completeCurrentJob(false);
    return false;
  }
}

/**
 * Ingest multiple files
 */
export async function ingestFiles(scanResults: ScanResult[]): Promise<{
  success: number;
  failed: number;
}> {
  let success = 0;
  let failed = 0;

  for (const result of scanResults) {
    const ok = await ingestFile(result);
    if (ok) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}
