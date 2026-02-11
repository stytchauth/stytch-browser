---
description: Code standards and formatting
globs: ['**/*.{ts,tsx,js,jsx,json}']
alwaysApply: true
---

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
