# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

# Code Standards and Formatting

## Language and TypeScript

- Primary Language: TypeScript for all packages
- Native Code: Kotlin, Swift, and Objective-C for React Native

## Code Quality Tools

- ESLint: Code quality and style enforcement
- Prettier: Code formatting
- Jest: Testing framework
- Storybook: UI preview and testing

## Coding standard

- Avoid type casting, `any` type and `@ts-expect-error` annotations
- Avoid comments that merely repeat what the code is doing. Only comment if the code is unintuitive, complex or exists to handle unusual business requirements. Do not add comments that repeats the user's prompt.

## Documentation Standards

### JSDoc Comments

- **Required**: All headless client methods and exports must have JSDoc comments
- **Source of Truth**: JSDoc comments are the primary source for API documentation
- **Method Descriptions**: Based on JSDoc blocks corresponding to method signatures

### RBAC Documentation

- Use `@rbac` tag for RBAC information
- Format: `@rbac action="action_name", resource="resource_name"`
- Example:
  ```ts
  /**
   * Method description...
   * @rbac action="create", resource="stytch.member"
   * ...
   */
  ```

## Code Organization

- Follow monorepo structure with packages in `packages/`
- Keep related functionality together

## Quality Checks

- Run `.cursor/checks.sh` after source code changes

## Testing Standards

- Prefer existing fixtures in `testUtils.ts`, `internal/mocks` and `__mock__` if available
- After adding tests, review test files for
  - No redundant tests
  - No placeholder comments for logic that has not yet been written
  - Test logic MUST match test description
- Mock as little as possible. Use msw to mock network calls instead of mocking out the entire client call, and use `jest.spyOn` to mock specific functions rather than mocking the entire module using `jest.mock`. For example:

  ```ts
  // BAD
  jest.mock('../utils/safeLocalStorage', {
    getItem: jest.fn(),
  });

  // GOOD
  const getItemSpy = jest.spyOn(safeLocalStorage, 'getItem');
  ```

- Use this pattern for defining StytchClient mocks

  ```ts
  const client = {
    sso: {
      start: jest.fn().mockResolvedValue({});
    },
  } satisfies MockClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call SSO start', async () => {
    // Run code that should trigger client.sso.start()
    expect(client.sso.start).toHaveBeenCalled();
  });

  it('should handle SSO error', async () => {
    // Mock behavior for this test specifically
    client.sso.mockRejectedValue(new StytchAPIError({ error_code: 'unknown_error' });
    await expect(action()).toBeRejectedWith(...);
  });
  ```