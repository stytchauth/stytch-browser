import { IConsumerSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '..';
import {
  CryptoWalletAuthenticateOptions,
  CryptoWalletAuthenticateResponse,
  CryptoWalletAuthenticateStartOptions,
  CryptoWalletAuthenticateStartResponse,
  IHeadlessCryptoWalletClient,
  StytchProjectConfigurationInput,
} from '../public';
import { omitUser, validate, WithUser } from '../utils';

type DynamicConfig = Promise<{
  siweRequiredForCryptoWallets: boolean;
}>;

const DefaultDynamicConfig = Promise.resolve({
  siweRequiredForCryptoWallets: false,
});

export class HeadlessCryptoWalletClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessCryptoWalletClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _apiNetworkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private executeRecaptcha: () => Promise<string | undefined> = () => Promise.resolve(undefined),
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
    private _config: DynamicConfig = DefaultDynamicConfig,
  ) {}

  async authenticateStart(
    options: CryptoWalletAuthenticateStartOptions,
  ): Promise<CryptoWalletAuthenticateStartResponse> {
    validate('stytch.cryptoWallets.authenticateStart')
      .isString('crypto_wallet_address', options.crypto_wallet_address)
      .isString('crypto_wallet_type', options.crypto_wallet_type);
    if (options.siwe_params) {
      validate('stytch.cryptoWallets.authenticateStart')
        .isOptionalString('uri', options.siwe_params.uri)
        .isOptionalString('chain_id', options.siwe_params.chain_id)
        .isOptionalString('issued_at', options.siwe_params.issued_at)
        .isOptionalString('statement', options.siwe_params.statement)
        .isOptionalString('not_before', options.siwe_params.not_before)
        .isOptionalString('message_request_id', options.siwe_params.message_request_id)
        .isOptionalStringArray('resources', options.siwe_params.resources);
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

  authenticate = this._subscriptionService.withUpdateSession(
    async (
      options: CryptoWalletAuthenticateOptions,
    ): Promise<CryptoWalletAuthenticateResponse<TProjectConfiguration>> => {
      validate('stytch.cryptoWallets.authenticate')
        .isString('signature', options.signature)
        .isString('crypto_wallet_address', options.crypto_wallet_address)
        .isString('crypto_wallet_type', options.crypto_wallet_type)
        .isNumber('session_duration_minutes', options.session_duration_minutes);

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
