import { DisabledDFPProtectedAuthProvider, IDFPProtectedAuthProvider } from '../../DFPProtectedAuthProvider';
import { INetworkClient } from '../../NetworkClient';
import { IPKCEManager } from '../../PKCEManager';
import { IB2BSubscriptionService } from '../../SubscriptionService';
import {
  B2BMagicLinksInviteOptions,
  B2BMagicLinksInviteResponse,
  ResponseCommon,
  StytchProjectConfigurationInput,
} from '../../public';
import {
  B2BMagicLinkLoginOrSignupOptions,
  B2BMagicLinkLoginOrSignupResponse,
  B2BMagicLinksAuthenticateOptions,
  B2BMagicLinksAuthenticateResponse,
  B2BMagicLinksDiscoveryAuthenticateOptions,
  B2BMagicLinksDiscoveryAuthenticateResponse,
  B2BMagicLinksEmailDiscoverySendOptions,
  B2BMagicLinksEmailDiscoverySendResponse,
  IHeadlessB2BMagicLinksClient,
} from '../../public/b2b/magicLinks';
import { validate } from '../../utils';

type DynamicConfig = Promise<{
  pkceRequiredForEmailMagicLinks: boolean;
}>;

const DefaultDynamicConfig = Promise.resolve({
  pkceRequiredForEmailMagicLinks: false,
});

