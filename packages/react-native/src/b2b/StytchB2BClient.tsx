import {
  B2BSubscriptionService,
  checkPublicToken,
  HeadlessB2BDiscoveryClient,
  HeadlessB2BMagicLinksClient,
  HeadlessB2BOrganizationClient,
  HeadlessB2BPasswordsClient,
  HeadlessB2BRBACClient,
  HeadlessB2BRecoveryCodesClient,
  HeadlessB2BSCIMClient,
  HeadlessB2BSelfClient,
  HeadlessB2BSessionClient,
  HeadlessB2BTOTPsClient,
  IB2BSubscriptionService,
  IDFPProtectedAuthProvider,
  INetworkClient,
  ISearchData,
  ISessionManager,
  isTestPublicToken,
  IStorageClient,
  logger,
  OpaqueTokensNeverConfig,
  SearchDataManager,
  SessionManager,
  StateChangeClient,
  StateChangeRegisterFunction,
  VERTICAL_CONSUMER,
} from '@stytch/core';
import {
  B2BState,
  IHeadlessB2BDiscoveryClient,
  IHeadlessB2BMagicLinksClient,
  IHeadlessB2BOAuthClient,
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
  StytchProjectConfigurationInput,
} from '@stytch/core/public';

import { APINetworkClient } from '../APINetworkClient';
import { BootstrapDataManager } from '../BootstrapDataManager';
import { CaptchaProvider } from '../CaptchaProvider';
import { DFPProtectedAuthProvider } from '../DFPProtectedAuthProvider';
import { writeB2BInternals } from '../internals';
import StytchReactNativeModule from '../native-module';
import { Platform } from '../native-module/types';
import { NetworkClient } from '../NetworkClient';
import { PKCEManager } from '../PKCEManager';
import { StorageClient } from '../StorageClient';
import { StytchClientOptions } from '../StytchClientOptions';
import { buildFinalConfig } from '../utils';
import { IUtilsClient, UtilsClient } from '../UtilsClient';
import { B2BOAuthClient } from './B2BOAuthClient';
import { RNB2BOTPsClient } from './B2BOTPClient';
import { B2BSSOClient } from './B2BSSOClient';

export interface IStytchB2BClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  magicLinks: IHeadlessB2BMagicLinksClient<TProjectConfiguration>;
  session: IHeadlessB2BSessionClient<TProjectConfiguration>;
  organization: IHeadlessB2BOrganizationClient;
  sso: IHeadlessB2BSSOClient<TProjectConfiguration>;
  discovery: IHeadlessB2BDiscoveryClient<TProjectConfiguration>;
  passwords: IHeadlessB2BPasswordClient<TProjectConfiguration>;
  otps: IHeadlessB2BOTPsClient<TProjectConfiguration>;
  rbac: IHeadlessB2BRBACClient;
  totp: IHeadlessB2BTOTPsClient<TProjectConfiguration>;
  recoveryCodes: IHeadlessB2BRecoveryCodesClient<TProjectConfiguration>;
  oauth: IHeadlessB2BOAuthClient<TProjectConfiguration>;
  scim: IHeadlessB2BSCIMClient;
  utils: IUtilsClient;

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
  onStateChange: StateChangeRegisterFunction<B2BState>;
}

export class StytchB2BClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> implements IStytchB2BClient<TProjectConfiguration>
{
  magicLinks: IHeadlessB2BMagicLinksClient<TProjectConfiguration>;
  session: IHeadlessB2BSessionClient<TProjectConfiguration>;
  self: IHeadlessB2BSelfClient;
  organization: IHeadlessB2BOrganizationClient;
  sso: IHeadlessB2BSSOClient<TProjectConfiguration>;
  discovery: IHeadlessB2BDiscoveryClient<TProjectConfiguration>;
  passwords: IHeadlessB2BPasswordClient<TProjectConfiguration>;
  otps: IHeadlessB2BOTPsClient<TProjectConfiguration>;
  totp: IHeadlessB2BTOTPsClient<TProjectConfiguration>;
  recoveryCodes: IHeadlessB2BRecoveryCodesClient<TProjectConfiguration>;
  oauth: IHeadlessB2BOAuthClient<TProjectConfiguration>;
  rbac: IHeadlessB2BRBACClient;
  publicToken: string;
  dfp: IDFPProtectedAuthProvider;
  scim: IHeadlessB2BSCIMClient;
  utils: IUtilsClient;

  onStateChange: StateChangeRegisterFunction<B2BState>;

  private _networkClient: INetworkClient;
  private _apiNetworkClient: INetworkClient;
  private _storageClient: IStorageClient;
  private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration & OpaqueTokensNeverConfig>;
  private _sessionManager: ISessionManager;
  private _search: ISearchData;
  private readonly _stateChangeClient: StateChangeClient<B2BState>;

