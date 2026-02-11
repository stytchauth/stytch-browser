import { IB2BSubscriptionService, IDFPProtectedAuthProvider, INetworkClient, IPKCEManager } from '../..';
import {
  B2BSSOCreateExternalConnectionOptions,
  B2BSSOCreateExternalConnectionResponse,
  B2BSSODeleteConnectionResponse,
  B2BSSODiscoverConnectionsResponse,
  B2BSSOGetConnectionsResponse,
  B2BSSOOIDCCreateConnectionOptions,
  B2BSSOOIDCCreateConnectionResponse,
  B2BSSOOIDCUpdateConnectionOptions,
  B2BSSOOIDCUpdateConnectionResponse,
  B2BSSOSAMLCreateConnectionOptions,
  B2BSSOSAMLCreateConnectionResponse,
  B2BSSOSAMLDeleteEncryptionPrivateKeyOptions,
  B2BSSOSAMLDeleteEncryptionPrivateKeyResponse,
  B2BSSOSAMLDeleteVerificationCertificateOptions,
  B2BSSOSAMLDeleteVerificationCertificateResponse,
  B2BSSOSAMLUpdateConnectionByURLOptions,
  B2BSSOSAMLUpdateConnectionByURLResponse,
  B2BSSOSAMLUpdateConnectionOptions,
  B2BSSOSAMLUpdateConnectionResponse,
  B2BSSOUpdateExternalConnectionOptions,
  B2BSSOUpdateExternalConnectionResponse,
  IHeadlessB2BSSOClient,
  SSOAuthenticateOptions,
  SSOAuthenticateResponse,
  SSOStartOptions,
} from '../../public';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { isTestPublicToken, logger } from '../../utils';
import { validateInDev } from '../../utils/dev';

type DynamicConfig = Promise<{
  pkceRequiredForSso: boolean;
}>;
type Config = {
  publicToken: string;
  testAPIURL: string;
  liveAPIURL: string;
};

export class HeadlessB2BSSOClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BSSOClient<TProjectConfiguration>
{
  authenticate: (options: SSOAuthenticateOptions) => Promise<SSOAuthenticateResponse<TProjectConfiguration>>;

  constructor(
    protected _networkClient: INetworkClient,
    protected _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    protected _pkceManager: IPKCEManager,
    protected _dynamicConfig: DynamicConfig,
    protected _config: Config,
    protected dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.authenticate = this._subscriptionService.withUpdateSession(async (options: SSOAuthenticateOptions) => {
      validateInDev('stytch.sso.authenticate', options, {
        sso_token: 'string',
        session_duration_minutes: 'number',
        locale: 'optionalString',
      });

      const keyPair = await this._pkceManager.getPKPair();

      if (!keyPair) {
        logger.warn(
          'No code verifier found in local storage for SSO flow.\n' +
            'Consider using stytch.sso.start() to add PKCE to your SSO flows for added security.\n' +
            'See https://stytch.com/docs/oauth#guides_pkce for more information.',
        );
      }

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

      const resp = await this._networkClient.retriableFetchSDK<SSOAuthenticateResponse<TProjectConfiguration>>({
        url: '/b2b/sso/authenticate',
        method: 'POST',
        body: {
          pkce_code_verifier: keyPair?.code_verifier,
          ...options,
          dfp_telemetry_id,
          captcha_token,
          intermediate_session_token: this._subscriptionService.getIntermediateSessionToken() || undefined,
        },
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });

      this._pkceManager.clearPKPair();

      return resp;
    });
  }

  protected async getBaseApiUrl() {
    // Our TestAPIURL and LiveAPIURL should have the HTTPS protocol already attached
    // Don't add it twice!
    if (isTestPublicToken(this._config.publicToken)) {
      return this._config.testAPIURL;
    }
    return this._config.liveAPIURL;
  }

  async start({ connection_id, login_redirect_url, signup_redirect_url }: SSOStartOptions): Promise<void> {
    const { pkceRequiredForSso } = await this._dynamicConfig;
    const baseURL = await this.getBaseApiUrl();

    const startUrl = new URL(`${baseURL}/v1/public/sso/start`);
    startUrl.searchParams.set('public_token', this._config.publicToken);
    startUrl.searchParams.set('connection_id', connection_id);

    if (pkceRequiredForSso) {
      const keyPair = await this._pkceManager.startPKCETransaction();
      startUrl.searchParams.set('pkce_code_challenge', keyPair.code_challenge);
    } else {
      this._pkceManager.clearPKPair();
    }

    if (login_redirect_url) startUrl.searchParams.set('login_redirect_url', login_redirect_url);
    if (signup_redirect_url) startUrl.searchParams.set('signup_redirect_url', signup_redirect_url);

    this.navigate(startUrl);
  }

