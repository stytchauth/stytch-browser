import { StytchProjectConfigurationInput } from '@stytch/core/public';
import { MOCK_AUTHENTICATE_PAYLOAD } from '@stytch/internal-mocks';
import Cookies, { CookieAttributes } from 'js-cookie';
import {
  __clearConsumerDataLayerCache,
  getConsumerDataLayer,
  ConsumerSubscriptionDataLayer,
  ConsumerSubscriptionService,
  BaseSubscriptionService,
  B2BSubscriptionDataLayer,
  B2BSubscriptionService,
  getB2BDataLayer,
} from './SubscriptionService';

const STYTCH_SESSION_COOKIE = 'stytch_session';
const STYTCH_SESSION_JWT_COOKIE = 'stytch_session_jwt';
const STYTCH_INTERMEDIATE_SESSION_TOKEN_COOKIE = 'stytch_intermediate_session_token';

const publicToken = 'public-token-test-123';
const localStorageKey = 'stytch_sdk_state_public-token-test-123';

const generateStateDiff = (n: number): any => ({
  state: {
    user: { user: 'MOCK-USER-' + n },
    session: { session: 'MOCK-SESSION-' + n },
  },
  session_token: 'MOCK_SESS_TOKEN_' + n,
  session_jwt: 'MOCK_SESS_JWT_' + n,
});

const {
  state: { user: MOCK_USER, session: MOCK_SESSION },
  session_token: MOCK_SESSION_TOKEN,
  session_jwt: MOCK_SESSION_JWT,
} = generateStateDiff(0);
const MOCK_INTERMEDIATE_SESSION_TOKEN = 'MOCK_INTERMEDIATE_SESSION_TOKEN';
const COOKIE_OPTS: CookieAttributes = { sameSite: 'lax', secure: false };

const setValidDataInLocalStorage = ({
  session = MOCK_SESSION,
  user = MOCK_USER,
}: {
  session?: unknown;
  user?: unknown;
} = {}) => window.localStorage.setItem(localStorageKey, JSON.stringify({ session, user }));

const setCookies = () => {
  Cookies.set(STYTCH_SESSION_COOKIE, MOCK_SESSION_TOKEN, COOKIE_OPTS);
  Cookies.set(STYTCH_SESSION_JWT_COOKIE, MOCK_SESSION_JWT, COOKIE_OPTS);
};
const setISTCookie = () => {
  Cookies.set(STYTCH_INTERMEDIATE_SESSION_TOKEN_COOKIE, MOCK_INTERMEDIATE_SESSION_TOKEN, COOKIE_OPTS);
};
const clearCookies = () => {
  Cookies.remove(STYTCH_SESSION_COOKIE, COOKIE_OPTS);
  Cookies.remove(STYTCH_SESSION_JWT_COOKIE, COOKIE_OPTS);
  Cookies.remove(STYTCH_INTERMEDIATE_SESSION_TOKEN_COOKIE, COOKIE_OPTS);
};

