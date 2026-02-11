import { StytchProjectConfigurationInput } from '@stytch/core/public';
import { B2BSubscriptionDataLayer } from '../SubscriptionService';
import { B2BSubscriptionService, __clearB2BDataLayerCache, getB2BDataLayer } from '../SubscriptionService';
import Cookies, { CookieAttributes } from 'js-cookie';

const STYTCH_SESSION_COOKIE = 'stytch_session';
const STYTCH_SESSION_JWT_COOKIE = 'stytch_session_jwt';

const publicToken = 'public-token-test-123';
const localStorageKey = 'stytch_sdk_state_public-token-test-123';

const generateStateDiff = (n: number): any => ({
  state: {
    member: { member: 'MOCK-MEMBER-' + n },
    session: { session: 'MOCK-MEMBER-SESSION-' + n },
  },
  session_token: 'MOCK_SESS_TOKEN_' + n,
  session_jwt: 'MOCK_SESS_JWT_' + n,
});

const {
  state: { member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION },
  session_token: MOCK_SESSION_TOKEN,
  session_jwt: MOCK_SESSION_JWT,
} = generateStateDiff(0);
const COOKIE_OPTS: CookieAttributes = { sameSite: 'lax', secure: false };

const setValidDataInLocalStorage = ({
  session = MOCK_MEMBER_SESSION,
  member = MOCK_MEMBER,
}: {
  session?: unknown;
  member?: unknown;
} = {}) => window.localStorage.setItem(localStorageKey, JSON.stringify({ session, member }));

const setCookies = () => {
  Cookies.set(STYTCH_SESSION_COOKIE, MOCK_SESSION_TOKEN, COOKIE_OPTS);
  Cookies.set(STYTCH_SESSION_JWT_COOKIE, MOCK_SESSION_JWT, COOKIE_OPTS);
};
const clearCookies = () => {
  Cookies.remove(STYTCH_SESSION_COOKIE, COOKIE_OPTS);
  Cookies.remove(STYTCH_SESSION_JWT_COOKIE, COOKIE_OPTS);
};

