import {
  AllowedOpaqueTokens,
  CommonAuthenticateOptions,
  ExtractOpaqueTokens,
  IB2BSubscriptionService,
  IConsumerSubscriptionService,
  IfOpaqueTokens,
  InternalSessionUpdateOptions,
  ISubscriptionService,
  logger,
  OpaqueTokensNeverConfig,
  SessionUpdateOptions,
} from '@stytch/core';
import {
  AuthenticateResponse,
  B2BAuthenticateResponse,
  B2BAuthenticateResponseWithMFA,
  B2BDiscoveryAuthenticateResponse,
  B2BState,
  ConsumerState,
  Member,
  Organization,
  SessionTokens,
  SessionTokensUpdate,
  StytchClientOptions,
  StytchProjectConfigurationInput,
  UnsubscribeFunction,
  User,
} from '@stytch/core/public';
import { createDeepEqual } from '@stytch/js-utils';
import Cookies from 'js-cookie';

import { hasMultipleCookies, isLocalhost } from '../src/utils';
import {
  getKeyBoundStorage,
  getPersistentStorageKey,
  IKeyBoundStorage,
  safeLocalStorage,
  safeSessionStorage,
  StorageKey,
} from './utils/storage';

type SubscriberFunction<T> = (value: T | null) => void;
type Subscribers<T> = Record<string, SubscriberFunction<T>>;

const STYTCH_SESSION_COOKIE = 'stytch_session';
const STYTCH_SESSION_JWT_COOKIE = 'stytch_session_jwt';
const STYTCH_INTERMEDIATE_SESSION_TOKEN_COOKIE = 'stytch_intermediate_session_token';
const SEEN_DOMAINS_KEY = 'seen_domains';

export class SubscriptionDataLayer<T extends ConsumerState | B2BState> {
  publicToken: string;
  state: T | null;
  private readonly _opaqueTokenCookieName: string | null = null;
  private readonly _jwtCookieName: string | null = null;
  private readonly _cookiePath: string | null = null;
  private readonly _domain: string | null = null;
  private readonly _cookieAvailableToSubdomains: boolean = false;
  private readonly _istCookieName: string | null = null;

  subscriptions: Subscribers<T & SessionUpdateOptions>;

  private readonly _localStorage: IKeyBoundStorage;
  readonly browserSessionStorage: IKeyBoundStorage;

  constructor(publicToken: string, options?: StytchClientOptions) {
    this.publicToken = publicToken;
    this.state = null;
    this.subscriptions = {};

    // Initialize storage utilities
    this._localStorage = getKeyBoundStorage(safeLocalStorage, publicToken);
    this.browserSessionStorage = getKeyBoundStorage(safeSessionStorage, publicToken);

    if (options?.cookieOptions) {
      this._opaqueTokenCookieName = options.cookieOptions.opaqueTokenCookieName || null;
      this._jwtCookieName = options.cookieOptions.jwtCookieName || null;
      this._cookiePath = options.cookieOptions.path || null;
      this._domain = options.cookieOptions.domain || null;
      this._cookieAvailableToSubdomains = options.cookieOptions.availableToSubdomains || false;
      this._istCookieName = options.cookieOptions.istCookieName || null;
    }

    const localStorageState = this._localStorage.getItem('');

    if (!localStorageState) {
      return;
    }
    let parsedState: unknown;
    try {
      parsedState = JSON.parse(localStorageState);
    } catch {
      // Overwrite the bad data with nulls
      this.syncToLocalStorage();
      return;
    }
    // TODO: Validate the data looks decent & matches Session/User format
    this.state = parsedState as T;
  }

  protected get opaqueTokenCookieName(): string {
    return this._opaqueTokenCookieName ?? STYTCH_SESSION_COOKIE;
  }

  protected get jwtCookieName(): string {
    return this._jwtCookieName ?? STYTCH_SESSION_JWT_COOKIE;
  }

  protected get istCookieName(): string {
    return this._istCookieName ?? STYTCH_INTERMEDIATE_SESSION_TOKEN_COOKIE;
  }

  readSessionCookie() {
    return {
      session_token: Cookies.get(this.opaqueTokenCookieName),
      session_jwt: Cookies.get(this.jwtCookieName),
    };
  }

  readIntermediateSessionTokenCookie() {
    return Cookies.get(this.istCookieName);
  }

