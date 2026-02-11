import { B2BMFAAction } from '../actions';
import { DEFAULT_MFA_STATE, DEFAULT_UI_STATE } from '../states';
import { MFAReducer } from './MFAReducer';
import { Screen } from '../screens';
import { MOCK_RESPONSE_COMMON } from '../../../mocks';
import { MOCK_ORGANIZATION } from '../mocks';
import { B2BErrorType } from '../../shared/types';
import { AuthFlowType, B2BMFAProducts } from '@stytch/core/public';
import {
  MOCK_FULLY_AUTHED_MEMBER_SESSION,
  MOCK_FULLY_AUTHED_RESPONSE,
  MOCK_MEMBER,
  MOCK_MEMBER_NEEDS_MFA,
  MOCK_MEMBER_NEEDS_MFA_SMS_IMPLICITLY_SENT,
  MOCK_MEMBER_NEEDS_MFA_TOTP_ENROLLED,
  MOCK_MEMBER_NEEDS_MFA_WITH_SMS_PRIMARY,
  MOCK_MEMBER_NO_MFA_ENROLLED_TOTP_SUPPORTED,
} from '../mocks';

describe('MFAReducer', () => {
  describe('mfa/primaryAuthenticate/success sets expected state', () => {
    describe('When a fully authenticated member session is present', () => {
      it('uses the correct postAuth screen', () => {
        const actionWithNoTokenType: B2BMFAAction = {
          type: 'mfa/primaryAuthenticate/success',
          response: MOCK_FULLY_AUTHED_MEMBER_SESSION,
          includedMfaMethods: [],
          resetTokenType: undefined,
        };
        const noTokenResult = MFAReducer(DEFAULT_UI_STATE, actionWithNoTokenType);
        expect(noTokenResult).toMatchObject({
          ...DEFAULT_UI_STATE,
          mfaState: DEFAULT_MFA_STATE,
          primaryAuthState: {},
          history: [Screen.Main],
          screen: Screen.Success,
        });

        const actionWithTokenType: B2BMFAAction = {
          ...actionWithNoTokenType,
          resetTokenType: 'multi_tenant_magic_links',
        };
        const withTokenResult = MFAReducer(DEFAULT_UI_STATE, actionWithTokenType);
        expect(withTokenResult).toMatchObject({
          ...DEFAULT_UI_STATE,
          mfaState: DEFAULT_MFA_STATE,
          primaryAuthState: {},
          history: [Screen.Main],
          screen: Screen.PasswordResetForm,
        });
      });
    });

    describe('Additional Primary Auth Required', () => {
      it('returns error if there are no primary auth methods', () => {
        const action: B2BMFAAction = {
          type: 'mfa/primaryAuthenticate/success',
          response: MOCK_MEMBER_NEEDS_MFA,
          includedMfaMethods: [],
          resetTokenType: undefined,
        };
        const result = MFAReducer(DEFAULT_UI_STATE, action);
        expect(result).toMatchObject({
          ...DEFAULT_UI_STATE,
          authenticationState: {
            ...DEFAULT_UI_STATE.authenticationState,
            authFlowType: AuthFlowType.Organization,
            organization: action.response.organization,
          },
          memberState: {
            ...DEFAULT_UI_STATE.memberState,
            emailAddress: {
              ...DEFAULT_UI_STATE.memberState.emailAddress,
              emailAddress: MOCK_MEMBER.email_address,
            },
          },
          primaryAuthState: {
            primaryAuthMethods: [],
            email: MOCK_MEMBER.email_address,
            emailVerified: MOCK_MEMBER.email_address_verified,
          },
          history: [Screen.Main],
          screen: Screen.Error,
          screenState: {
            ...DEFAULT_UI_STATE.screenState,
            error: { internalError: B2BErrorType.CannotJoinOrgDueToAuthPolicy },
          },
        });
      });
      it('returns expectes state if there are primary auth methods', () => {
        const action: B2BMFAAction = {
          type: 'mfa/primaryAuthenticate/success',
          response: MOCK_MEMBER_NEEDS_MFA_WITH_SMS_PRIMARY,
          includedMfaMethods: [],
          resetTokenType: undefined,
        };
        const result = MFAReducer(DEFAULT_UI_STATE, action);
        expect(result).toMatchObject({
          ...DEFAULT_UI_STATE,
          authenticationState: {
            ...DEFAULT_UI_STATE.authenticationState,
            authFlowType: AuthFlowType.Organization,
            organization: action.response.organization,
          },
          memberState: {
            ...DEFAULT_UI_STATE.memberState,
            emailAddress: {
              ...DEFAULT_UI_STATE.memberState.emailAddress,
              emailAddress: MOCK_MEMBER.email_address,
            },
          },
          primaryAuthState: {
            primaryAuthMethods: ['sms_otp'],
            email: MOCK_MEMBER.email_address,
            emailVerified: MOCK_MEMBER.email_address_verified,
          },
          history: [Screen.Main],
          screen: Screen.Main,
        });
      });
    });

    describe('When there is a preferred method', () => {
      describe('And its SMS implicitly sent', () => {
        it('Sets the expected state', () => {
          const action: B2BMFAAction = {
            type: 'mfa/primaryAuthenticate/success',
            response: MOCK_MEMBER_NEEDS_MFA_SMS_IMPLICITLY_SENT,
            includedMfaMethods: [],
            resetTokenType: undefined,
          };
          const result = MFAReducer(DEFAULT_UI_STATE, action);
          const expectedPrimaryInfo = {
            enrolledMfaMethods: [B2BMFAProducts.smsOtp],
            memberId: action.response.member_id,
            memberPhoneNumber: action.response.member.mfa_phone_number,
            organizationId: action.response.organization.organization_id,
            organizationMfaOptionsSupported: [],
            postAuthScreen: Screen.Success,
          };
          const expectedMfaState = {
            ...DEFAULT_MFA_STATE,
            primaryInfo: expectedPrimaryInfo,
          };
          expect(result).toMatchObject({
            ...DEFAULT_UI_STATE,
            mfaState: {
              ...expectedMfaState,
              smsOtp: {
                ...DEFAULT_MFA_STATE.smsOtp,
                codeExpiration: expect.any(Date),
              },
            },
            primaryAuthState: {},
            history: [Screen.Main],
            screen: Screen.SMSOTPEntry,
          });
        });
      });
      describe('And it is TOTP', () => {
        it('Sets the expected state', () => {
          const action: B2BMFAAction = {
            type: 'mfa/primaryAuthenticate/success',
            response: MOCK_MEMBER_NEEDS_MFA_TOTP_ENROLLED,
            includedMfaMethods: [],
            resetTokenType: undefined,
          };
          const result = MFAReducer(DEFAULT_UI_STATE, action);
          const expectedPrimaryInfo = {
            enrolledMfaMethods: [B2BMFAProducts.totp, B2BMFAProducts.smsOtp],
            memberId: action.response.member_id,
            memberPhoneNumber: action.response.member.mfa_phone_number,
            organizationId: action.response.organization.organization_id,
            organizationMfaOptionsSupported: [],
            postAuthScreen: Screen.Success,
          };
          const expectedMfaState = {
            ...DEFAULT_MFA_STATE,
            primaryInfo: expectedPrimaryInfo,
          };
          expect(result).toMatchObject({
            ...DEFAULT_UI_STATE,
            mfaState: expectedMfaState,
            primaryAuthState: {},
            history: [Screen.Main],
            screen: Screen.TOTPEntry,
          });
        });
      });
    });

    describe('When member not enrolled in MFA', () => {
      describe('And only TOTP is allowed', () => {
        it('Sets the expected state', () => {
          const action: B2BMFAAction = {
            type: 'mfa/primaryAuthenticate/success',
            response: MOCK_MEMBER_NO_MFA_ENROLLED_TOTP_SUPPORTED,
            includedMfaMethods: [B2BMFAProducts.totp],
            resetTokenType: undefined,
          };
          const result = MFAReducer(DEFAULT_UI_STATE, action);
          const expectedPrimaryInfo = {
            enrolledMfaMethods: [],
            memberId: action.response.member_id,
            memberPhoneNumber: action.response.member.mfa_phone_number,
            organizationId: action.response.organization.organization_id,
            organizationMfaOptionsSupported: [],
            postAuthScreen: Screen.Success,
          };
          expect(result).toMatchObject({
            ...DEFAULT_UI_STATE,
            mfaState: { ...DEFAULT_MFA_STATE, primaryInfo: expectedPrimaryInfo, isEnrolling: true },
            primaryAuthState: {},
            history: [Screen.Main],
            screen: Screen.TOTPEnrollmentManual,
          });
        });
        describe('And only SMS is allowed', () => {
          it('Sets the expected state', () => {
            const action: B2BMFAAction = {
              type: 'mfa/primaryAuthenticate/success',
              response: MOCK_MEMBER_NO_MFA_ENROLLED_TOTP_SUPPORTED,
              includedMfaMethods: [B2BMFAProducts.smsOtp],
              resetTokenType: undefined,
            };
            const result = MFAReducer(DEFAULT_UI_STATE, action);
            const expectedPrimaryInfo = {
              enrolledMfaMethods: [],
              memberId: action.response.member_id,
              memberPhoneNumber: action.response.member.mfa_phone_number,
              organizationId: action.response.organization.organization_id,
              organizationMfaOptionsSupported: [],
              postAuthScreen: Screen.Success,
            };
            expect(result).toMatchObject({
              ...DEFAULT_UI_STATE,
              mfaState: { ...DEFAULT_MFA_STATE, primaryInfo: expectedPrimaryInfo, isEnrolling: true },
              primaryAuthState: {},
              history: [Screen.Main],
              screen: Screen.SMSOTPEnrollment,
            });
          });
        });
        describe('And only both methods are allowed', () => {
          it('Sets the expected state', () => {
            const action: B2BMFAAction = {
              type: 'mfa/primaryAuthenticate/success',
              response: MOCK_MEMBER_NO_MFA_ENROLLED_TOTP_SUPPORTED,
              includedMfaMethods: [B2BMFAProducts.smsOtp, B2BMFAProducts.totp],
              resetTokenType: undefined,
            };
            const result = MFAReducer(DEFAULT_UI_STATE, action);
            const expectedPrimaryInfo = {
              enrolledMfaMethods: [],
              memberId: action.response.member_id,
              memberPhoneNumber: action.response.member.mfa_phone_number,
              organizationId: action.response.organization.organization_id,
              organizationMfaOptionsSupported: [],
              postAuthScreen: Screen.Success,
            };
            expect(result).toMatchObject({
              ...DEFAULT_UI_STATE,
              mfaState: { ...DEFAULT_MFA_STATE, primaryInfo: expectedPrimaryInfo, isEnrolling: true },
              primaryAuthState: {},
              history: [Screen.Main],
              screen: Screen.MFAEnrollmentSelection,
            });
          });
        });
      });
    });
  });
  describe('mfa/recoveryCode/authenticate/success sets expected state', () => {
    it('with default success screen', () => {
      const action: B2BMFAAction = {
        type: 'mfa/recoveryCode/authenticate/success',
        response: MOCK_FULLY_AUTHED_RESPONSE,
      };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [Screen.Main],
          screen: Screen.Discovery,
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main, Screen.Discovery],
        screen: Screen.Success,
      });
    });
    it('with specified postAuth screen', () => {
      const action: B2BMFAAction = {
        type: 'mfa/recoveryCode/authenticate/success',
        response: MOCK_FULLY_AUTHED_RESPONSE,
      };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [Screen.Main],
          screen: Screen.Discovery,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            primaryInfo: {
              enrolledMfaMethods: [],
              memberId: '',
              memberPhoneNumber: null,
              organizationId: '',
              organizationMfaOptionsSupported: [],
              postAuthScreen: Screen.EmailConfirmation,
            },
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main, Screen.Discovery],
        screen: Screen.EmailConfirmation,
      });
    });
  });
  describe('mfa/recoveryCode/navigateToEntry sets expected state', () => {
    it('Goes to recovery screen', () => {
      const action: B2BMFAAction = { type: 'mfa/recoveryCode/navigateToEntry' };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Main,
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.RecoveryCodeEntry,
      });
    });
  });
  describe('mfa/recoveryCode/saveAcknowledge sets expected state', () => {
    it('with default success screen', () => {
      const action: B2BMFAAction = { type: 'mfa/recoveryCode/saveAcknowledge' };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [Screen.Main],
          screen: Screen.Discovery,
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main, Screen.Discovery],
        screen: Screen.Success,
      });
    });
    it('with specified postAuth screen', () => {
      const action: B2BMFAAction = { type: 'mfa/recoveryCode/saveAcknowledge' };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [Screen.Main],
          screen: Screen.Discovery,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            primaryInfo: {
              enrolledMfaMethods: [],
              memberId: '',
              memberPhoneNumber: null,
              organizationId: '',
              organizationMfaOptionsSupported: [],
              postAuthScreen: Screen.EmailConfirmation,
            },
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main, Screen.Discovery],
        screen: Screen.EmailConfirmation,
      });
    });
  });
  describe('mfa/smsOtp/authenticateSuccess sets expected state', () => {
    it('with default success screen', () => {
      const action: B2BMFAAction = { type: 'mfa/smsOtp/authenticateSuccess', response: MOCK_FULLY_AUTHED_RESPONSE };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [Screen.Main],
          screen: Screen.Discovery,
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main, Screen.Discovery],
        screen: Screen.Success,
      });
    });
    it('with specified postAuth screen', () => {
      const action: B2BMFAAction = { type: 'mfa/smsOtp/authenticateSuccess', response: MOCK_FULLY_AUTHED_RESPONSE };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [Screen.Main],
          screen: Screen.Discovery,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            primaryInfo: {
              enrolledMfaMethods: [],
              memberId: '',
              memberPhoneNumber: null,
              organizationId: '',
              organizationMfaOptionsSupported: [],
              postAuthScreen: Screen.EmailConfirmation,
            },
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main, Screen.Discovery],
        screen: Screen.EmailConfirmation,
      });
    });
  });
  describe('mfa/smsOtp/navigateToEntry sets expected state', () => {
    it('Goes to recovery screen', () => {
      const action: B2BMFAAction = { type: 'mfa/smsOtp/navigateToEntry' };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Main,
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.SMSOTPEntry,
      });
    });
  });
  describe('mfa/smsOtp/send sets expected state', () => {
    it('updates smsOtp properties', () => {
      const action: B2BMFAAction = { type: 'mfa/smsOtp/send' };
      const result = MFAReducer(DEFAULT_UI_STATE, action);
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        screenState: {
          ...DEFAULT_UI_STATE.screenState,
          isSubmitting: true,
        },
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          smsOtp: {
            ...DEFAULT_UI_STATE.mfaState.smsOtp,
            isSending: true,
            sendError: undefined,
          },
        },
      });
    });
  });
  describe('mfa/smsOtp/send/success sets expected state', () => {
    it('updates smsOtp properties', () => {
      const action: B2BMFAAction = {
        type: 'mfa/smsOtp/send/success',
        countryCode: '+1',
        phoneNumber: 'phone-number',
        formattedPhoneNumber: 'formatted-phone-number',
        response: MOCK_RESPONSE_COMMON,
      };
      const result = MFAReducer(DEFAULT_UI_STATE, action);
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.SMSOTPEntry,
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          smsOtp: {
            ...DEFAULT_UI_STATE.mfaState.smsOtp,
            isSending: false,
            sendError: undefined,
            codeExpiration: expect.any(Date),
            formattedDestination: 'formatted-phone-number',
            enrolledNumber: {
              phoneNumber: 'phone-number',
              countryCode: '+1',
            },
          },
        },
      });
    });
  });
  describe('mfa/smsOtp/send/error sets expected state', () => {
    it('updates smsOtp properties', () => {
      const action: B2BMFAAction = { type: 'mfa/smsOtp/send/error', error: { internalError: B2BErrorType.Default } };
      const codeExpiration = new Date();
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            smsOtp: {
              ...DEFAULT_UI_STATE.mfaState.smsOtp,
              codeExpiration: codeExpiration,
            },
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          smsOtp: {
            ...DEFAULT_UI_STATE.mfaState.smsOtp,
            isSending: false,
            sendError: action.error,
            codeExpiration: codeExpiration,
          },
        },
      });
    });
  });
  describe('mfa/startEnrollment sets expected state', () => {
    it('enrolls in SMS', () => {
      const action: B2BMFAAction = { type: 'mfa/startEnrollment', method: B2BMFAProducts.smsOtp };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Main,
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.SMSOTPEnrollment,
      });
    });
    it('enrolls in TOTP', () => {
      const action: B2BMFAAction = { type: 'mfa/startEnrollment', method: B2BMFAProducts.totp };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Main,
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.TOTPEnrollmentManual,
      });
    });
  });
  describe('mfa/totp/authenticate/success sets expected state', () => {
    it('when enrolling', () => {
      const action: B2BMFAAction = { type: 'mfa/totp/authenticate/success', response: MOCK_FULLY_AUTHED_RESPONSE };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Main,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            isEnrolling: true,
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.RecoveryCodeSave,
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          isEnrolling: true,
        },
      });
    });
    it('when postAuthScreen is specified', () => {
      const action: B2BMFAAction = { type: 'mfa/totp/authenticate/success', response: MOCK_FULLY_AUTHED_RESPONSE };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Main,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            isEnrolling: false,
            primaryInfo: {
              enrolledMfaMethods: [],
              memberId: '',
              memberPhoneNumber: null,
              organizationId: '',
              organizationMfaOptionsSupported: [],
              postAuthScreen: Screen.EmailConfirmation,
            },
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.EmailConfirmation,
      });
    });
    it('when default', () => {
      const action: B2BMFAAction = { type: 'mfa/totp/authenticate/success', response: MOCK_FULLY_AUTHED_RESPONSE };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Main,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            isEnrolling: false,
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.Success,
      });
    });
  });
  describe('mfa/totp/create sets expected state', () => {
    it('TKTKTK', () => {
      const action: B2BMFAAction = { type: 'mfa/totp/create' };
      const result = MFAReducer(DEFAULT_UI_STATE, action);
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          totp: {
            ...DEFAULT_UI_STATE.mfaState.totp,
            isCreating: true,
            createError: undefined,
          },
        },
      });
    });
  });
  describe('mfa/totp/create/success sets expected state', () => {
    it('updates the totp state', () => {
      const action = {
        type: 'mfa/totp/create/success',
        response: {
          ...MOCK_RESPONSE_COMMON,
          member_id: 'member-id',
          member: MOCK_MEMBER,
          organization: MOCK_ORGANIZATION,
          totp_registration_id: 'totp-registration-id',
          secret: 'totp-secret',
          qr_code: 'totp-qr-code',
          recovery_codes: ['1', '2'],
        },
        memberId: 'member-id',
        organizationId: 'organization-id',
      } satisfies B2BMFAAction;
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            isEnrolling: true,
            primaryInfo: {
              enrolledMfaMethods: [],
              memberPhoneNumber: null,
              organizationMfaOptionsSupported: [],
              postAuthScreen: Screen.EmailConfirmation,
              memberId: 'member-id',
              organizationId: 'organization-id',
            },
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          isEnrolling: true,
          primaryInfo: {
            enrolledMfaMethods: [],
            memberPhoneNumber: null,
            organizationMfaOptionsSupported: [],
            postAuthScreen: Screen.EmailConfirmation,
            memberId: 'member-id',
            organizationId: 'organization-id',
          },
          totp: {
            createError: undefined,
            isCreating: false,
            enrollment: {
              secret: action.response.secret,
              qrCode: action.response.qr_code,
              recoveryCodes: action.response.recovery_codes,
              method: 'qr',
            },
          },
        },
      });
    });
  });
  describe('mfa/totp/create/error sets expected state', () => {
    it('updates totp properties', () => {
      const action: B2BMFAAction = { type: 'mfa/totp/create/error', error: { internalError: B2BErrorType.Default } };
      const result = MFAReducer(DEFAULT_UI_STATE, action);
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          totp: {
            ...DEFAULT_UI_STATE.mfaState.totp,
            isCreating: false,
            createError: { internalError: B2BErrorType.Default },
          },
        },
      });
    });
  });
  describe('mfa/totp/navigateToEntry expected state', () => {
    it('Goes to recovery screen', () => {
      const action: B2BMFAAction = { type: 'mfa/totp/navigateToEntry' };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Main,
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.TOTPEntry,
      });
    });
  });
  describe('mfa/totp/showCode sets expected state', () => {
    it('for manual', () => {
      const action: B2BMFAAction = { type: 'mfa/totp/showCode', method: 'manual' };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Success,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            isEnrolling: true,
            totp: {
              ...DEFAULT_UI_STATE.mfaState.totp,
              enrollment: {
                secret: '',
                recoveryCodes: [],
                qrCode: '',
                method: 'manual',
              },
            },
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          isEnrolling: true,
          totp: {
            ...DEFAULT_UI_STATE.mfaState.totp,
            enrollment: {
              secret: '',
              recoveryCodes: [],
              qrCode: '',
              method: 'manual',
            },
          },
        },
        history: [Screen.Success],
        screen: Screen.TOTPEnrollmentManual,
      });
    });
    it('for qr', () => {
      const action: B2BMFAAction = { type: 'mfa/totp/showCode', method: 'qr' };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Success,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            isEnrolling: true,
            totp: {
              ...DEFAULT_UI_STATE.mfaState.totp,
              enrollment: {
                secret: '',
                recoveryCodes: [],
                qrCode: '',
                method: 'manual',
              },
            },
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Success],
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          isEnrolling: true,
          totp: {
            ...DEFAULT_UI_STATE.mfaState.totp,
            enrollment: {
              secret: '',
              recoveryCodes: [],
              qrCode: '',
              method: 'qr',
            },
          },
        },
        screen: Screen.TOTPEnrollmentManual,
      });
    });
    it('uses the state if no action passed', () => {
      const action: B2BMFAAction = { type: 'mfa/totp/showCode' };
      const result = MFAReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Main,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            isEnrolling: true,
            totp: {
              ...DEFAULT_UI_STATE.mfaState.totp,
              enrollment: {
                secret: '',
                recoveryCodes: [],
                qrCode: '',
                method: 'manual',
              },
            },
          },
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.TOTPEnrollmentManual,
        mfaState: {
          ...DEFAULT_UI_STATE.mfaState,
          isEnrolling: true,
          totp: {
            ...DEFAULT_UI_STATE.mfaState.totp,
            enrollment: {
              secret: '',
              recoveryCodes: [],
              qrCode: '',
              method: 'manual',
            },
          },
        },
      });
    });
  });
});