  constructor(publicToken: string, options?: StytchClientOptions) {
    checkPublicToken(publicToken);
    const config = buildFinalConfig(this.constructor.name, options);

    this.publicToken = publicToken;
    this._storageClient = new StorageClient();
    this._subscriptionService = new B2BSubscriptionService(publicToken, this._storageClient);
    this._stateChangeClient = new StateChangeClient(this._subscriptionService, {});
    this.onStateChange = (...args) => this._stateChangeClient.onStateChange(...args);
    let baseUrl = config.endpoints.liveAPIURL;
    if (isTestPublicToken(publicToken)) {
      baseUrl = config.endpoints.testAPIURL;
    }
    this._networkClient = new NetworkClient(publicToken, this._subscriptionService, baseUrl);
    this._apiNetworkClient = new APINetworkClient(
      publicToken,
      this._subscriptionService,
      config.endpoints.liveAPIURL,
      config.endpoints.testAPIURL,
    );
    const bootstrap = new BootstrapDataManager(publicToken, this._networkClient);
    const captcha = new CaptchaProvider(bootstrap.getAsync());
    const dfpProtectedAuth = new DFPProtectedAuthProvider(
      publicToken,
      config.endpoints.dfpBackendURL,
      bootstrap.getAsync(),
      captcha.executeRecaptcha,
    );
    this.organization = new HeadlessB2BOrganizationClient(
      this._networkClient,
      this._apiNetworkClient,
      this._subscriptionService,
    );
    this.self = new HeadlessB2BSelfClient(this._networkClient, this._apiNetworkClient, this._subscriptionService);
    this.session = new HeadlessB2BSessionClient(this._networkClient, this._subscriptionService);
    this.magicLinks = new HeadlessB2BMagicLinksClient(
      this._networkClient,
      this._subscriptionService,
      new PKCEManager(this._storageClient),
      new PKCEManager(this._storageClient),
      Promise.resolve({ pkceRequiredForEmailMagicLinks: true }),
      dfpProtectedAuth,
    );
    this.sso = new B2BSSOClient(
      this._networkClient,
      this._subscriptionService,
      new PKCEManager(this._storageClient),
      {
        publicToken: publicToken,
        testAPIURL: config.endpoints.testAPIURL,
        liveAPIURL: config.endpoints.liveAPIURL,
      },
      dfpProtectedAuth,
    );
    this.discovery = new HeadlessB2BDiscoveryClient(this._networkClient, this._subscriptionService);
    this.passwords = new HeadlessB2BPasswordsClient(
      this._networkClient,
      this._subscriptionService,
      new PKCEManager(this._storageClient),
      Promise.resolve({ pkceRequiredForPasswordResets: true }),
      dfpProtectedAuth,
    );
    this.rbac = new HeadlessB2BRBACClient(bootstrap.getSync(), bootstrap.getAsync(), this._subscriptionService);
    this.otps = new RNB2BOTPsClient(this._networkClient, this._subscriptionService, dfpProtectedAuth);
    this.totp = new HeadlessB2BTOTPsClient(this._networkClient, this._subscriptionService, dfpProtectedAuth);
    this.recoveryCodes = new HeadlessB2BRecoveryCodesClient(
      this._networkClient,
      this._subscriptionService,
      dfpProtectedAuth,
    );
    this._sessionManager = new SessionManager(this._subscriptionService, this.session, publicToken, {
      keepSessionAlive: config.keepSessionAlive,
    });
    this.dfp = dfpProtectedAuth;
    this.oauth = new B2BOAuthClient(
      this._networkClient,
      this._subscriptionService,
      new PKCEManager(this._storageClient),
      Promise.resolve({ cnameDomain: '', pkceRequiredForOAuth: true }),
      {
        publicToken: publicToken,
        testAPIURL: config.endpoints.testAPIURL,
        liveAPIURL: config.endpoints.liveAPIURL,
      },
      dfpProtectedAuth,
    );
    this.scim = new HeadlessB2BSCIMClient(this._networkClient, this._subscriptionService);
    this._search = new SearchDataManager(this._networkClient, dfpProtectedAuth);
    this.utils = new UtilsClient(new PKCEManager(this._storageClient));
    /*
      After service initialization, retrieve existing session data from storage.
      If valid, it populates the subscription service with Session and User info,
      notifying the Session client, initializing a heartbeat every three minutes,
      and triggering session.authenticate for validation.
    */
    this._subscriptionService.syncFromDeviceStorage(async () => {
      try {
        const sessionInfo = this.session.getInfo();
        if (sessionInfo.session) {
          await this.session.authenticate();
        } else {
          /*
            If no session was found, ensure we clean up any potential lingering/stale data.
            This also ensures that the SWR `fromCache` value is updated.
          */
          this._subscriptionService.destroySession();
        }
      } catch {
        // Ignore errors during session cleanup
      }
    });
    this._networkClient.logEvent({
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

    const nativeModule = new StytchReactNativeModule();
    writeB2BInternals(this, {
      bootstrap: bootstrap,
      publicToken: publicToken,
      networkClient: this._networkClient,
      searchManager: this._search,
      nativeModule: nativeModule,
    });

    const deviceInfo = nativeModule.DeviceInfo.get();
    if (deviceInfo.platform == Platform.iOS) {
      nativeModule.Misc.loadFontsForUI();
      if (config.iosDisableUrlCache) {
        nativeModule.Misc.disableUrlCache();
      }
    }
  }
}
