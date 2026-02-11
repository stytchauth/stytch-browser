import { AuthFlowType, B2BMFAProducts } from '@stytch/core/public';
import { getEnabledMethods, isTruthy } from '../utils';
import { UIState } from '../states';
import { B2BMFAAction } from '../actions';
import { Screen } from '../screens';
import { DEFAULT_MFA_STATE, MfaState } from '../states';
import { B2B_MFA_METHODS } from '../types';
import { B2BErrorType } from '../../shared/types';

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

const getSmsOtpCodeExpiration = () => new Date(Date.now() + DEFAULT_SMS_OTP_EXPIRATION_MS);

export const MFAReducer = (state: UIState, action: B2BMFAAction): UIState => {
  switch (action.type) {
    case 'mfa/primaryAuthenticate':
    case 'mfa/recoveryCode/authenticate':
    case 'mfa/smsOtp/authenticate':
    case 'mfa/totp/authenticate':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'mfa/primaryAuthenticate/success': {
      const memberAuthenticated = !!action.response.member_session;
      const postAuthScreen =
        action.resetTokenType === 'multi_tenant_magic_links' ? Screen.PasswordResetForm : Screen.Success;

      // If the member is fully authenticated, there's no need to continue
      if (memberAuthenticated) {
        return {
          ...state,
          mfaState: DEFAULT_MFA_STATE,
          primaryAuthState: {},
          history: state.history.concat([state.screen]),
          screen: postAuthScreen,
          screenState: {
            ...state.screenState,
            isSubmitting: false,
          },
        };
      }

      // Additional primary auth may be required
      if (action.response.primary_required) {
        const primaryAuthMethods = action.response.primary_required.allowed_auth_methods;
        const { email_address: email, email_address_verified: emailVerified } = action.response.member;

        const newBaseState: UIState = {
          ...state,
          authenticationState: {
            ...state.authenticationState,
            authFlowType: AuthFlowType.Organization,
            organization: action.response.organization,
          },
          memberState: {
            ...state.memberState,
            emailAddress: {
              ...state.memberState.emailAddress,
              emailAddress: email,
            },
          },
          primaryAuthState: {
            primaryAuthMethods,
            email,
            emailVerified,
          },
          history: state.history.concat([state.screen]),
          screen: Screen.Main,
          screenState: {
            ...state.screenState,
            isSubmitting: false,
          },
        };

        if (primaryAuthMethods?.length === 0) {
          return {
            ...newBaseState,
            history: state.history.concat([state.screen]),
            screen: Screen.Error,
            screenState: {
              ...state.screenState,
              isSubmitting: false,
              error: { internalError: B2BErrorType.CannotJoinOrgDueToAuthPolicy },
            },
          };
        }

        return newBaseState;
      }

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
          action.response.organization.mfa_methods === 'RESTRICTED' && action.response.organization.allowed_mfa_methods
            ? action.response.organization.allowed_mfa_methods?.map(apiMfaMethodToProduct).filter(isTruthy)
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

      // Use the member's preferred method, or any suitable fallback if the
      // preferred method is not available for whatever reason. However, if an
      // SMS was automatically sent, we should proceed directly to SMS OTP
      // entry (even if the member's phone number is not yet verified).
      const smsImplicitlySent = action.response.mfa_required?.secondary_auth_initiated === 'sms_otp';
      const entryMethod = smsImplicitlySent
        ? B2BMFAProducts.smsOtp
        : (getDefaultMethod() ?? primaryInfo.enrolledMfaMethods.find(organizationSupportsMethod));
      if (entryMethod) {
        const mfaState = {
          ...DEFAULT_MFA_STATE,
          primaryInfo,
        } as const;

        switch (entryMethod) {
          case B2BMFAProducts.smsOtp: {
            return {
              ...state,
              mfaState: {
                ...mfaState,
                smsOtp: {
                  ...DEFAULT_MFA_STATE.smsOtp,
                  codeExpiration: smsImplicitlySent ? getSmsOtpCodeExpiration() : null,
                },
              },
              primaryAuthState: {},
              history: state.history.concat([state.screen]),
              screen: Screen.SMSOTPEntry,
              screenState: {
                ...state.screenState,
                isSubmitting: false,
              },
            };
          }
          case B2BMFAProducts.totp:
            return {
              ...state,
              mfaState: mfaState,
              primaryAuthState: {},
              history: state.history.concat([state.screen]),
              screen: Screen.TOTPEntry,
              screenState: {
                ...state.screenState,
                isSubmitting: false,
              },
            };
        }
      }

      // If the member is not enrolled in MFA, we need to enroll them. Note that
      // it's possible the member is actually enrolled, but using a method we
      // don't recognize. Unfortunately, we can't distinguish between these
      // cases; we'll offer to enroll the user, but enrollment will likely fail
      // if the member can't complete MFA first.

      const enabledMethods = getEnabledMethods({
        allMethods: B2B_MFA_METHODS,
        orgSupportedMethods: primaryInfo.organizationMfaOptionsSupported,
        uiIncludedMethods: action.includedMfaMethods,
      });

      const getNextEnrollmentScreen = () => {
        // If there is only one possible method, use it
        if (enabledMethods.size === 1) {
          if (enabledMethods.has(B2BMFAProducts.totp)) {
            return Screen.TOTPEnrollmentManual;
          }
          if (enabledMethods.has(B2BMFAProducts.smsOtp)) {
            return Screen.SMSOTPEnrollment;
          }
        }

        return Screen.MFAEnrollmentSelection;
      };

      return {
        ...state,
        mfaState: { ...DEFAULT_MFA_STATE, primaryInfo, isEnrolling: true },
        primaryAuthState: {},
        history: state.history.concat([state.screen]),
        screen: getNextEnrollmentScreen(),
      };
    }
    case 'mfa/recoveryCode/authenticate/success':
      return {
        ...state,
        mfaState: DEFAULT_MFA_STATE,
        history: state.history.concat([state.screen]),
        screen: state.mfaState.primaryInfo?.postAuthScreen ?? Screen.Success,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/recoveryCode/authenticate/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'mfa/recoveryCode/navigateToEntry':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.RecoveryCodeEntry,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/recoveryCode/saveAcknowledge':
      return {
        ...state,
        mfaState: DEFAULT_MFA_STATE,
        history: state.history.concat([state.screen]),
        screen: state.mfaState.primaryInfo?.postAuthScreen ?? Screen.Success,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/smsOtp/authenticateSuccess':
      return {
        ...state,
        mfaState: DEFAULT_MFA_STATE,
        history: state.history.concat([state.screen]),
        screen: state.mfaState.primaryInfo?.postAuthScreen ?? Screen.Success,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/smsOtp/authenticateError':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'mfa/smsOtp/navigateToEntry':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.SMSOTPEntry,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/smsOtp/send':
      return {
        ...state,
        mfaState: {
          ...state.mfaState,
          smsOtp: {
            ...state.mfaState.smsOtp,
            isSending: true,
            sendError: undefined,
          },
        },
        screenState: {
          ...state.screenState,
          isSubmitting: true,
        },
      };
    case 'mfa/smsOtp/send/success':
      return {
        ...state,
        mfaState: {
          ...state.mfaState,
          smsOtp: {
            ...state.mfaState.smsOtp,
            isSending: false,
            sendError: undefined,
            codeExpiration: getSmsOtpCodeExpiration(),
            formattedDestination: action.formattedPhoneNumber ?? state.mfaState.smsOtp.formattedDestination,
            enrolledNumber: action.phoneNumber
              ? {
                  phoneNumber: action.phoneNumber,
                  countryCode: action.countryCode,
                }
              : null,
          },
        },
        history: state.history.concat([state.screen]),
        screen: Screen.SMSOTPEntry,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/smsOtp/send/error':
      return {
        ...state,
        mfaState: {
          ...state.mfaState,
          smsOtp: {
            ...state.mfaState.smsOtp,
            isSending: false,
            sendError: action.error,
            // If there was no code (expiration), set an expiration to an
            // arbitrary point in the past. This reveals the "resend code"
            // button so the user can try again.
            codeExpiration: state.mfaState.smsOtp.codeExpiration ?? new Date(Date.now() - 1000),
          },
        },
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/startEnrollment':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: action.method === B2BMFAProducts.smsOtp ? Screen.SMSOTPEnrollment : Screen.TOTPEnrollmentManual,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/totp/authenticate/success':
      return {
        ...state,
        mfaState: state.mfaState.isEnrolling ? state.mfaState : DEFAULT_MFA_STATE,
        history: state.history.concat([state.screen]),
        screen: state.mfaState.isEnrolling
          ? Screen.RecoveryCodeSave
          : (state.mfaState.primaryInfo?.postAuthScreen ?? Screen.Success),
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/totp/authenticate/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'mfa/totp/create':
      if (state.mfaState.totp.isCreating) {
        return state;
      }

      return {
        ...state,
        mfaState: {
          ...state.mfaState,
          totp: {
            ...state.mfaState.totp,
            isCreating: true,
            createError: undefined,
          },
        },
      };
    case 'mfa/totp/create/success':
      // I think we need to change screens here
      if (
        !state.mfaState.isEnrolling ||
        state.mfaState.primaryInfo?.memberId !== action.memberId ||
        state.mfaState.primaryInfo?.organizationId !== action.organizationId
      ) {
        return state;
      }

      return {
        ...state,
        mfaState: {
          ...state.mfaState,
          totp: {
            ...state.mfaState.totp,
            createError: undefined,
            isCreating: false,
            enrollment: {
              secret: action.response.secret,
              qrCode: action.response.qr_code,
              recoveryCodes: action.response.recovery_codes,
              method: state.mfaState.totp.enrollment?.method ?? 'qr',
            },
          },
        },
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/totp/create/error':
      return {
        ...state,
        mfaState: {
          ...state.mfaState,
          totp: {
            ...state.mfaState.totp,
            isCreating: false,
            createError: action.error,
          },
        },
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'mfa/totp/navigateToEntry':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.TOTPEntry,
      };
    case 'mfa/totp/showCode': {
      if (!state.mfaState.isEnrolling || !state.mfaState.totp.enrollment) {
        return state;
      }

      const method = action.method ?? state.mfaState.totp.enrollment.method ?? 'qr';

      return {
        ...state,
        mfaState: {
          ...state.mfaState,
          totp: {
            ...state.mfaState.totp,
            enrollment: {
              ...state.mfaState.totp.enrollment,
              method,
            },
          },
        },
        history: state.history.concat([state.screen]),
        screen: Screen.TOTPEnrollmentManual,
      };
    }
    case 'mfa/recoveryCode/download/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: action.error,
        },
      };
  }
};
