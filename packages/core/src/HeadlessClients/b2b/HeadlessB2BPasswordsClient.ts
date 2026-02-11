import { IDFPProtectedAuthProvider } from '../../DFPProtectedAuthProvider';
import { INetworkClient } from '../../NetworkClient';
import { IPKCEManager } from '../../PKCEManager';
import { IB2BSubscriptionService } from '../../SubscriptionService';
import { validate } from '../../utils';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import {
  B2BPasswordDiscoveryResetByEmailStartOptions,
  B2BPasswordDiscoveryResetByEmailStartResponse,
  B2BPasswordDiscoveryResetByEmailOptions,
  B2BPasswordDiscoveryResetByEmailResponse,
  B2BPasswordAuthenticateOptions,
  B2BPasswordAuthenticateResponse,
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
  B2BPasswordDiscoveryAuthenticateOptions,
  B2BPasswordDiscoveryAuthenticateResponse,
} from '../../public/b2b/passwords';

type DynamicConfig = Promise<{
  pkceRequiredForPasswordResets: boolean;
}>;

const DefaultDynamicConfig = Promise.resolve({
  pkceRequiredForPasswordResets: false,
});

export class HeadlessB2BPasswordsClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BPasswordClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    private _pkceManager: IPKCEManager,
    private _config: DynamicConfig = DefaultDynamicConfig,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {}

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

  authenticate = this._subscriptionService.withUpdateSession(
    async (
      options: B2BPasswordAuthenticateOptions,
    ): Promise<B2BPasswordAuthenticateResponse<TProjectConfiguration>> => {
      validate('stytch.passwords.authenticate')
        .isString('org_id', options.organization_id)
        .isString('password', options.password)
        .isString('email_address', options.email_address)
        .isNumber('session_duration_minutes', options.session_duration_minutes)
        .isOptionalString('locale', options.locale);

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

  async resetByEmailStart(options: B2BPasswordResetByEmailStartOptions): Promise<B2BPasswordResetByEmailStartResponse> {
    validate('stytch.passwords.resetByEmailStart')
      .isString('email', options.email_address)
      .isOptionalString('login_redirect_url', options.login_redirect_url)
      .isOptionalString('reset_password_redirect_url', options.reset_password_redirect_url)
      .isOptionalString('reset_password_template_id', options.reset_password_template_id)
      .isOptionalNumber('reset_password_expiration_minutes', options.reset_password_expiration_minutes)
      .isOptionalString('verify_email_template_id', options.verify_email_template_id)
      .isOptionalString('locale', options.locale);

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

  discovery = {
    resetByEmailStart: async (
      options: B2BPasswordDiscoveryResetByEmailStartOptions,
    ): Promise<B2BPasswordDiscoveryResetByEmailStartResponse> => {
      validate('stytch.passwords.discovery.resetByEmailStart')
        .isString('email', options.email_address)
        .isOptionalString('login_redirect_url', options.discovery_redirect_url)
        .isOptionalString('reset_password_redirect_url', options.reset_password_redirect_url)
        .isOptionalString('reset_password_template_id', options.reset_password_template_id)
        .isOptionalNumber('reset_password_expiration_minutes', options.reset_password_expiration_minutes)
        .isOptionalString('verify_email_template_id', options.verify_email_template_id)
        .isOptionalString('locale', options.locale);

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
        validate('stytch.passwords.discovery.resetByEmail')
          .isString('password_reset_token', options.password_reset_token)
          .isString('password', options.password);

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
        validate('stytch.passwords.discovery.authenticate')
          .isString('password', options.password)
          .isString('email_address', options.email_address);

        const pkPair = await this._pkceManager.getPKPair();
        const code_verifier = pkPair?.code_verifier;
        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        return this._networkClient.retriableFetchSDK<B2BPasswordDiscoveryAuthenticateResponse<TProjectConfiguration>>({
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
        });
      },
    ),
  };

  resetByEmail = this._subscriptionService.withUpdateSession(
    async (
      options: B2BPasswordResetByEmailOptions,
    ): Promise<B2BPasswordResetByEmailResponse<TProjectConfiguration>> => {
      validate('stytch.passwords.resetByEmail')
        .isString('password_reset_token', options.password_reset_token)
        .isString('password', options.password)
        .isNumber('session_duration_minutes', options.session_duration_minutes)
        .isOptionalString('locale', options.locale);

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const pkPair = await this._pkceManager.getPKPair();
      const code_verifier = pkPair?.code_verifier;

      const resp = await this._networkClient.retriableFetchSDK<B2BPasswordResetByEmailResponse<TProjectConfiguration>>({
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

  resetByExistingPassword = this._subscriptionService.withUpdateSession(
    async (
      options: B2BPasswordResetByExistingPasswordOptions,
    ): Promise<B2BPasswordResetByExistingPasswordResponse<TProjectConfiguration>> => {
      validate('stytch.passwords.resetByExistingPassword')
        .isString('email', options.email_address)
        .isString('existing_password', options.existing_password)
        .isString('new_password', options.new_password)
        .isOptionalString('locale', options.locale)
        .isNumber('session_duration_minutes', options.session_duration_minutes);

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

      return this._networkClient.retriableFetchSDK<B2BPasswordResetByExistingPasswordResponse<TProjectConfiguration>>({
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
      });
    },
  );

  resetBySession = this._subscriptionService.withUpdateSession(
    async (
      options: B2BPasswordResetBySessionOptions,
    ): Promise<B2BPasswordResetBySessionResponse<TProjectConfiguration>> => {
      validate('stytch.passwords.resetBySession').isString('password', options.password);

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

  async strengthCheck(options: B2BPasswordStrengthCheckOptions): Promise<B2BPasswordStrengthCheckResponse> {
    validate('stytch.passwords.strengthCheck')
      .isOptionalString('email', options.email_address)
      .isString('password', options.password);

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
