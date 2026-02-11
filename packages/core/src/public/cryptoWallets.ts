import { AuthenticateResponse, ResponseCommon, SDKDeviceHistory, SessionDurationOptions } from './common';
import { StytchProjectConfigurationInput } from './typeConfig';

export type SIWEParams = {
  /**
   * An RFC 3986 URI referring to the resource that is the subject of the signing. Defaults to window.location.origin
   */
  uri?: string;
  /**
   * The EIP-155 Chain ID to which the session is bound, and the network where Contract Accounts MUST be resolved.
   * Defaults to 1.
   */
  chain_id?: string;
  /**
   * The time when the message was generated. Defaults to the current time.
   * Must conform to the RFC 3339 standard in UTC, e.g. 2021-12-29T12:33:09Z.
   */
  issued_at?: string;
  /**
   * A human-readable ASCII assertion that the user will sign. Must not include '\n'.
   */
  statement?: string;
  /**
   * The time when the signed authentication message will become valid. Defaults to the current time.
   * Must conform to the RFC 3339 standard in UTC, e.g. 2021-12-29T12:33:09Z.
   */
  not_before?: string;
  /**
   * A system-specific identifier that may be used to uniquely refer to the sign-in request.
   */
  message_request_id?: string;
  /**
   * A list of information or references to information the user wishes to have resolved as part of authentication.
   * Every resource must be a valid RFC 3986 URI.
   */
  resources?: string[];
};

export type CryptoWalletAuthenticateStartOptions = {
  /**
   * The address to authenticate.
   */
  crypto_wallet_address: string;
  /**
   * The type of wallet to authenticate. Currently `ethereum` and `solana` are supported.
   */
  crypto_wallet_type: string;
  /**
   * Parameters for the Sign In With Ethereum (SIWE) protocol. Only used if you have toggled on the
   * siweRequiredForCryptoWallets parameter in your SDK configuration and if the crypto_wallet_type is `ethereum`.
   */
  siwe_params?: SIWEParams;
};

export type CryptoWalletAuthenticateStartResponse = ResponseCommon & {
  /**
   * The challenge to be signed by the user's wallet.
   */
  challenge: string;
};

export type CryptoWalletAuthenticateOptions = SessionDurationOptions & {
  /**
   * The address to authenticate.
   */
  crypto_wallet_address: string;
  /**
   * The type of wallet to authenticate. Currently `ethereum` and `solana` are supported.
   */
  crypto_wallet_type: string;
  /**
   * The signature from the message.
   */
  signature: string;
};

// CryptoWalletsAuthenticateResponse
export type CryptoWalletAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export interface IHeadlessCryptoWalletClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/crypto-wallet-authenticate-start Crypto Wallet Authenticate Start} endpoint. Call this method to prompt the user to sign a challenge using their crypto wallet.
   *
   * For Ethereum crypto wallets, the challenge will follow the Sign In With Ethereum (SIWE) protocol if you have toggled **SIWE Enabled** in the {@link https://stytch.com/dashboard/sdk-configuration SDK Configuration page}. The domain and URI will be inferred automatically, but you may optionally override the URI.
   *
   * Load the challenge data by calling `cryptoWallets.authenticateStart()`.
   *
   * You'll then pass this challenge to the user's wallet for signing. You can do so by using the crypto provider's built-in API and by including the `crypto_wallet_address` and `challenge` that is provided from `cryptoWallets.authenticateStart()`. See [Ethereum's EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) for an example of Ethereum's provider API.
   *
   *
   * @example
   * ```
   * // Request user's address
   * const [crypto_wallet_address] = await ethereum.request({
   *   method: 'eth_requestAccounts',
   * });
   *
   * // Ask Stytch to generate a challenge for the user
   * const { challenge } = await stytch.cryptoWallets.authenticateStart({
   *   crypto_wallet_address: crypto_wallet_address,
   *   crypto_wallet_type: 'ethereum',
   * });
   * ```
   * @param options - {@link CryptoWalletAuthenticateStartOptions}
   *
   * @returns A {@link CryptoWalletAuthenticateStartResponse} containing a challenge to be passed to the user's wallet for signing.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  authenticateStart(options: CryptoWalletAuthenticateStartOptions): Promise<CryptoWalletAuthenticateStartResponse>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/crypto-wallet-authenticate authenticate} crypto wallet endpoint. Call this method after the user signs the challenge to validate the signature.
   * If this method succeeds and the user is not already logged in, the user will be logged in, granted an active session, and the {@link https://stytch.com/docs/sdks/javascript-sdk/resources/cookies-and-session-management session cookies} will be minted and stored in the browser.
   * If the user is already logged in, the crypto wallet will be added to the `user.crypto_wallets[]` array and associated with user's existing session as an `authentication_factor`.
   *
   * See [Ethereum's EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) for an example of Ethereum's provider API.
   *
   * @example
   * ```
   * // Ask the user to sign the challenge
   * const signature = await ethereum.request({
   *   method: 'personal_sign',
   *   params: [challenge, crypto_wallet_address],
   * });
   *
   * // Authenticate the signature
   * stytch.cryptoWallets.authenticate({
   *  crypto_wallet_address: crypto_wallet_address,
   *  crypto_wallet_type: 'ethereum',
   *  signature: signature,
   *  session_duration_minutes: 60,
   * });
   * ```
   *
   * @param options - {@link CryptoWalletAuthenticateOptions}
   *
   * @returns A {@link CryptoWalletAuthenticateResponse} indicating the user has been authenticated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  authenticate(
    options: CryptoWalletAuthenticateOptions,
  ): Promise<CryptoWalletAuthenticateResponse<TProjectConfiguration>>;
}
