import {
  ConsumerSubscriptionService,
  HeadlessMagicLinksClient,
  HeadlessPasswordClient,
  HeadlessRBACClient,
  HeadlessSessionClient,
  HeadlessTOTPClient,
  HeadlessUserClient,
  IConsumerSubscriptionService,
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
  VERTICAL_B2B,
} from '@stytch/core';
import {
  ConsumerState,
  IHeadlessBiometricsClient,
  IHeadlessMagicLinksClient,
  IHeadlessOTPsClient,
  IHeadlessPasswordClient,
  IHeadlessRBACClient,
  IHeadlessSessionClient,
  IHeadlessTOTPClient,
  IHeadlessUserClient,
  IHeadlessWebAuthnClient,
  StytchProjectConfigurationInput,
  User,
} from '@stytch/core/public';

import { HeadlessBiometricsClient } from './BiometricsClient';
import { BootstrapDataManager } from './BootstrapDataManager';
import { CaptchaProvider } from './CaptchaProvider';
import { DFPProtectedAuthProvider } from './DFPProtectedAuthProvider';
import { writeB2CInternals } from './internals';
import StytchReactNativeModule from './native-module';
import { Platform } from './native-module/types';
import { NetworkClient } from './NetworkClient';
import { HeadlessOAuthClient, INativeOAuthClient } from './OAuthClient';
import { RNHeadlessOTPClient } from './OTPClient';
import { PKCEManager } from './PKCEManager';
import { StorageClient } from './StorageClient';
import { StytchClientOptions } from './StytchClientOptions';
import { buildFinalConfig } from './utils';
import { IUtilsClient, UtilsClient } from './UtilsClient';
import { HeadlessWebAuthnClient } from './WebAuthnClient';

export interface IStytchClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  user: IHeadlessUserClient;
  session: IHeadlessSessionClient<TProjectConfiguration>;
  magicLinks: IHeadlessMagicLinksClient<TProjectConfiguration>;
  otps: IHeadlessOTPsClient<TProjectConfiguration>;
  passwords: IHeadlessPasswordClient<TProjectConfiguration>;
  oauth: INativeOAuthClient<TProjectConfiguration>;
  biometrics: IHeadlessBiometricsClient<TProjectConfiguration>;
  webauthn: IHeadlessWebAuthnClient<TProjectConfiguration>;
  utils: IUtilsClient;
  totp: IHeadlessTOTPClient<TProjectConfiguration>;

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
}

export class StytchClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> implements IStytchClient<TProjectConfiguration>
{
  private _networkClient: INetworkClient;
  private _storageClient: IStorageClient;
  private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration & OpaqueTokensNeverConfig>;
  private _sessionManager: ISessionManager;
  private _search: ISearchData;
  private readonly _stateChangeClient: StateChangeClient<ConsumerState>;

  publicToken: string;
  user: IHeadlessUserClient;
  magicLinks: IHeadlessMagicLinksClient<TProjectConfiguration>;
  session: IHeadlessSessionClient<TProjectConfiguration>;
  otps: IHeadlessOTPsClient<TProjectConfiguration>;
  passwords: IHeadlessPasswordClient<TProjectConfiguration>;
  oauth: INativeOAuthClient<TProjectConfiguration>;
  biometrics: IHeadlessBiometricsClient<TProjectConfiguration>;
  utils: IUtilsClient;
  webauthn: IHeadlessWebAuthnClient<TProjectConfiguration>;
  dfp: IDFPProtectedAuthProvider;
  totp: IHeadlessTOTPClient<TProjectConfiguration>;
  rbac: IHeadlessRBACClient;

  onStateChange: StateChangeRegisterFunction<ConsumerState>;

