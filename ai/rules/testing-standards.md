---
description: Code standards for tests
globs: ['**/*.{spec,test}.{ts,tsx,js,jsx,json}']
alwaysApply: true
---

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
