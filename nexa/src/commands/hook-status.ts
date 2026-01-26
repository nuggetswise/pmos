/**
 * Hook Status Command
 *
 * Displays recent hook execution activity from the audit log.
 * Helps users debug hook failures and understand system behavior.
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';

interface AuditEntry {
  timestamp: string;
  hookName: string;
  event: string;
  success: boolean;
  error?: string;
  duration?: number;
}

/**
 * Parse audit log entries
 */
function parseAuditLog(content: string): AuditEntry[] {
  const lines = content.split('\n').filter(Boolean);
  const entries: AuditEntry[] = [];

  // Skip header lines (markdown table header)
  const dataLines = lines.slice(2);

  for (const line of dataLines) {
    const parts = line.split('|').map((s) => s.trim()).filter(Boolean);
    if (parts.length < 4) continue;

    const [timestamp, hookName, event, result, duration, error] = parts;

    entries.push({
      timestamp,
      hookName,
      event,
      success: result === 'success',
      error: error && error !== '-' ? error : undefined,
      duration: duration && duration !== '-' ? parseInt(duration) : undefined,
    });
  }

  return entries;
}

/**
 * Display hook status from audit log
 */
export async function hookStatus(options?: { limit?: number }): Promise<void> {
  const limit = options?.limit ?? 10;
  const auditPath = path.join(process.cwd(), 'outputs/audit/hook-log.md');

  if (!existsSync(auditPath)) {
    console.log('❌ No hook audit log found at outputs/audit/hook-log.md');
    console.log('   Run a skill or start a new session to generate hook activity.');
    return;
  }

  const content = readFileSync(auditPath, 'utf-8');
  const entries = parseAuditLog(content);

  if (entries.length === 0) {
    console.log('ℹ️  No hook activity recorded yet.');
    return;
  }

  console.log(`\n🔍 Recent Hook Activity (last ${limit}):\n`);

  const recentEntries = entries.slice(-limit);

  for (const entry of recentEntries) {
    const icon = entry.success ? '✅' : '❌';
    const durationStr = entry.duration ? ` (${entry.duration}ms)` : '';

    console.log(`${icon} ${entry.timestamp} | ${entry.hookName} | ${entry.event}${durationStr}`);

    if (entry.error) {
      console.log(`   ⚠️  Error: ${entry.error}`);
    }
  }

  // Show summary stats
  const totalHooks = entries.length;
  const failedHooks = entries.filter((e) => !e.success).length;
  const successRate =
    totalHooks > 0 ? ((totalHooks - failedHooks) / totalHooks) * 100 : 0;

  console.log(`\n📊 Summary:`);
  console.log(`   Total hooks: ${totalHooks}`);
  console.log(`   Failed: ${failedHooks}`);
  console.log(`   Success rate: ${successRate.toFixed(1)}%`);

  if (failedHooks > 0) {
    console.log(
      `\n💡 Tip: Check individual hook errors above. Common fixes:`
    );
    console.log(`   - File missing: Run \`pm-os scan\``);
    console.log(`   - JSON corruption: Run \`pm-os repair-beads\``);
    console.log(`   - State issues: Run \`pm-os init\` to reset`);
  }

  console.log();
}