  constructor(publicToken: string, options?: StytchClientOptions) {
    const config = buildFinalConfig(this.constructor.name, options);

    this.publicToken = publicToken;
    this._storageClient = new StorageClient();
    this._subscriptionService = new ConsumerSubscriptionService(publicToken, this._storageClient);
    this._stateChangeClient = new StateChangeClient(this._subscriptionService, {});
    this.onStateChange = (...args) => this._stateChangeClient.onStateChange(...args);
    let baseUrl = config.endpoints.liveAPIURL;
    if (isTestPublicToken(publicToken)) {
      baseUrl = config.endpoints.testAPIURL;
    }
    this._networkClient = new NetworkClient(publicToken, this._subscriptionService, baseUrl);
    const bootstrap = new BootstrapDataManager(publicToken, this._networkClient);
    const captcha = new CaptchaProvider(bootstrap.getAsync());
    const dfpProtectedAuth = new DFPProtectedAuthProvider(
      publicToken,
      config.endpoints.dfpBackendURL,
      bootstrap.getAsync(),
      captcha.executeRecaptcha,
    );
    this.user = new HeadlessUserClient(this._networkClient, this._subscriptionService);
    this.session = new HeadlessSessionClient(this._networkClient, this._subscriptionService);
    this.magicLinks = new HeadlessMagicLinksClient(
      this._networkClient,
      this._subscriptionService,
      new PKCEManager(this._storageClient),
      new PKCEManager(this._storageClient),
      Promise.resolve({
        pkceRequiredForEmailMagicLinks: true,
      }),
      dfpProtectedAuth,
    );
    this.passwords = new HeadlessPasswordClient(
      this._networkClient,
      this._subscriptionService,
      new PKCEManager(this._storageClient),
      Promise.resolve({
        pkceRequiredForPasswordResets: true,
      }),
      dfpProtectedAuth,
    );
    this.oauth = new HeadlessOAuthClient(
      this._networkClient,
      this._subscriptionService,
      new PKCEManager(this._storageClient),
      bootstrap.getAsync(),
      {
        publicToken,
        testAPIURL: config.endpoints.testAPIURL,
        liveAPIURL: config.endpoints.liveAPIURL,
      },
    );
    this.biometrics = new HeadlessBiometricsClient(this._subscriptionService, this._networkClient, dfpProtectedAuth);

    this.otps = new RNHeadlessOTPClient(
      this._networkClient,
      this._subscriptionService,
      captcha.executeRecaptcha,
      dfpProtectedAuth,
    );
    this._sessionManager = new SessionManager(this._subscriptionService, this.session, publicToken, {
      keepSessionAlive: config.keepSessionAlive,
    });
    this.utils = new UtilsClient(new PKCEManager(this._storageClient));
    this.webauthn = new HeadlessWebAuthnClient(this._networkClient, this._subscriptionService, dfpProtectedAuth);
    this.dfp = dfpProtectedAuth;
    this._search = new SearchDataManager(this._networkClient, dfpProtectedAuth);

    const nativeModule = new StytchReactNativeModule();
    nativeModule.Storage.didMigrate().then(async (didMigrate) => {
      if (!didMigrate) {
        await nativeModule.Storage.migrate(publicToken);
      }
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
        name: 'sdk_instance_instantiated',
        details: {
          event_callback_registered: false,
          error_callback_registered: false,
          success_callback_registered: false,
        },
      });
    });
    this.totp = new HeadlessTOTPClient(this._networkClient, this._subscriptionService, dfpProtectedAuth);
    this.rbac = new HeadlessRBACClient(bootstrap.getSync(), bootstrap.getAsync(), this._subscriptionService);

    bootstrap.getAsync().then((bootstrapData) => {
      if (bootstrapData.vertical === VERTICAL_B2B) {
        logger.error(
          'This application is using a Stytch client for Consumer projects, but the public token is for a Stytch B2B project. Use a B2B Stytch client instead, or verify that the public token is correct.',
        );
      }
    });

    writeB2CInternals(this, {
      bootstrap: bootstrap,
      publicToken: publicToken,
      networkClient: this._networkClient,
      captcha: captcha,
      search: this._search,
    });

    const deviceInfo = nativeModule.DeviceInfo.get();
    if (deviceInfo.platform == Platform.iOS) {
      // Run key migration to set the encryption key to be available after first unlock (ie: still retrievable when app has background fetch enabled)
      nativeModule.Misc.migrateKeychainItems();
      // On iOS, the keychain does not reset following an explicit uninstall/reinstall, so
      // we manually need to clear out Stytch values from the keychain
      // NOTE: is this needed after the migration to in-house storage client? Since we'll be saving everything to UserDefaults, the above wll no longer be true?
      nativeModule.Misc.resetSecureStorageOnFreshInstall(publicToken);
      if (config.iosDisableUrlCache) {
        nativeModule.Misc.disableUrlCache();
      }
      nativeModule.Misc.loadFontsForUI();
    }

    this._subscriptionService.subscribeToState(async (state: ConsumerState | null) => {
      if (!state?.user) return;
      processPotentialBiometricRegistrationCleanups(state.user);
    });

    const cleanupPotentiallyOrphanedBiometricRegistrations = async (user: User) => {
      const localRegistrationId = await this.biometrics.getBiometricRegistrationId();
      if (
        !!localRegistrationId &&
        user.biometric_registrations.map((record) => record.biometric_registration_id).includes(localRegistrationId) !==
          true
      ) {
        await nativeModule.Biometrics.deleteKeys();
      }
    };

    const processPotentialBiometricRegistrationCleanups = async (currentUser: User) => {
      const lastAuthenticatedUserId = await this._storageClient.getData('stytch_last_authenticated_user_id');
      if (!lastAuthenticatedUserId || lastAuthenticatedUserId === currentUser.user_id) {
        // if we have no previous user, or it's the same user as before, just clean up any local registrations that don't exist on the server
        cleanupPotentiallyOrphanedBiometricRegistrations(currentUser);
      } else {
        // if they are different, and there is an existing biometric registration on the device:
        this.biometrics.getBiometricRegistrationId().then(async (registrationId) => {
          if (registrationId) {
            // delete the local registration
            this.biometrics.deleteDeviceRegistration();
          }
        });
      }
      await this._storageClient.setData('stytch_last_authenticated_user_id', currentUser.user_id);
    };
  }
}