describe('B2BSubscriptionDataLayer', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearCookies();
  });

  it('Sets session and member to null when they do not exist in localStorage', () => {
    const dataLayer = new B2BSubscriptionDataLayer(publicToken);
    expect(dataLayer.state?.member).toEqual(undefined);
    expect(dataLayer.state?.session).toEqual(undefined);
  });

  it('Sets session and member to null when invalid data exists in localStorage', () => {
    window.localStorage.setItem(localStorageKey, 'IM NOT VALID LOOK AT ME');
    const dataLayer = new B2BSubscriptionDataLayer(publicToken);
    expect(dataLayer.state?.member).toEqual(undefined);
    expect(dataLayer.state?.session).toEqual(undefined);
    expect(window.localStorage.getItem(localStorageKey)).toEqual('null');
  });

  it('Retrieves session and member from localStorage when they exist, and preserves saved cookies', () => {
    setValidDataInLocalStorage();
    const dataLayer = new B2BSubscriptionDataLayer(publicToken);
    expect(dataLayer.state?.member).toEqual(MOCK_MEMBER);
    expect(dataLayer.state?.session).toEqual(MOCK_MEMBER_SESSION);
  });

  it('Does not clear existing cookies if info does not exist in localStorage', () => {
    setCookies();
    const dataLayer = new B2BSubscriptionDataLayer(publicToken);
    expect(dataLayer.readSessionCookie()).toEqual({
      session_token: MOCK_SESSION_TOKEN,
      session_jwt: MOCK_SESSION_JWT,
    });
  });

  it('Preserves existing cookies if localStorage is valid', () => {
    setCookies();
    setValidDataInLocalStorage();
    const dataLayer = new B2BSubscriptionDataLayer(publicToken);
    expect(dataLayer.readSessionCookie()).toEqual({
      session_token: MOCK_SESSION_TOKEN,
      session_jwt: MOCK_SESSION_JWT,
    });
  });

  it('Can override cookie names to use custom values', () => {
    Cookies.set('some_other_name', MOCK_SESSION_TOKEN, COOKIE_OPTS);
    Cookies.set('some_jwt_name', MOCK_SESSION_JWT, COOKIE_OPTS);
    setValidDataInLocalStorage();
    const dataLayer = new B2BSubscriptionDataLayer(publicToken, {
      cookieOptions: {
        opaqueTokenCookieName: 'some_other_name',
        jwtCookieName: 'some_jwt_name',
      },
    });
    expect(dataLayer.readSessionCookie()).toEqual({
      session_token: MOCK_SESSION_TOKEN,
      session_jwt: MOCK_SESSION_JWT,
    });
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
        B2BSubscriptionDataLayer.generateCookieOpts({
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
        B2BSubscriptionDataLayer.generateCookieOpts({
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

    it('does not set an explicit domain on non-localhost when cookie is not available to subdomains', () => {
      jsdom.reconfigure({
        url: 'https://example.com/',
      });
      expect(
        B2BSubscriptionDataLayer.generateCookieOpts({
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

    it('Passes path param through when provided', () => {
      jsdom.reconfigure({
        url: 'https://example.com/',
      });
      expect(
        B2BSubscriptionDataLayer.generateCookieOpts({
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
});

describe('B2BSubscriptionService', () => {
  let ss: B2BSubscriptionService<StytchProjectConfigurationInput>;
  let dataLayer: B2BSubscriptionDataLayer;

  const createSubscriptionService = (usingCustomApiEndpoint = false) => {
    dataLayer = getB2BDataLayer(publicToken);
    return new B2BSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint });
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
    clearCookies();
    __clearB2BDataLayerCache();
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
      expect(ss.getState()).toEqual({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });
    });
  });

  it('Can retrieve the member and session', () => {
    setValidDataInLocalStorage();
    setCookies();
    ss = createSubscriptionService();
    expect(ss.getState()).toEqual({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });
  });

  it('Subscribers are notified when data changes', () => {
    const sub = jest.fn();
    ss = createSubscriptionService();
    const unsub = ss.subscribeToState(sub);
    const diff2 = generateStateDiff(2);
    ss.updateStateAndTokens(diff2);

    expect(sub).toHaveBeenCalledWith({ member: diff2.state.member, session: diff2.state.session });

    unsub();

    const diff3 = generateStateDiff(3);
    ss.updateStateAndTokens(diff3);

    expect(sub).not.toHaveBeenCalledWith({ member: diff3.state.member, session: diff3.state.session });
  });

  it('Subscribers are notified when initial cache update completes and data does not change', () => {
    setValidDataInLocalStorage();
    setCookies();
    ss = createSubscriptionService();
    const sub = jest.fn();
    ss.subscribeToState(sub);

    expect(ss.getState()).toStrictEqual({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });
    expect(ss.getFromCache()).toBe(true);

    const diff0 = generateStateDiff(0);
    ss.updateStateAndTokens(diff0);

    expect(ss.getFromCache()).toBe(false);
    expect(sub).toHaveBeenCalledWith({ member: diff0.state.member, session: diff0.state.session });
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
      const dataLayer = getB2BDataLayer(publicToken);
      const ss = new B2BSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      jest.spyOn(dataLayer, 'syncToLocalStorage');
      ss.subscribeToState(subscriber);
      expect(ss.getState()).toEqual(null);

      const evt = new StorageEvent('storage', {
        key: localStorageKey,
        newValue: JSON.stringify({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION }),
      });
      window.dispatchEvent(evt);

      expect(ss.getState()).toEqual({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });
      expect(subscriber).toHaveBeenCalledWith({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });
      expect(dataLayer.syncToLocalStorage).not.toHaveBeenCalled();
    });

    it('Notifies subscribers but does not sync to local storage when the cache is initially refreshed but the value has not changed', () => {
      setCookies();
      setValidDataInLocalStorage();
      const subscriber = jest.fn();
      const dataLayer = getB2BDataLayer(publicToken);
      const ss = new B2BSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      jest.spyOn(dataLayer, 'syncToLocalStorage');
      ss.subscribeToState(subscriber);
      expect(ss.getState()).toEqual({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });

      const evt = new StorageEvent('storage', {
        key: localStorageKey,
        newValue: JSON.stringify({
          member: MOCK_MEMBER,
          session: MOCK_MEMBER_SESSION,
        }),
      });
      window.dispatchEvent(evt);

      expect(ss.getState()).toEqual({
        member: MOCK_MEMBER,
        session: MOCK_MEMBER_SESSION,
      });
      expect(subscriber).toHaveBeenCalledWith({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });
      expect(dataLayer.syncToLocalStorage).not.toHaveBeenCalled();
    });

    it('Does not notify subscribers and does not sync to local storage when the value has not changed and the cache has already been refreshed', () => {
      setCookies();
      setValidDataInLocalStorage();
      const subscriber = jest.fn();
      const dataLayer = getB2BDataLayer(publicToken);
      const ss = new B2BSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      ss.updateStateAndTokens(generateStateDiff(0));
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      jest.spyOn(dataLayer, 'syncToLocalStorage');
      ss.subscribeToState(subscriber);
      expect(ss.getState()).toEqual({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });

      const evt = new StorageEvent('storage', {
        key: localStorageKey,
        newValue: JSON.stringify({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION }),
      });
      window.dispatchEvent(evt);

      expect(ss.getState()).toEqual({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });
      expect(subscriber).not.toHaveBeenCalled();
      expect(dataLayer.syncToLocalStorage).not.toHaveBeenCalled();
    });

    it('Updates local state when a null storage event is fired', () => {
      setCookies();
      setValidDataInLocalStorage();
      const subscriber = jest.fn();
      const dataLayer = getB2BDataLayer(publicToken);
      const ss = new B2BSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      jest.spyOn(window.localStorage.__proto__, 'setItem');
      jest.spyOn(dataLayer, 'syncToLocalStorage');
      jest.spyOn(ss, 'updateState');
      ss.subscribeToState(subscriber);
      expect(ss.getState()).toEqual({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });

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
    let ss1: B2BSubscriptionService<StytchProjectConfigurationInput>;
    let ss2: B2BSubscriptionService<StytchProjectConfigurationInput>;
    beforeEach(() => {
      setCookies();
      setValidDataInLocalStorage();
      const dataLayer = getB2BDataLayer(publicToken);
      ss1 = new B2BSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
      ss2 = new B2BSubscriptionService(publicToken, dataLayer, { usingCustomApiEndpoint: false });
    });
    afterEach(() => {
      ss1?.destroy();
      ss2?.destroy();
    });

    it('access the same SubscriptionDataLayer from the cache and stay in sync', () => {
      expect(ss1.getState()).toEqual({ member: MOCK_MEMBER, session: MOCK_MEMBER_SESSION });
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

      expect(ss1Sub).toHaveBeenCalledWith({ session: diff.state.session, member: diff.state.member });
      expect(ss2Sub).toHaveBeenCalledWith({ session: diff.state.session, member: diff.state.member });
    });
  });
});
