/**
 * PM OS Watch Mode
 *
 * Optional background mode that watches for file changes.
 */

import * as path from 'path';
import chokidar from 'chokidar';
import { loadSources, updateDaemonStatus, updateHeartbeat } from './state';
import { expandPath, computeHash, getQuickFingerprint } from './utils';
import { routeToJobType } from './scanner';
import { ingestFile } from './ingest';
import { loadInputRules } from './state';

let watcher: chokidar.FSWatcher | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * Start watch mode
 */
export async function startWatch(): Promise<void> {
  const config = await loadSources();
  const rules = await loadInputRules();

  // Get all paths to watch
  const paths: string[] = [];
  for (const source of config.sources) {
    const expandedPath = expandPath(source.path);
    paths.push(expandedPath);
  }

  console.log('Starting watch mode...');
  console.log(`Watching ${paths.length} path(s):`);
  paths.forEach((p) => console.log(`  - ${p}`));

  // Update daemon status
  await updateDaemonStatus('running');

  // Set up heartbeat
  heartbeatInterval = setInterval(async () => {
    await updateHeartbeat();
  }, 30000); // Every 30 seconds

  // Create watcher
  watcher = chokidar.watch(paths, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: config.stability_window_sec * 1000,
      pollInterval: 1000,
    },
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/*.tmp',
      '**/*.temp',
    ],
  });

  // Handle events
  watcher.on('add', async (filePath) => {
    await handleFile(filePath, rules.rules);
  });

  watcher.on('change', async (filePath) => {
    await handleFile(filePath, rules.rules);
  });

  watcher.on('error', async (error) => {
    console.error('Watcher error:', error);
    await updateDaemonStatus('error');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await stopWatch();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down...');
    await stopWatch();
    process.exit(0);
  });

  console.log('\nWatch mode active. Press Ctrl+C to stop.');
}

/**
 * Stop watch mode
 */
export async function stopWatch(): Promise<void> {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  if (watcher) {
    await watcher.close();
    watcher = null;
  }

  await updateDaemonStatus('stopped');
  console.log('Watch mode stopped.');
}

/**
 * Handle a file event
 */
async function handleFile(
  filePath: string,
  rules: Awaited<ReturnType<typeof loadInputRules>>['rules']
): Promise<void> {
  console.log(`\nFile detected: ${path.basename(filePath)}`);

  // Check if file matches any of our patterns
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const supportedExts = ['md', 'txt', 'csv', 'docx', 'pdf', 'pptx'];

  if (!supportedExts.includes(ext)) {
    console.log(`  Skipping (unsupported extension: ${ext})`);
    return;
  }

  // Note: No need to check isStable() here - chokidar's awaitWriteFinish
  // configuration already ensures the file is stable before this handler fires

  // Compute fingerprint and hash
  const fingerprint = await getQuickFingerprint(filePath);
  const hash = await computeHash(filePath);
  const jobType = routeToJobType(filePath, rules);

  console.log(`  Processing as: ${jobType}`);

  // Ingest the file
  await ingestFile({
    path: filePath,
    hash,
    fingerprint,
    stable: true,
    alreadyIngested: false,
    jobType,
  });
}
