/**
 * Repair corrupted beads file
 *
 * Command: pm-os repair-beads
 * Removes corrupted lines from .beads/insights.jsonl
 */

import { readBeadsSafe, repairBeadsFile } from '../beads/bead-reader.js';

export async function repairBeads(): Promise<void> {
  console.log('🔍 Scanning beads file for corruption...\n');

  // Check for corruption first
  const readResult = await readBeadsSafe();

  if (!readResult.corruption_detected) {
    console.log('✅ No corruption detected');
    console.log(`   ${readResult.beads.length} beads in file, all valid`);
    return;
  }

  console.log(`⚠️  Corruption detected:`);
  console.log(`   Total lines: ${readResult.total_lines}`);
  console.log(`   Valid beads: ${readResult.beads.length}`);
  console.log(`   Corrupted lines: ${readResult.corrupted_lines.length}`);
  console.log(`   Corrupted line numbers: ${readResult.corrupted_lines.join(', ')}`);

  console.log('\n🛠️  Repairing...');

  // Perform repair
  const repairResult = await repairBeadsFile();

  console.log('✅ Repair complete');
  console.log(`   Recovered: ${repairResult.recovered} beads`);
  console.log(`   Removed: ${repairResult.removed} corrupted lines`);
  console.log(`   Backup: ${repairResult.backup_path}`);
}