  // Public so it can be mocked in tests
  navigate(url: URL) {
    window.location.href = url.toString();
  }

  async getConnections(): Promise<B2BSSOGetConnectionsResponse> {
    return await this._networkClient.fetchSDK<B2BSSOGetConnectionsResponse>({
      url: '/b2b/sso',
      method: 'GET',
    });
  }

  async discoverConnections(emailAddress: string): Promise<B2BSSODiscoverConnectionsResponse> {
    return await this._networkClient.fetchSDK<B2BSSODiscoverConnectionsResponse>({
      url: `/b2b/sso/discovery/connections?email_address=${encodeURIComponent(emailAddress)}`,
      method: 'GET',
    });
  }

  async deleteConnection(connectionId: string): Promise<B2BSSODeleteConnectionResponse> {
    return this._networkClient.fetchSDK<B2BSSODeleteConnectionResponse>({
      url: `/b2b/sso/${connectionId}`,
      method: 'DELETE',
    });
  }

  saml = {
    createConnection: async (data: B2BSSOSAMLCreateConnectionOptions): Promise<B2BSSOSAMLCreateConnectionResponse> => {
      return await this._networkClient.fetchSDK<B2BSSOSAMLCreateConnectionResponse>({
        url: '/b2b/sso/saml',
        method: 'POST',
        body: data,
      });
    },
    updateConnection: async (data: B2BSSOSAMLUpdateConnectionOptions): Promise<B2BSSOSAMLUpdateConnectionResponse> => {
      return await this._networkClient.fetchSDK<B2BSSOSAMLUpdateConnectionResponse>({
        url: `/b2b/sso/saml/${data.connection_id}`,
        method: 'PUT',
        body: data,
      });
    },
    updateConnectionByURL: async (
      data: B2BSSOSAMLUpdateConnectionByURLOptions,
    ): Promise<B2BSSOSAMLUpdateConnectionByURLResponse> => {
      return await this._networkClient.fetchSDK<B2BSSOSAMLUpdateConnectionResponse>({
        url: `/b2b/sso/saml/${data.connection_id}/url`,
        method: 'PUT',
        body: data,
      });
    },
    deleteVerificationCertificate: async (
      data: B2BSSOSAMLDeleteVerificationCertificateOptions,
    ): Promise<B2BSSOSAMLDeleteVerificationCertificateResponse> => {
      return await this._networkClient.fetchSDK<B2BSSOSAMLDeleteVerificationCertificateResponse>({
        url: `/b2b/sso/saml/${data.connection_id}/verification_certificates/${data.certificate_id}`,
        method: 'DELETE',
      });
    },
    deleteEncryptionPrivateKey: async (
      data: B2BSSOSAMLDeleteEncryptionPrivateKeyOptions,
    ): Promise<B2BSSOSAMLDeleteEncryptionPrivateKeyResponse> => {
      return await this._networkClient.fetchSDK<B2BSSOSAMLDeleteEncryptionPrivateKeyResponse>({
        url: `/b2b/sso/saml/${data.connection_id}/encryption_private_key/${data.private_key_id}`,
        method: 'DELETE',
      });
    },
  };

  oidc = {
    createConnection: async (data: B2BSSOOIDCCreateConnectionOptions): Promise<B2BSSOOIDCCreateConnectionResponse> => {
      return await this._networkClient.fetchSDK<B2BSSOOIDCCreateConnectionResponse>({
        url: '/b2b/sso/oidc',
        method: 'POST',
        body: data,
      });
    },
    updateConnection: async (data: B2BSSOOIDCUpdateConnectionOptions): Promise<B2BSSOOIDCUpdateConnectionResponse> => {
      return await this._networkClient.fetchSDK<B2BSSOOIDCUpdateConnectionResponse>({
        url: `/b2b/sso/oidc/${data.connection_id}`,
        method: 'PUT',
        body: data,
      });
    },
  };

  external = {
    createConnection: async (
      data: B2BSSOCreateExternalConnectionOptions,
    ): Promise<B2BSSOCreateExternalConnectionResponse> => {
      return await this._networkClient.fetchSDK<B2BSSOCreateExternalConnectionResponse>({
        url: '/b2b/sso/external',
        method: 'POST',
        body: data,
      });
    },
    updateConnection: async (
      data: B2BSSOUpdateExternalConnectionOptions,
    ): Promise<B2BSSOUpdateExternalConnectionResponse> => {
      return await this._networkClient.fetchSDK<B2BSSOUpdateExternalConnectionResponse>({
        url: `/b2b/sso/external/${data.connection_id}`,
        method: 'PUT',
        body: data,
      });
    },
  };
}
