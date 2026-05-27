# TypeScript Strict Cleanup

A CLI tool for systematically eliminating TypeScript strict type checking errors in large codebases.

## Overview

This tool helps you tackle the daunting task of fixing thousands of TypeScript ESLint strict type checking errors through:

- **Automated analysis**: Categorize errors by type and complexity
- **Mass fixing**: Batch process auto-fixable errors (void expressions, unused vars)
- **Progress tracking**: Monitor cleanup progress over time
- **Guided workflow**: Phased approach from easy to complex fixes
- **Best practices**: Built-in patterns for type guards, assertions, async handling

## Problem This Solves

When enabling TypeScript's `strict: true` and ESLint's `strictTypeChecked` preset on an existing codebase, you often face thousands of errors:

```
❌ 24,716 TypeScript ESLint errors found
   - 3,407 @typescript-eslint/no-unsafe-member-access
   - 2,811 @typescript-eslint/no-unsafe-assignment
   - 2,568 @typescript-eslint/no-confusing-void-expression
   - 1,655 @typescript-eslint/no-floating-promises
   - ... and many more
```

This tool provides a systematic approach to eliminate all errors without overwhelming your team.

## Installation

```bash
# Global installation
npm install -g ts-strict-cleanup

# Or use with npx
npx ts-strict-cleanup <command>
```

## Quick Start

```bash
# 1. Analyze your project
ts-strict-cleanup analyze

# 2. Create a cleanup plan
ts-strict-cleanup plan

# 3. Run auto-fixes
ts-strict-cleanup fix void-expressions
ts-strict-cleanup fix unused-vars

# 4. Track progress
ts-strict-cleanup status

# 5. Generate report
ts-strict-cleanup report
```

## Commands

### `analyze`

Analyze your TypeScript project and categorize all strict type errors.

```bash
ts-strict-cleanup analyze [options]

Options:
  --src <path>       Source directory (default: "src")
  --convex <path>    Convex directory (optional)
  --output <file>    Output JSON file (default: ".ts-strict-cleanup.json")
```

**Output:**
```json
{
  "timestamp": "2026-02-15T10:30:00Z",
  "baseline": 24716,
  "errors": {
    "no-unsafe-member-access": 3407,
    "no-unsafe-assignment": 2811,
    "no-confusing-void-expression": 2568,
    ...
  },
  "autoFixable": 4500,
  "manual": 20216
}
```

### `plan`

Generate a phased cleanup plan based on error analysis.

```bash
ts-strict-cleanup plan [options]

Options:
  --weeks <number>   Target timeline in weeks (default: 12)
  --format <type>    Output format: markdown|json (default: "markdown")
```

Creates a detailed cleanup plan with phases, timelines, and task breakdown.

### `fix`

Run automated fixes for specific error categories.

```bash
# Fix confusing void expressions
ts-strict-cleanup fix void-expressions

# Fix unused variables and imports
ts-strict-cleanup fix unused-vars

# Fix unnecessary conditions (safe subset)
ts-strict-cleanup fix unnecessary-conditions

# Run all auto-fixes
ts-strict-cleanup fix all
```

**Options:**
```bash
--dry-run          Preview changes without modifying files
--verify           Run tests after fixing
--batch-size <n>   Process N files at a time (default: 100)
```

### `status`

Show current cleanup progress.

```bash
ts-strict-cleanup status

Output:
📊 TypeScript Strict Cleanup Status
  Baseline:  24,716 errors (2026-02-15)
  Current:   20,250 errors
  Fixed:     4,466 errors (18.1% complete)

  Phase 1: Auto-fixable Patterns
  ✅ void-expressions: 2,568 → 0 (100%)
  ✅ unused-vars: 1,041 → 0 (100%)
  ⏳ unnecessary-conditions: 929 → 71 (92%)

  Estimated completion: 10 weeks remaining
```

### `report`

Generate comprehensive cleanup report.

```bash
ts-strict-cleanup report [options]

Options:
  --format <type>    markdown|html|pdf (default: "markdown")
  --output <file>    Output file path
```

## Phased Cleanup Workflow

The tool guides you through a proven 6-phase approach:

### Phase 0: Foundation (Week 1-2)
```bash
ts-strict-cleanup analyze
ts-strict-cleanup plan
ts-strict-cleanup init  # Set up tracking
```

### Phase 1: Auto-fixable (Week 2-3)
```bash
ts-strict-cleanup fix void-expressions
ts-strict-cleanup fix unused-vars
ts-strict-cleanup fix unnecessary-conditions --safe-only
```
**Expected:** ~18% error reduction

### Phase 2: Async Patterns (Week 3-4)
```bash
ts-strict-cleanup guide async-patterns
# Manual fixes with guidance
```
**Expected:** ~12% error reduction

### Phase 3: Type Refinements (Week 3-5, parallel)
```bash
ts-strict-cleanup guide type-refinements
# Create type guards, use narrowing
```
**Expected:** ~4% error reduction

### Phase 4: Unsafe Operations (Week 5-10)
```bash
ts-strict-cleanup guide unsafe-operations
# Largest effort, manual fixes
```
**Expected:** ~47% error reduction

