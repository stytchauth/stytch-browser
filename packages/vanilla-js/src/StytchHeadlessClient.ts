import {
  checkNotSSR,
  checkPublicToken,
  DFPProtectedAuthProvider,
  HeadlessCryptoWalletClient,
  HeadlessMagicLinksClient,
  HeadlessOTPClient,
  HeadlessPasswordClient,
  HeadlessImpersonationClient,
  HeadlessSessionClient,
  HeadlessTOTPClient,
  HeadlessUserClient,
  HeadlessWebAuthnClient,
  INetworkClient,
  SearchDataManager,
  SessionManager,
  StateChangeClient,
  StateChangeRegisterFunction,
  VERTICAL_B2B,
  logger,
  HeadlessRBACClient,
  HeadlessIDPClient,
} from '@stytch/core';
import {
  ConsumerState,
  IHeadlessCryptoWalletClient,
  IHeadlessMagicLinksClient,
  IHeadlessOTPsClient,
  IHeadlessPasswordClient,
  IHeadlessSessionClient,
  IHeadlessTOTPClient,
  IHeadlessUserClient,
  IHeadlessWebAuthnClient,
  IHeadlessImpersonationClient,
  StytchClientOptions,
  StytchProjectConfigurationInput,
  IHeadlessRBACClient,
} from '@stytch/core/public';
import { BootstrapDataManager } from './BootstrapDataManager';
import { CaptchaProvider } from './CaptchaProvider';
import { ClientsideServicesProvider } from './ClientsideServicesProvider';
import { HeadlessOAuthClient, IWebOAuthClient } from './HeadlessOAuthClient';
import { NetworkClient } from './NetworkClient';
import { OneTapProvider } from './oneTap/OneTapProvider';
import { PKCEManager } from './PKCEManager';
import {
  ConsumerSubscriptionDataLayer,
  ConsumerSubscriptionService,
  getConsumerDataLayer,
} from './SubscriptionService';
import { writeB2CInternals } from './utils/internal';
import { buildFinalConfig, hasCustomApiEndpoint } from './utils/config';
import { createAuthUrlHandler, AuthenticateByUrl, ParseAuthenticateUrl } from './utils/createAuthUrlHandler';

export type HandledTokenType = 'magic_links' | 'oauth' | 'impersonation';

/**
 * A headless client used for invoking the Stytch API.
 * The Stytch Headless Client can be used as a drop-in solution for authentication and session management.
 * Full documentation can be found {@link https://stytch.com/docs/sdks/javascript-sdk online}.
 * @example
 * const stytch = new StytchHeadlessClient('public-token-<find yours in the stytch dashboard>');
 * stytch.magicLinks.email.loginOrCreate('sandbox@stytch.com', {
 *   login_magic_link_url: 'https://example.com/authenticate',
 *   login_expiration_minutes: 60,
 *   signup_magic_link_url: 'https://example.com/authenticate',
 *   signup_expiration_minutes: 60,
 * });
 */
export class StytchHeadlessClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> {
  private readonly _subscriptionService: ConsumerSubscriptionService<TProjectConfiguration>;
  private readonly _sessionManager: SessionManager<TProjectConfiguration>;
  private readonly _networkClient: INetworkClient;
  private readonly _dataLayer: ConsumerSubscriptionDataLayer;
  private readonly _stateChangeClient: StateChangeClient<ConsumerState>;

  // External API Clients
  user: IHeadlessUserClient;
  magicLinks: IHeadlessMagicLinksClient<TProjectConfiguration>;
  session: IHeadlessSessionClient<TProjectConfiguration>;
  otps: IHeadlessOTPsClient<TProjectConfiguration>;
  oauth: IWebOAuthClient<TProjectConfiguration>;
  cryptoWallets: IHeadlessCryptoWalletClient<TProjectConfiguration>;
  totps: IHeadlessTOTPClient<TProjectConfiguration>;
  webauthn: IHeadlessWebAuthnClient<TProjectConfiguration>;
  passwords: IHeadlessPasswordClient<TProjectConfiguration>;
  impersonation: IHeadlessImpersonationClient<TProjectConfiguration>;
  rbac: IHeadlessRBACClient;
  idp: HeadlessIDPClient;

