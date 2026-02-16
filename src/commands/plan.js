import chalk from 'chalk';

export async function planCommand(options) {
  console.log(chalk.yellow('📋 Plan generation coming in v0.2'));
  console.log(chalk.gray('\nFor now, use the manual planning approach:'));
  console.log(chalk.gray('  1. Run'), chalk.cyan('ts-strict-cleanup analyze'));
  console.log(chalk.gray('  2. Review the analysis output'));
  console.log(chalk.gray('  3. Start with auto-fixable patterns'));
}
