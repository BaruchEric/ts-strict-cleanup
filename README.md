# ts-strict-cleanup

A Node CLI that analyzes a TypeScript project's ESLint strict-type errors, auto-fixes the mechanically fixable ones with `eslint --fix`, and tracks your progress against a saved baseline as you grind a large codebase toward zero errors.

## TL;DR

- **What:** turns a wall of `@typescript-eslint` strict-type errors into a categorized baseline, batch-runs `eslint --fix` for the auto-fixable rules, and shows how far you've come.
- **How:** runs ESLint per-directory (to avoid OOM on huge trees), parses its JSON output, and saves a `.ts-strict-cleanup.json` baseline you measure against.
- **Stack:** Node ≥18, ES modules, `commander` + `chalk` + `ora`; `execa` to shell out to ESLint; `fs-extra`, `glob`, `inquirer`.
- **Run:** `node bin/cli.js analyze` → `... fix all` → `... status`. (Not published to npm; run from a local clone.)

## Overview

Enabling `strict: true` and the `strictTypeChecked` ESLint preset on an existing codebase can surface thousands of errors at once. This tool gives that cleanup some structure:

1. **`analyze`** runs ESLint over your source (and optionally a Convex) directory, counts every rule violation, flags which are auto-fixable, ranks the worst files, and writes a `.ts-strict-cleanup.json` baseline.
2. **`fix`** finds the files containing a given rule's errors and runs `eslint --fix --quiet` over them in batches, then re-counts what's left.
3. **`status`** re-runs ESLint and compares the live count to the saved baseline — overall and per category — with a progress bar and a naive linear ETA.
4. **`validate`** asserts the count is zero and exits non-zero otherwise (useful in CI).

All ESLint invocations run **one directory at a time** to avoid out-of-memory crashes on large monorepos, and the runner auto-detects **`bunx`** (falling back to **`npx`**) so it works in both bun and npm projects.

## Tech stack

- **Node ≥18**, ES modules (`"type": "module"`).
- **`commander`** — argument parsing / subcommands.
- **`execa`** — shells out to `eslint` (via `bunx`/`npx`) and parses its `--format json` output.
- **`chalk`** + **`ora`** — colored output and spinners.
- **`fs-extra`** — reading/writing the JSON baseline and `init` scaffolding.
- **`inquirer`**, **`glob`** — declared dependencies (for planned interactive/glob features).

## Getting started

Not published to npm. Clone the repo and run the CLI directly:

```bash
npm install                    # install dependencies
node bin/cli.js <command>      # or: npm run dev -- <command>
```

Typical loop, run from the root of the **target** TypeScript project:

```bash
# 1. Establish a baseline (writes .ts-strict-cleanup.json)
node /path/to/ts-strict-cleanup/bin/cli.js analyze --src src

# 2. Knock out the auto-fixable rules
node /path/to/ts-strict-cleanup/bin/cli.js fix all

# 3. See how far you've gotten
node /path/to/ts-strict-cleanup/bin/cli.js status

# 4. Gate on zero errors (e.g. in CI)
node /path/to/ts-strict-cleanup/bin/cli.js validate
```

> The target project must have its own ESLint config with the relevant `@typescript-eslint` strict rules enabled — this tool drives *your* ESLint setup, it does not supply rules.

## Commands

| Command | Status | What it does |
| --- | --- | --- |
| `analyze` | working | Runs ESLint per directory, categorizes errors, ranks the top files, computes auto-fixable vs manual, writes the baseline JSON. |
| `fix <type>` | working | Batches `eslint --fix` over files containing a chosen rule's errors, then recounts. `<type>` ∈ `void-expressions`, `unused-vars`, `unnecessary-conditions`, `all`. |
| `status` | working | Re-runs ESLint, compares to the baseline (overall + by category), draws a progress bar, prints a linear ETA. |
| `validate` | working | Runs ESLint over `src/` and `convex/`; exits `0` on zero errors, `1` otherwise. |
| `init` | working | Scaffolds a `.ts-strict-cleanup/` directory (`progress/`, `reports/`, `.gitignore`). |
| `plan` | stub | Prints a "coming in v0.2" message and a manual-planning hint. |
| `report` | stub | Prints a "coming in v0.2" message. |
| `patterns <category>` | stub | Prints a "coming in v0.3" message. |
| `guide <phase>` | stub | Prints a "coming soon" message. |
| `install-hooks` | stub | Prints a "coming soon" message. |

### `analyze` options

```
--src <path>      Source directory (default: "src")
--convex <path>   Additional Convex directory (optional)
--output <file>   Baseline JSON path (default: ".ts-strict-cleanup.json")
```

The baseline records the timestamp, total `baseline` count, per-rule `errors`, per-file counts, `autoFixable`/`manual` totals, the directory breakdown, and the 20 worst files.

### `fix <type>` options

```
--dry-run            Preview (counts files, modifies nothing)
--verify             Run tests after fixing
--batch-size <n>     Files per eslint --fix batch (default: 100)
```

Auto-fix strategies map a friendly name to an ESLint rule:

- `void-expressions` → `@typescript-eslint/no-confusing-void-expression`
- `unused-vars` → `@typescript-eslint/no-unused-vars`
- `unnecessary-conditions` → `@typescript-eslint/no-unnecessary-condition`
- `all` → runs all three

### `status` options

```
--fail-on-regression   Exit 1 if the current count exceeds the baseline
```

## Architecture

```
bin/cli.js                       commander setup; registers all subcommands
src/commands/
  analyze.js   baseline generation (ESLint → categorized JSON)
  fix.js       batched eslint --fix per strategy, before/after counts
  status.js    live recount vs baseline, category breakdown, ETA
  validate.js  zero-error gate
  init.js      scaffold .ts-strict-cleanup/ tracking dirs
  plan.js report.js patterns.js   stubs (print "coming soon")
src/utils/detectPackageRunner.js prefers bunx, falls back to npx
```

`analyze`, `fix`, and `status` all share the same defensive pattern: iterate directories one at a time, run `eslint --format json`, and pull the first line that starts with `[` out of stdout (ESLint mixes warnings/deprecation noise into the stream).

## Status & known limitations

This is an early, personally-used tool (`v0.1.0`). Honest caveats from the code:

- **Five commands are stubs** (`plan`, `report`, `patterns`, `guide`, `install-hooks`) — they only print "coming soon" messages.
- **`validate` hardcodes the directory list** to `src/` and `convex/`, so it only fits projects with that exact layout.
- **`fix --verify` runs `npm test`** specifically, even though every other ESLint call goes through the auto-detected `bunx`/`npx` runner.
- There is **no config file**: directories are passed via flags (or, for `fix`/`status`, read back from the baseline's `directories` map). The `"test"` script in `package.json` is the default placeholder (`exit 1`).
- `author` in `package.json` is an unfilled `"Your Name"` placeholder.

## License

MIT — see [LICENSE](LICENSE). Contributions: see [CONTRIBUTING.md](CONTRIBUTING.md).
