#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { analyzeCommand } from '../src/commands/analyze.js';
import { planCommand } from '../src/commands/plan.js';
import { fixCommand } from '../src/commands/fix.js';
import { statusCommand } from '../src/commands/status.js';
import { reportCommand } from '../src/commands/report.js';
import { patternsCommand } from '../src/commands/patterns.js';
import { validateCommand } from '../src/commands/validate.js';
import { initCommand } from '../src/commands/init.js';

const program = new Command();

program
  .name('ts-strict-cleanup')
  .description('CLI tool for systematically eliminating TypeScript strict type checking errors')
  .version('0.1.0');

// Analyze command
program
  .command('analyze')
  .description('Analyze TypeScript project and categorize strict type errors')
  .option('--src <path>', 'Source directory', 'src')
  .option('--convex <path>', 'Convex directory')
  .option('--output <file>', 'Output JSON file', '.ts-strict-cleanup.json')
  .action(analyzeCommand);

// Plan command
program
  .command('plan')
  .description('Generate phased cleanup plan')
  .option('--weeks <number>', 'Target timeline in weeks', '12')
  .option('--format <type>', 'Output format: markdown|json', 'markdown')
  .action(planCommand);

// Fix command
program
  .command('fix <type>')
  .description('Run automated fixes for specific error category')
  .option('--dry-run', 'Preview changes without modifying files')
  .option('--verify', 'Run tests after fixing')
  .option('--batch-size <n>', 'Process N files at a time', '100')
  .action(fixCommand);

// Status command
program
  .command('status')
  .description('Show current cleanup progress')
  .option('--fail-on-regression', 'Exit with error if errors increased')
  .action(statusCommand);

// Report command
program
  .command('report')
  .description('Generate comprehensive cleanup report')
  .option('--format <type>', 'Report format: markdown|html|pdf', 'markdown')
  .option('--output <file>', 'Output file path')
  .action(reportCommand);

// Patterns command
program
  .command('patterns <category>')
  .description('Show type-safe code patterns')
  .action(patternsCommand);

// Validate command
program
  .command('validate')
  .description('Validate that all errors are eliminated')
  .action(validateCommand);

// Init command
program
  .command('init')
  .description('Initialize cleanup tracking in project')
  .action(initCommand);

// Guide command
program
  .command('guide <phase>')
  .description('Interactive guide for manual fixes')
  .action((phase) => {
    console.log(chalk.yellow(`📚 Interactive guide for ${phase} coming soon!`));
    console.log(chalk.gray('   For now, see: https://github.com/yourusername/ts-strict-cleanup/docs'));
  });

// Install hooks command
program
  .command('install-hooks')
  .description('Install pre-commit hooks to prevent regressions')
  .action(() => {
    console.log(chalk.yellow('🔧 Pre-commit hook installation coming soon!'));
  });

program.parse();