export class HeadlessB2BMagicLinksClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BMagicLinksClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    private _pkceManager: IPKCEManager,
    private _passwordResetPKCEManager: IPKCEManager,
    private _config: DynamicConfig = DefaultDynamicConfig,
    private dfpProtectedAuth: IDFPProtectedAuthProvider = DisabledDFPProtectedAuthProvider(),
  ) {}

  private async getCodeChallenge(): Promise<string | undefined> {
    const { pkceRequiredForEmailMagicLinks } = await this._config;
    if (!pkceRequiredForEmailMagicLinks) {
      return undefined;
    }
    let keyPair = await this._pkceManager.getPKPair();
    if (keyPair) {
      return keyPair.code_challenge;
    }
    keyPair = await this._pkceManager.startPKCETransaction();
    return keyPair.code_challenge;
  }

  private async handlePKCEForAuthenticate(
    pkceManager: IPKCEManager,
    data: B2BMagicLinksAuthenticateOptions,
  ): Promise<B2BMagicLinksAuthenticateResponse<TProjectConfiguration>> {
    const pkPair = await pkceManager.getPKPair();

    const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

    const requestBody = {
      pkce_code_verifier: pkPair?.code_verifier,
      dfp_telemetry_id,
      captcha_token,
      intermediate_session_token: (await this._subscriptionService.getIntermediateSessionToken()) || undefined,
      ...data,
    };
    const resp = await this._networkClient.retriableFetchSDK<B2BMagicLinksAuthenticateResponse<TProjectConfiguration>>({
      url: '/b2b/magic_links/authenticate',
      body: requestBody,
      method: 'POST',
      retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
    });

    pkceManager.clearPKPair();

    return resp;
  }

  email = {
    invite: async (data: B2BMagicLinksInviteOptions): Promise<B2BMagicLinksInviteResponse> => {
      validate('stytch.magicLinks.email.invite')
        .isString('email_address', data.email_address)
        .isOptionalString('invite_redirect_url', data.invite_redirect_url)
        .isOptionalString('invite_template_id', data.invite_template_id)
        .isOptionalString('name', data.name)
        .isOptionalString('locale', data.locale)
        .isOptionalStringArray('roles', data.roles)
        .isOptionalNumber('invite_expiration_minutes', data.invite_expiration_minutes);

      return this._networkClient.fetchSDK<B2BMagicLinksInviteResponse>({
        url: '/b2b/magic_links/email/invite',
        body: data,
        method: 'POST',
      });
    },
    loginOrSignup: async (data: B2BMagicLinkLoginOrSignupOptions): Promise<ResponseCommon> => {
      validate('stytch.magicLinks.email.loginOrSignup')
        .isString('email_address', data.email_address)
        .isString('organization_id', data.organization_id)
        .isOptionalString('login_redirect_url', data.login_redirect_url)
        .isOptionalString('login_template_id', data.login_template_id)
        .isOptionalString('signup_redirect_url', data.signup_redirect_url)
        .isOptionalString('signup_template_id', data.signup_template_id)
        .isOptionalString('locale', data.locale)
        .isOptionalNumber('login_expiration_minutes', data.login_expiration_minutes)
        .isOptionalNumber('signup_expiration_minutes', data.signup_expiration_minutes);

      const pkce_code_challenge = await this.getCodeChallenge();
      const requestBody = {
        ...data,
        pkce_code_challenge,
      };
      return this._networkClient.fetchSDK<B2BMagicLinkLoginOrSignupResponse>({
        url: '/b2b/magic_links/email/login_or_signup',
        body: requestBody,
        method: 'POST',
      });
    },
    discovery: {
      send: async (data: B2BMagicLinksEmailDiscoverySendOptions): Promise<B2BMagicLinksEmailDiscoverySendResponse> => {
        validate('stytch.magicLinks.email.discovery.send')
          .isString('email_address', data.email_address)
          .isOptionalString('discovery_redirect_url', data.discovery_redirect_url)
          .isOptionalString('login_template_id', data.login_template_id)
          .isOptionalString('locale', data.locale)
          .isOptionalNumber('discovery_expiration_minutes', data.discovery_expiration_minutes);

        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
        const pkce_code_challenge = await this.getCodeChallenge();
        const requestBody = {
          ...data,
          pkce_code_challenge,
          dfp_telemetry_id,
          captcha_token,
        };
        return this._networkClient.retriableFetchSDK<B2BMagicLinksEmailDiscoverySendResponse>({
          url: '/b2b/magic_links/email/discovery/send',
          body: requestBody,
          method: 'POST',
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },
    },
  };

  authenticate = this._subscriptionService.withUpdateSession(async (data: B2BMagicLinksAuthenticateOptions) => {
    validate('stytch.magicLinks.authenticate')
      .isString('magic_links_token', data.magic_links_token)
      .isNumber('session_duration_minutes', data.session_duration_minutes)
      .isOptionalString('locale', data.locale);

    // When a user resets their password with PKCE turned on, they create a pkPair in the 'passwords' namespace.
    // However, when the user gets the reset password email, they have the option to log in without a password.
    // This redirects them to the magic link authenticate flow, which automatically looks for the pkce code_verifier
    // in the 'magic_links' namespace, breaking the flow. Unfortunately we won't know for sure in the eml authenticate call
    // whether or not the user is coming from a password reset flow. To handle this, we have to try to authenticate with
    // both the 'passwords' and 'magic_links' code_verifiers.
    const passwordResetPKPair = await this._passwordResetPKCEManager.getPKPair();

    let resp: B2BMagicLinksAuthenticateResponse<TProjectConfiguration> | null = null;

    if (passwordResetPKPair?.code_verifier) {
      try {
        resp = await this.handlePKCEForAuthenticate(this._passwordResetPKCEManager, data);
      } catch (e) {
        if ((e as Error).message.includes('pkce')) {
          // If pkce-related error, fall back to magic links code_verifier
          // eslint-disable-next-line no-console
          console.log(
            'Authenticate with passwords pkce namespace failed. Falling back to authenticate with magic_links namespace.',
          );
        } else {
          throw e;
        }
      }
    }

    if (!resp) {
      resp = await this.handlePKCEForAuthenticate(this._pkceManager, data);
    }

    return resp;
  });

  discovery = {
    authenticate: this._subscriptionService.withUpdateSession(
      async (
        data: B2BMagicLinksDiscoveryAuthenticateOptions,
      ): Promise<B2BMagicLinksDiscoveryAuthenticateResponse<TProjectConfiguration>> => {
        validate('stytch.magicLinks.discovery.authenticate').isString(
          'discovery_magic_links_token',
          data.discovery_magic_links_token,
        );

        const pkPair = await this._pkceManager.getPKPair();

        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        const requestBody = {
          pkce_code_verifier: pkPair?.code_verifier,
          dfp_telemetry_id,
          captcha_token,
          ...data,
        };
        const resp = await this._networkClient.retriableFetchSDK<
          B2BMagicLinksDiscoveryAuthenticateResponse<TProjectConfiguration>
        >({
          url: '/b2b/magic_links/discovery/authenticate',
          body: requestBody,
          method: 'POST',
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });

        this._pkceManager.clearPKPair();

        return resp;
      },
    ),
  };
}
