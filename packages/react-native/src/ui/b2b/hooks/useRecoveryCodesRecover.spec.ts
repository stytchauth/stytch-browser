import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { useRecoveryCodesRecover } from './useRecoveryCodesRecover';
import { StytchRNB2BUIConfig } from '../config';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { MOCK_MEMBER_NEEDS_MFA } from '../mocks';
import { B2BMFAProducts } from '@stytch/core/public';
import { Screen } from '../screens';

describe('useRecoveryCodesRecover', () => {
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
  it('dispatches expected error when organizationId is missing', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      recoveryCodes: {
        recover: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { recoveryCodesRecover } = useRecoveryCodesRecover();
    await recoveryCodesRecover('code');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/recoveryCode/authenticate/error',
      error: { internalError: 'Missing organizationId' },
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
      recoveryCodes: {
        recover: jest.fn().mockResolvedValue(MOCK_MEMBER_NEEDS_MFA),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { recoveryCodesRecover } = useRecoveryCodesRecover();
    await recoveryCodesRecover('code');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/recoveryCode/authenticate/success',
      response: MOCK_MEMBER_NEEDS_MFA,
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
      recoveryCodes: {
        recover: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { recoveryCodesRecover } = useRecoveryCodesRecover();
    await recoveryCodesRecover('code');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/recoveryCode/authenticate/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
