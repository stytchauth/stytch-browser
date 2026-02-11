import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { useTOTPAuthenticate } from './useTOTPAuthenticate';
import { StytchRNB2BUIConfig } from '../config';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { B2BMFAProducts } from '@stytch/core/public';
import { Screen } from '../screens';
import { MOCK_FULLY_AUTHED_RESPONSE } from '../mocks';

describe('useTOTPAuthenticate', () => {
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
  it('dispatches expected error when organization id is missing', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      totp: {
        authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { totpAuthenticate } = useTOTPAuthenticate();
    await totpAuthenticate('code');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/totp/authenticate/error',
      error: { internalError: 'Missing organization' },
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
      totp: {
        authenticate: jest.fn().mockResolvedValue(MOCK_FULLY_AUTHED_RESPONSE),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { totpAuthenticate } = useTOTPAuthenticate();
    await totpAuthenticate('code');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/totp/authenticate/success',
      response: MOCK_FULLY_AUTHED_RESPONSE,
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
            totp: {
              isCreating: true,
              createError: undefined,
              enrollment: {
                secret: 'secret',
                qrCode: 'qr-code',
                recoveryCodes: [],
                method: 'manual',
              },
            },
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      totp: {
        authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { totpAuthenticate } = useTOTPAuthenticate();
    try {
      await totpAuthenticate('code');
    } catch {
      // we updated these hooks to throw for error handling in the UI, but we don't care about the thrown error in tests
    }
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/totp/authenticate/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