  writeSessionCookie(stateDiff: StateWithReadableTokensLoggedIn<T>) {
    const { state, session_token, session_jwt } = stateDiff;

    const cookieOpts = SubscriptionDataLayer.generateCookieOpts({
      expiresAt: state?.session?.expires_at ?? '',
      availableToSubdomains: this._cookieAvailableToSubdomains,
      path: this._cookiePath,
      domain: this._domain,
    });

    if (cookieOpts.domain) {
      this.addSeenDomain(cookieOpts.domain);
    }

    Cookies.set(this.opaqueTokenCookieName, session_token, cookieOpts);
    Cookies.set(this.jwtCookieName, session_jwt, cookieOpts);

    /**
     * If a developer flips the boolean value of availableToSubdomains at any point,
     * there will be two cookies set which will could cause the user to log out since
     * the js-cookie API always returns the first cookie set. Thus, we will clear the
     * cookie that doesn't relate to the current cookie options.
     */

    const alternateCookieOptions = SubscriptionDataLayer.generateCookieOpts({
      expiresAt: state?.session?.expires_at ?? '',
      availableToSubdomains: !this._cookieAvailableToSubdomains,
      path: this._cookiePath,
      domain: this._domain,
    });

    if (alternateCookieOptions.domain) {
      this.addSeenDomain(alternateCookieOptions.domain);
    }

    if (hasMultipleCookies(this.jwtCookieName)) {
      Cookies.remove(this.jwtCookieName, alternateCookieOptions);
    }

    if (hasMultipleCookies(this.opaqueTokenCookieName)) {
      Cookies.remove(this.opaqueTokenCookieName, alternateCookieOptions);
    }

    if (hasMultipleCookies(this.jwtCookieName)) {
      logger.warn(
        'Could not remove extraneous JWT cookie. This might happen if the cookie has been set using multiple `path` settings, and may produce unwanted behavior.',
      );
    }

    if (hasMultipleCookies(this.opaqueTokenCookieName)) {
      logger.warn('Could not remove extraneous opaque token cookie.');
    }
  }

  writeIntermediateSessionTokenCookie(IST: string) {
    // ISTs are valid for 10 minutes
    const expiresAtTime = new Date(Date.now() + 10 * 60000);
    const cookieOpts = SubscriptionDataLayer.generateCookieOpts({
      expiresAt: expiresAtTime.toString(),
      availableToSubdomains: this._cookieAvailableToSubdomains,
      path: this._cookiePath,
      domain: this._domain,
    });

    Cookies.set(this.istCookieName, IST, cookieOpts);
  }

  removeSessionCookie() {
    this.removeCookies([this.opaqueTokenCookieName, this.jwtCookieName]);
  }

  removeISTCookie() {
    this.removeCookies([this.istCookieName]);
  }

  removeCookies(cookiesToRemove: string[]) {
    /**
     * Spray and Pray approach:
     * In order to delete a cookie, both the path and domain must match exactly
     * We don't always know how the cookie was set - we can use the path & info that the SDK was created with
     * but if the SDK settings have changed (e.g. a dev is developing) then things might get strange.
     * Note: it is _impossible_ to reliably delete a cookie if you don't know what path it was set at - thank,; internet
     * Our best effort approach is to just list off the likely combinations
     *
     * As of 2025-07-14, we track all domains that have been used to set cookies and try to delete
     * cookies from all of them to handle cases where domains change (e.g. something.com -> web.something.com)
     */

    // Get all previously seen domains
    const trackedDomains = this.getSeenDomains();
    // Include the current domain and null (no domain) in our attempts
    const allDomains = [this._domain, null, ...trackedDomains];
    // Remove duplicates
    const uniqueDomains = [...new Set(allDomains)];

    [true, false].forEach((availableToSubdomains) => {
      [this._cookiePath, null].forEach((path) => {
        uniqueDomains.forEach((domain) => {
          const cookieOpts = SubscriptionDataLayer.generateCookieOpts({
            expiresAt: new Date(0).toString(),
            availableToSubdomains,
            path,
            domain,
          });
          cookiesToRemove.forEach((cookieName) => {
            Cookies.remove(cookieName, cookieOpts);
          });
        });
      });
    });
  }

  syncToLocalStorage(): void {
    this._localStorage.setItem('', JSON.stringify(this.state));
  }

  getItem(key: StorageKey): string | null {
    return this._localStorage.getItem(key);
  }

