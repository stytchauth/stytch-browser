import { IConsumerSubscriptionService } from '..';
import { IDFPProtectedAuthProvider } from '../DFPProtectedAuthProvider';
import { INetworkClient } from '../NetworkClient';
import { IPKCEManager } from '../PKCEManager';
import {
  IHeadlessPasswordClient,
  PasswordAuthenticateOptions,
  PasswordAuthenticateResponse,
  PasswordCreateOptions,
  PasswordCreateResponse,
  PasswordResetByEmailOptions,
  PasswordResetByEmailResponse,
  PasswordResetByEmailStartOptions,
  PasswordResetByEmailStartResponse,
  PasswordResetByExistingPasswordOptions,
  PasswordResetByExistingPasswordResponse,
  PasswordResetBySessionOptions,
  PasswordResetBySessionResponse,
  PasswordStrengthCheckOptions,
  PasswordStrengthCheckResponse,
  StytchProjectConfigurationInput,
} from '../public';
import { omitUser, validate, WithUser } from '../utils';

type DynamicConfig = Promise<{
  pkceRequiredForPasswordResets: boolean;
}>;

const DefaultDynamicConfig = Promise.resolve({
  pkceRequiredForPasswordResets: false,
});

export class HeadlessPasswordClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessPasswordClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
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

  create = this._subscriptionService.withUpdateSession(
    async (options: PasswordCreateOptions): Promise<PasswordCreateResponse<TProjectConfiguration>> => {
      validate('stytch.passwords.create')
        .isString('password', options.password)
        .isString('email', options.email)
        .isNumber('session_duration_minutes', options.session_duration_minutes);

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

      const resp = await this._networkClient.retriableFetchSDK<WithUser<PasswordCreateResponse<TProjectConfiguration>>>(
        {
          url: '/passwords',
          method: 'POST',
          body: {
            email: options.email,
            password: options.password,
            session_duration_minutes: options.session_duration_minutes,
            captcha_token,
            dfp_telemetry_id,
          },
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        },
      );

      return omitUser(resp);
    },
  );

  authenticate = this._subscriptionService.withUpdateSession(
    async (options: PasswordAuthenticateOptions): Promise<PasswordAuthenticateResponse<TProjectConfiguration>> => {
      validate('stytch.passwords.authenticate')
        .isString('password', options.password)
        .isString('email', options.email)
        .isNumber('session_duration_minutes', options.session_duration_minutes);

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

      const resp = await this._networkClient.retriableFetchSDK<
        WithUser<PasswordAuthenticateResponse<TProjectConfiguration>>
      >({
        url: '/passwords/authenticate',
        method: 'POST',
        body: {
          email: options.email,
          password: options.password,
          session_duration_minutes: options.session_duration_minutes,
          captcha_token,
          dfp_telemetry_id,
        },
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });

      return omitUser(resp);
    },
  );

  async resetByEmailStart(options: PasswordResetByEmailStartOptions): Promise<PasswordResetByEmailStartResponse> {
    validate('stytch.passwords.resetByEmailStart')
      .isString('email', options.email)
      .isOptionalString('login_redirect_url', options.login_redirect_url)
      .isOptionalString('reset_password_redirect_url', options.reset_password_redirect_url)
      .isOptionalString('reset_password_template_id', options.reset_password_template_id)
      .isOptionalNumber('reset_password_expiration_minutes', options.reset_password_expiration_minutes)
      .isOptionalString('locale', options.locale);

    const code_challenge = await this.getCodeChallenge();
    const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

    return this._networkClient.retriableFetchSDK<PasswordResetByEmailStartResponse>({
      url: '/passwords/email/reset/start',
      method: 'POST',
      body: {
        email: options.email,
        login_redirect_url: options.login_redirect_url,
        reset_password_redirect_url: options.reset_password_redirect_url,
        reset_password_expiration_minutes: options.reset_password_expiration_minutes,
        reset_password_template_id: options.reset_password_template_id,
        locale: options.locale,
        code_challenge,
        captcha_token,
        dfp_telemetry_id,
      },
      retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
    });
  }

  resetByEmail = this._subscriptionService.withUpdateSession(
    async (options: PasswordResetByEmailOptions): Promise<PasswordResetByEmailResponse<TProjectConfiguration>> => {
      validate('stytch.passwords.resetByEmail')
        .isString('token', options.token)
        .isString('password', options.password)
        .isNumber('session_duration_minutes', options.session_duration_minutes);

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const pkPair = await this._pkceManager.getPKPair();
      const code_verifier = pkPair?.code_verifier;

      const resp = await this._networkClient.retriableFetchSDK<
        WithUser<PasswordResetByEmailResponse<TProjectConfiguration>>
      >({
        url: '/passwords/email/reset',
        method: 'POST',
        body: {
          token: options.token,
          password: options.password,
          session_duration_minutes: options.session_duration_minutes,
          captcha_token,
          code_verifier,
          dfp_telemetry_id,
        },
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });

      this._pkceManager.clearPKPair();

      return omitUser(resp);
    },
  );

  resetByExistingPassword = this._subscriptionService.withUpdateSession(
    async (
      options: PasswordResetByExistingPasswordOptions,
    ): Promise<PasswordResetByExistingPasswordResponse<TProjectConfiguration>> => {
      validate('stytch.passwords.resetByExistingPassword')
        .isString('email', options.email)
        .isString('existing_password', options.existing_password)
        .isString('new_password', options.new_password)
        .isNumber('session_duration_minutes', options.session_duration_minutes);

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

      const resp = await this._networkClient.retriableFetchSDK<
        WithUser<PasswordResetByExistingPasswordResponse<TProjectConfiguration>>
      >({
        url: '/passwords/existing_password/reset',
        method: 'POST',
        body: {
          email: options.email,
          existing_password: options.existing_password,
          new_password: options.new_password,
          session_duration_minutes: options.session_duration_minutes,
          dfp_telemetry_id,
          captcha_token,
        },
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });

      return omitUser(resp);
    },
  );

  resetBySession = this._subscriptionService.withUpdateSession(
    async (options: PasswordResetBySessionOptions): Promise<PasswordResetBySessionResponse<TProjectConfiguration>> => {
      validate('stytch.passwords.resetBySession').isString('password', options.password);

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

      return this._networkClient.retriableFetchSDK<PasswordResetBySessionResponse<TProjectConfiguration>>({
        url: '/passwords/session/reset',
        method: 'POST',
        body: {
          password: options.password,
          session_duration_minutes: options.session_duration_minutes,
          dfp_telemetry_id,
          captcha_token,
        },
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });
    },
  );

  async strengthCheck(options: PasswordStrengthCheckOptions): Promise<PasswordStrengthCheckResponse> {
    validate('stytch.passwords.strengthCheck')
      .isOptionalString('email', options.email)
      .isString('password', options.password);

    return this._networkClient.fetchSDK<PasswordStrengthCheckResponse>({
      url: '/passwords/strength_check',
      method: 'POST',
      body: {
        email: options.email,
        password: options.password,
      },
    });
  }
}
