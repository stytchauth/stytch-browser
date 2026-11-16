import { SessionManager } from '@stytch/core';
import { StytchClientOptions } from '@stytch/core/public';
import Cookies from 'js-cookie';

import { StytchB2BClient } from './b2b/StytchB2BClient';
import { StytchClient } from './StytchClient';

const publicToken = 'public-token-test-123';
const customBaseUrl = 'https://auth.example.com';

const clients = [
  ['StytchClient', (options: StytchClientOptions) => new StytchClient(publicToken, options)],
  ['StytchB2BClient', (options: StytchClientOptions) => new StytchB2BClient(publicToken, options)],
] as const;

describe.each(clients)('%s startup session refresh', (_name, createClient) => {
  let refresh: jest.SpyInstance;

  beforeEach(() => {
    window.localStorage.clear();
    Cookies.remove('stytch_session');
    Cookies.remove('stytch_session_jwt');
    refresh = jest.spyOn(SessionManager.prototype, 'performBackgroundRefresh').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Cookies.remove('stytch_session');
    Cookies.remove('stytch_session_jwt');
  });

  it('refreshes with a custom endpoint and no session cookie by default', () => {
    createClient({ customBaseUrl });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not refresh with a custom endpoint, no session cookie, and usesHttpOnlyCookies false', () => {
    createClient({ customBaseUrl, cookieOptions: { usesHttpOnlyCookies: false } });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('refreshes with a custom endpoint, a session cookie, and usesHttpOnlyCookies false', () => {
    Cookies.set('stytch_session', 'session-token');
    createClient({ customBaseUrl, cookieOptions: { usesHttpOnlyCookies: false } });
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
