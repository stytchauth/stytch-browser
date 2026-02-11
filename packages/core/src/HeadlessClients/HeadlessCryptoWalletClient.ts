import { IConsumerSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '..';
import {
  CryptoWalletAuthenticateOptions,
  CryptoWalletAuthenticateResponse,
  CryptoWalletAuthenticateStartOptions,
  CryptoWalletAuthenticateStartResponse,
  IHeadlessCryptoWalletClient,
  StytchProjectConfigurationInput,
} from '../public';
import { omitUser, WithUser } from '../utils';
import { validateInDev } from '../utils/dev';

type DynamicConfig = Promise<{
  siweRequiredForCryptoWallets: boolean;
}>;

const DefaultDynamicConfig = Promise.resolve({
  siweRequiredForCryptoWallets: false,
});

export class HeadlessCryptoWalletClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessCryptoWalletClient<TProjectConfiguration>
{
  authenticate: (
    options: CryptoWalletAuthenticateOptions,
  ) => Promise<CryptoWalletAuthenticateResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _apiNetworkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private executeRecaptcha: () => Promise<string | undefined> = () => Promise.resolve(undefined),
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
    private _config: DynamicConfig = DefaultDynamicConfig,
  ) {
    this.authenticate = this._subscriptionService.withUpdateSession(
      async (
        options: CryptoWalletAuthenticateOptions,
      ): Promise<CryptoWalletAuthenticateResponse<TProjectConfiguration>> => {
        validateInDev('stytch.cryptoWallets.authenticate', options, {
          signature: 'string',
          crypto_wallet_address: 'string',
          crypto_wallet_type: 'string',
          session_duration_minutes: 'number',
        });

        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        const resp = await this._apiNetworkClient.retriableFetchSDK<
          WithUser<CryptoWalletAuthenticateResponse<TProjectConfiguration>>
        >({
          url: '/crypto_wallets/authenticate',
          method: 'POST',
          body: {
            session_duration_minutes: options.session_duration_minutes,
            crypto_wallet_address: options.crypto_wallet_address,
            crypto_wallet_type: options.crypto_wallet_type,
            signature: options.signature,
            captcha_token,
            dfp_telemetry_id,
          },
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });

        return omitUser(resp);
      },
    );
  }

  async authenticateStart(
    options: CryptoWalletAuthenticateStartOptions,
  ): Promise<CryptoWalletAuthenticateStartResponse> {
    validateInDev('stytch.cryptoWallets.authenticateStart', options, {
      crypto_wallet_address: 'string',
      crypto_wallet_type: 'string',
    });
    if (options.siwe_params) {
      validateInDev('stytch.cryptoWallets.authenticateStart', options.siwe_params, {
        uri: 'optionalString',
        chain_id: 'optionalString',
        issued_at: 'optionalString',
        statement: 'optionalString',
        not_before: 'optionalString',
        message_request_id: 'optionalString',
        resources: 'optionalStringArray',
      });
    }

    const isLoggedIn = !!this._subscriptionService.getSession();
    const captcha_token = await this.executeRecaptcha();
    const { siweRequiredForCryptoWallets } = await this._config;

    const body: CryptoWalletAuthenticateStartOptions = {
      crypto_wallet_address: options.crypto_wallet_address,
      crypto_wallet_type: options.crypto_wallet_type,
    };
    if (siweRequiredForCryptoWallets && options.crypto_wallet_type == 'ethereum') {
      body.siwe_params = { ...options.siwe_params, uri: options.siwe_params?.uri || window.location.origin };
    }

    const endpoint = isLoggedIn
      ? '/crypto_wallets/authenticate/start/secondary'
      : '/crypto_wallets/authenticate/start/primary';

    const requestBody = {
      ...body,
      captcha_token,
    };
    return this._apiNetworkClient.fetchSDK<CryptoWalletAuthenticateStartResponse>({
      url: endpoint,
      method: 'POST',
      body: requestBody,
    });
  }
}
