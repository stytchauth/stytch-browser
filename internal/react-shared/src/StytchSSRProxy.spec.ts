import { expectToThrow } from '@stytch/internal-test-utils';
import { createStytchSSRProxy, isStytchSSRProxy } from './StytchSSRProxy';
import { cannotInvokeMethodOnServerError } from './utils/errors';

describe('StytchSSRProxy', () => {
  it('Throws an error when a user attempts to invoke any Stytch API methods on the serverside', () => {
    const proxy = createStytchSSRProxy();
    expectToThrow(
      () => proxy.magicLinks.authenticate('foo'),
      cannotInvokeMethodOnServerError('stytch.magicLinks.authenticate'),
    );
  });

  it('Can be identified as a proxy', () => {
    const proxy = createStytchSSRProxy();
    expect(isStytchSSRProxy(proxy)).toBe(true);
    expect(isStytchSSRProxy({})).toBe(false);
  });
});
