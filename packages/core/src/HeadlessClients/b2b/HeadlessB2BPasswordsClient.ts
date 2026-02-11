import { IDFPProtectedAuthProvider } from '../../DFPProtectedAuthProvider';
import { INetworkClient } from '../../NetworkClient';
import { IPKCEManager } from '../../PKCEManager';
import {
  B2BPasswordAuthenticateOptions,
  B2BPasswordAuthenticateResponse,
  B2BPasswordDiscoveryAuthenticateOptions,
  B2BPasswordDiscoveryAuthenticateResponse,
  B2BPasswordDiscoveryResetByEmailOptions,
  B2BPasswordDiscoveryResetByEmailResponse,
  B2BPasswordDiscoveryResetByEmailStartOptions,
  B2BPasswordDiscoveryResetByEmailStartResponse,
  B2BPasswordResetByEmailOptions,
  B2BPasswordResetByEmailResponse,
  B2BPasswordResetByEmailStartOptions,
  B2BPasswordResetByEmailStartResponse,
  B2BPasswordResetByExistingPasswordOptions,
  B2BPasswordResetByExistingPasswordResponse,
  B2BPasswordResetBySessionOptions,
  B2BPasswordResetBySessionResponse,
  B2BPasswordStrengthCheckOptions,
  B2BPasswordStrengthCheckResponse,
  IHeadlessB2BPasswordClient,
} from '../../public/b2b/passwords';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { IB2BSubscriptionService } from '../../SubscriptionService';
import { validateInDev } from '../../utils/dev';

type DynamicConfig = Promise<{
  pkceRequiredForPasswordResets: boolean;
}>;

const DefaultDynamicConfig = Promise.resolve({
  pkceRequiredForPasswordResets: false,
});

export class HeadlessB2BPasswordsClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BPasswordClient<TProjectConfiguration>
{
  authenticate: (
    options: B2BPasswordAuthenticateOptions,
  ) => Promise<B2BPasswordAuthenticateResponse<TProjectConfiguration>>;

  discovery: {
    resetByEmailStart: (
      options: B2BPasswordDiscoveryResetByEmailStartOptions,
    ) => Promise<B2BPasswordDiscoveryResetByEmailStartResponse>;
    resetByEmail: (
      options: B2BPasswordDiscoveryResetByEmailOptions,
    ) => Promise<B2BPasswordDiscoveryResetByEmailResponse<TProjectConfiguration>>;
    authenticate: (
      options: B2BPasswordDiscoveryAuthenticateOptions,
    ) => Promise<B2BPasswordDiscoveryAuthenticateResponse<TProjectConfiguration>>;
  };

  resetByEmail: (
    options: B2BPasswordResetByEmailOptions,
  ) => Promise<B2BPasswordResetByEmailResponse<TProjectConfiguration>>;

  resetByExistingPassword: (
    options: B2BPasswordResetByExistingPasswordOptions,
  ) => Promise<B2BPasswordResetByExistingPasswordResponse<TProjectConfiguration>>;

