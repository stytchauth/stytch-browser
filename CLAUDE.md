# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Stytch JavaScript SDK Monorepo

This is a monorepo for Stytch JavaScript SDKs. The codebase is split between B2C and B2B authentication APIs, with separate headless clients and UI component exports.

## Package Hierarchy

**Core SDK Package:**

- `@stytch/web` - Contains all core functionality: headless client, UI components built with Preact, and React bindings. Everything in vanilla-js, react, and nextjs wraps or re-exports from this package. Not published directly.

**Published Wrapper Packages:**

- `@stytch/vanilla-js` - Framework-agnostic bindings using custom elements. Re-exports from `@stytch/web`.
- `@stytch/react` - React-specific bindings (client-side only). Re-exports from `@stytch/web` and adds React Context/hooks.
- `@stytch/nextjs` - Next.js bindings with SSR support. Re-exports from `@stytch/web`.
- `@stytch/react-native` - Standalone SDK for React Native with native Kotlin/Swift/Objective-C code. Shares some copied code with web, but code reuse should be done primarily by lifting them to `@stytch/core`

**Helper Packages:**

- `@stytch/core` - Business logic, session management, PKCE, Subscription Service. Exports:
  - `@stytch/core/public` - Public API (types, constants)
  - `@stytch/core` - Internal implementation consumed by web and react-native
  - Defines the `StytchClient` template with platform-agnostic logic
- `@stytch/js-utils` - Utility functions bundled into other packages (not published)

## B2C vs B2B Split

- **B2C exports**: Root exports (e.g., `import {} from '@stytch/react'`)
- **B2B exports**: `/b2b` subpath (e.g., `import {} from '@stytch/react/b2b'`)
- **AdminPortal exports**: `/adminPortal` subpath

Most libraries have this dual export structure throughout their codebase.

## Headless vs UI

- **Headless**: Stateful client APIs only (`@stytch/web/headless`)
- **UI**: Prebuilt components

## React Native Specifics

React Native package contains code copied from web to accommodate platform differences. When editing files that exist in both packages, verify you're modifying the correct version - they often have identical names but different platform-specific logic.

## StytchClient Architecture

1. `@stytch/core` defines the `StytchClient` template with platform-agnostic business logic
2. Individual SDK packages implement platform-specific components:
   - `StorageClient` - Handles persistent storage (cookies, localStorage, AsyncStorage)
   - `NetworkClient` - Handles HTTP requests, telemetry, metadata
3. These components are injected to create the final `StytchClient` export consumed by developers

## Monorepo Structure

```
packages/          # Published and internal packages
  web/            # Core implementation (private)
  vanilla-js/     # Framework-agnostic SDK
  react/          # React bindings
  nextjs/         # Next.js bindings
  react-native/   # React Native SDK
  core/           # Business logic and session management
  js-utils/       # Utility functions (bundled, not published)
apps/             # Demo applications
  react-demo/
  react-b2b-demo/
  next-demo/
  passkey-demo/
  react-native-demo/
  other-framework-demo/
services/
  clientside-services/  # Static files loaded from Stytch servers
  e2e-tests/           # Cypress end-to-end tests
internal/         # Build config, mocks, test utils
```

## Workflow

- Always run from repository root
- Use Yarn, not npm
- Run `yarn format` after making changes
- Run `yarn typecheck` and `yarn test` for logic changes
- Node version specified in `.nvmrc`
- Uses Turborepo for build orchestration and Yarn Workspaces for dependency management

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

# Code Standards

## TypeScript

- Avoid `any`, type casting, and `@ts-expect-error` annotations
- All headless client methods must have JSDoc comments
- Use `@rbac` tag for RBAC info: `@rbac action="create", resource="stytch.member"`

## Documentation

- **Required**: All headless client methods and exports must have JSDoc comments
- **Source of Truth**: JSDoc comments are the primary source for API documentation
- **Method Descriptions**: Based on JSDoc blocks corresponding to method signatures

## Comments

Only add comments when code is unintuitive, complex, or handles unusual business requirements. Avoid comments that repeat what code does or echo user prompts.

## Internationalization

Lingui is used for i18n. Run `yarn strings` to extract and compile message catalogs after modifying translatable strings.

# Testing

- Use existing fixtures in `testUtils.ts`, `internal/mocks`, and `__mock__` directories
- Use `msw` to mock network calls instead of mocking entire client calls
- Use `jest.spyOn` to mock specific functions rather than `jest.mock` for entire modules
- Follow this pattern for StytchClient mocks:

```ts
const client = {
  sso: {
    start: jest.fn().mockResolvedValue({}),
  },
} satisfies MockClient;

beforeEach(() => {
  jest.clearAllMocks();
});

// Override for specific test
client.sso.start.mockRejectedValue(new StytchAPIError({...}));
```
