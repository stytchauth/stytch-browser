import {
  DisabledDFPProtectedAuthProvider,
  IConsumerSubscriptionService,
  IDFPProtectedAuthProvider,
  INetworkClient,
  omitUser,
  validateInDev,
  WithUser,
} from '@stytch/core';
import {
  errorToStytchError,
  IHeadlessWebAuthnClient,
  StytchProjectConfigurationInput,
  WebAuthnAuthenticateResponse,
  WebAuthnAuthenticateStartOptions,
  WebAuthnAuthenticateStartResponse,
  WebAuthnRegisterResponse,
  WebAuthnRegisterStartOptions,
  WebAuthnRegisterStartResponse,
  WebAuthnUpdateOptions,
  WebAuthnUpdateResponse,
} from '@stytch/core/public';

import StytchReactNativeModule from './native-module';

export class HeadlessWebAuthnClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessWebAuthnClient<TProjectConfiguration>
{
  private nativeModule: StytchReactNativeModule;
  register: (options?: WebAuthnRegisterStartOptions) => Promise<WebAuthnRegisterResponse<TProjectConfiguration>>;

  authenticate: (
    options: WebAuthnAuthenticateStartOptions,
  ) => Promise<WebAuthnAuthenticateResponse<TProjectConfiguration>>;

  constructor(
    public _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider = DisabledDFPProtectedAuthProvider(),
  ) {
    this.nativeModule = new StytchReactNativeModule();
    this.register = this._subscriptionService.withUpdateSession(
      async (options?: WebAuthnRegisterStartOptions): Promise<WebAuthnRegisterResponse<TProjectConfiguration>> => {
        const userAgentResp = await this.nativeModule.DeviceInfo.getUserAgent();

        const startResp = await this._networkClient.fetchSDK<WebAuthnRegisterStartResponse>({
          url: '/webauthn/register/start',
          method: 'POST',
          body: {
            domain: options?.domain,
            authenticator_type: 'platform',
            return_passkey_credential_options: options?.is_passkey,
            override_id: options?.override_id,
            override_name: options?.override_name,
            override_display_name: options?.override_display_name,
            user_agent: userAgentResp.userAgent,
          },
        });

        const publicKeyCredentialCreationOptions = startResp.public_key_credential_creation_options;
        try {
          const registerResp = await this.nativeModule.Passkeys.register({
            publicKeyCredentialOptions: publicKeyCredentialCreationOptions,
          });

          const resp = await this._networkClient.fetchSDK<WithUser<WebAuthnRegisterResponse<TProjectConfiguration>>>({
            url: '/webauthn/register',
            method: 'POST',
            body: {
              public_key_credential: registerResp.publicKeyCredential,
              session_duration_minutes: options?.session_duration_minutes,
            },
          });

          return omitUser(resp);
        } catch (err) {
          throw errorToStytchError(err);
        }
      },
    );

    this.authenticate = this._subscriptionService.withUpdateSession(
      async (
        options: WebAuthnAuthenticateStartOptions,
      ): Promise<WebAuthnAuthenticateResponse<TProjectConfiguration>> => {
        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        const isLoggedIn = !!this._subscriptionService.getSession();

        const endpoint = isLoggedIn ? '/webauthn/authenticate/start/secondary' : '/webauthn/authenticate/start/primary';

        const startResp = await this._networkClient.fetchSDK<WebAuthnAuthenticateStartResponse>({
          url: endpoint,
          method: 'POST',
          body: {
            domain: options.domain,
            return_passkey_credential_options: options.is_passkey,
          },
        });

        const publicKeyCredentialRequestOptions = startResp.public_key_credential_request_options;
        try {
          const authenticateResp = await this.nativeModule.Passkeys.authenticate({
            publicKeyCredentialOptions: publicKeyCredentialRequestOptions,
          });

          const authenticationData = await this._networkClient.retriableFetchSDK<
            WithUser<WebAuthnAuthenticateResponse<TProjectConfiguration>>
          >({
            url: '/webauthn/authenticate',
            method: 'POST',
            body: {
              public_key_credential: authenticateResp.publicKeyCredential,
              session_duration_minutes: options.session_duration_minutes,
              dfp_telemetry_id,
              captcha_token,
            },
            retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
          });

          return omitUser(authenticationData);
        } catch (err) {
          throw errorToStytchError(err);
        }
      },
    );
  }

  update = async (options: WebAuthnUpdateOptions): Promise<WebAuthnUpdateResponse> => {
    validateInDev('stytch.webauthn.update', options, {
      webauthn_registration_id: 'string',
      name: 'string',
    });

    const url = '/webauthn/update/' + options.webauthn_registration_id;
    return await this._networkClient.fetchSDK<WebAuthnUpdateResponse>({
      url: url,
      method: 'PUT',
      body: {
        name: options.name,
      },
    });
  };

  // Not used in React Native
  browserSupportsAutofill(): Promise<boolean> {
    return Promise.resolve(false);
  }
}
