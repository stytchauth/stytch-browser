import { StytchClientOptions } from '@stytch/core/public';

import { StytchClient } from './StytchClient';

describe(StytchClient, () => {
  describe('Option parsing', () => {
    it('should error if keepSessionAlive options are invalid', () => {
      expect(
        () =>
          new StytchClient('public-token-test', {
            // @ts-expect-error
            keepSessionAlive: 100,
          }),
      ).toThrowErrorMatchingInlineSnapshot(`
       "Invalid call to StytchClient
       keepSessionAlive must be a boolean."
      `);
    });

    it('should error if cookie options are invalid', () => {
      const options: StytchClientOptions = {
        cookieOptions: {
          // @ts-expect-error
          opaqueTokenCookieName: 12,
          // @ts-expect-error
          jwtCookieName: false,
          // @ts-expect-error
          availableToSubdomains: {},
        },
      };

      expect(() => new StytchClient('public-token-test', options)).toThrow(AggregateError);
      try {
        new StytchClient('public-token-test', options);
      } catch (e) {
        // Unfortunately there's no way to customize how to map error to snapshot in toThrowErrorMatchingInlineSnapshot()
        // eslint-disable-next-line jest/no-conditional-expect
        expect((e as AggregateError).errors.map((e) => e.message)).toMatchInlineSnapshot(`
         [
           "Invalid call to StytchClient.cookieOptions
         opaqueTokenCookieName must be a string.",
           "Invalid call to StytchClient.cookieOptions
         jwtCookieName must be a string.",
         ]
        `);
      }
    });
  });
});
