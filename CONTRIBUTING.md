# Contributing to TypeScript Strict Cleanup

Thank you for your interest in contributing! This tool was born from real-world experience cleaning up 24,716+ strict TypeScript errors in a production codebase.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ts-strict-cleanup.git
cd ts-strict-cleanup

# Install dependencies
npm install

# Run the CLI locally
node bin/cli.js --help
```

## Project Structure

```
ts-strict-cleanup/
├── bin/                  # CLI entry point
│   └── cli.js           # Main CLI with command registration
├── src/
│   ├── commands/        # CLI command implementations
│   │   ├── analyze.js   # Error analysis command
│   │   ├── fix.js       # Auto-fix command
│   │   ├── status.js    # Progress status command
│   │   └── ...
│   ├── analyzers/       # Error analysis logic (future)
│   ├── fixers/          # Auto-fix implementations (future)
│   ├── reporters/       # Report generation (future)
│   └── utils/           # Shared utilities (future)
├── templates/           # Pattern templates (future)
└── docs/                # Documentation
```

## Contributing Guidelines

### Adding New Commands

1. Create new command file in `src/commands/`
2. Export an async function with the command logic
3. Register the command in `bin/cli.js`
4. Update README.md with command documentation

Example:

```javascript
// src/commands/mycmd.js
import chalk from 'chalk';
import ora from 'ora';

export async function myCommand(options) {
  const spinner = ora('Processing...').start();

  try {
    // Command logic here
    spinner.succeed('Done!');
  } catch (error) {
    spinner.fail('Failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
```

### Adding New Fix Strategies

Edit `src/commands/fix.js` and add to `FIX_STRATEGIES`:

```javascript
const FIX_STRATEGIES = {
  'my-fix-type': {
    rule: '@typescript-eslint/my-rule',
    description: 'Fix my specific error type',
  },
};
```

### Code Style

- Use ESM modules (import/export)
- Use async/await for async operations
- Use chalk for colored output
- Use ora for spinners
- Handle errors gracefully
- Provide clear user feedback

### Testing

```bash
# Run linting
npm run lint

# Test on a real project
cd /path/to/test/project
node /path/to/ts-strict-cleanup/bin/cli.js analyze
```

## Roadmap

See [README.md](README.md#roadmap) for planned features.

Priority areas for contribution:
1. **v0.2**: Progress tracking and reporting
2. **v0.3**: Guided manual fixes
3. **v0.4**: CI/CD integration
4. **v0.5**: Pattern library

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test on a real TypeScript project
5. Commit: `git commit -am "Add feature: ..."`
6. Push: `git push origin feature/my-feature`
7. Submit a Pull Request

## Questions?

Open an issue or discussion on GitHub!
