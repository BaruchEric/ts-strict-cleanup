import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { detectPackageRunner } from '../utils/detectPackageRunner.js';

export async function analyzeCommand(options) {
  const spinner = ora('Analyzing TypeScript project...').start();

  try {
    const cwd = process.cwd();
    const directories = [options.src];
    if (options.convex) {
      directories.push(options.convex);
    }

    // Detect which package runner to use (bunx or npx)
    const packageRunner = await detectPackageRunner(cwd);
    if (packageRunner === 'bunx') {
      spinner.text = 'Detected bun project, using bunx...';
    }

    // Run ESLint on each directory separately to avoid OOM issues
    let results = [];
    for (const dir of directories) {
      spinner.text = `Running ESLint on ${dir}...`;

      try {
        const { stdout, stderr } = await execa(
          packageRunner,
          ['eslint', dir, '--format', 'json'],
          {
            cwd,
            reject: false,
            // Filter out stderr noise (warnings, deprecation messages)
            // but keep actual errors
          }
        );

        // Parse results (ESLint writes JSON to stdout even on errors)
        try {
          // Filter out non-JSON lines (warnings, deprecation notices)
          const jsonOutput = stdout.split('\n').find(line => line.trim().startsWith('['));
          if (jsonOutput) {
            const dirResults = JSON.parse(jsonOutput);
            results = results.concat(dirResults);
          }
        } catch (parseError) {
          spinner.warn(`Failed to parse ESLint output for ${dir}`);
          console.error(chalk.yellow(`  Stdout (first 300 chars): ${stdout.substring(0, 300)}`));
        }
      } catch (execError) {
        spinner.warn(`ESLint failed for ${dir}: ${execError.message}`);
      }
    }

    // Categorize errors
    const errorCounts = {};
    const fileErrors = {};
    let totalErrors = 0;

    for (const result of results) {
      const filePath = path.relative(cwd, result.filePath);
      fileErrors[filePath] = result.messages.length;

      for (const message of result.messages) {
        if (message.ruleId) {
          errorCounts[message.ruleId] = (errorCounts[message.ruleId] || 0) + 1;
          totalErrors++;
        }
      }
    }

    // Determine auto-fixable errors
    const autoFixableRules = new Set([
      '@typescript-eslint/no-confusing-void-expression',
      '@typescript-eslint/no-unused-vars',
    ]);

    let autoFixable = 0;
    for (const [ruleId, count] of Object.entries(errorCounts)) {
      if (autoFixableRules.has(ruleId)) {
        autoFixable += count;
      }
    }

    // Create analysis result
    const analysis = {
      timestamp: new Date().toISOString(),
      baseline: totalErrors,
      directories: {
        [options.src]: results
          .filter((r) => r.filePath.includes(options.src))
          .reduce((sum, r) => sum + r.messages.length, 0),
      },
      errors: errorCounts,
      fileErrors,
      autoFixable,
      manual: totalErrors - autoFixable,
      topFiles: Object.entries(fileErrors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([file, count]) => ({ file, count })),
    };

    if (options.convex) {
      analysis.directories[options.convex] = results
        .filter((r) => r.filePath.includes(options.convex))
        .reduce((sum, r) => sum + r.messages.length, 0);
    }

    // Save to file
    const outputPath = path.resolve(cwd, options.output);
    await fs.writeJson(outputPath, analysis, { spaces: 2 });

    spinner.succeed('Analysis complete!');

    // Display summary
    console.log('\n' + chalk.bold('📊 TypeScript Strict Type Errors Analysis\n'));
    console.log(chalk.cyan('Total Errors:'), chalk.yellow(totalErrors.toLocaleString()));
    console.log(chalk.cyan('Auto-fixable:'), chalk.green(autoFixable.toLocaleString()), chalk.gray(`(${((autoFixable/totalErrors)*100).toFixed(1)}%)`));
    console.log(chalk.cyan('Manual fixes:'), chalk.red(analysis.manual.toLocaleString()), chalk.gray(`(${((analysis.manual/totalErrors)*100).toFixed(1)}%)`));

    console.log('\n' + chalk.bold('By Directory:\n'));
    for (const [dir, count] of Object.entries(analysis.directories)) {
      console.log(`  ${dir}: ${chalk.yellow(count.toLocaleString())} errors`);
    }

    console.log('\n' + chalk.bold('Top 10 Error Types:\n'));
    const sortedErrors = Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [ruleId, count] of sortedErrors) {
      const isAutoFix = autoFixableRules.has(ruleId);
      const label = isAutoFix ? chalk.green('(auto-fixable)') : chalk.gray('(manual)');
      console.log(`  ${ruleId}`);
      console.log(`    ${chalk.yellow(count.toLocaleString())} errors ${label}`);
    }

    console.log('\n' + chalk.bold('Top 10 Files with Most Errors:\n'));
    for (const { file, count } of analysis.topFiles.slice(0, 10)) {
      console.log(`  ${file}: ${chalk.yellow(count)} errors`);
    }

    console.log('\n' + chalk.gray(`Analysis saved to: ${outputPath}`));
    console.log('\n' + chalk.bold('Next steps:'));
    console.log(chalk.gray('  1. Run:'), chalk.cyan('ts-strict-cleanup plan'), chalk.gray('to create cleanup plan'));
    console.log(chalk.gray('  2. Run:'), chalk.cyan('ts-strict-cleanup fix void-expressions'), chalk.gray('to start auto-fixes'));
  } catch (error) {
    spinner.fail('Analysis failed');
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }
}