  setItem(key: StorageKey, value: string): void {
    this._localStorage.setItem(key, value);
  }

  removeItem(key: StorageKey): void {
    this._localStorage.removeItem(key);
  }

  /**
   * Get all previously seen domains from local storage
   */
  private getSeenDomains(): string[] {
    const storedDomains = this.getItem(SEEN_DOMAINS_KEY);

    if (!storedDomains) {
      return [];
    }

    try {
      const parsed = JSON.parse(storedDomains);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Add a domain to the seen domains list
   */
  private addSeenDomain(domain: string | null): void {
    if (!domain) {
      return;
    }

    const storedDomains = this.getSeenDomains();
    if (!storedDomains.includes(domain)) {
      storedDomains.push(domain);
      this.setItem(SEEN_DOMAINS_KEY, JSON.stringify(storedDomains));
    }
  }

  static generateCookieOpts({
    path,
    domain,
    availableToSubdomains,
    expiresAt,
  }: {
    path: string | null;
    domain: string | null;
    availableToSubdomains: boolean;
    expiresAt: string;
  }): Cookies.CookieAttributes {
    const cookieOpts: Cookies.CookieAttributes = {
      expires: new Date(expiresAt),
      sameSite: 'lax',
    };

    if (path) {
      cookieOpts.path = path;
    }

    if (isLocalhost()) {
      // We do not require HTTPS for localhost / local development
      // TODO: Could investigate disabling HTTPS for test projects
      cookieOpts.secure = false;
    } else {
      if (availableToSubdomains) {
        // Domain must be expressly configured in order for the cookie to
        // be sent to subdomains
        // UNLESS it is localhost, in which case domain should not be set
        // cf. https://stackoverflow.com/questions/1134290/cookies-on-localhost-with-explicit-domain
        cookieOpts.domain = domain || window.location.host;
      }
      cookieOpts.secure = true;
    }
    return cookieOpts;
  }
}

export class ConsumerSubscriptionDataLayer extends SubscriptionDataLayer<ConsumerState> {}
export class B2BSubscriptionDataLayer extends SubscriptionDataLayer<B2BState> {}

/**
 * We want multiple instances of the same Stytch SDK for the same project in the same page to
 * effectively share state - to do this, we create a single cache for the data layer.
 * In order to preserve the cache state across project hot module reloads, we bind it to
 * the global window object using a stytch-internal symbol.
 *
 * This also allows various StytchClients to communicate across package boundaries -
 * consider the following scenario:
 * - Next App splits out bundles per-page
 * - Next App uses Headless Client on all pages, and UI Client on one page
 *    - UI client page includes its own copy of Headless Client (since UI depends on Headless CLient)
 * - B/C of code splitting & recombining, if someone navigates from a Headless page to a UI page
 *   the there will actually be two copies of the HeadlessClient loaded,
 *   one in the main bundle, and one included inside the UI Client code
 * - So using an in-memory global object will not suffice, we'll end up with two global objects in two diff packages
 */
type ConsumerDataLayerCache = Record<string, SubscriptionDataLayer<ConsumerState>>;
type B2BDataLayerCache = Record<string, SubscriptionDataLayer<B2BState>>;

const consumerDataLayerCacheSymbol = Symbol.for('__stytch_DataLayer');
const b2bDataLayerCacheSymbol = Symbol.for('__stytch_b2b_DataLayer');

const getConsumerDataLayerCache = (): ConsumerDataLayerCache => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wdw = window as any;
  if (!wdw[consumerDataLayerCacheSymbol]) {
    wdw[consumerDataLayerCacheSymbol] = {};
  }
  return wdw[consumerDataLayerCacheSymbol];
};

const getB2BDataLayerCache = (): B2BDataLayerCache => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wdw = window as any;
  if (!wdw[b2bDataLayerCacheSymbol]) {
    wdw[b2bDataLayerCacheSymbol] = {};
  }
  return wdw[b2bDataLayerCacheSymbol];
};

export const __clearConsumerDataLayerCache = () => {
  const dataLayerCache = getConsumerDataLayerCache();
  Object.keys(dataLayerCache).forEach((key) => delete dataLayerCache[key]);
};

export const __clearB2BDataLayerCache = () => {
  const dataLayerCache = getB2BDataLayerCache();
  Object.keys(dataLayerCache).forEach((key) => delete dataLayerCache[key]);
};

