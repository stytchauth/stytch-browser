import { B2BMFAProducts } from '@stytch/core/public';

import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchRNB2BUIConfig } from '../config';
import * as ContextProvider from '../ContextProvider';
import { MOCK_FULLY_AUTHED_RESPONSE } from '../mocks';
import { Screen } from '../screens';
import { DEFAULT_UI_STATE } from '../states';
import { useTOTPCreate } from './useTOTPCreate';

describe('useTOTPCreate', () => {
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
        create: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { totpCreate } = useTOTPCreate();
    await totpCreate();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/totp/create/error',
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
        create: jest.fn().mockResolvedValue(MOCK_FULLY_AUTHED_RESPONSE),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { totpCreate } = useTOTPCreate();
    await totpCreate();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/totp/create/success',
      response: MOCK_FULLY_AUTHED_RESPONSE,
      memberId: 'member-id',
      organizationId: 'organization-id',
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
      totp: {
        create: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { totpCreate } = useTOTPCreate();
    await totpCreate();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'mfa/totp/create/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
