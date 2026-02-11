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
import { omitUser, WithUser } from '../utils';
import { validateInDev } from '../utils/dev';

type DynamicConfig = Promise<{
  pkceRequiredForPasswordResets: boolean;
}>;

const DefaultDynamicConfig = Promise.resolve({
  pkceRequiredForPasswordResets: false,
});

export class HeadlessPasswordClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessPasswordClient<TProjectConfiguration>
{
  create: (options: PasswordCreateOptions) => Promise<PasswordCreateResponse<TProjectConfiguration>>;

  authenticate: (options: PasswordAuthenticateOptions) => Promise<PasswordAuthenticateResponse<TProjectConfiguration>>;

  resetByEmail: (options: PasswordResetByEmailOptions) => Promise<PasswordResetByEmailResponse<TProjectConfiguration>>;

  resetByExistingPassword: (
    options: PasswordResetByExistingPasswordOptions,
  ) => Promise<PasswordResetByExistingPasswordResponse<TProjectConfiguration>>;

  resetBySession: (
    options: PasswordResetBySessionOptions,
  ) => Promise<PasswordResetBySessionResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private _pkceManager: IPKCEManager,
    private _config: DynamicConfig = DefaultDynamicConfig,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.create = this._subscriptionService.withUpdateSession(
      async (options: PasswordCreateOptions): Promise<PasswordCreateResponse<TProjectConfiguration>> => {
        validateInDev('stytch.passwords.create', options, {
          password: 'string',
          email: 'string',
          session_duration_minutes: 'number',
        });

        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        const resp = await this._networkClient.retriableFetchSDK<
          WithUser<PasswordCreateResponse<TProjectConfiguration>>
        >({
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
        });

        return omitUser(resp);
      },
    );

    this.authenticate = this._subscriptionService.withUpdateSession(
      async (options: PasswordAuthenticateOptions): Promise<PasswordAuthenticateResponse<TProjectConfiguration>> => {
        validateInDev('stytch.passwords.authenticate', options, {
          password: 'string',
          email: 'string',
          session_duration_minutes: 'number',
        });

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

    this.resetByEmail = this._subscriptionService.withUpdateSession(
      async (options: PasswordResetByEmailOptions): Promise<PasswordResetByEmailResponse<TProjectConfiguration>> => {
        validateInDev('stytch.passwords.resetByEmail', options, {
          token: 'string',
          password: 'string',
          session_duration_minutes: 'number',
        });

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

    this.resetByExistingPassword = this._subscriptionService.withUpdateSession(
      async (
        options: PasswordResetByExistingPasswordOptions,
      ): Promise<PasswordResetByExistingPasswordResponse<TProjectConfiguration>> => {
        validateInDev('stytch.passwords.resetByExistingPassword', options, {
          email: 'string',
          existing_password: 'string',
          new_password: 'string',
          session_duration_minutes: 'number',
        });

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

    this.resetBySession = this._subscriptionService.withUpdateSession(
      async (
        options: PasswordResetBySessionOptions,
      ): Promise<PasswordResetBySessionResponse<TProjectConfiguration>> => {
        validateInDev('stytch.passwords.resetBySession', options, {
          password: 'string',
        });

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

  async resetByEmailStart(options: PasswordResetByEmailStartOptions): Promise<PasswordResetByEmailStartResponse> {
    validateInDev('stytch.passwords.resetByEmailStart', options, {
      email: 'string',
      login_redirect_url: 'optionalString',
      reset_password_redirect_url: 'optionalString',
      reset_password_template_id: 'optionalString',
      reset_password_expiration_minutes: 'optionalNumber',
      locale: 'optionalString',
    });

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

  async strengthCheck(options: PasswordStrengthCheckOptions): Promise<PasswordStrengthCheckResponse> {
    validateInDev('stytch.passwords.strengthCheck', options, {
      email: 'optionalString',
      password: 'string',
    });

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