export const getConsumerDataLayer = (
  publicToken: string,
  options?: StytchClientOptions,
): ConsumerSubscriptionDataLayer => {
  const dataLayerCache = getConsumerDataLayerCache();
  if (!dataLayerCache[publicToken]) {
    dataLayerCache[publicToken] = new ConsumerSubscriptionDataLayer(publicToken, options);
  }
  return dataLayerCache[publicToken];
};

export const getB2BDataLayer = (publicToken: string, options?: StytchClientOptions): B2BSubscriptionDataLayer => {
  const dataLayerCache = getB2BDataLayerCache();
  if (!dataLayerCache[publicToken]) {
    dataLayerCache[publicToken] = new B2BSubscriptionDataLayer(publicToken, options);
  }
  return dataLayerCache[publicToken];
};

const addSubscriber = <T>(collection: Subscribers<T>, subscriber: SubscriberFunction<T>): UnsubscribeFunction => {
  const uniqueId = Math.random().toString(36).slice(-10);
  collection[uniqueId] = subscriber;
  return () => delete collection[uniqueId];
};

const notifySubscribers = <T>(collection: Subscribers<T>, value: T | null): void => {
  Object.values(collection).forEach((cb) => cb(value));
};

type StateWithReadableTokensLoggedIn<T> = {
  state: T | null;
  intermediate_session_token: null;
  session_token: string;
  session_jwt: string;
};

type StateIfOpaqueTokensLoggedIn<T> = {
  state: T | null;
  intermediate_session_token: null;
  session_token: true;
  session_jwt: true;
};

type StateWithTokensLoggedIn<T> = StateWithReadableTokensLoggedIn<T> | StateIfOpaqueTokensLoggedIn<T>;

type StateWithTokensLoggedOut = {
  state: null;
  session_token: null;
  session_jwt: null;
  intermediate_session_token: null;
};

type StateWithReadableIntermediateSessionToken = {
  state: null;
  session_token: null;
  session_jwt: null;
  intermediate_session_token: string;
};

type StateWithOpaqueIntermediateSessionToken = {
  state: null;
  session_token: null;
  session_jwt: null;
  intermediate_session_token: true;
};

type StateWithIntermediateSessionToken =
  | StateWithReadableIntermediateSessionToken
  | StateWithOpaqueIntermediateSessionToken;

type StateWithTokensDiff<T> = StateWithTokensLoggedIn<T> | StateWithTokensLoggedOut | StateWithIntermediateSessionToken;

const deepEqualData = createDeepEqual({
  KEYS_TO_EXCLUDE: ['last_accessed_at'],
});

