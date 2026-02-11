import { IConsumerSubscriptionService } from '..';
import { IDFPProtectedAuthProvider } from '../DFPProtectedAuthProvider';
import { INetworkClient } from '../NetworkClient';
import { IPKCEManager } from '../PKCEManager';
import {
  IHeadlessMagicLinksClient,
  MagicLinksAuthenticateOptions,
  MagicLinksAuthenticateResponse,
  MagicLinksLoginOrCreateOptions,
  MagicLinksLoginOrCreateResponse,
  MagicLinksSendOptions,
  MagicLinksSendResponse,
  ResponseCommon,
  StytchProjectConfigurationInput,
} from '../public';
import { omitUser, WithUser } from '../utils';
import { validateInDev } from '../utils/dev';

type DynamicConfig = Promise<{
  pkceRequiredForEmailMagicLinks: boolean;
}>;

const DefaultDynamicConfig = Promise.resolve({
  pkceRequiredForEmailMagicLinks: false,
});

export class HeadlessMagicLinksClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessMagicLinksClient<TProjectConfiguration>
{
  email: {
    loginOrCreate: (email: string, options?: MagicLinksLoginOrCreateOptions) => Promise<ResponseCommon>;
    send: (email: string, options?: MagicLinksSendOptions) => Promise<ResponseCommon>;
  };

  authenticate: (
    token: string,
    options: MagicLinksAuthenticateOptions,
  ) => Promise<MagicLinksAuthenticateResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private _pkceManager: IPKCEManager,
    private _passwordResetPKCEManager: IPKCEManager,
    private _config: DynamicConfig = DefaultDynamicConfig,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.email = {
      loginOrCreate: async (email: string, options: MagicLinksLoginOrCreateOptions = {}): Promise<ResponseCommon> => {
        const { pkceRequiredForEmailMagicLinks } = await this._config;

        let code_challenge: string | undefined = undefined;
        if (pkceRequiredForEmailMagicLinks) {
          code_challenge = await this.getCodeChallenge();
        }

        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
        const requestBody = {
          ...options,
          email,
          code_challenge,
          captcha_token,
          dfp_telemetry_id,
        };
        return this._networkClient.retriableFetchSDK<MagicLinksLoginOrCreateResponse>({
          url: '/magic_links/email/login_or_create',
          body: requestBody,
          method: 'POST',
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },

      send: async (email: string, options: MagicLinksSendOptions = {}): Promise<ResponseCommon> => {
        const { pkceRequiredForEmailMagicLinks } = await this._config;

        let code_challenge: string | undefined = undefined;
        if (pkceRequiredForEmailMagicLinks) {
          code_challenge = await this.getCodeChallenge();
        }
        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
        const requestBody = {
          ...options,
          email,
          code_challenge,
          captcha_token,
          dfp_telemetry_id,
        };
        const isLoggedIn = !!this._subscriptionService.getSession();

        const endpoint = isLoggedIn ? '/magic_links/email/send/secondary' : '/magic_links/email/send/primary';

        return this._networkClient.retriableFetchSDK<MagicLinksSendResponse>({
          url: endpoint,
          body: requestBody,
          method: 'POST',
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },
    };

    this.authenticate = this._subscriptionService.withUpdateSession(
      async (token: string, options: MagicLinksAuthenticateOptions) => {
        validateInDev(
          'stytch.magicLinks.authenticate',
          { token, ...options },
          {
            token: 'string',
            session_duration_minutes: 'number',
          },
        );

        // When a user resets their password with PKCE turned on, they create a pkPair in the 'passwords' namespace.
        // However, when the user gets the reset password email, they have the option to log in without a password.
        // This redirects them to the magic link authenticate flow, which automatically looks for the pkce code_verifier
        // in the 'magic_links' namespace, breaking the flow. Unfortunately we won't know for sure in the eml authenticate call
        // whether or not the user is coming from a password reset flow. To handle this, we have to try to authenticate with
        // both the 'passwords' and 'magic_links' code_verifiers.
        const passwordResetPKPair = await this._passwordResetPKCEManager.getPKPair();

        let resp: WithUser<MagicLinksAuthenticateResponse<TProjectConfiguration>> | null = null;

        if (passwordResetPKPair?.code_verifier) {
          try {
            resp = await this.handlePKCEForAuthenticate(this._passwordResetPKCEManager, { token, ...options });
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
          resp = await this.handlePKCEForAuthenticate(this._pkceManager, { token, ...options });
        }

        return omitUser(resp);
      },
    );
  }

  private async getCodeChallenge(): Promise<string> {
    let keyPair = await this._pkceManager.getPKPair();
    if (keyPair) {
      return keyPair.code_challenge;
    }
    keyPair = await this._pkceManager.startPKCETransaction();
    return keyPair.code_challenge;
  }

  private async handlePKCEForAuthenticate(
    pkceManager: IPKCEManager,
    data: MagicLinksAuthenticateOptions & { token: string },
  ): Promise<WithUser<MagicLinksAuthenticateResponse<TProjectConfiguration>>> {
    const pkPair = await pkceManager.getPKPair();

    const requestBody = {
      code_verifier: pkPair?.code_verifier,
      ...data,
    };

    const resp = await this._networkClient.fetchSDK<WithUser<MagicLinksAuthenticateResponse<TProjectConfiguration>>>({
      url: '/magic_links/authenticate',
      body: requestBody,
      method: 'POST',
    });

    pkceManager.clearPKPair();

    return resp;
  }
}
