import { Cacheable } from '../../utils';
import { locale, MemberEmailUpdateDeliveryMethod, ResponseCommon, UnsubscribeFunction } from '../common';
import { Member, MemberResponseCommon } from './common';

export type B2BMemberOnChangeCallback = (member: Member | null) => void;

export type B2BMemberUpdateOptions = {
  /**
   * The name of the Member. Replaces the existing name, if it exists.
   */
  name?: string;

  /**
   * A JSON object containing application-specific metadata.
   * Use it to store fields that a Member can be allowed to edit directly without backend validation - such as `display_theme` or `preferred_locale`.
   * See our {@link https://stytch.com/docs/api/metadata metadata reference} for complete details.
   */
  untrusted_metadata?: Record<string, unknown>;

  /**
   * Sets whether the Member is enrolled in MFA.
   * If true, the Member must complete an MFA step whenever they wish to log in to their Organization.
   * If false, the Member only needs to complete an MFA step if the Organization's MFA policy is set to REQUIRED_FOR_ALL.
   */
  mfa_enrolled?: boolean;

  /**
   * Sets the Member's phone number. Throws an error if the Member already has a phone number.
   */
  mfa_phone_number?: string;
  /**
   * Sets the Member's default MFA method. Valid values are 'sms_otp' and 'totp'.
   * This value will determine
   * 1. Which MFA method the Member is prompted to use when logging in
   * 2. Whether An SMS will be sent automatically after completing the first leg of authentication
   */
  default_mfa_method?: 'sms_otp' | 'totp';
};

export type B2BMemberUnlinkRetiredEmailRequest = {
  /**
   * ID of the retired email to be deleted. At least one of email id or email address must be provided.
   */
  email_id?: string;

  /**
   * Address of the retired email to be deleted. At least one of email id or email address must be provided.
   */
  email_address?: string;
};

export type B2BMemberStartEmailUpdateRequest = {
  /**
   * The new email address to be set (after verification) for the Member.
   */
  email_address: string;

  /**
   * The url the user is redirected to after clicking the login email magic link.
   * This should be a url that your app receives and parses and subsequently send an API request to authenticate the magic link and log in the member.
   * If this value is not passed, the default login redirect URL that you set in your Dashboard is used.
   * If you have not set a default login redirect URL, an error is returned.
   */
  login_redirect_url?: string;

  /**
   * The email template ID to use for magic linkemails.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a Magic link Login custom HTML template.
   */
  login_template_id?: string;

  /**
   * The locale is used to determine which language to use in the email. Parameter is a {@link https://www.w3.org/International/articles/language-tags/ IETF BCP 47 language tag}, e.g. "en".
   * Currently supported languages are English ("en"), Spanish ("es"), and Brazilian Portuguese ("pt-br"); if no value is provided, the copy defaults to English.
   */
  locale?: locale;

  /**
   * The delivery method to use when sending the email, either EMAIL_MAGIC_LINK or EMAIL_OTP. By default, EMAIL_MAGIC_LINK is used.
   */
  delivery_method?: MemberEmailUpdateDeliveryMethod;
};

export type B2BMemberStartEmailUpdateResponse = MemberResponseCommon;

export type B2BMemberGetConnectedAppsResponse = ResponseCommon & {
  connected_apps: {
    connected_app_id: string;
    name: string;
    description: string;
    client_type: string;
    logo_url?: string;
    scopes_granted: string;
  }[];
};

export type B2BMemberRevokeConnectedAppOptions = {
  connected_app_id: string;
};

export type B2BMemberRevokeConnectedAppResponse = ResponseCommon;

export type B2BMemberUpdateResponse = MemberResponseCommon;

export type B2BMemberDeleteMFAPhoneNumberResponse = MemberResponseCommon;

export type B2BMemberDeletePasswordResponse = MemberResponseCommon;

export type B2BMemberDeleteMFATOTPResponse = MemberResponseCommon;

export type B2BMemberUnlinkRetiredEmailResponse = MemberResponseCommon;

export type MemberInfo = Cacheable<{
  /**
   * The member object, or null if no member exists.
   */
  member: Member | null;
}>;

export interface IHeadlessB2BSelfClient {
  /**
   * The asynchronous method, `member.get`, wraps the {@link https://stytch.com/docs/b2b/api/search-members search member} endpoint.
   * It fetches the Member's data and refreshes the cached object if changes are detected.
   * The Stytch SDK will invoke this method automatically in the background, so you probably won't need to call this method directly.
   *
   * @returns A {@link Member} object, or null if no member exists.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  get(): Promise<Member | null>;

  /**
   * If logged in, the `member.getSync` method returns the cached Member object.
   * Otherwise it returns `null`.
   * This method does not refresh the Member's data.
   *
   * @returns A {@link Member} object, or null if no user exists.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  getSync(): Member | null;

  /**
   * The `member.getInfo` method is similar to `member.getSync`, but it returns an object containing the `member` object and a `fromCache` boolean.
   * If `fromCache` is true, the Member object is from the cache and a state refresh is in progress.
   */
  getInfo(): MemberInfo;

