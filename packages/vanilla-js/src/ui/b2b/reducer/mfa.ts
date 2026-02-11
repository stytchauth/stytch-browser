import { CountryCode, StringLiteralFromEnum } from '@stytch/core';
import {
  AuthFlowType,
  B2BAuthenticateResponseWithMFA,
  B2BMFAProducts,
  B2BSMSSendResponse,
  B2BTOTPCreateResponse,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { Optional } from '../../../utils/Optional';
import { isTruthy } from '../../../utils/isTruthy';
import { AppState } from '../types/AppState';
import { ErrorType } from '../types/ErrorType';
import { AppScreens } from '../types/AppScreens';
import { DEFAULT_MFA_STATE, MfaState } from '../MfaState';
import { getEnabledMethods } from '../getEnabledMethods';
import { pushHistory, replaceHistory } from './navigation';

type PrimaryAuthenticateSuccessAction = {
  type: 'primary_authenticate_success';
  response: B2BAuthenticateResponseWithMFA<StytchProjectConfigurationInput>;
  includedMfaMethods: readonly StringLiteralFromEnum<B2BMFAProducts>[] | undefined;
  resetTokenType?: string;
};

type TotpAuthenticateAction = {
  type: 'totp/authenticate_success';
};

type TotpCreateAction =
  | { type: 'totp/create' }
  | {
      type: 'totp/create_success';
      response: B2BTOTPCreateResponse;
      memberId: string;
      organizationId: string;
    }
  | { type: 'totp/create_error'; error: unknown };

type TotpShowCodeAction = {
  type: 'totp/show_code';
  method?: 'qr' | 'manual';
};

type RecoveryCodeAuthenticateAction = {
  type: 'recovery_code/authenticate_success';
};

type RecoveryCodeSaveAcknowledgeAction = { type: 'recovery_code/save_acknowledge' };

type SmsOtpAuthenticateAction = {
  type: 'sms_otp/authenticate_success';
};

type SmsOtpSendAction =
  | { type: 'sms_otp/send' }
  | ({
      type: 'sms_otp/send_success';
      response: B2BSMSSendResponse;
    } & Optional<{
      phoneNumber: string;
      countryCode: CountryCode;
      formattedPhoneNumber: string;
    }>)
  | { type: 'sms_otp/send_error'; error: unknown }
  | { type: 'sms_otp/format_destination'; formattedPhoneNumber: string };

export type MfaAction =
  | PrimaryAuthenticateSuccessAction
  | RecoveryCodeAuthenticateAction
  | RecoveryCodeSaveAcknowledgeAction
  | SmsOtpAuthenticateAction
  | SmsOtpSendAction
  | TotpAuthenticateAction
  | TotpCreateAction
  | TotpShowCodeAction;

const DEFAULT_SMS_OTP_EXPIRATION_MS = 1000 * 60 * 2; // 2 minutes

function apiMfaMethodToProduct(method: 'sms_otp' | 'totp'): B2BMFAProducts;
function apiMfaMethodToProduct(method: string): B2BMFAProducts | undefined;
function apiMfaMethodToProduct(method: string): B2BMFAProducts | undefined {
  switch (method) {
    case 'totp':
      return B2BMFAProducts.totp;
    case 'sms_otp':
      return B2BMFAProducts.smsOtp;
    default:
      return undefined;
  }
}

function getNextEnrollmentScreen(enabledMethods: Set<'smsOtp' | 'totp'>) {
  // If there is only one possible method, use it
  if (enabledMethods.size === 1) {
    if (enabledMethods.has(B2BMFAProducts.totp)) {
      return AppScreens.TOTPEnrollmentQRCode;
    }
    if (enabledMethods.has(B2BMFAProducts.smsOtp)) {
      return AppScreens.SMSOTPEnrollment;
    }
  }

  return AppScreens.MFAEnrollmentSelection;
}

const getSmsOtpCodeExpiration = () => new Date(Date.now() + DEFAULT_SMS_OTP_EXPIRATION_MS);

export const B2B_MFA_METHODS = [B2BMFAProducts.totp, B2BMFAProducts.smsOtp] as const;

export const mfaReducer = (state: AppState, action: MfaAction): AppState => {
  switch (action.type) {
    case 'primary_authenticate_success': {
      const memberAuthenticated = !!action.response.member_session;
      const postAuthScreen =
        action.resetTokenType === 'multi_tenant_magic_links' ? AppScreens.PasswordResetForm : AppScreens.LoggedIn;

      // 1. If the member is fully authenticated, there's no need to continue
      if (memberAuthenticated) {
        return replaceHistory(postAuthScreen, {
          ...state,
          mfa: DEFAULT_MFA_STATE,
          primary: {},
        });
      }

      // 2. Additional primary auth may be required
      if (action.response.primary_required) {
        const primaryAuthMethods = action.response.primary_required.allowed_auth_methods;
        const { email_address: email, email_address_verified: emailVerified } = action.response.member;

        const newBaseState = {
          ...state,
          flowState: {
            type: AuthFlowType.Organization,
            organization: action.response.organization,
          },
          formState: {
            ...state.formState,
            passwordState: { email },
          },
          primary: {
            primaryAuthMethods,
            email,
            emailVerified,
          },
        };

        if (primaryAuthMethods?.length === 0) {
          return replaceHistory(AppScreens.Error, {
            ...newBaseState,
            error: { type: ErrorType.CannotJoinOrgDueToAuthPolicy, canGoBack: false },
          });
        }

        return replaceHistory(AppScreens.Main, newBaseState);
      }

      // 3. Start MFA
      const memberEnrolledInSmsOtp = action.response.member.mfa_phone_number_verified;
      const memberEnrolledInTotp = !!action.response.member.totp_registration_id;

      const primaryInfo: MfaState['primaryInfo'] = {
        enrolledMfaMethods: (
          [memberEnrolledInTotp && B2BMFAProducts.totp, memberEnrolledInSmsOtp && B2BMFAProducts.smsOtp] as const
        ).filter(isTruthy),
        memberId: action.response.member_id,
        memberPhoneNumber: action.response.member.mfa_phone_number,
        organizationId: action.response.organization.organization_id,
        organizationMfaOptionsSupported:
          action.response.organization.mfa_methods === 'RESTRICTED'
            ? (action.response.organization.allowed_mfa_methods?.map(apiMfaMethodToProduct).filter(isTruthy) ?? [])
            : [],
        postAuthScreen,
      };

      const organizationSupportsMethod = (method: B2BMFAProducts) =>
        primaryInfo.organizationMfaOptionsSupported.length === 0 ||
        primaryInfo.organizationMfaOptionsSupported.includes(method);

      const getDefaultMethod = () => {
        const defaultMethod = apiMfaMethodToProduct(action.response.member.default_mfa_method);

        if (
          defaultMethod &&
          organizationSupportsMethod(defaultMethod) &&
          primaryInfo.enrolledMfaMethods.includes(defaultMethod)
        ) {
          return defaultMethod;
        }

        return undefined;
      };

      // 3A. Use the member's preferred method, or any suitable fallback if the
      // preferred method is not available for whatever reason. However, if an
      // SMS was automatically sent, we should proceed directly to SMS OTP
      // entry (even if the member's phone number is not yet verified).
      const smsImplicitlySent = action.response.mfa_required?.secondary_auth_initiated === 'sms_otp';
      const entryMethod = smsImplicitlySent
        ? B2BMFAProducts.smsOtp
        : (getDefaultMethod() ?? primaryInfo.enrolledMfaMethods.find(organizationSupportsMethod));
      if (entryMethod) {
        const mfaState: MfaState = {
          ...DEFAULT_MFA_STATE,
          primaryInfo,
        } as const;

        switch (entryMethod) {
          case B2BMFAProducts.totp: {
            return replaceHistory(AppScreens.TOTPEntry, {
              ...state,
              mfa: mfaState,
              primary: {},
            });
          }

          case B2BMFAProducts.smsOtp: {
            const nextState = {
              ...state,
              mfa: {
                ...mfaState,
                smsOtp: {
                  ...mfaState.smsOtp,
                  // Setting codeExpiration tells SMSOTPEntry that the SMS has already been sent
                  codeExpiration: smsImplicitlySent ? getSmsOtpCodeExpiration() : null,
                },
              },
              primary: {},
            };

            if (memberEnrolledInSmsOtp) {
              return replaceHistory(AppScreens.SMSOTPEntry, nextState);
            } else {
              // If the user is not enrolled in SMS OTP (i.e. phone number not verified)
              // we need to allow the user to go back to enrollment to change it, so we need to
              // add it to history
              return {
                ...nextState,
                screen: AppScreens.SMSOTPEntry,
                screenHistory: [AppScreens.SMSOTPEnrollment],
              };
            }
          }
        }
      }

      // 3B. If the member is not enrolled in MFA, we need to enroll them. Note that
      // it's possible the member is actually enrolled, but using a method we
      // don't recognize. Unfortunately, we can't distinguish between these
      // cases; we'll offer to enroll the user, but enrollment will likely fail
      // if the member can't complete MFA first.

      const enabledMethods = getEnabledMethods({
        allMethods: B2B_MFA_METHODS,
        orgSupportedMethods: primaryInfo.organizationMfaOptionsSupported,
        uiIncludedMethods: action.includedMfaMethods,
      });

      return replaceHistory(getNextEnrollmentScreen(enabledMethods), {
        ...state,
        mfa: {
          ...DEFAULT_MFA_STATE,
          primaryInfo,
          isEnrolling: true,
        },
        primary: {},
      });
    }

    case 'sms_otp/send':
      return {
        ...state,
        mfa: {
          ...state.mfa,
          smsOtp: {
            ...state.mfa.smsOtp,
            isSending: true,
            sendError: null,
          },
        },
      };

    case 'sms_otp/send_success':
      return pushHistory(AppScreens.SMSOTPEntry, {
        ...state,
        mfa: {
          ...state.mfa,
          smsOtp: {
            ...state.mfa.smsOtp,
            isSending: false,
            sendError: null,
            codeExpiration: getSmsOtpCodeExpiration(),
            formattedDestination: action.formattedPhoneNumber ?? state.mfa.smsOtp.formattedDestination,
            enrolledNumber: action.phoneNumber
              ? {
                  phoneNumber: action.phoneNumber,
                  countryCode: action.countryCode,
                }
              : null,
          },
        },
      });

    case 'sms_otp/send_error':
      return {
        ...state,
        mfa: {
          ...state.mfa,
          smsOtp: {
            ...state.mfa.smsOtp,
            isSending: false,
            sendError: action.error,
            // If there was no code (expiration), set an expiration to an
            // arbitrary point in the past. This reveals the "resend code"
            // button so the user can try again.
            codeExpiration: state.mfa.smsOtp.codeExpiration ?? new Date(Date.now() - 1000),
          },
        },
      };

    case 'sms_otp/format_destination':
      return {
        ...state,
        mfa: {
          ...state.mfa,
          smsOtp: {
            ...state.mfa.smsOtp,
            formattedDestination: action.formattedPhoneNumber,
          },
        },
      };

    case 'sms_otp/authenticate_success':
    case 'recovery_code/authenticate_success':
    case 'recovery_code/save_acknowledge':
      return replaceHistory(state.mfa.primaryInfo?.postAuthScreen ?? AppScreens.LoggedIn, {
        ...state,
        mfa: DEFAULT_MFA_STATE,
      });

    case 'totp/authenticate_success': {
      const nextScreen = state.mfa.isEnrolling
        ? AppScreens.RecoveryCodeSave
        : (state.mfa.primaryInfo?.postAuthScreen ?? AppScreens.LoggedIn);
      return replaceHistory(nextScreen, {
        ...state,
        mfa: state.mfa.isEnrolling ? state.mfa : DEFAULT_MFA_STATE,
      });
    }

    case 'totp/create':
      if (state.mfa.totp.isCreating) {
        return state;
      }

      return {
        ...state,
        mfa: {
          ...state.mfa,
          totp: {
            ...state.mfa.totp,
            isCreating: true,
            createError: null,
          },
        },
      };

    case 'totp/create_success':
      if (
        !state.mfa.isEnrolling ||
        state.mfa.primaryInfo?.memberId !== action.memberId ||
        state.mfa.primaryInfo?.organizationId !== action.organizationId
      ) {
        return state;
      }

      return {
        ...state,
        mfa: {
          ...state.mfa,
          totp: {
            ...state.mfa.totp,
            createError: null,
            isCreating: false,
            enrollment: {
              secret: action.response.secret,
              qrCode: action.response.qr_code,
              recoveryCodes: action.response.recovery_codes,
              method: state.mfa.totp.enrollment?.method ?? 'qr',
            },
          },
        },
      };
    case 'totp/create_error':
      return {
        ...state,
        mfa: {
          ...state.mfa,
          totp: {
            ...state.mfa.totp,
            isCreating: false,
            createError: action.error,
          },
        },
      };

    case 'totp/show_code': {
      if (!state.mfa.isEnrolling || !state.mfa.totp.enrollment) {
        return state;
      }

      const method = action.method ?? state.mfa.totp.enrollment.method ?? 'qr';
      const nextScreen = method === 'manual' ? AppScreens.TOTPEnrollmentManual : AppScreens.TOTPEnrollmentQRCode;

      return pushHistory(nextScreen, {
        ...state,
        mfa: {
          ...state.mfa,
          totp: {
            ...state.mfa.totp,
            enrollment: {
              ...state.mfa.totp.enrollment,
              method,
            },
          },
        },
      });
    }

    default:
      return state;
  }
};