  // External methods
  /**
   * Register a callback function to be invoked whenever certain state changes
   * occur, like a user or session object being updated.
   *
   * This is an alternative to more specific methods like `user.onChange` and
   * `session.onChange`. It can be helpful if you want to be notified of related
   * changes to different parts of state at once.
   *
   * If you are only interested in specific state changes, consider using more
   * specific methods like `user.onChange` and `session.onChange` instead.
   */
  onStateChange: StateChangeRegisterFunction<ConsumerState>;

  /**
   * Extracts token and token type from the current page URL's query parameters.
   * If the current URL do not have the required query params, this will return null.
   * Otherwise, returns an object { handled: boolean, tokenType: string, token: string }
   */
  parseAuthenticateUrl: ParseAuthenticateUrl<HandledTokenType>;

  /**
   * Call this method to authenticate the user when the user has been redirected
   * to this page with a token in the query parameters, such as after OAuth
   * or through an email magic link. This method currently supports
   *
   * - Magic links
   * - OAuth
   * - Impersonation
   *
   * Returns null if token or stytch_token_type query parameters are not present,
   * or returns an unhandled result if the token type is not recognized.
   */
  authenticateByUrl: AuthenticateByUrl<HandledTokenType>;

  constructor(publicTokenRaw: string, options?: StytchClientOptions) {
    checkNotSSR('StytchHeadlessClient');

    // Intentionally check the raw public token so that we can log a correct error message,
    // but then coalesce to an empty string so that the UI components don't fail to render.
    checkPublicToken(publicTokenRaw);
    const _PUBLIC_TOKEN = publicTokenRaw ?? '';

    // Not casting to InternalStytchClientOptions since InternalStytchClientOptions is currently a superset
    const config = buildFinalConfig(this.constructor.name, options);
    const usingCustomApiEndpoint = hasCustomApiEndpoint(_PUBLIC_TOKEN, options);

    this._dataLayer = getConsumerDataLayer(_PUBLIC_TOKEN, config);
    this._subscriptionService = new ConsumerSubscriptionService(_PUBLIC_TOKEN, this._dataLayer, {
      usingCustomApiEndpoint,
    });
    this._stateChangeClient = new StateChangeClient(this._subscriptionService, {});
    this.onStateChange = (...args) => this._stateChangeClient.onStateChange(...args);

    const additionalTelemetryDataFn = () => ({
      stytch_user_id: this._dataLayer.state?.user?.user_id,
      stytch_session_id: this._dataLayer.state?.session?.session_id,
    });

    const passwordsPKCEManager = new PKCEManager(this._dataLayer, 'passwords');
    const networkClient = new NetworkClient(
      _PUBLIC_TOKEN,
      this._dataLayer,
      config.endpoints.liveAPIURL,
      config.endpoints.testAPIURL,
      additionalTelemetryDataFn,
    );
    this._networkClient = networkClient;

    const bootstrap = new BootstrapDataManager(_PUBLIC_TOKEN, this._networkClient, this._dataLayer);
    const captcha = new CaptchaProvider(bootstrap.getAsync());
    const dfpProtectedAuth = new DFPProtectedAuthProvider(
      _PUBLIC_TOKEN,
      config.endpoints.dfpBackendURL,
      config.endpoints.dfpCdnURL,
      bootstrap.getAsync(),
      captcha.executeRecaptcha,
    );
    const clientsideServices = new ClientsideServicesProvider(config.endpoints.clientsideServicesIframeURL);
    const oneTap = new OneTapProvider(_PUBLIC_TOKEN, clientsideServices);
    const searchManager = new SearchDataManager(this._networkClient, dfpProtectedAuth);

    this.user = new HeadlessUserClient(this._networkClient, this._subscriptionService);
    this.session = new HeadlessSessionClient(this._networkClient, this._subscriptionService);
    this.magicLinks = new HeadlessMagicLinksClient(
      this._networkClient,
      this._subscriptionService,
      new PKCEManager(this._dataLayer, 'magic_links'),
      passwordsPKCEManager,
      bootstrap.getAsync(),
      dfpProtectedAuth,
    );
    this.otps = new HeadlessOTPClient(
      this._networkClient,
      this._subscriptionService,
      captcha.executeRecaptcha,
      dfpProtectedAuth,
    );
    this.oauth = new HeadlessOAuthClient(
      this._networkClient,
      this._subscriptionService,
      new PKCEManager(this._dataLayer, 'oauth'),
      bootstrap.getAsync(),
      {
        publicToken: _PUBLIC_TOKEN,
        testAPIURL: config.endpoints.testAPIURL,
        liveAPIURL: config.endpoints.liveAPIURL,
      },
      oneTap,
    );
    this.cryptoWallets = new HeadlessCryptoWalletClient(
      this._networkClient,
      this._networkClient,
      this._subscriptionService,
      captcha.executeRecaptcha,
      dfpProtectedAuth,
      bootstrap.getAsync(),
    );
    this.totps = new HeadlessTOTPClient(this._networkClient, this._subscriptionService, dfpProtectedAuth);
    this.webauthn = new HeadlessWebAuthnClient(this._networkClient, this._subscriptionService, dfpProtectedAuth);
    this.passwords = new HeadlessPasswordClient(
      this._networkClient,
      this._subscriptionService,
      passwordsPKCEManager,
      bootstrap.getAsync(),
      dfpProtectedAuth,
    );
    this.impersonation = new HeadlessImpersonationClient(
      this._networkClient,
      this._subscriptionService,
      dfpProtectedAuth,
    );

    this.rbac = new HeadlessRBACClient(bootstrap.getSync(), bootstrap.getAsync(), this._subscriptionService);
    this.idp = new HeadlessIDPClient(this._networkClient);
    this._sessionManager = new SessionManager(this._subscriptionService, this.session, _PUBLIC_TOKEN, {
      keepSessionAlive: config.keepSessionAlive,
    });

    // If the session does not exist in localstorage (like if we are in an iframe)
    // then the cookie might still be set and we can retrieve the session via an API call.
    // If a custom API endpoint is being used, the session may be being managed by
    // HttpOnly cookies, which we can't detect.
    if (usingCustomApiEndpoint || this._dataLayer.readSessionCookie().session_token) {
      this._sessionManager.performBackgroundRefresh();
    }

    this._networkClient.logEvent({
      name: 'sdk_instance_instantiated',
      details: {
        event_callback_registered: false,
        error_callback_registered: false,
        success_callback_registered: false,
      },
    });

    bootstrap.getAsync().then((bootstrapData) => {
      if (bootstrapData.vertical === VERTICAL_B2B) {
        logger.error(
          'This application is using a Stytch client for Consumer projects, but the public token is for a Stytch B2B project. Use a B2B Stytch client instead, or verify that the public token is correct.',
        );
      }
    });

    const { authenticateByUrl, parseAuthenticateUrl } = createAuthUrlHandler({
      magic_links: (token, options) => this.magicLinks.authenticate(token, options),
      oauth: (token, options) => this.oauth.authenticate(token, options),
      impersonation: (token: string) => this.impersonation.authenticate({ impersonation_token: token }),
    });

    this.authenticateByUrl = authenticateByUrl;
    this.parseAuthenticateUrl = parseAuthenticateUrl;

    writeB2CInternals(this, {
      bootstrap,
      clientsideServices,
      captcha,
      oneTap,
      searchManager,
      publicToken: _PUBLIC_TOKEN,
      dataLayer: this._dataLayer,
      networkClient: this._networkClient,
    });
  }
}
