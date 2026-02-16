import { execa } from 'execa';

/**
 * Detect which package runner to use (bunx or npx)
 * Prefers bunx if available (for bun projects)
 */
export async function detectPackageRunner(cwd = process.cwd()) {
  try {
    await execa('bunx', ['--version'], { cwd, reject: true });
    return 'bunx';
  } catch {
    return 'npx';
  }
}
