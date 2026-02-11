---
description: Code standards for tests
globs: ['**/*.{spec,test}.{ts,tsx,js,jsx,json}']
alwaysApply: true
---

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
