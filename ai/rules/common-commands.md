---
description: Common commands and workflows
globs: ['**/*']
alwaysApply: true
---

# Common Commands and Workflows

## Essential Commands

### Build and Development

```bash
# Install dependencies
yarn install

# Build all packages
yarn build
```

### Code Quality

```bash
# Run all tests
yarn test

# Run tests for specific package
yarn workspace @stytch/web test
```

### Package Management

```bash
# Add dependency to specific package
yarn workspace @stytch/web add package-name@version -D

# Remove dependency from specific package
yarn workspace @stytch/web remove package-name -D
```

### UI Development

```bash
# Run Storybook tests
yarn test-storybook
```

## Workflow Patterns

### After Making Changes

Run `yarn format` after all changes. Run `yarn typecheck` and `yarn test` for logic changes.
