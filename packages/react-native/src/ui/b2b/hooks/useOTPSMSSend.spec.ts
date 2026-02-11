import { B2BMFAProducts } from '@stytch/core/public';

import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { MOCK_RESPONSE_COMMON, MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchRNB2BUIConfig } from '../config';
import * as ContextProvider from '../ContextProvider';
import { Screen } from '../screens';
import { DEFAULT_UI_STATE } from '../states';
import { useOTPSMSSend } from './useOTPSMSSend';

describe('useOTPSMSSend', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchB2BClient;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return {
        productConfig: {
          sessionOptions: {},
        },
      } as StytchRNB2BUIConfig;
    });
    jest.spyOn(ContextProvider, 'useEventCallback').mockReturnValue(jest.fn());
  });
  it('dispatches expected error when organzation id is missing', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      otps: {
        sms: {
          send: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { otpSmsSend } = useOTPSMSSend();
    await otpSmsSend();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/smsOtp/send/error',
      error: { internalError: 'Missing organization' },
    });
  });
  it('dispatches expected error when phonenumber is missing', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [
        {
          ...DEFAULT_UI_STATE,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            primaryInfo: {
              enrolledMfaMethods: [B2BMFAProducts.smsOtp],
              memberId: 'member-id',
              memberPhoneNumber: null,
              organizationId: 'organization-id',
              organizationMfaOptionsSupported: [B2BMFAProducts.smsOtp],
              postAuthScreen: Screen.Success,
            },
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      otps: {
        sms: {
          send: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { otpSmsSend } = useOTPSMSSend();
    await otpSmsSend();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/smsOtp/send/error',
      error: { internalError: 'Missing memberPhoneNumber' },
    });
  });
  it('dispatches expected success when call succeeds', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [
        {
          ...DEFAULT_UI_STATE,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            primaryInfo: {
              enrolledMfaMethods: [B2BMFAProducts.smsOtp],
              memberId: 'member-id',
              memberPhoneNumber: '',
              organizationId: 'organization-id',
              organizationMfaOptionsSupported: [B2BMFAProducts.smsOtp],
              postAuthScreen: Screen.Success,
            },
            smsOtp: {
              isSending: true,
              sendError: undefined,
              codeExpiration: null,
              formattedDestination: null,
              enrolledNumber: {
                countryCode: '+1',
                phoneNumber: '5005550006',
              },
            },
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      otps: {
        sms: {
          send: jest.fn().mockResolvedValue(MOCK_RESPONSE_COMMON),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { otpSmsSend } = useOTPSMSSend();
    await otpSmsSend();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/smsOtp/send/success',
      response: MOCK_RESPONSE_COMMON,
      countryCode: '+1',
      phoneNumber: '5005550006',
      formattedPhoneNumber: '+15005550006',
    });
  });
  it('dispatches expected error when call fails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [
        {
          ...DEFAULT_UI_STATE,
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            primaryInfo: {
              enrolledMfaMethods: [B2BMFAProducts.smsOtp],
              memberId: 'member-id',
              memberPhoneNumber: '',
              organizationId: 'organization-id',
              organizationMfaOptionsSupported: [B2BMFAProducts.smsOtp],
              postAuthScreen: Screen.Success,
            },
            smsOtp: {
              isSending: true,
              sendError: undefined,
              codeExpiration: null,
              formattedDestination: null,
              enrolledNumber: {
                countryCode: '+1',
                phoneNumber: '5005550006',
              },
            },
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      otps: {
        sms: {
          send: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { otpSmsSend } = useOTPSMSSend();
    await otpSmsSend();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/smsOtp/send/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