describe('SubscriptionDataLayer', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearCookies();
  });

  it('Sets session and user to null when they do not exist in localStorage', () => {
    const dataLayer = new ConsumerSubscriptionDataLayer(publicToken);
    expect(dataLayer.state?.user).toEqual(undefined);
    expect(dataLayer.state?.session).toEqual(undefined);
  });

  it('Sets session and user to null when invalid data exists in localStorage', () => {
    window.localStorage.setItem(localStorageKey, 'IM NOT VALID LOOK AT ME');
    const dataLayer = new ConsumerSubscriptionDataLayer(publicToken);
    expect(dataLayer.state?.user).toEqual(undefined);
    expect(dataLayer.state?.session).toEqual(undefined);
    expect(window.localStorage.getItem(localStorageKey)).toEqual('null');
  });

  it('Retrieves session and user from localStorage when they exist, and preserves saved cookies', () => {
    setValidDataInLocalStorage();
    const dataLayer = new ConsumerSubscriptionDataLayer(publicToken);
    expect(dataLayer.state?.user).toEqual(MOCK_USER);
    expect(dataLayer.state?.session).toEqual(MOCK_SESSION);
  });

  it('Does not clear existing cookies if info does not exist in localStorage', () => {
    setCookies();
    const dataLayer = new ConsumerSubscriptionDataLayer(publicToken);
    expect(dataLayer.readSessionCookie()).toEqual({
      session_token: MOCK_SESSION_TOKEN,
      session_jwt: MOCK_SESSION_JWT,
    });
  });

  it('Preserves existing cookies if localStorage is valid', () => {
    setCookies();
    setValidDataInLocalStorage();
    const dataLayer = new ConsumerSubscriptionDataLayer(publicToken);
    expect(dataLayer.readSessionCookie()).toEqual({
      session_token: MOCK_SESSION_TOKEN,
      session_jwt: MOCK_SESSION_JWT,
    });
  });

  it('Can override cookie names to use custom values', () => {
    Cookies.set('some_other_name', MOCK_SESSION_TOKEN, COOKIE_OPTS);
    Cookies.set('some_jwt_name', MOCK_SESSION_JWT, COOKIE_OPTS);
    Cookies.set('some_ist_name', MOCK_INTERMEDIATE_SESSION_TOKEN, COOKIE_OPTS);
    setValidDataInLocalStorage();
    const dataLayer = new ConsumerSubscriptionDataLayer(publicToken, {
      cookieOptions: {
        opaqueTokenCookieName: 'some_other_name',
        jwtCookieName: 'some_jwt_name',
        istCookieName: 'some_ist_name',
      },
    });
    expect(dataLayer.readSessionCookie()).toEqual({
      session_token: MOCK_SESSION_TOKEN,
      session_jwt: MOCK_SESSION_JWT,
    });
    expect(dataLayer.readIntermediateSessionTokenCookie()).toEqual(MOCK_INTERMEDIATE_SESSION_TOKEN);
  });

  describe('generateCookieOpts', () => {
    const expectedDate = new Date(0);
    beforeEach(() => {
      jsdom.reconfigure({
        url: 'http://localhost:3000/',
      });
    });

    it('sets secure: false and does not set a domain when on localhost', () => {
      expect(
        ConsumerSubscriptionDataLayer.generateCookieOpts({
          expiresAt: expectedDate.toString(),
          availableToSubdomains: false,
          path: null,
          domain: null,
        }),
      ).toEqual({
        expires: expectedDate,
        sameSite: 'lax',
        secure: false,
      });
    });

    it('sets secure: true and an explicit domain on non-localhost when cookie is available to subdomains', () => {
      jsdom.reconfigure({
        url: 'https://example.com/',
      });
      expect(
        ConsumerSubscriptionDataLayer.generateCookieOpts({
          expiresAt: expectedDate.toString(),
          availableToSubdomains: true,
          path: null,
          domain: null,
        }),
      ).toEqual({
        expires: expectedDate,
        sameSite: 'lax',
        secure: true,
        domain: 'example.com',
      });
    });

    it('sets secure: true and an explicit domain on non-localhost when cookie is available to subdomains and a particular domain is requested', () => {
      jsdom.reconfigure({
        url: 'https://auth.at.example.com/',
      });
      expect(
        ConsumerSubscriptionDataLayer.generateCookieOpts({
          expiresAt: expectedDate.toString(),
          availableToSubdomains: true,
          path: null,
          domain: 'example.com',
        }),
      ).toEqual({
        expires: expectedDate,
        sameSite: 'lax',
        secure: true,
        domain: 'example.com',
      });
    });

    it('does not set an explicit domain on non-localhost when cookie is not available to subdomains', () => {
      jsdom.reconfigure({
        url: 'https://example.com/',
      });
      expect(
        ConsumerSubscriptionDataLayer.generateCookieOpts({
          expiresAt: expectedDate.toString(),
          availableToSubdomains: false,
          path: null,
          domain: null,
        }),
      ).toEqual({
        expires: expectedDate,
        sameSite: 'lax',
        secure: true,
      });
    });

    it('does not set an explicit domain on non-localhost when cookie is not available to subdomains - even when a domain is set', () => {
      jsdom.reconfigure({
        url: 'https://auth.at.example.com/',
      });
      expect(
        ConsumerSubscriptionDataLayer.generateCookieOpts({
          expiresAt: expectedDate.toString(),
          availableToSubdomains: false,
          path: null,
          domain: 'example.com',
        }),
      ).toEqual({
        expires: expectedDate,
        sameSite: 'lax',
        secure: true,
      });
    });

    it('Passes path param through when provided', () => {
      jsdom.reconfigure({
        url: 'https://example.com/',
      });
      expect(
        ConsumerSubscriptionDataLayer.generateCookieOpts({
          expiresAt: expectedDate.toString(),
          availableToSubdomains: false,
          path: '/my/path',
          domain: null,
        }),
      ).toEqual({
        expires: expectedDate,
        sameSite: 'lax',
        secure: true,
        path: '/my/path',
      });
    });
  });

  describe('seen domain tracking', () => {
    let dataLayer: ConsumerSubscriptionDataLayer;

    beforeEach(() => {
      dataLayer = new ConsumerSubscriptionDataLayer(publicToken);
    });

    it('tracks domains when writing session cookies and uses them when removing cookies', () => {
      // Mock Cookies.remove to track cookie operations
      const cookieRemoveSpy = jest.spyOn(Cookies, 'remove');

      // Configure for a non-localhost domain with subdomains enabled
      jsdom.reconfigure({
        url: 'https://app.example.com/',
      });

      const dataLayerWithDomain = new ConsumerSubscriptionDataLayer(publicToken, {
        cookieOptions: {
          availableToSubdomains: true,
          domain: 'example.com',
        },
      });
      const setItemSpyWithDomain = jest.spyOn(dataLayerWithDomain, 'setItem');
      const getItemSpyWithDomain = jest.spyOn(dataLayerWithDomain, 'getItem');

      // Write a session cookie - this should track the domain
      dataLayerWithDomain.writeSessionCookie({
        state: { user: MOCK_USER, session: MOCK_SESSION },
        session_token: MOCK_SESSION_TOKEN,
        session_jwt: MOCK_SESSION_JWT,
        intermediate_session_token: null,
      });

      // Verify that the domain was stored
      expect(setItemSpyWithDomain).toHaveBeenCalledWith('seen_domains', JSON.stringify(['example.com']));

      // Mock the stored domains for removal test
      getItemSpyWithDomain.mockReturnValue(JSON.stringify(['example.com', 'old.example.com']));

      // Remove cookies - this should use all tracked domains
      dataLayerWithDomain.removeCookies([STYTCH_SESSION_COOKIE, STYTCH_SESSION_JWT_COOKIE]);

      // Verify that getItem was called to retrieve stored domains
      expect(getItemSpyWithDomain).toHaveBeenCalledWith('seen_domains');

      // Verify that cookie removal was attempted for all domains
      // The method tries various combinations, so we just check that it was called
      // with different domain configurations
      expect(cookieRemoveSpy).toHaveBeenCalled();

      // Check that removal was attempted with tracked domains
      const removeCalls = cookieRemoveSpy.mock.calls;
      const domainsUsedInRemoval = removeCalls.map((call) => call[1]?.domain).filter((domain) => domain !== undefined);

      expect(domainsUsedInRemoval).toContain('example.com');
      expect(domainsUsedInRemoval).toContain('old.example.com');
    });

    it('handles malformed domain storage gracefully', () => {
      const getItemSpy = jest.spyOn(dataLayer, 'getItem');
      const cookieRemoveSpy = jest.spyOn(Cookies, 'remove');

      // Mock malformed domain storage
      getItemSpy.mockReturnValue('invalid-json');

      // Remove cookies with malformed storage
      dataLayer.removeCookies([STYTCH_SESSION_COOKIE]);

      // Verify that it handles the error gracefully
      expect(getItemSpy).toHaveBeenCalledWith('seen_domains');
      expect(cookieRemoveSpy).toHaveBeenCalled();
    });
  });
});

