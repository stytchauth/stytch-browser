import { StytchHeadlessClient } from './StytchHeadlessClient';

describe(StytchHeadlessClient, () => {
  describe('Option parsing', () => {
    it('should error if keepSessionAlive options are invalid', () => {
      expect(
        () =>
          new StytchHeadlessClient('public-token-test', {
            keepSessionAlive: 100,
          } as any),
      ).toThrowErrorMatchingInlineSnapshot(`
"Invalid call to StytchHeadlessClient
keepSessionAlive must be a boolean."
`);
    });

    it('should error if cookie options are invalid', () => {
      expect(
        () =>
          new StytchHeadlessClient('public-token-test', {
            cookieOptions: {
              opaqueTokenCookieName: 12,
              jwtCookieName: false,
              availableToSubdomains: {},
            } as any,
          }),
      ).toThrowErrorMatchingInlineSnapshot(`
"Invalid call to StytchHeadlessClient
cookieOptions.opaqueTokenCookieName must be a string."
`);
    });
  });
});