export class BaseSubscriptionService<T extends ConsumerState | B2BState, TOpaqueTokens extends AllowedOpaqueTokens>
  implements ISubscriptionService<T, TOpaqueTokens>
{
  /**
   * Whether the state was retrieved from the cache and is awaiting a refresh
   */
  private fromCache = true;

  constructor(
    private _publicToken: string,
    private _datalayer: SubscriptionDataLayer<T>,
    { usingCustomApiEndpoint }: { usingCustomApiEndpoint: boolean },
  ) {
    window.addEventListener('storage', this._listen);

    // If a custom API endpoint is being used, the session may be being managed
    // by HttpOnly cookies, which we can't detect.
    if (!usingCustomApiEndpoint) {
      // If the session does not exist in localstorage (like if we are in an iframe)
      // then the cookie might still be set and we can retrieve the session via an API call
      const { session_token } = this._datalayer.readSessionCookie();
      if (!session_token) {
        this.destroySession();
        return;
      }
    }
  }

  // Listening for state changes across tabs
  private _listen = (e: StorageEvent) => {
    if (e.key !== getPersistentStorageKey(this._publicToken, '')) {
      return;
    }

    const parsedValue = e.newValue === null || e.newValue === 'null' ? null : (JSON.parse(e.newValue) as T);
    this.updateState(parsedValue, true);
  };

  getTokens(): IfOpaqueTokens<TOpaqueTokens, never, SessionTokens | null> {
    const { session_token, session_jwt } = this._datalayer.readSessionCookie();
    if (!(typeof session_token === 'string') || !(typeof session_jwt === 'string')) {
      return null as IfOpaqueTokens<TOpaqueTokens, never, SessionTokens | null>;
    }
    return { session_token, session_jwt } as IfOpaqueTokens<TOpaqueTokens, never, SessionTokens | null>;
  }

  getIntermediateSessionToken(): string | null {
    return this._datalayer.readIntermediateSessionTokenCookie() || null;
  }

  destroyState() {
    this.updateStateAndTokens({
      state: null,
      session_token: null,
      session_jwt: null,
      intermediate_session_token: null,
    });
  }

  destroySession() {
    this._datalayer.removeSessionCookie();
    this.updateState(null);
  }

  _updateStateAndTokensInternal(stateDiff: StateWithTokensDiff<T>, options: InternalSessionUpdateOptions) {
    const oldStateValue = this._datalayer.state;
    const newStateValue = stateDiff.state === null ? null : ({ ...this._datalayer.state, ...stateDiff.state } as T);
    this._datalayer.state = newStateValue;
    const wasCached = this.getFromCache();
    this.setCacheRefreshed();

    // NOTE: This means that our tab executes first before we signal the state change to other tabs
    // TODO: Should we avoid notifying subscribers in the same thread? Should we put
    // notifications in a setImmediate or setTimeout(..., 0)?
    // Should subscribers let us know if they are active/passive when they sign up?
    if (wasCached || !deepEqualData(oldStateValue, newStateValue)) {
      let notification: (T & SessionUpdateOptions) | null;
      if (newStateValue == null || options.fromCache) {
        notification = newStateValue;
      } else {
        notification = {
          ...newStateValue,
          sessionDurationMinutes: options.sessionDurationMinutes,
        };
      }

      notifySubscribers(this._datalayer.subscriptions, notification);
    }
  }

  updateStateAndTokens(
    stateDiff: StateWithTokensDiff<T>,
    options: InternalSessionUpdateOptions = { fromCache: false },
  ) {
    if (stateDiff.state) {
      if (typeof stateDiff.session_token === 'string') {
        this._datalayer.writeSessionCookie(stateDiff);
      } else {
        // The session token is opaque, so let's clear any residual session
        // cookies that may have been left over
        this._datalayer.removeSessionCookie();
      }
      this._datalayer.removeISTCookie();
    } else if (stateDiff.intermediate_session_token) {
      if (typeof stateDiff.intermediate_session_token === 'string') {
        this._datalayer.writeIntermediateSessionTokenCookie(stateDiff.intermediate_session_token);
      } else {
        // The intermediate session token is opaque, so let's clear any residual
        // intermediate session token cookies that may have been left over
        this._datalayer.removeISTCookie();
      }
      this._datalayer.removeSessionCookie();
    } else {
      this._datalayer.removeSessionCookie();
      this._datalayer.removeISTCookie();
    }

    this._updateStateAndTokensInternal(stateDiff, options);

    this._datalayer.syncToLocalStorage();
  }

  updateState(state: T | null, fromExternalSource = false) {
    const oldStateValue = this._datalayer.state;
    const newStateValue = state === null ? null : ({ ...this._datalayer.state, ...state } as T);
    this._datalayer.state = newStateValue;
    const wasCached = this.getFromCache();
    this.setCacheRefreshed();

    const hasStateChanged = !deepEqualData(oldStateValue, newStateValue);
    if (wasCached || hasStateChanged) {
      notifySubscribers(this._datalayer.subscriptions, newStateValue);

      // If there is no state change, or if this update was itself triggered by
      // a storage event, there is no need to sync to local storage since the
      // state is already in sync.
      if (hasStateChanged && !fromExternalSource) {
        // Delay notifying other tabs until after we have refreshed ourselves
        this._datalayer.syncToLocalStorage();
      }
    }
  }

  updateTokens(tokens: SessionTokensUpdate) {
    const { session_token, session_jwt } = tokens;
    const cookie = this._datalayer.readSessionCookie();
    const diff = {
      ...cookie,
      session_token,
      session_jwt,
    } as StateWithTokensDiff<T>;
    if (typeof session_token === 'string' || typeof session_jwt === 'string') {
      this._datalayer.writeSessionCookie(diff as StateWithReadableTokensLoggedIn<T>);
      this._datalayer.removeISTCookie();
    } else {
      this._datalayer.removeSessionCookie();
    }
  }

  subscribeToState(callback: SubscriberFunction<T & SessionUpdateOptions>): UnsubscribeFunction {
    return addSubscriber(this._datalayer.subscriptions, callback);
  }

  getState(): T | null {
    return this._datalayer.state;
  }

  destroy() {
    window.removeEventListener('storage', this._listen);
  }

  syncFromDeviceStorage() {
    return null;
  }

  getFromCache(): boolean {
    return this.fromCache;
  }

  setCacheRefreshed() {
    this.fromCache = false;
  }
}

