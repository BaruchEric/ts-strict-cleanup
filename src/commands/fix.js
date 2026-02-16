import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';

const FIX_STRATEGIES = {
  'void-expressions': {
    rule: '@typescript-eslint/no-confusing-void-expression',
    description: 'Fix confusing void expressions in arrow functions',
  },
  'unused-vars': {
    rule: '@typescript-eslint/no-unused-vars',
    description: 'Remove unused variables and imports',
  },
  'unnecessary-conditions': {
    rule: '@typescript-eslint/no-unnecessary-condition',
    description: 'Remove unnecessary type conditions',
  },
};

export async function fixCommand(type, options) {
  const cwd = process.cwd();

  // Validate fix type
  if (type !== 'all' && !FIX_STRATEGIES[type]) {
    console.error(chalk.red(`❌ Unknown fix type: ${type}`));
    console.log('\n' + chalk.bold('Available fix types:'));
    for (const [key, strategy] of Object.entries(FIX_STRATEGIES)) {
      console.log(`  ${chalk.cyan(key)}: ${strategy.description}`);
    }
    console.log(`  ${chalk.cyan('all')}: Run all auto-fixes`);
    process.exit(1);
  }

  // Determine which fixes to run
  const fixTypes = type === 'all' ? Object.keys(FIX_STRATEGIES) : [type];

  console.log(chalk.bold('🔧 TypeScript Strict Auto-Fix\n'));

  if (options.dryRun) {
    console.log(chalk.yellow('⚠️  DRY RUN MODE - No files will be modified\n'));
  }

  let totalFixed = 0;
  let totalFiles = 0;

  for (const fixType of fixTypes) {
    const strategy = FIX_STRATEGIES[fixType];
    const spinner = ora(`Fixing ${fixType}...`).start();

    try {
      // Get files with this error type
      const { stdout: listOutput } = await execa(
        'npx',
        ['eslint', 'src/', 'convex/', '--format', 'json'],
        { cwd, reject: false }
      );

      const results = JSON.parse(listOutput || '[]');
      const filesWithError = new Set();

      for (const result of results) {
        const hasError = result.messages.some((msg) => msg.ruleId === strategy.rule);
        if (hasError) {
          filesWithError.add(result.filePath);
        }
      }

      if (filesWithError.size === 0) {
        spinner.succeed(`${fixType}: No errors found`);
        continue;
      }

      spinner.text = `Fixing ${fixType} in ${filesWithError.size} files...`;

      // Process files in batches
      const files = Array.from(filesWithError);
      const batchSize = parseInt(options.batchSize || '100', 10);
      let filesFixed = 0;

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);

        if (options.dryRun) {
          // Just show what would be fixed
          filesFixed += batch.length;
        } else {
          // Run ESLint --fix on batch
          await execa(
            'npx',
            ['eslint', ...batch, '--fix', '--quiet'],
            { cwd, reject: false }
          );
          filesFixed += batch.length;
        }

        spinner.text = `Fixing ${fixType}: ${filesFixed}/${files.length} files`;
      }

      // Count remaining errors
      const { stdout: afterOutput } = await execa(
        'npx',
        ['eslint', 'src/', 'convex/', '--format', 'json'],
        { cwd, reject: false }
      );

      const afterResults = JSON.parse(afterOutput || '[]');
      const remainingErrors = afterResults.reduce((sum, result) => {
        return sum + result.messages.filter((msg) => msg.ruleId === strategy.rule).length;
      }, 0);

      const errorsFixed = filesWithError.size > 0 ? '✓' : remainingErrors;
      spinner.succeed(
        `${fixType}: Fixed ${filesFixed} files (${remainingErrors} errors remaining)`
      );

      totalFixed += filesFixed;
      totalFiles += files.length;
    } catch (error) {
      spinner.fail(`${fixType}: Failed`);
      console.error(chalk.red('Error:'), error.message);
    }
  }

  console.log('\n' + chalk.bold('Summary:'));
  console.log(`  Files processed: ${chalk.cyan(totalFiles)}`);
  console.log(`  Files fixed: ${chalk.green(totalFixed)}`);

  if (options.verify) {
    console.log('\n' + chalk.bold('Running verification...'));
    const verifySpinner = ora('Running tests...').start();

    try {
      await execa('npm', ['test'], { cwd });
      verifySpinner.succeed('All tests passed');
    } catch (error) {
      verifySpinner.fail('Tests failed');
      console.error(chalk.red('\n⚠️  Some tests failed after fixes.'));
      console.error(chalk.gray('Review changes and fix failing tests.'));
      process.exit(1);
    }
  }

  if (!options.dryRun) {
    console.log('\n' + chalk.bold('Next steps:'));
    console.log(chalk.gray('  1. Review changes:'), chalk.cyan('git diff'));
    console.log(chalk.gray('  2. Run tests:'), chalk.cyan('npm test'));
    console.log(chalk.gray('  3. Check status:'), chalk.cyan('ts-strict-cleanup status'));
    console.log(chalk.gray('  4. Commit changes:'), chalk.cyan('git commit -am "fix: auto-fix <type>"'));
  }
}