  /**
   * The `member.onChange` method takes in a callback that gets called whenever the Member object changes.
   * It returns an unsubscribe method for you to call when you no longer want to listen for such changes.
   *
   * @param callback - Gets called whenever the member object changes. See {@link B2BMemberOnChangeCallback}.
   *
   * @returns An {@link UnsubscribeFunction} for you to call when you no longer want to listen for changes in the member object.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  onChange(callback: B2BMemberOnChangeCallback): UnsubscribeFunction;

  /**
   * The Update Member method wraps the {@link https://stytch.com/docs/b2b/api/update-member Update Member} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method can be used to update any Member in the logged-in Member's Organization.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#update-self Stytch Docs} for a complete reference.
   *
   * @example
   * stytch.self.update({
   *   mfa_enrolled: true,
   *   phone_number: '+12025550162',
   * });
   *
   * @rbac action="requested", resource="stytch.self"
   *
   * @param data - {@link B2BMemberUpdateOptions}
   *
   * @returns A {@link B2BMemberUpdateResponse} indicating that the member has been updated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  update(data: B2BMemberUpdateOptions): Promise<B2BMemberUpdateResponse>;

  /**
   * The Delete Self MFA phone number method wraps the {@link https://stytch.com/docs/b2b/api/delete-member-mfa-phone-number Delete Member MFA phone number} API endpoint.
   * The `organization_id` and `member_id` will be automatically inferred from the logged-in Member's session.
   * This method can only be used to delete the logged-in Member's MFA phone number.
   *
   * To change a Member's phone number, you must first call this endpoint to delete the existing phone number.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#delete-self-mfa-phone-number Stytch Docs} for a complete reference.
   *
   * @rbac action="update.info.delete.mfa-phone", resource="stytch.self"
   *
   * @returns A {@link B2BMemberDeleteMFAPhoneNumberResponse} indicating that the member's phone number has been deleted.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteMFAPhoneNumber(): Promise<B2BMemberDeleteMFAPhoneNumberResponse>;

  /**
   * The Delete Self password method wraps the {@link https://stytch.com/docs/b2b/api/delete-member-password Delete Member password} API endpoint.
   * The `organization_id` and `member_id` will be automatically inferred from the logged-in Member's session.
   * This method can only be used to delete the logged-in Member's password.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#delete-self-password Stytch Docs} for a complete reference.
   *
   * @rbac action="update.info.delete.password", resource="stytch.self"
   *
   * @returns A {@link B2BMemberDeletePasswordResponse} indicating that the member's phone number has been deleted.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deletePassword(passwordId: string): Promise<B2BMemberDeletePasswordResponse>;

  /**
   * The Delete Self MFA totp method wraps the {@link https://stytch.com/docs/b2b/api/delete-member-mfa-totp Delete Member MFA TOTP} API endpoint.
   * The `organization_id` and `member_id` will be automatically inferred from the logged-in Member's session.
   * This method can only be used to delete the logged-in Member's MFA totp.
   *
   * To change a Member's totp, you must first call this endpoint to delete the existing totp.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#delete-self-mfa-totp Stytch Docs} for a complete reference.
   *
   * @rbac action="update.info.delete.mfa-totp", resource="stytch.self"
   *
   * @returns A {@link B2BMemberDeleteMFATOTPResponse} indicating that the member's totp has been deleted.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteMFATOTP(): Promise<B2BMemberDeleteMFATOTPResponse>;

  /**
   * The Unlink Self Retired Email Address method wraps the {@link https://stytch.com/docs/b2b/api/unlink-retired-member-email Unlink Retired Email} API endpoint.
   * The `organization_id` and `member_id` will be automatically inferred from the logged-in Member's session.
   * This method can only be used to unlink the logged-in Member's retired email.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#unlink-retired-member-email Stytch Docs} for a complete reference.
   *
   * @rbac action="update.info.unlink.retired-email", resource="stytch.self"
   *
   * @param data - {@link B2BMemberUnlinkRetiredEmailRequest}
   * @returns A {@link B2BMemberUnlinkRetiredEmailResponse} indicating that the member's retired email has been marked as deleted.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  unlinkRetiredEmail(data: B2BMemberUnlinkRetiredEmailRequest): Promise<B2BMemberUnlinkRetiredEmailResponse>;

  /**
   * The Start Email Update method wraps the {@link https://stytch.com/docs/b2b/api/start-member-email-update Start Member Email Update} API endpoint.
   * The `organization_id` and `member_id` will be automatically inferred from the logged-in Member's session.
   * This method can be used to start the self-serve email update process for the logged-in Member.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/members/start-self-email-update Stytch Docs} for a complete reference.
   *
   * @rbac action="update.info.email", resource="stytch.self"
   *
   * @param data - {@link B2BMemberStartEmailUpdateRequest}
   * @returns A {@link B2BMemberStartEmailUpdateResponse} indicating that an email update has been started.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  startEmailUpdate(data: B2BMemberStartEmailUpdateRequest): Promise<B2BMemberStartEmailUpdateResponse>;

  /**
   * The Member Get Connected Apps method wraps the {@link https://stytch.com/docs/b2b/api/connected-app-member-get-all Member Get Connected Apps} API endpoint.
   * The `organization_id` and `member_id` will be automatically inferred from the logged-in Member's session.
   *
   * This method retrieves a list of Connected Apps that the Member has completed an authorization flow with successfully.
   * If the Member revokes a Connected App's access (e.g. via the `revokeConnectedApp` method) then the Connected App will
   * no longer be returned in this endpoint's response. A Connected App's access may be revoked if the Organization's
   * allowed Connected App policy changes.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/members/get-self-connected-apps Stytch Docs} for a complete reference.
   *
   * @rbac action="get.connected-apps", resource="stytch.self"
   *
   * @returns A {@link B2BMemberGetConnectedAppsResponse} indicating that the member's retired email has been marked as deleted.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  getConnectedApps(): Promise<B2BMemberGetConnectedAppsResponse>;

  /**
   * The Member Revoke Connected App method wraps the {@link https://stytch.com/docs/b2b/api/connected-app-member-revoke Member Revoke Connected App} API endpoint.
   * The `organization_id` and `member_id` will be automatically inferred from the logged-in Member's session.
   *
   * This method revokes a Connected App's access to the Member and revokes all active tokens that have been
   * created on the Member's behalf. New tokens cannot be created until the Member completes a new authorization
   * flow with the Connected App.
   *
   * Note that after calling this method, the Member will be forced to grant consent in subsequent authorization
   * flows with the Connected App.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/members/revoke-self-connected-app Stytch Docs} for a complete reference.
   *
   * @rbac action="revoke.connected-app", resource="stytch.self"
   *
   * @param data - {@link B2BMemberRevokeConnectedAppOptions}
   * @returns A {@link B2BMemberRevokeConnectedAppResponse} indicating that the Connected App's access has been revoked.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  revokeConnectedApp(data: B2BMemberRevokeConnectedAppOptions): Promise<B2BMemberRevokeConnectedAppResponse>;
}

/**
 * @deprecated please use IHeadlessB2BSelfClient
 */
export interface IHeadlessB2BMemberClient {
  /**
   * The asynchronous method, `member.get`, wraps the {@link https://stytch.com/docs/b2b/api/search-members Search Member} endpoint.
   * It fetches the Member's data and refreshes the cached object if changes are detected.
   * The Stytch SDK will invoke this method automatically in the background, so you probably won't need to call this method directly.
   *
   * @deprecated please use {@link IHeadlessB2BSelfClient#get self.get()} instead
   * @returns A {@link Member} object, or null if no member exists.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  get(): Promise<Member | null>;

  /**
   * If logged in, the `member.getSync` method returns the cached Member object.
   * Otherwise it returns `null`. This method does not refresh the Member's data.
   * The synchronous method for getting a member. This is the recommended approach.
   *
   * @deprecated please use {@link IHeadlessB2BSelfClient#get self.getSync()} instead
   * @returns A {@link Member} object, or null if no user exists.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  getSync(): Member | null;

  /**
   * The `member.onChange` method takes in a callback that gets called whenever the Member object changes.
   * It returns an unsubscribe method for you to call when you no longer want to listen for such changes.
   *
   * @deprecated please use {@link IHeadlessB2BSelfClient#get self.onChange()} instead
   * @param callback - Gets called whenever the member object changes. See {@link B2BMemberOnChangeCallback}.
   *
   * @returns An {@link UnsubscribeFunction} for you to call when you no longer want to listen for changes in the member object.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  onChange(callback: B2BMemberOnChangeCallback): UnsubscribeFunction;

  /**
   * The Update Self method wraps the {@link https://stytch.com/docs/b2b/api/update-member Update Member} API endpoint.
   * The `organization_id` and `member_id` will be automatically inferred from the logged-in Member's session.
   * This method can be used to update only the logged-in Member.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#update-member-deprecated Stytch Docs} for a complete reference.
   *
   * @example
   * stytch.self.update({
   *   mfa_enrolled: true,
   *   phone_number: '+12025550162',
   * });
   *
   * @deprecated please use {@link IHeadlessB2BSelfClient#get self.update()} instead
   * @param data - {@link B2BMemberUpdateOptions}
   *
   * @returns A {@link B2BMemberUpdateResponse} indicating that the member has been updated.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  update(data: B2BMemberUpdateOptions): Promise<B2BMemberUpdateResponse>;

  /**
   * The Delete Member MFA phone number method wraps the {@link https://stytch.com/docs/b2b/api/delete-member-mfa-phone-number Delete Member MFA phone number} API endpoint.
   * Use this method to delete the Member's MFA phone number.
   *
   * To change a Member's phone number, you must first call this endpoint to delete the existing phone number.
   *
   * @deprecated please use {@link IHeadlessB2BSelfClient#get self.deleteMFAPhoneNumber()} instead
   * @returns A {@link B2BMemberDeleteMFAPhoneNumberResponse} indicating that the member's phone number has been deleted.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  deleteMFAPhoneNumber(): Promise<B2BMemberDeleteMFAPhoneNumberResponse>;
}