export class ConsumerSubscriptionService<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends BaseSubscriptionService<ConsumerState, ExtractOpaqueTokens<TProjectConfiguration>>
  implements IConsumerSubscriptionService<TProjectConfiguration>
{
  updateUser = (user: User) => this.updateState({ user });
  getUser = () => this.getState()?.user ?? null;
  getSession = () => this.getState()?.session ?? null;
  updateSession: IConsumerSubscriptionService<TProjectConfiguration>['updateSession'] = (resp, options) => {
    const { session, user, session_jwt, session_token } = resp;

    if (session_token && session_jwt) {
      this.updateStateAndTokens(
        {
          state: { session, user },
          session_jwt,
          session_token,
          intermediate_session_token: null,
        },
        {
          fromCache: false,
          sessionDurationMinutes: options?.sessionDurationMinutes,
        },
      );
    } else {
      this.updateStateAndTokens(
        {
          state: { session, user },
          session_token: true,
          session_jwt: true,
          intermediate_session_token: null,
        },
        {
          fromCache: false,
          sessionDurationMinutes: options?.sessionDurationMinutes,
        },
      );
    }
  };

  withUpdateSession =
    <
      Args extends [] | [options?: CommonAuthenticateOptions] | (string | CommonAuthenticateOptions)[],
      Ret extends AuthenticateResponse<TProjectConfiguration & OpaqueTokensNeverConfig> | null,
    >(
      authenticate: (...args: Args) => Promise<Ret>,
    ): ((...args: Args) => Promise<Ret>) =>
    async (...args) => {
      const resp = await authenticate(...args);
      if (resp != null) {
        const options = args.find((a): a is CommonAuthenticateOptions => a != null && !(typeof a === 'string'));
        this.updateSession(resp, {
          sessionDurationMinutes: options?.session_duration_minutes,
        });
      }
      return resp;
    };
}

export class B2BSubscriptionService<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends BaseSubscriptionService<B2BState, ExtractOpaqueTokens<TProjectConfiguration>>
  implements IB2BSubscriptionService<TProjectConfiguration>
{
  updateMember = (member: Member) => this.updateState({ member });
  getMember = () => this.getState()?.member ?? null;
  updateOrganization = (organization: Organization) => this.updateState({ organization });
  getOrganization = () => this.getState()?.organization ?? null;
  getSession = () => this.getState()?.session ?? null;
  updateSession: IB2BSubscriptionService<TProjectConfiguration>['updateSession'] = (resp, options) => {
    if ('member_session' in resp && resp.member_session) {
      const tokens =
        resp.session_token && resp.session_jwt
          ? { session_token: resp.session_token, session_jwt: resp.session_jwt }
          : ({ session_token: true, session_jwt: true } as const);

      this.updateStateAndTokens(
        {
          state: {
            session: resp.member_session,
            member: resp.member,
            organization: resp.organization,
          },
          ...tokens,
          intermediate_session_token: null,
        },
        {
          fromCache: false,
          sessionDurationMinutes: options?.sessionDurationMinutes,
        },
      );
    } else {
      this.updateStateAndTokens(
        {
          state: null,
          session_token: null,
          session_jwt: null,
          intermediate_session_token: resp.intermediate_session_token || true,
        },
        {
          fromCache: false,
          sessionDurationMinutes: options?.sessionDurationMinutes,
        },
      );
    }
  };

  withUpdateSession =
    <
      Options extends CommonAuthenticateOptions | undefined,
      Ret extends
        | B2BAuthenticateResponse<TProjectConfiguration & OpaqueTokensNeverConfig>
        | B2BAuthenticateResponseWithMFA<TProjectConfiguration & OpaqueTokensNeverConfig>
        | B2BDiscoveryAuthenticateResponse<TProjectConfiguration & OpaqueTokensNeverConfig>,
    >(
      authenticate: (options: Options) => Promise<Ret>,
    ): ((options: Options) => Promise<Ret>) =>
    async (options) => {
      const resp = await authenticate(options);
      this.updateSession(resp, {
        sessionDurationMinutes: options?.session_duration_minutes,
      });
      return resp;
    };
}
