---
description: Project overview and structure
globs: ['**/*']
alwaysApply: true
---

# Stytch JavaScript SDK Monorepo

This is a monorepo containing Stytch JavaScript SDKs for various platforms and demo applications.

## Project Structure

### Core SDK Packages (in `packages/`)

Stytch has two main set of authentication API, B2C and B2B. Code in these packages are split between them - usually exports from the root index file are B2C while B2B code and components are exported via `/b2b`. In addition, most libraries have separate headless and UI component exports.

- **`web`** - Core JavaScript SDK for frontend projects with stateful headless client and Preact-based UI components.
- **`react-native`** - React Native SDK with headless client and prebuilt UI.
  A lot of code in this package are copied from vanilla-js. When editing files in both packages MAKE SURE you are editing the correct version of the file since many files will have the same name but slightly different function or logic to accommodate the specific platform.

The following packages are wrappers around `web`

- **`vanilla-js`** - Framework-less, custom element based bindings
- **`react`** - React-specific bindings (client-side only)
- **`nextjs`** - Next.js bindings with SSR support

### Helper Packages (in `packages/`)

- **`core`** - Constants, types, business logic, session management, PKCE, and Subscription Service. `core/public` forms part of the public interface, while `core` code not exported through `public` are internal to Stytch.
- **`js-utils`** - Utility functions bundled into other packages (not published to npm)

### Demo Applications (in `apps/`)

Demo applications only need to be updated when significant new functionality (such as a new auth method) is added.

- **`react-demo`** - React consumer demo app
- **`react-b2b-demo`** - React B2B demo app
- **`other-framework-demo`** -
- **`next-demo`** - Next.js demo app
- **`passkey-demo`** - Passkey-specific demo
- **`react-native-demo`** - React Native demo app
- **`react-native-b2b-demo`** - React Native B2B demo app

### Services (in `services/`)

- **`clientside-services`** - Static files loaded from Stytch servers (Google One Tap, phone formatting)
- **`e2e-tests`** - End-to-end tests using Cypress

### Internal Packages (in `internal/`)

- **`test-utils`** - Testing utilities
- **`mocks`** - Mock data for testing
- **`build-config`** - Shared build configuration
- **`demo-utils`** - Shared code between demo apps

## Important Notes

- All commands should be run from the repository root unless specified otherwise
- The project uses Yarn instead of npm
- JSDoc comments are used for documentation and are the source of truth for API documentation
