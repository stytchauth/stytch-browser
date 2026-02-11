import * as webauthnJson from '@github/webauthn-json';

import { IConsumerSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '..';
import {
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
} from '../public';
import { logger, omitUser, WithUser } from '../utils';
import { validateInDev } from '../utils/dev';

export class HeadlessWebAuthnClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessWebAuthnClient<TProjectConfiguration>
{
  register: (options: WebAuthnRegisterStartOptions) => Promise<WebAuthnRegisterResponse<TProjectConfiguration>>;

  authenticate: (
    options: WebAuthnAuthenticateStartOptions,
  ) => Promise<WebAuthnAuthenticateResponse<TProjectConfiguration> | null>;

  constructor(
    public _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.register = this._subscriptionService.withUpdateSession(
      async (options?: WebAuthnRegisterStartOptions): Promise<WebAuthnRegisterResponse<TProjectConfiguration>> => {
        if (options) {
          validateInDev('stytch.webauthn.register', options, {
            domain: 'optionalString',
            authenticator_type: 'optionalString',
            is_passkey: 'optionalBoolean',
            session_duration_minutes: 'number',
            override_id: 'optionalString',
            override_name: 'optionalString',
            override_display_name: 'optionalString',
            use_base64_url_encoding: 'optionalBoolean',
          });
        }

        const startResp = await this._networkClient.fetchSDK<WebAuthnRegisterStartResponse>({
          url: '/webauthn/register/start',
          method: 'POST',
          body: {
            domain: options?.domain ?? window.location.hostname,
            authenticator_type: options?.authenticator_type ?? undefined,
            return_passkey_credential_options: options?.is_passkey,
            override_id: options?.override_id,
            override_name: options?.override_name,
            override_display_name: options?.override_display_name,
            user_agent: navigator.userAgent,
            use_base64_url_encoding: options?.use_base64_url_encoding,
          },
        });

        const publicKeyCredentialCreationOptions = startResp.public_key_credential_creation_options;
        const publicKey = JSON.parse(publicKeyCredentialCreationOptions);

        const credential = await webauthnJson.create({
          publicKey: publicKey,
        });

        const resp = await this._networkClient.fetchSDK<WithUser<WebAuthnRegisterResponse<TProjectConfiguration>>>({
          url: '/webauthn/register',
          method: 'POST',
          body: {
            public_key_credential: JSON.stringify(credential),
            session_duration_minutes: options?.session_duration_minutes,
          },
        });

        return omitUser(resp);
      },
    );

    this.authenticate = this._subscriptionService.withUpdateSession(
      async (
        options: WebAuthnAuthenticateStartOptions,
      ): Promise<WebAuthnAuthenticateResponse<TProjectConfiguration> | null> => {
        validateInDev('stytch.webauthn.authenticate', options, {
          domain: 'optionalString',
          session_duration_minutes: 'number',
          is_passkey: 'optionalBoolean',
          signal: 'optionalObject',
          conditional_mediation: 'optionalBoolean',
          disable_input_check: 'optionalBoolean',
        });
        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        if (options.conditional_mediation) {
          if (!(await this.browserSupportsAutofill())) {
            logger.error('Browser does not support WebAuthn autofill');
            return null;
          }

          if (!options.disable_input_check && !this.checkEligibleInputs()) {
            return null;
          }
        }

        const isLoggedIn = !!this._subscriptionService.getSession();

        const endpoint = isLoggedIn ? '/webauthn/authenticate/start/secondary' : '/webauthn/authenticate/start/primary';

        const startResp = await this._networkClient.fetchSDK<WebAuthnAuthenticateStartResponse>({
          url: endpoint,
          method: 'POST',
          body: {
            domain: options.domain ?? window.location.hostname,
            return_passkey_credential_options: options?.is_passkey,
          },
        });

        const publicKeyCredentialRequestOptions = startResp.public_key_credential_request_options;
        const abortController = new AbortController();
        const credReqOptions = {
          publicKey: JSON.parse(publicKeyCredentialRequestOptions),
          signal: options.signal ?? abortController.signal,
        };
        const conditionalMediationCredReqOption = {
          ...credReqOptions,
          mediation: 'conditional' as CredentialMediationRequirement,
        };
        const credential = await webauthnJson.get(
          options.conditional_mediation ? conditionalMediationCredReqOption : credReqOptions,
        );

        const authenticationData = await this._networkClient.retriableFetchSDK<
          WithUser<WebAuthnAuthenticateResponse<TProjectConfiguration>>
        >({
          url: '/webauthn/authenticate',
          method: 'POST',
          body: {
            public_key_credential: JSON.stringify(credential),
            session_duration_minutes: options.session_duration_minutes,
            dfp_telemetry_id,
            captcha_token,
          },
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });

        return omitUser(authenticationData);
      },
    );
  }

  async update(options: WebAuthnUpdateOptions): Promise<WebAuthnUpdateResponse> {
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
  }

  async browserSupportsAutofill(): Promise<boolean> {
    return (await window.PublicKeyCredential?.isConditionalMediationAvailable?.()) ?? false;
  }

  private checkEligibleInputs = (): boolean => {
    // Check for an <input> with "webauthn" in its `autocomplete` attribute
    const eligibleInputs = document.querySelectorAll("input[autocomplete*='webauthn']");
    // WebAuthn autofill requires at least one valid input
    if (eligibleInputs.length < 1) {
      logger.error('No <input> with `"webauthn"` in its `autocomplete` attribute was detected');
      return false;
    }
    return true;
  };
}
