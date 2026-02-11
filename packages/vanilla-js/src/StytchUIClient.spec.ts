import { StytchUIClient } from './StytchUIClient';

describe(StytchUIClient, () => {
  describe('Option parsing', () => {
    it('should error if keepSessionAlive options are invalid', () => {
      expect(
        () =>
          new StytchUIClient('public-token-test', {
            keepSessionAlive: 100,
          } as any),
      ).toThrowErrorMatchingInlineSnapshot(`
"Invalid call to StytchUIClient
keepSessionAlive must be a boolean."
`);
    });

    it('should error if cookie options are invalid', () => {
      expect(
        () =>
          new StytchUIClient('public-token-test', {
            cookieOptions: {
              opaqueTokenCookieName: 12,
              jwtCookieName: false,
              availableToSubdomains: {},
            } as any,
          }),
      ).toThrowErrorMatchingInlineSnapshot(`
"Invalid call to StytchUIClient
cookieOptions.opaqueTokenCookieName must be a string."
`);
    });
  });
});
