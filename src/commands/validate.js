import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';

export async function validateCommand() {
  const spinner = ora('Validating type safety...').start();

  try {
    const { stdout } = await execa(
      'npx',
      ['eslint', 'src/', 'convex/', '--format', 'json'],
      { cwd: process.cwd(), reject: false }
    );

    const results = JSON.parse(stdout || '[]');
    const totalErrors = results.reduce((sum, r) => sum + r.messages.length, 0);

    if (totalErrors === 0) {
      spinner.succeed('Validation passed!');
      console.log('\n' + chalk.green.bold('✅ Zero TypeScript strict errors!'));
      console.log(chalk.green('   Strict type safety achieved! 🎉\n'));
    } else {
      spinner.fail('Validation failed');
      console.log('\n' + chalk.red.bold(`❌ ${totalErrors} errors remaining`));
      console.log(chalk.gray('\nRun:'), chalk.cyan('ts-strict-cleanup status'), chalk.gray('for details\n'));
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Validation failed');
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}
