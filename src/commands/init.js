import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function initCommand() {
  const cwd = process.cwd();

  console.log(chalk.bold('🚀 Initializing TypeScript Strict Cleanup\n'));

  // Create .ts-strict-cleanup directory
  const configDir = path.resolve(cwd, '.ts-strict-cleanup');
  await fs.ensureDir(configDir);
  console.log(chalk.green('✓'), 'Created', chalk.cyan('.ts-strict-cleanup/'), 'directory');

  // Create progress directory
  const progressDir = path.resolve(configDir, 'progress');
  await fs.ensureDir(progressDir);
  console.log(chalk.green('✓'), 'Created progress tracking directory');

  // Create reports directory
  const reportsDir = path.resolve(configDir, 'reports');
  await fs.ensureDir(reportsDir);
  console.log(chalk.green('✓'), 'Created reports directory');

  // Create .gitignore
  const gitignorePath = path.resolve(configDir, '.gitignore');
  if (!await fs.pathExists(gitignorePath)) {
    await fs.writeFile(gitignorePath, '*.json\n*.log\n');
    console.log(chalk.green('✓'), 'Created .gitignore');
  }

  console.log('\n' + chalk.bold('Next steps:'));
  console.log(chalk.gray('  1. Run:'), chalk.cyan('ts-strict-cleanup analyze'));
  console.log(chalk.gray('  2. Run:'), chalk.cyan('ts-strict-cleanup plan'));
  console.log(chalk.gray('  3. Start fixing:'), chalk.cyan('ts-strict-cleanup fix void-expressions'));
}