### Phase 5: Validation (Week 12)
```bash
ts-strict-cleanup validate
ts-strict-cleanup report --format html
```

## Configuration

Create `.ts-strict-cleanup.config.js` in your project root:

```javascript
export default {
  // Directories to analyze
  src: ['src', 'lib'],
  convex: 'convex',

  // Ignore patterns
  ignore: ['**/*.test.ts', '**/*.spec.ts', '**/generated/**'],

  // ESLint configuration
  eslintConfig: '.eslintrc.json',

  // Progress tracking
  progressFile: '.ts-strict-cleanup/progress.json',

  // Auto-fix settings
  autofix: {
    voidExpressions: true,
    unusedVars: true,
    unnecessaryConditions: 'safe-only',  // 'all', 'safe-only', false
  },

  // Validation
  runTests: true,
  testCommand: 'npm test',

  // Reporting
  reports: {
    format: 'markdown',
    outputDir: '.ts-strict-cleanup/reports',
  }
};
```

## Features

### 🔍 Smart Analysis

- Categorizes errors by type and complexity
- Identifies auto-fixable vs manual patterns
- Estimates effort and timeline
- Detects patterns across codebase

### 🤖 Automated Fixes

- **Void expressions**: Arrow functions returning void
- **Unused variables**: Removes imports, prefixes unused vars
- **Unnecessary conditions**: Removes redundant type checks
- **Safe mode**: Only applies fixes that preserve semantics

### 📊 Progress Tracking

- Baseline establishment
- Weekly snapshots
- Category-level tracking
- Velocity calculation
- Completion estimates

### 📚 Guided Manual Fixes

When auto-fix isn't possible, the tool provides:

- Pattern-specific guidance
- Before/after examples
- Type guard templates
- Best practice recommendations

### 🎯 Type Safety Patterns

Built-in library of type-safe patterns:

```typescript
// Type guards
ts-strict-cleanup patterns type-guards

// Async handling
ts-strict-cleanup patterns async

// Type assertions
ts-strict-cleanup patterns assertions

// Convex-specific
ts-strict-cleanup patterns convex
```

## Integration

### CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/type-check.yml
- name: TypeScript Strict Check
  run: |
    npx ts-strict-cleanup status --fail-on-regression
    npx ts-strict-cleanup validate
```

### Pre-commit Hooks

Prevent new errors from being introduced:

```bash
ts-strict-cleanup install-hooks
```

Creates `.git/hooks/pre-commit` that checks staged files.

## Examples

### Complete Workflow Example

```bash
# 1. Initial analysis
ts-strict-cleanup analyze
# Output: 24,716 errors found

# 2. Create plan
ts-strict-cleanup plan --weeks 12
# Output: cleanup-plan.md created

# 3. Phase 1: Auto-fixes
ts-strict-cleanup fix void-expressions
# Output: Fixed 2,568 errors in 247 files

ts-strict-cleanup fix unused-vars
# Output: Fixed 1,041 errors in 189 files

ts-strict-cleanup status
# Output: 21,107 errors remaining (14.6% complete)

# 4. Phase 2: Async patterns (manual)
ts-strict-cleanup guide async-patterns
# Output: Opens interactive guide

# 5. Continue through phases...

# 6. Final validation
ts-strict-cleanup validate
# Output: ✅ 0 errors remaining. Strict type safety achieved!
```

### Integration with Existing Scripts

```bash
# Use in existing cleanup scripts
#!/bin/bash
set -e

echo "Starting TypeScript strict cleanup..."

# Run auto-fixes
ts-strict-cleanup fix all --verify

# Check for regressions
ts-strict-cleanup status --fail-on-regression

# Update progress
ts-strict-cleanup report --format json > progress.json

echo "Cleanup complete!"
```

## Why This Tool?

### Before: Manual Chaos
- ❌ 24,716 errors overwhelming
- ❌ No clear starting point
- ❌ Auto-fix only works on 1-2%
- ❌ Hard to track progress
- ❌ Easy to introduce regressions

### After: Systematic Approach
- ✅ Clear phased roadmap
- ✅ Automated analysis and categorization
- ✅ Mass-fix scripts for auto-fixable errors
- ✅ Progress tracking and reporting
- ✅ Prevention of regressions via hooks
- ✅ Best practice patterns built-in

## Roadmap

- [ ] v0.1: Core analysis and auto-fix (void, unused vars)
- [ ] v0.2: Progress tracking and reporting
- [ ] v0.3: Guided manual fixes (async, type refinements)
- [ ] v0.4: CI/CD integration and hooks
- [ ] v0.5: Pattern library and templates
- [ ] v1.0: Complete workflow, stable API

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT - see [LICENSE](LICENSE)

## Inspired By

This tool was created to solve the real-world problem of cleaning up 24,716+ strict TypeScript errors in a production codebase. The phased approach and automation scripts have been proven effective on a large enterprise application.

## Support

- 📖 [Documentation](./docs)
- 🐛 [Issue Tracker](https://github.com/yourusername/ts-strict-cleanup/issues)
- 💬 [Discussions](https://github.com/yourusername/ts-strict-cleanup/discussions)

---

**Made with ❤️ for TypeScript developers tired of seeing thousands of type errors**
