import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export async function statusCommand(options) {
  const cwd = process.cwd();
  const analysisFile = path.resolve(cwd, '.ts-strict-cleanup.json');

  // Check if analysis exists
  if (!await fs.pathExists(analysisFile)) {
    console.error(chalk.red('❌ No analysis found. Run:'), chalk.cyan('ts-strict-cleanup analyze'));
    process.exit(1);
  }

  const spinner = ora('Checking current status...').start();

  try {
    // Load baseline
    const analysis = await fs.readJson(analysisFile);
    const baseline = analysis.baseline;
    const baselineDate = new Date(analysis.timestamp).toLocaleDateString();

    // Get current error count
    const { stdout } = await execa(
      'npx',
      ['eslint', 'src/', 'convex/', '--format', 'json'],
      { cwd, reject: false }
    );

    const results = JSON.parse(stdout || '[]');
    const currentErrors = {};
    let currentTotal = 0;

    for (const result of results) {
      for (const message of result.messages) {
        if (message.ruleId) {
          currentErrors[message.ruleId] = (currentErrors[message.ruleId] || 0) + 1;
          currentTotal++;
        }
      }
    }

    spinner.stop();

    // Calculate progress
    const fixed = baseline - currentTotal;
    const percentComplete = ((fixed / baseline) * 100).toFixed(1);

    // Display status
    console.log('\n' + chalk.bold('📊 TypeScript Strict Cleanup Status\n'));
    console.log(chalk.cyan('Baseline:'), chalk.yellow(baseline.toLocaleString()), chalk.gray(`(${baselineDate})`));
    console.log(chalk.cyan('Current: '), chalk.yellow(currentTotal.toLocaleString()));
    console.log(chalk.cyan('Fixed:   '), chalk.green(fixed.toLocaleString()), chalk.gray(`(${percentComplete}% complete)`));

    // Show progress bar
    const barLength = 40;
    const filled = Math.floor((fixed / baseline) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    console.log('\n' + chalk.green(bar) + ` ${percentComplete}%\n`);

    // Category breakdown
    console.log(chalk.bold('By Category:\n'));

    const categories = {
      'Auto-fixable': new Set([
        '@typescript-eslint/no-confusing-void-expression',
        '@typescript-eslint/no-unused-vars',
      ]),
      'Async Patterns': new Set([
        '@typescript-eslint/no-floating-promises',
        '@typescript-eslint/no-misused-promises',
      ]),
      'Type Refinements': new Set([
        '@typescript-eslint/no-unnecessary-condition',
      ]),
      'Unsafe Operations': new Set([
        '@typescript-eslint/no-unsafe-member-access',
        '@typescript-eslint/no-unsafe-assignment',
        '@typescript-eslint/no-unsafe-call',
        '@typescript-eslint/no-unsafe-argument',
        '@typescript-eslint/no-unsafe-return',
      ]),
    };

    for (const [category, rules] of Object.entries(categories)) {
      const baselineCount = Object.entries(analysis.errors)
        .filter(([rule]) => rules.has(rule))
        .reduce((sum, [, count]) => sum + count, 0);

      const currentCount = Object.entries(currentErrors)
        .filter(([rule]) => rules.has(rule))
        .reduce((sum, [, count]) => sum + count, 0);

      const categoryFixed = baselineCount - currentCount;
      const categoryPercent = baselineCount > 0 ? ((categoryFixed / baselineCount) * 100).toFixed(0) : 0;

      const status = currentCount === 0 ? chalk.green('✅') : chalk.yellow('⏳');

      console.log(`  ${status} ${category}:`);
      console.log(`     ${chalk.yellow(baselineCount.toLocaleString())} → ${chalk.cyan(currentCount.toLocaleString())} (${categoryPercent}% fixed)`);
    }

    // Estimate completion
    if (currentTotal > 0) {
      console.log('\n' + chalk.bold('Estimation:\n'));

      // Calculate velocity (assuming linear progress)
      const daysElapsed = Math.max(
        1,
        Math.floor((Date.now() - new Date(analysis.timestamp).getTime()) / (1000 * 60 * 60 * 24))
      );
      const velocity = fixed / daysElapsed;

      if (velocity > 0) {
        const daysRemaining = Math.ceil(currentTotal / velocity);
        const weeksRemaining = Math.ceil(daysRemaining / 7);

        console.log(
          `  At current pace: ${chalk.cyan(weeksRemaining)} weeks remaining`
        );
        console.log(
          chalk.gray(`  (fixing ~${Math.floor(velocity)} errors/day)`)
        );
      }
    } else {
      console.log('\n' + chalk.green.bold('🎉 All errors eliminated! Strict type safety achieved!'));
    }

    // Check for regressions
    if (options.failOnRegression && currentTotal > baseline) {
      console.log('\n' + chalk.red.bold('❌ REGRESSION DETECTED'));
      console.log(chalk.red(`Errors increased from ${baseline} to ${currentTotal}`));
      console.log(chalk.gray('New errors introduced since baseline.'));
      process.exit(1);
    }

    console.log('\n' + chalk.bold('Next steps:'));
    if (currentTotal > 0) {
      console.log(chalk.gray('  1. Continue fixes:'), chalk.cyan('ts-strict-cleanup fix <type>'));
      console.log(chalk.gray('  2. Generate report:'), chalk.cyan('ts-strict-cleanup report'));
    } else {
      console.log(chalk.gray('  1. Run final validation:'), chalk.cyan('ts-strict-cleanup validate'));
      console.log(chalk.gray('  2. Generate completion report:'), chalk.cyan('ts-strict-cleanup report'));
    }
  } catch (error) {
    spinner.fail('Status check failed');
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}
