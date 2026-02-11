import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { StytchAPIError } from '@stytch/core/public';

import { extractErrorType } from './extractErrorType';

const errorMessages = {
  invalid_email: msg({ id: 'error.invalidEmail', message: 'Email format is invalid.' }),
  invalid_phone_number: msg({
    id: 'error.invalidPhoneNumber',
    message: 'Phone number format is invalid. Ensure the phone number is in the E.164 format.',
  }),
  unsubscribed_phone_number: msg({
    id: 'error.unsubscribedPhoneNumber',
    message:
      "Phone number is unsubscribed. User has unsubscribed. Resubscribe by texting 'START' before messages can be sent.",
  }),
  inactive_email: msg({
    id: 'error.inactiveEmail',
    message:
      'The email address is marked as inactive. Please try another email address, or contact your admin if you think this is a mistake.',
  }),
  unauthorized_credentials: msg({ id: 'error.unauthorizedCredentials', message: 'Unauthorized credentials.' }),
  user_unauthenticated: msg({
    id: 'error.userUnauthenticated',
    message: 'Must have an active session to call this method. Have you logged in yet?',
  }),
  email_not_found: msg({ id: 'error.emailNotFound', message: 'Email not found.' }),
  unable_to_auth_magic_link: msg({
    id: 'error.unableToAuthMagicLink',
    message:
      'The magic link could not be authenticated because it was either already used or expired. Please try again.',
  }),
  no_user_password: msg({ id: 'error.noUserPassword', message: 'Password not found for this user. Please try again.' }),
  breached_password: msg({
    id: 'error.breachedPassword',
    message: 'Password appears in the list of breached passwords and must be reset.',
  }),
  reset_password: msg({ id: 'error.resetPassword', message: 'Password must be reset.' }),
  oauth_token_not_found: msg({ id: 'error.oauthTokenNotFound', message: 'OAuth Token could not be found.' }),
  invalid_code: msg({ id: 'error.invalidCode', message: 'Code format is invalid, please try again.' }),
  member_password_not_found: msg({ id: 'error.memberPasswordNotFound', message: 'Member password not found.' }),
  oauth_flow_callback_error: msg({
    id: 'error.oauthFlowCallbackError',
    message: 'An error was encountered in the callback of the OAuth flow. Please try again.',
  }),
  unauthorized_action: msg({ id: 'error.unauthorizedAction', message: 'Unauthorized action.' }),
  user_lock_limit_reached: msg({
    id: 'error.userLockLimitReached',
    message: 'Too many failed authentication attempts. Please try again later.',
  }),
  invalid_session_token: msg({ id: 'error.invalidSessionToken', message: 'Invalid session token.' }),
  session_not_found: msg({ id: 'error.sessionNotFound', message: 'Session not found.' }),
  invalid_phone_number_country_code: msg({
    id: 'error.invalidPhoneNumberCountryCode',
    message: "The phone number's country code is invalid, unsupported, or disabled.",
  }),
  otp_code_not_found: msg({ id: 'error.otpCodeNotFound', message: 'Invalid passcode, please try again.' }),
  duplicate_member_phone_number: msg({
    id: 'error.duplicatePhoneNumber',
    message: 'A member with the specified phone number already exists for this organization.',
  }),
} as const;

/**
 * This method is meant to be a catch all for errors that don't require special handling.
 * It will return a translated error message for the error type.
 * If the error type is not included here, it will return the error message as an untranslated string.
 */
export const getTranslatedError = (error: StytchAPIError, t: (descriptor: MessageDescriptor) => string) => {
  const errorType = extractErrorType(error);
  const messageDescriptor = errorMessages[errorType as keyof typeof errorMessages];
  if (messageDescriptor) {
    return t(messageDescriptor);
  }
  return error.error_message;
};
