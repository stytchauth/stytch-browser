import { Cacheable } from '../utils';
import { DeleteResponse, ResponseCommon, UnsubscribeFunction, User } from './common';

export type UserOnChangeCallback = (user: User | null) => void;

export type UserUpdateOptions = {
  /**
   * The name of the user. If at least one name field is passed, all name fields will be updated.
   */
  name?: {
    /**
     * The first name of the user. Replaces an existing first name, if it exists.
     */
    first_name?: string;
    /**
     * The middle name(s) of the user. Replaces an existing middle name, if it exists.
     */
    middle_name?: string;
    /**
     * The last name of the user. Replaces an existing last name, if it exists.
     */
    last_name?: string;
  };
  /**
   * A JSON object containing application-specific metadata.
   * Use it to store fields that a user can be allowed to edit directly without backend validation - such as `display_theme` or `preferred_locale`.
   * See our {@link https://stytch.com/docs/api/metadata metadata reference} for complete details.
   */
  untrusted_metadata?: Record<string, unknown>;
};

export type UserUpdateResponse = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific user in the Stytch API.
   */
  user_id: string;
  /**
   * The updated emails for the user.
   */
  emails: User['emails'];
  /**
   * The updated phone numbers for the user.
   */
  phone_numbers: User['phone_numbers'];
  /**
   * The updated crypto wallets for the user.
   */
  crypto_wallets: User['crypto_wallets'];
};

export type UserInfo = Cacheable<{
  /**
   * The user object, or null if no user exists.
   */
  user: User | null;
}>;

export type UserGetConnectedAppsResponse = ResponseCommon & {
  connected_apps: {
    connected_app_id: string;
    name: string;
    description: string;
    client_type: string;
    logo_url?: string;
    scopes_granted: string;
  }[];
};