  resetBySession: (
    options: B2BPasswordResetBySessionOptions,
  ) => Promise<B2BPasswordResetBySessionResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    private _pkceManager: IPKCEManager,
    private _config: DynamicConfig = DefaultDynamicConfig,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.authenticate = this._subscriptionService.withUpdateSession(
      async (
        options: B2BPasswordAuthenticateOptions,
      ): Promise<B2BPasswordAuthenticateResponse<TProjectConfiguration>> => {
        validateInDev('stytch.passwords.authenticate', options, {
          organization_id: 'string',
          password: 'string',
          email_address: 'string',
          session_duration_minutes: 'number',
          locale: 'optionalString',
        });

        const pkPair = await this._pkceManager.getPKPair();
        const code_verifier = pkPair?.code_verifier;
        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        return this._networkClient.retriableFetchSDK<B2BPasswordAuthenticateResponse<TProjectConfiguration>>({
          url: '/b2b/passwords/authenticate',
          method: 'POST',
          body: {
            organization_id: options.organization_id,
            email_address: options.email_address,
            password: options.password,
            session_duration_minutes: options.session_duration_minutes,
            locale: options.locale,
            captcha_token,
            dfp_telemetry_id,
            code_verifier,
            intermediate_session_token: this._subscriptionService.getIntermediateSessionToken() || undefined,
          },
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },
    );

    this.discovery = {
      resetByEmailStart: async (
        options: B2BPasswordDiscoveryResetByEmailStartOptions,
      ): Promise<B2BPasswordDiscoveryResetByEmailStartResponse> => {
        validateInDev('stytch.passwords.discovery.resetByEmailStart', options, {
          email_address: 'string',
          discovery_redirect_url: 'optionalString',
          reset_password_redirect_url: 'optionalString',
          reset_password_template_id: 'optionalString',
          reset_password_expiration_minutes: 'optionalNumber',
          verify_email_template_id: 'optionalString',
          locale: 'optionalString',
        });

        const pkce_code_challenge = await this.getCodeChallenge();
        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        return this._networkClient.retriableFetchSDK<B2BPasswordDiscoveryResetByEmailStartResponse>({
          url: '/b2b/passwords/discovery/reset/start',
          method: 'POST',
          body: {
            email_address: options.email_address,
            discovery_redirect_url: options.discovery_redirect_url,
            reset_password_redirect_url: options.reset_password_redirect_url,
            reset_password_expiration_minutes: options.reset_password_expiration_minutes,
            reset_password_template_id: options.reset_password_template_id,
            verify_email_template_id: options.verify_email_template_id,
            locale: options.locale,
            pkce_code_challenge,
            captcha_token,
            dfp_telemetry_id,
          },
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },
      resetByEmail: this._subscriptionService.withUpdateSession(
        async (
          options: B2BPasswordDiscoveryResetByEmailOptions,
        ): Promise<B2BPasswordDiscoveryResetByEmailResponse<TProjectConfiguration>> => {
          validateInDev('stytch.passwords.discovery.resetByEmail', options, {
            password_reset_token: 'string',
            password: 'string',
          });

          const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
          const pkPair = await this._pkceManager.getPKPair();
          const pkce_code_verifier = pkPair?.code_verifier;

          const resp = await this._networkClient.retriableFetchSDK<
            B2BPasswordDiscoveryResetByEmailResponse<TProjectConfiguration>
          >({
            url: '/b2b/passwords/discovery/reset',
            method: 'POST',
            body: {
              password_reset_token: options.password_reset_token,
              password: options.password,
              captcha_token,
              dfp_telemetry_id,
              pkce_code_verifier,
              intermediate_session_token: (await this._subscriptionService.getIntermediateSessionToken()) || undefined,
            },
            retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
          });

          this._pkceManager.clearPKPair();

          return resp;
        },
      ),

      authenticate: this._subscriptionService.withUpdateSession(
        async (
          options: B2BPasswordDiscoveryAuthenticateOptions,
        ): Promise<B2BPasswordDiscoveryAuthenticateResponse<TProjectConfiguration>> => {
          validateInDev('stytch.passwords.discovery.authenticate', options, {
            password: 'string',
            email_address: 'string',
          });

          const pkPair = await this._pkceManager.getPKPair();
          const code_verifier = pkPair?.code_verifier;
          const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

          return this._networkClient.retriableFetchSDK<B2BPasswordDiscoveryAuthenticateResponse<TProjectConfiguration>>(
            {
              url: '/b2b/passwords/discovery/authenticate',
              method: 'POST',
              body: {
                email_address: options.email_address,
                password: options.password,
                captcha_token,
                dfp_telemetry_id,
                code_verifier,
              },
              retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
            },
          );
        },
      ),
    };

    this.resetByEmail = this._subscriptionService.withUpdateSession(
      async (
        options: B2BPasswordResetByEmailOptions,
      ): Promise<B2BPasswordResetByEmailResponse<TProjectConfiguration>> => {
        validateInDev('stytch.passwords.resetByEmail', options, {
          password_reset_token: 'string',
          password: 'string',
          session_duration_minutes: 'number',
          locale: 'optionalString',
        });

        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
        const pkPair = await this._pkceManager.getPKPair();
        const code_verifier = pkPair?.code_verifier;

        const resp = await this._networkClient.retriableFetchSDK<
          B2BPasswordResetByEmailResponse<TProjectConfiguration>
        >({
          url: '/b2b/passwords/email/reset',
          method: 'POST',
          body: {
            password_reset_token: options.password_reset_token,
            password: options.password,
            session_duration_minutes: options.session_duration_minutes,
            locale: options.locale,
            captcha_token,
            dfp_telemetry_id,
            code_verifier: code_verifier,
            intermediate_session_token: this._subscriptionService.getIntermediateSessionToken() || undefined,
          },
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });

        this._pkceManager.clearPKPair();
        return resp;
      },
    );

    this.resetByExistingPassword = this._subscriptionService.withUpdateSession(
      async (
        options: B2BPasswordResetByExistingPasswordOptions,
      ): Promise<B2BPasswordResetByExistingPasswordResponse<TProjectConfiguration>> => {
        validateInDev('stytch.passwords.resetByExistingPassword', options, {
          email_address: 'string',
          existing_password: 'string',
          new_password: 'string',
          locale: 'optionalString',
          session_duration_minutes: 'number',
        });

        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        return this._networkClient.retriableFetchSDK<B2BPasswordResetByExistingPasswordResponse<TProjectConfiguration>>(
          {
            url: '/b2b/passwords/existing_password/reset',
            method: 'POST',
            body: {
              organization_id: options.organization_id,
              email_address: options.email_address,
              existing_password: options.existing_password,
              new_password: options.new_password,
              locale: options.locale,
              session_duration_minutes: options.session_duration_minutes,
              captcha_token,
              dfp_telemetry_id,
            },
            retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
          },
        );
      },
    );

    this.resetBySession = this._subscriptionService.withUpdateSession(
      async (
        options: B2BPasswordResetBySessionOptions,
      ): Promise<B2BPasswordResetBySessionResponse<TProjectConfiguration>> => {
        validateInDev('stytch.passwords.resetBySession', options, {
          password: 'string',
        });

        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        return this._networkClient.retriableFetchSDK<B2BPasswordResetBySessionResponse<TProjectConfiguration>>({
          url: '/b2b/passwords/session/reset',
          method: 'POST',
          body: {
            password: options.password,
            captcha_token,
            dfp_telemetry_id,
          },
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },
    );
  }

  private async getCodeChallenge(): Promise<string | undefined> {
    const { pkceRequiredForPasswordResets } = await this._config;
    if (!pkceRequiredForPasswordResets) {
      return undefined;
    }
    let keyPair = await this._pkceManager.getPKPair();
    if (keyPair) {
      return keyPair.code_challenge;
    }
    keyPair = await this._pkceManager.startPKCETransaction();
    return keyPair.code_challenge;
  }

  async resetByEmailStart(options: B2BPasswordResetByEmailStartOptions): Promise<B2BPasswordResetByEmailStartResponse> {
    validateInDev('stytch.passwords.resetByEmailStart', options, {
      email_address: 'string',
      login_redirect_url: 'optionalString',
      reset_password_redirect_url: 'optionalString',
      reset_password_template_id: 'optionalString',
      reset_password_expiration_minutes: 'optionalNumber',
      verify_email_template_id: 'optionalString',
      locale: 'optionalString',
    });

    const code_challenge = await this.getCodeChallenge();
    const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

    return this._networkClient.retriableFetchSDK<B2BPasswordResetByEmailStartResponse>({
      url: '/b2b/passwords/email/reset/start',
      method: 'POST',
      body: {
        organization_id: options.organization_id,
        email_address: options.email_address,
        login_redirect_url: options.login_redirect_url,
        reset_password_redirect_url: options.reset_password_redirect_url,
        reset_password_expiration_minutes: options.reset_password_expiration_minutes,
        reset_password_template_id: options.reset_password_template_id,
        verify_email_template_id: options.verify_email_template_id,
        locale: options.locale,
        code_challenge,
        captcha_token,
        dfp_telemetry_id,
      },
      retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
    });
  }

  async strengthCheck(options: B2BPasswordStrengthCheckOptions): Promise<B2BPasswordStrengthCheckResponse> {
    validateInDev('stytch.passwords.strengthCheck', options, {
      email_address: 'optionalString',
      password: 'string',
    });

    return this._networkClient.fetchSDK<B2BPasswordStrengthCheckResponse>({
      url: '/b2b/passwords/strength_check',
      method: 'POST',
      body: {
        email_address: options.email_address,
        password: options.password,
      },
    });
  }
}
