import {
  checkB2BNotSSR,
  checkPublicToken,
  DFPProtectedAuthProvider,
  HeadlessB2BDiscoveryClient,
  HeadlessB2BIDPClient,
  HeadlessB2BImpersonationClient,
  HeadlessB2BMagicLinksClient,
  HeadlessB2BOrganizationClient,
  HeadlessB2BOTPsClient,
  HeadlessB2BPasswordsClient,
  HeadlessB2BRBACClient,
  HeadlessB2BRecoveryCodesClient,
  HeadlessB2BSCIMClient,
  HeadlessB2BSelfClient,
  HeadlessB2BSessionClient,
  HeadlessB2BSSOClient,
  HeadlessB2BTOTPsClient,
  INetworkClient,
  logger,
  SearchDataManager,
  SessionManager,
  StateChangeClient,
  StateChangeRegisterFunction,
  VERTICAL_CONSUMER,
} from '@stytch/core';
import {
  B2BState,
  IHeadlessB2BDiscoveryClient,
  IHeadlessB2BImpersonationClient,
  IHeadlessB2BMagicLinksClient,
  IHeadlessB2BMemberClient,
  IHeadlessB2BOrganizationClient,
  IHeadlessB2BOTPsClient,
  IHeadlessB2BPasswordClient,
  IHeadlessB2BRBACClient,
  IHeadlessB2BRecoveryCodesClient,
  IHeadlessB2BSCIMClient,
  IHeadlessB2BSelfClient,
  IHeadlessB2BSessionClient,
  IHeadlessB2BSSOClient,
  IHeadlessB2BTOTPsClient,
  StytchClientOptions,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';

import { BootstrapDataManager } from '../BootstrapDataManager';
import { CaptchaProvider } from '../CaptchaProvider';
import { ClientsideServicesProvider } from '../ClientsideServicesProvider';
import { NetworkClient } from '../NetworkClient';
import { PKCEManager } from '../PKCEManager';
import { B2BSubscriptionDataLayer, B2BSubscriptionService, getB2BDataLayer } from '../SubscriptionService';
import { buildFinalConfig, hasCustomApiEndpoint } from '../utils/config';
import { AuthenticateByUrl, createAuthUrlHandler, ParseAuthenticateUrl } from '../utils/createAuthUrlHandler';
import { B2BInternals, writeB2BInternals } from '../utils/internal';
import { HeadlessB2BOAuthClient, IWebB2BOAuthClient } from './HeadlessB2BOAuthClient';
import { B2BOneTapProvider } from './oneTap/B2BOneTapProvider';

export type HandledTokenType =
  | 'discovery'
  | 'discovery_oauth'
  | 'oauth'
  | 'sso'
  | 'multi_tenant_magic_links'
  | 'multi_tenant_impersonation';

/**
 * A headless client used for invoking Stytch's B2B APIs.
 * The Stytch Headless Client can be used as a drop-in solution for authentication and session management.
 * Full documentation can be found {@link https://stytch.com/docs/b2b/sdks/javascript-sdk online}.
 *
 * @example
 * const stytch = new StytchB2BClient('public-token-<find yours in the stytch dashboard>');
 * stytch.magicLinks.email.loginOrCreate({
 *   email: 'sandbox@stytch.com',
 *   organization_id: 'organization-test-123',
 * });
 */
export class StytchB2BClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> {
  private readonly _subscriptionService: B2BSubscriptionService<TProjectConfiguration>;
  private readonly _sessionManager: SessionManager<TProjectConfiguration>;
  private readonly _networkClient: INetworkClient;
  private readonly _dataLayer: B2BSubscriptionDataLayer;
  private readonly _stateChangeClient: StateChangeClient<B2BState>;

  // External API Clients
  magicLinks: IHeadlessB2BMagicLinksClient<TProjectConfiguration>;
  session: IHeadlessB2BSessionClient<TProjectConfiguration>;
  /** @deprecated Please use client.self instead. This will be removed in a future release. */
  member: IHeadlessB2BMemberClient;
  self: IHeadlessB2BSelfClient;
  organization: IHeadlessB2BOrganizationClient;
  oauth: IWebB2BOAuthClient<TProjectConfiguration>;
  sso: IHeadlessB2BSSOClient<TProjectConfiguration>;
  discovery: IHeadlessB2BDiscoveryClient<TProjectConfiguration>;
  passwords: IHeadlessB2BPasswordClient<TProjectConfiguration>;
  otps: IHeadlessB2BOTPsClient<TProjectConfiguration>;
  totp: IHeadlessB2BTOTPsClient<TProjectConfiguration>;
  recoveryCodes: IHeadlessB2BRecoveryCodesClient<TProjectConfiguration>;
  rbac: IHeadlessB2BRBACClient;
  scim: IHeadlessB2BSCIMClient;
  impersonation: IHeadlessB2BImpersonationClient;
  idp: HeadlessB2BIDPClient;

  // External methods
  /**
   * Register a callback function to be invoked whenever certain state changes
   * occur, like a member or session object being updated.
   *
   * This is an alternative to more specific methods like `self.onChange` and
   * `session.onChange`. It can be helpful if you want to be notified of related
   * changes to different parts of state at once.
   *
   * If you are only interested in specific state changes, consider using more
   * specific methods like `self.onChange` and `session.onChange` instead.
   */
  onStateChange: StateChangeRegisterFunction<B2BState>;

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
   * - SSO
   * - Impersonation
   *
   * If the current URL do not have the required query params, the promise returned will resolve to null.
   * If the token type is not supported (e.g. reset_password), the promise returned will resolve to this
   * object allowing you to handle the token.
   * {
   *   handled: false,
   *   tokenType: 'token_type',
   *   token: '<token>'
   * }
   */
  authenticateByUrl: AuthenticateByUrl<HandledTokenType>;

  constructor(rawPublicToken: string, options?: StytchClientOptions) {
    checkB2BNotSSR();

    // Intentionally check the raw public token so that we can log a correct error message,
    // but then coalesce to an empty string so that the UI components don't fail to render.
    checkPublicToken(rawPublicToken);
    const _PUBLIC_TOKEN = rawPublicToken ?? '';

    // Not casting to InternalStytchClientOptions since InternalStytchClientOptions is currently a superset
    const config = buildFinalConfig(this.constructor.name, options);
    const usingCustomApiEndpoint = hasCustomApiEndpoint(_PUBLIC_TOKEN, options);

    this._dataLayer = getB2BDataLayer(_PUBLIC_TOKEN, config);
    this._subscriptionService = new B2BSubscriptionService(_PUBLIC_TOKEN, this._dataLayer, { usingCustomApiEndpoint });
    this._stateChangeClient = new StateChangeClient(this._subscriptionService, {});
    this.onStateChange = (...args) => this._stateChangeClient.onStateChange(...args);

    const additionalTelemetryDataFn = () => ({
      stytch_member_id: this._dataLayer.state?.member?.member_id,
      stytch_member_session_id: this._dataLayer.state?.session?.member_session_id,
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

    const bootstrap = new BootstrapDataManager(_PUBLIC_TOKEN, networkClient, this._dataLayer);
    const captcha = new CaptchaProvider(bootstrap.getAsync());
    const dfpProtectedAuth = new DFPProtectedAuthProvider(
      _PUBLIC_TOKEN,
      config.endpoints.dfpBackendURL,
      config.endpoints.dfpCdnURL,
      bootstrap.getAsync(),
      captcha.executeRecaptcha,
    );
    const clientsideServices = new ClientsideServicesProvider(config.endpoints.clientsideServicesIframeURL);
    const pkceManagerForOAuth = new PKCEManager(this._dataLayer, 'oauth');
    const oneTap = new B2BOneTapProvider(networkClient, pkceManagerForOAuth, bootstrap.getAsync());

    this.organization = new HeadlessB2BOrganizationClient(networkClient, networkClient, this._subscriptionService);
    this.member = new HeadlessB2BSelfClient(networkClient, networkClient, this._subscriptionService);
    this.self = new HeadlessB2BSelfClient(networkClient, networkClient, this._subscriptionService);
    this.session = new HeadlessB2BSessionClient(networkClient, this._subscriptionService);
    this.magicLinks = new HeadlessB2BMagicLinksClient(
      networkClient,
      this._subscriptionService,
      new PKCEManager(this._dataLayer, 'magic_links'),
      passwordsPKCEManager,
      bootstrap.getAsync(),
      dfpProtectedAuth,
    );
    this.oauth = new HeadlessB2BOAuthClient(
      networkClient,
      this._subscriptionService,
      pkceManagerForOAuth,
      bootstrap.getAsync(),
      {
        publicToken: _PUBLIC_TOKEN,
        testAPIURL: config.endpoints.testAPIURL,
        liveAPIURL: config.endpoints.liveAPIURL,
      },
      dfpProtectedAuth,
      oneTap,
    );
    this.sso = new HeadlessB2BSSOClient(
      networkClient,
      this._subscriptionService,
      new PKCEManager(this._dataLayer, 'sso'),
      bootstrap.getAsync(),
      {
        publicToken: _PUBLIC_TOKEN,
        testAPIURL: config.endpoints.testAPIURL,
        liveAPIURL: config.endpoints.liveAPIURL,
      },
      dfpProtectedAuth,
    );
    this.discovery = new HeadlessB2BDiscoveryClient(networkClient, this._subscriptionService);
    this.passwords = new HeadlessB2BPasswordsClient(
      networkClient,
      this._subscriptionService,
      passwordsPKCEManager,
      bootstrap.getAsync(),
      dfpProtectedAuth,
    );
    this.otps = new HeadlessB2BOTPsClient(networkClient, this._subscriptionService, dfpProtectedAuth);
    this.totp = new HeadlessB2BTOTPsClient(networkClient, this._subscriptionService, dfpProtectedAuth);
    this.recoveryCodes = new HeadlessB2BRecoveryCodesClient(networkClient, this._subscriptionService, dfpProtectedAuth);
    this.rbac = new HeadlessB2BRBACClient(bootstrap.getSync(), bootstrap.getAsync(), this._subscriptionService);
    this.scim = new HeadlessB2BSCIMClient(this._networkClient, this._subscriptionService);
    this.impersonation = new HeadlessB2BImpersonationClient(
      this._networkClient,
      this._subscriptionService,
      dfpProtectedAuth,
    );
    this.idp = new HeadlessB2BIDPClient(networkClient);
    this._sessionManager = new SessionManager(this._subscriptionService, this.session, _PUBLIC_TOKEN, {
      keepSessionAlive: config.keepSessionAlive,
    });
    const searchManager = new SearchDataManager(networkClient, dfpProtectedAuth);

    // If the session does not exist in localstorage (like if we are in an iframe)
    // then the cookie might still be set and we can retrieve the session via an API call.
    // If a custom API endpoint is being used, the session may be being managed by
    // HttpOnly cookies, which we can't detect.
    if (usingCustomApiEndpoint || this._dataLayer.readSessionCookie().session_token) {
      this._sessionManager.performBackgroundRefresh();
    }

    const { authenticateByUrl, parseAuthenticateUrl } = createAuthUrlHandler<HandledTokenType>({
      discovery: (token) => this.magicLinks.discovery.authenticate({ discovery_magic_links_token: token }),
      discovery_oauth: (token) => this.oauth.discovery.authenticate({ discovery_oauth_token: token }),
      oauth: (token, options) => this.oauth.authenticate({ oauth_token: token, ...options }),
      sso: (token, options) => this.sso.authenticate({ sso_token: token, ...options }),
      multi_tenant_magic_links: (token, options) =>
        this.magicLinks.authenticate({ magic_links_token: token, ...options }),
      multi_tenant_impersonation: (token) => this.impersonation.authenticate({ impersonation_token: token }),
    });

    this.authenticateByUrl = authenticateByUrl;
    this.parseAuthenticateUrl = parseAuthenticateUrl;

    networkClient.logEvent({
      name: 'b2b_sdk_instance_instantiated',
      details: {
        event_callback_registered: false,
        error_callback_registered: false,
        success_callback_registered: false,
      },
    });

    bootstrap.getAsync().then((bootstrapData) => {
      if (bootstrapData.vertical === VERTICAL_CONSUMER) {
        logger.error(
          'This application is using a Stytch client for B2B projects, but the public token is for a Stytch Consumer project. Use a Consumer Stytch client instead, or verify that the public token is correct.',
        );
      }
    });

    const internals: B2BInternals = {
      bootstrap,
      clientsideServices,
      publicToken: _PUBLIC_TOKEN,
      searchManager,
      dataLayer: this._dataLayer,
      networkClient: networkClient,
      oneTap,
    };

    writeB2BInternals(this, internals);
  }
}