export interface IHeadlessUserClient {
  /**
   * The asynchronous method, `user.get`, wraps the {@link https://stytch.com/docs/api/get-user get user} endpoint.
   * It fetches the user's data and refreshes the cached object if changes are detected.
   * The Stytch SDK will invoke this method automatically in the background, so you probably won't need to call this method directly.
   *
   * @returns A {@link User} object, or null if no user exists.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  get(): Promise<User>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/update-user update user} endpoint. Use this method to change the user's name, untrusted metadata, and attributes.
   *
   * You can listen for successful user updates anywhere in the codebase with the `stytch.user.onChange()` method or `useStytchUser()` hook if you are using React.
   *
   * **Note:** If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk#resources_multi-factor-authentication Multi-factor authentication} section for more details.
   *
   * @example
   * ```
   * const updateName = useCallback(() => {
   *  stytchClient.user.update({
   *    name: {
   *      first_name: 'Jane',
   *      last_name: 'Doe',
   *    },
   *  });
   * }, [stytchClient]);
   * ```
   *
   * @param options - {@link UserUpdateOptions}
   *
   * @returns A {@link UserUpdateResponse} indicating the user has been updated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  update(options: UserUpdateOptions): Promise<UserUpdateResponse>;
  /**
   * The `user.getSync` is a synchronous method for getting a user. This is the recommended approach. You can listen to changes with the `onChange` method.
   * If logged in, this returns the cached user object, otherwise it returns null. This method does not refresh the user's data.
   *
   * @returns A {@link User} object, or null if no user exists.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  getSync(): User | null;
  /**
   * The `user.getInfo` method is similar to `user.getSync`, but it returns an object containing the `user` object and a `fromCache` boolean.
   * If `fromCache` is true, the user object is from the cache and a state refresh is in progress.
   */
  getInfo(): UserInfo;
  /**
   * The `user.onChange` method takes in a callback that gets called whenever the user object changes. It returns an unsubscribe method for you to call when you no longer want to listen for such changes.
   *
   * In React, the `@stytch/react` library provides the `useStytchUser` hook that implements these methods for you to easily access the user and listen for changes.
   *
   * @param callback - Gets called whenever the user object changes. See {@link UserOnChangeCallback}.
   *
   * @returns An {@link UnsubscribeFunction} for you to call when you no longer want to listen for changes in the user object.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  onChange(callback: UserOnChangeCallback): UnsubscribeFunction;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/delete-user-email delete user email} endpoint.
   * This methods cannot be used to remove all factors from a user. A user must have at least one email, phone number, or OAuth provider associated with their account at all times, otherwise they will not be able to log in again.
   * Note: If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk#resources_multi-factor-authentication Multi-factor authentication} section for more details.
   *
   * @param emailId - ID of the email to be deleted.
   *
   * @returns A {@link DeleteResponse} that indicates the user email has been deleted.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteEmail(emailId: string): Promise<DeleteResponse>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/delete-user-phone-number delete phone number} endpoint.
   * This methods cannot be used to remove all factors from a user. A user must have at least one email, phone number, or OAuth provider associated with their account at all times, otherwise they will not be able to log in again.
   * Note: If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk#resources_multi-factor-authentication Multi-factor authentication} section for more details.
   *
   * @param phoneId - ID of the phone number to be deleted.
   *
   * @returns A {@link DeleteResponse} that indicates the user phone number has been deleted.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deletePhoneNumber(phoneId: string): Promise<DeleteResponse>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/delete-user-totp delete TOTP} endpoint.
   * Note: If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk#resources_multi-factor-authentication Multi-factor authentication} section for more details.
   *
   * @param totpId - ID of the TOTP registration to be deleted.
   *
   * @returns A {@link DeleteResponse} that indicates the user TOTP registration has been deleted.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteTOTP(totpId: string): Promise<DeleteResponse>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/delete-user-oauth-registration delete OAuth} endpoint.
   * Note: If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk#resources_multi-factor-authentication Multi-factor authentication} section for more details.
   *
   * @param oauthUserRegistrationId - ID of the OAuth registration to be deleted.
   *
   * @returns A {@link DeleteResponse} that indicates the user OAuth registration has been deleted.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteOAuthRegistration(oauthUserRegistrationId: string): Promise<DeleteResponse>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/delete-user-crypto-wallet delete crypto wallet} endpoint.
   * Note: If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk#resources_multi-factor-authentication Multi-factor authentication} section for more details.
   *
   * @param cryptoWalletId - ID of the crypto wallet to be deleted.
   *
   * @returns A {@link DeleteResponse} that indicates the user crypto wallet has been deleted.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteCryptoWallet(cryptoWalletId: string): Promise<DeleteResponse>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/delete-user-webauthn-registration delete WebAuthn} endpoint.
   * Note: If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk#resources_multi-factor-authentication Multi-factor authentication} section for more details.
   *
   * @param webAuthnId - ID of the WebAuthn registration to be deleted.
   *
   * @returns A {@link DeleteResponse} that indicates the user WebAuthn registration has been deleted.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteWebauthnRegistration(webAuthnId: string): Promise<DeleteResponse>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/delete-user-biometric-registration delete biometric} endpoint.
   *
   * @param biometricRegistrationId - ID of the biometric registration to be deleted.
   *
   * @returns A {@link DeleteResponse} that indicates the user Biometric registration has been deleted.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteBiometricRegistration(biometricRegistrationId: string): Promise<DeleteResponse>;
  /**
   * The User Get Connected Apps method wraps the {@link https://stytch.com/docs/api/connected-app-user-get-all User Get Connected Apps} API endpoint.
   * The `user_id` will be automatically inferred from the logged-in user's session.
   *
   * This method retrieves a list of Connected Apps that the user has completed an authorization flow with successfully.
   * If the user revokes a Connected App's access (e.g. via the `revokeConnectedApp` method) then the Connected App will
   * no longer be returned in this endpoint's response.
   *
   * @returns A {@link UserGetConnectedAppsResponse} containing a list of the user's connected apps
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  getConnectedApps(): Promise<UserGetConnectedAppsResponse>;
  /**
   * The User Revoke Connected App method wraps the {@link https://stytch.com/docs/api/connected-app-user-revoke User Revoke Connected App} API endpoint.
   * The `user_id` will be automatically inferred from the logged-in user's session.
   *
   * This method revokes a Connected App's access to the user and revokes all active tokens that have been
   * created on the user's behalf. New tokens cannot be created until the user completes a new authorization
   * flow with the Connected App.
   *
   * Note that after calling this method, the user will be forced to grant consent in subsequent authorization
   * flows with the Connected App.
   *
   * @param connectedAppId - ID of the Connected App to revoke.
   * @returns A {@link ResponseCommon} indicating that the Connected App's access has been revoked.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  revokedConnectedApp(connectedAppId: string): Promise<ResponseCommon>;
}
