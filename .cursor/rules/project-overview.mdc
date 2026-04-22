---
description: Project overview and structure
globs: ['**/*']
alwaysApply: true
---

# Stytch JavaScript SDK Monorepo

This is a monorepo for Stytch JavaScript SDKs. The codebase is split between B2C and B2B authentication APIs, with separate headless clients and UI component exports.

## Package Hierarchy

**Core SDK Package:**

- `@stytch/web` - Contains all core functionality: headless client, UI components built with Preact, and React bindings. Everything in vanilla-js, react, and nextjs wraps or re-exports from this package. Not published directly.

**Published Wrapper Packages:**

- `@stytch/vanilla-js` - Framework-agnostic bindings using custom elements. Re-exports from `@stytch/web`.
- `@stytch/react` - React-specific bindings (client-side only). Re-exports from `@stytch/web` and adds React Context/hooks.
- `@stytch/nextjs` - Next.js bindings with SSR support. Re-exports from `@stytch/web`.

**Helper Packages:**

- `@stytch/core` - Business logic, session management, PKCE, Subscription Service. Exports:
  - `@stytch/core/public` - Public API (types, constants)
  - `@stytch/core` - Internal implementation consumed by web
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
  core/           # Business logic and session management
  js-utils/       # Utility functions (bundled, not published)
apps/             # Demo applications
  react-demo/
  react-b2b-demo/
  next-demo/
  passkey-demo/
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