describe(ConsumerSubscriptionService, () => {
  let ss: ConsumerSubscriptionService<StytchProjectConfigurationInput>;
  let dataLayer: ConsumerSubscriptionDataLayer;

  const createSubscriptionService = (usingCustomApiEndpoint = false) => {
    dataLayer = getConsumerDataLayer(publicToken);
    return new ConsumerSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint });
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
    clearCookies();
    __clearConsumerDataLayerCache();
  });
  afterEach(() => {
    ss?.destroy();
  });

  describe('initialization', () => {
    it('When no cookie is saved with standard endpoint, destroys the saved data', () => {
      setValidDataInLocalStorage();
      ss = createSubscriptionService(false);
      expect(ss.getState()).toBe(null);
    });

    it('When no cookie is saved with custom endpoint, preserves the saved data', () => {
      setValidDataInLocalStorage();
      ss = createSubscriptionService(true);
      expect(ss.getState()).toEqual({ user: MOCK_USER, session: MOCK_SESSION });
    });
  });

  it('Can retrieve the user and session', () => {
    setValidDataInLocalStorage();
    setCookies();
    ss = createSubscriptionService();
    expect(ss.getState()).toEqual({ user: MOCK_USER, session: MOCK_SESSION });
  });

  it('Subscribers are notified when data changes', () => {
    const sub = jest.fn();
    ss = createSubscriptionService();
    const unsub = ss.subscribeToState(sub);
    const diff2 = generateStateDiff(2);
    ss.updateStateAndTokens(diff2);

    expect(sub).toHaveBeenCalledWith({ session: diff2.state.session, user: diff2.state.user });

    unsub();

    const diff3 = generateStateDiff(3);
    ss.updateStateAndTokens(diff3);

    expect(sub).not.toHaveBeenCalledWith({ session: diff3.state.session, user: diff3.state.user });
  });

  it('Subscribers are notified when initial cache update completes and data does not change', () => {
    setValidDataInLocalStorage();
    setCookies();
    ss = createSubscriptionService();
    const sub = jest.fn();
    ss.subscribeToState(sub);

    expect(ss.getState()).toStrictEqual({ user: MOCK_USER, session: MOCK_SESSION });
    expect(ss.getFromCache()).toBe(true);

    const diff0 = generateStateDiff(0);
    ss.updateStateAndTokens(diff0);

    expect(ss.getFromCache()).toBe(false);
    expect(sub).toHaveBeenCalledWith({ session: diff0.state.session, user: diff0.state.user });
  });

  it('Subscribers are not notified after initial cache update when data does not change', () => {
    setValidDataInLocalStorage();
    setCookies();
    ss = createSubscriptionService();
    const diff0 = generateStateDiff(0);
    ss.updateStateAndTokens(diff0);

    expect(ss.getFromCache()).toBe(false);

    const sub = jest.fn();
    ss.subscribeToState(sub);
    ss.updateStateAndTokens(diff0);

    expect(ss.getFromCache()).toBe(false);
    expect(sub).not.toHaveBeenCalled();
  });

  it('Subscribers are notified when there is a stale cached session token that is destroyed', () => {
    setValidDataInLocalStorage();
    setCookies();
    ss = createSubscriptionService();
    const sub = jest.fn();
    ss.subscribeToState(sub);

    expect(ss.getFromCache()).toBe(true);

    ss.destroySession();

    expect(ss.getFromCache()).toBe(false);
    expect(sub).toHaveBeenCalledWith(null);
  });

  it('fromCache is initialized to false when there is no session token', () => {
    ss = createSubscriptionService();
    expect(ss.getFromCache()).toBe(false);
  });

  describe('cross-tab sync', () => {
    it('Listens to changes in localStorage from other tabs and refreshes state', () => {
      const subscriber = jest.fn();
      const dataLayer = getConsumerDataLayer(publicToken);
      const ss = new ConsumerSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      jest.spyOn(dataLayer, 'syncToLocalStorage');
      ss.subscribeToState(subscriber);
      expect(ss.getState()).toEqual(null);

      const evt = new StorageEvent('storage', {
        key: localStorageKey,
        newValue: JSON.stringify({
          session: MOCK_SESSION,
          user: MOCK_USER,
        }),
      });
      window.dispatchEvent(evt);

      expect(ss.getState()).toEqual({ user: MOCK_USER, session: MOCK_SESSION });
      expect(subscriber).toHaveBeenCalledWith({ user: MOCK_USER, session: MOCK_SESSION });
      expect(dataLayer.syncToLocalStorage).not.toHaveBeenCalled();
    });

    it('Notifies subscribers but does not sync to local storage when the cache is initially refreshed but the value has not changed', () => {
      setCookies();
      setValidDataInLocalStorage();
      const subscriber = jest.fn();
      const dataLayer = getConsumerDataLayer(publicToken);
      const ss = new ConsumerSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      jest.spyOn(dataLayer, 'syncToLocalStorage');
      ss.subscribeToState(subscriber);
      expect(ss.getState()).toEqual({ user: MOCK_USER, session: MOCK_SESSION });

      const evt = new StorageEvent('storage', {
        key: localStorageKey,
        newValue: JSON.stringify({
          session: MOCK_SESSION,
          user: MOCK_USER,
        }),
      });
      window.dispatchEvent(evt);

      expect(ss.getState()).toEqual({
        session: MOCK_SESSION,
        user: MOCK_USER,
      });
      expect(subscriber).toHaveBeenCalledWith({ session: MOCK_SESSION, user: MOCK_USER });
      expect(dataLayer.syncToLocalStorage).not.toHaveBeenCalled();
    });

    it('Does not notify subscribers and does not sync to local storage when the value has not changed and the cache has already been refreshed', () => {
      setCookies();
      setValidDataInLocalStorage();
      const subscriber = jest.fn();
      const dataLayer = getConsumerDataLayer(publicToken);
      const ss = new ConsumerSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      ss.updateStateAndTokens(generateStateDiff(0));
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      jest.spyOn(dataLayer, 'syncToLocalStorage');
      ss.subscribeToState(subscriber);
      expect(ss.getState()).toEqual({ user: MOCK_USER, session: MOCK_SESSION });

      const evt = new StorageEvent('storage', {
        key: localStorageKey,
        newValue: JSON.stringify({
          session: MOCK_SESSION,
          user: MOCK_USER,
        }),
      });
      window.dispatchEvent(evt);

      expect(ss.getState()).toEqual({
        session: MOCK_SESSION,
        user: MOCK_USER,
      });
      expect(subscriber).not.toHaveBeenCalled();
      expect(dataLayer.syncToLocalStorage).not.toHaveBeenCalled();
    });

    it('Updates local state when a null storage event is fired', () => {
      setCookies();
      setValidDataInLocalStorage();
      const subscriber = jest.fn();
      const dataLayer = getConsumerDataLayer(publicToken);
      const ss = new ConsumerSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      jest.spyOn(dataLayer, 'syncToLocalStorage');
      jest.spyOn(ss, 'updateState');
      ss.subscribeToState(subscriber);
      expect(ss.getState()).toEqual({ user: MOCK_USER, session: MOCK_SESSION });

      const evt = new StorageEvent('storage', {
        key: localStorageKey,
        newValue: JSON.stringify(null),
      });
      window.dispatchEvent(evt);

      expect(ss.getState()).toEqual(null);
      expect(subscriber).toHaveBeenCalled();
      expect(ss.updateState).toHaveBeenCalled();
      expect(ss.updateState).toHaveBeenCalledWith(null, true);
      expect(dataLayer.syncToLocalStorage).not.toHaveBeenCalled();
    });
  });

  describe('Multiple instances on the same page', () => {
    let ss1: ConsumerSubscriptionService<StytchProjectConfigurationInput>;
    let ss2: ConsumerSubscriptionService<StytchProjectConfigurationInput>;
    beforeEach(() => {
      setCookies();
      setValidDataInLocalStorage();
      const dataLayer = getConsumerDataLayer(publicToken);
      ss1 = new ConsumerSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      ss2 = new ConsumerSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
    });
    afterEach(() => {
      ss1?.destroy();
      ss2?.destroy();
    });

    it('access the same SubscriptionDataLayer from the cache and stay in sync', () => {
      expect(ss1.getState()).toEqual({ user: MOCK_USER, session: MOCK_SESSION });
      expect(ss1.getState()).toEqual(ss2.getState());

      ss1.destroyState();
      expect(ss1.getState()).toEqual(null);
      expect(ss1.getState()).toEqual(ss2.getState());
    });

    it('Subscribers are called regardless of where they first subscribed', () => {
      const ss1Sub = jest.fn();
      ss1.subscribeToState(ss1Sub);
      const ss2Sub = jest.fn();
      ss2.subscribeToState(ss2Sub);

      const diff = generateStateDiff(2);

      ss1.updateStateAndTokens(diff);

      expect(ss1Sub).toHaveBeenCalledWith({ session: diff.state.session, user: diff.state.user });
      expect(ss2Sub).toHaveBeenCalledWith({ session: diff.state.session, user: diff.state.user });
    });
  });

  describe('updateStateAndTokens', () => {
    it('when called with an IST, sets the IST cookie and removes the session cookies', () => {
      ss = createSubscriptionService();
      const dataLayer = getConsumerDataLayer(publicToken);
      ss.updateTokens({ session_token: MOCK_SESSION_TOKEN, session_jwt: MOCK_SESSION_JWT });
      expect(dataLayer.readSessionCookie()).toEqual({
        session_token: MOCK_SESSION_TOKEN,
        session_jwt: MOCK_SESSION_JWT,
      });
      expect(dataLayer.readIntermediateSessionTokenCookie()).toEqual(undefined);

      ss.updateStateAndTokens({
        state: null,
        session_token: null,
        session_jwt: null,
        intermediate_session_token: MOCK_INTERMEDIATE_SESSION_TOKEN,
      });
      expect(ss.getTokens()).toEqual(null);
      expect(dataLayer.readSessionCookie()).toEqual({ session_token: undefined, session_jwt: undefined });
      expect(dataLayer.readIntermediateSessionTokenCookie()).toEqual(MOCK_INTERMEDIATE_SESSION_TOKEN);
    });
    it('when called with a session token, sets the session cookies and removes the IST cookie', () => {
      ss = createSubscriptionService();
      const dataLayer = getConsumerDataLayer(publicToken);
      setISTCookie();
      expect(dataLayer.readIntermediateSessionTokenCookie()).toEqual(MOCK_INTERMEDIATE_SESSION_TOKEN);

      const diff = generateStateDiff(1);
      ss.updateStateAndTokens(diff);
      expect(ss.getTokens()).toEqual({ session_token: diff.session_token, session_jwt: diff.session_jwt });
      expect(dataLayer.readSessionCookie()).toEqual({
        session_token: diff.session_token,
        session_jwt: diff.session_jwt,
      });
      expect(dataLayer.readIntermediateSessionTokenCookie()).toEqual(undefined);
    });
    it('when called with an opaque session token, clears residual cookies', () => {
      ss = createSubscriptionService();
      const dataLayer = getConsumerDataLayer(publicToken);
      ss.updateTokens({ session_token: MOCK_SESSION_TOKEN, session_jwt: MOCK_SESSION_JWT });
      expect(dataLayer.readSessionCookie()).toEqual({
        session_token: MOCK_SESSION_TOKEN,
        session_jwt: MOCK_SESSION_JWT,
      });
      expect(dataLayer.readIntermediateSessionTokenCookie()).toEqual(undefined);

      ss.updateStateAndTokens({
        state: null,
        session_token: true,
        session_jwt: true,
        intermediate_session_token: null,
      });
      expect(ss.getTokens()).toEqual(null);
      expect(dataLayer.readSessionCookie()).toEqual({ session_token: undefined, session_jwt: undefined });
      expect(dataLayer.readIntermediateSessionTokenCookie()).toEqual(undefined);
    });
    it('when called with an opaque IST, clears residual cookies', () => {
      ss = createSubscriptionService();
      const dataLayer = getConsumerDataLayer(publicToken);
      setISTCookie();
      expect(dataLayer.readIntermediateSessionTokenCookie()).toEqual(MOCK_INTERMEDIATE_SESSION_TOKEN);

      ss.updateStateAndTokens({
        state: null,
        session_token: null,
        session_jwt: null,
        intermediate_session_token: true,
      });
      expect(ss.getTokens()).toEqual(null);
      expect(dataLayer.readSessionCookie()).toEqual({ session_token: undefined, session_jwt: undefined });
      expect(dataLayer.readIntermediateSessionTokenCookie()).toEqual(undefined);
    });
  });

  describe('updateTokens', () => {
    const createSubscriptionService = () => {
      dataLayer = getConsumerDataLayer(publicToken);
      return new BaseSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
    };

    describe('when given null session_token or session_jwt', () => {
      it('removes the session cookie', () => {
        const ss = createSubscriptionService();
        const readSpy = jest
          .spyOn(dataLayer, 'readSessionCookie')
          .mockReturnValueOnce({ session_token: 'existing-session-token', session_jwt: 'existing-session-jwt' });
        const removeSpy = jest.spyOn(dataLayer, 'removeSessionCookie').mockImplementationOnce(jest.fn());
        const removeISTSpy = jest.spyOn(dataLayer, 'removeISTCookie').mockImplementationOnce(jest.fn());
        // @ts-expect-error
        ss.updateTokens({ session_token: null, session_jwt: null });
        expect(readSpy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalled();
        expect(removeISTSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('when given a session_token and session_jwt', () => {
      it('writes the session cookie and removes the IST', () => {
        const ss = createSubscriptionService();
        const readSpy = jest
          .spyOn(dataLayer, 'readSessionCookie')
          .mockReturnValueOnce({ session_token: undefined, session_jwt: undefined });
        const writeSpy = jest.spyOn(dataLayer, 'writeSessionCookie').mockImplementationOnce(jest.fn());
        const removeSpy = jest.spyOn(dataLayer, 'removeSessionCookie').mockImplementationOnce(jest.fn());
        const removeISTSpy = jest.spyOn(dataLayer, 'removeISTCookie').mockImplementationOnce(jest.fn());
        ss.updateTokens({ session_token: 'new-session-token', session_jwt: 'new-session-jwt' });
        expect(readSpy).toHaveBeenCalled();
        expect(writeSpy).toHaveBeenCalledWith({ session_token: 'new-session-token', session_jwt: 'new-session-jwt' });
        expect(removeSpy).toHaveBeenCalledTimes(0);
        expect(removeISTSpy).toHaveBeenCalled();
      });
    });

    describe('when given a session_token and no session_jwt', () => {
      it('writes the session cookie', () => {
        const ss = createSubscriptionService();
        const readSpy = jest
          .spyOn(dataLayer, 'readSessionCookie')
          .mockReturnValueOnce({ session_token: undefined, session_jwt: undefined });
        const writeSpy = jest.spyOn(dataLayer, 'writeSessionCookie').mockImplementationOnce(jest.fn());
        const removeSpy = jest.spyOn(dataLayer, 'removeSessionCookie').mockImplementationOnce(jest.fn());
        const removeISTSpy = jest.spyOn(dataLayer, 'removeISTCookie').mockImplementationOnce(jest.fn());
        ss.updateTokens({ session_token: 'new-session-token', session_jwt: '' });
        expect(readSpy).toHaveBeenCalled();
        expect(writeSpy).toHaveBeenCalledWith({ session_token: 'new-session-token', session_jwt: '' });
        expect(removeSpy).toHaveBeenCalledTimes(0);
        expect(removeISTSpy).toHaveBeenCalled();
      });
    });

    describe('when given no session_token and a session_jwt', () => {
      it('writes the session cookie', () => {
        const ss = createSubscriptionService();
        const readSpy = jest
          .spyOn(dataLayer, 'readSessionCookie')
          .mockReturnValueOnce({ session_token: undefined, session_jwt: undefined });
        const writeSpy = jest.spyOn(dataLayer, 'writeSessionCookie').mockImplementationOnce(jest.fn());
        const removeSpy = jest.spyOn(dataLayer, 'removeSessionCookie').mockImplementationOnce(jest.fn());
        const removeISTSpy = jest.spyOn(dataLayer, 'removeISTCookie').mockImplementationOnce(jest.fn());
        ss.updateTokens({ session_token: '', session_jwt: 'new-session-jwt' });
        expect(readSpy).toHaveBeenCalled();
        expect(writeSpy).toHaveBeenCalledWith({ session_token: '', session_jwt: 'new-session-jwt' });
        expect(removeSpy).toHaveBeenCalledTimes(0);
        expect(removeISTSpy).toHaveBeenCalled();
      });
    });
  });

  describe('withUpdateSession', () => {
    beforeEach(() => {
      ss = createSubscriptionService();
    });

    it('should pass through response', async () => {
      const authenticate = jest.fn().mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      const updateSessionSpy = jest.spyOn(ss, 'updateSession');
      const wrapped = ss.withUpdateSession(authenticate);

      await wrapped();

      expect(authenticate).toHaveBeenCalled();
      expect(updateSessionSpy).toHaveBeenCalledWith(MOCK_AUTHENTICATE_PAYLOAD, {});
    });

    it('should pass through session duration', async () => {
      const authenticate = jest.fn().mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      const updateSessionSpy = jest.spyOn(ss, 'updateSession');
      const wrapped = ss.withUpdateSession(authenticate);

      await wrapped('token', 'stuff', {
        session_duration_minutes: 30,
        ignore_this_property: 'asdf',
      });

      expect(authenticate).toHaveBeenCalledWith('token', 'stuff', {
        session_duration_minutes: 30,
        ignore_this_property: 'asdf',
      });

      expect(updateSessionSpy).toHaveBeenCalledWith(MOCK_AUTHENTICATE_PAYLOAD, {
        sessionDurationMinutes: 30,
      });
    });
  });
});

describe(B2BSubscriptionService, () => {
  let ss: B2BSubscriptionService<StytchProjectConfigurationInput>;
  let dataLayer: B2BSubscriptionDataLayer;

  const createSubscriptionService = (usingCustomApiEndpoint = false) => {
    dataLayer = getB2BDataLayer(publicToken);
    return new B2BSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint });
  };

  describe('withUpdateSession', () => {
    beforeEach(() => {
      ss = createSubscriptionService();
    });

    it('should pass through response', async () => {
      const authenticate = jest.fn().mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      const updateSessionSpy = jest.spyOn(ss, 'updateSession');
      const wrapped = ss.withUpdateSession(authenticate);

      await wrapped({
        token: 'asdf',
      });

      expect(authenticate).toHaveBeenCalledWith({
        token: 'asdf',
      });
      expect(updateSessionSpy).toHaveBeenCalledWith(MOCK_AUTHENTICATE_PAYLOAD, {});
    });

    it('should pass through session duration', async () => {
      const authenticate = jest.fn().mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      const updateSessionSpy = jest.spyOn(ss, 'updateSession');
      const wrapped = ss.withUpdateSession(authenticate);

      await wrapped({
        session_duration_minutes: 30,
        ignore_this_property: 'asdf',
      });

      expect(authenticate).toHaveBeenCalledWith({
        session_duration_minutes: 30,
        ignore_this_property: 'asdf',
      });

      expect(updateSessionSpy).toHaveBeenCalledWith(MOCK_AUTHENTICATE_PAYLOAD, {
        sessionDurationMinutes: 30,
      });
    });
  });
});
