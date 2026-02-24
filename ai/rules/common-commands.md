---
description: Common commands and workflows
globs: ['**/*']
alwaysApply: true
---

# Commands

All commands should be run from the repository root.

## Build and Development

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Build specific package and its dependencies
yarn build:vanilla-js
yarn build:react
yarn build:packages  # All packages only

# Run demo apps with auto-recompile
yarn dev:react        # B2C React demo
yarn dev:b2b:react    # B2B React demo
yarn dev:next         # Next.js demo
```

## Testing

```bash
# Run all tests
yarn test

# Test specific package
yarn workspace @stytch/vanilla-js test

# Watch mode for specific package
yarn workspace @stytch/vanilla-js test --watch

# Storybook tests (for vanilla-js UI components)
yarn test-storybook

# Run Storybook locally
yarn workspace @stytch/vanilla-js storybook  # http://localhost:6006
```

## Code Quality

```bash
# Check linting and formatting (no changes)
yarn lint

# Auto-fix linting and formatting issues
yarn format

# Type checking
yarn typecheck

# Build, lint, and test all at once
yarn blt
```

## Dependencies

```bash
# Add dependency to specific package
yarn workspace @stytch/vanilla-js add package-name@version -D

# Remove dependency
yarn workspace @stytch/vanilla-js remove package-name
```
