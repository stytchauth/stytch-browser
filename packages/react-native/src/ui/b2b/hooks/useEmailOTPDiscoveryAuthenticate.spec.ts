import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { useEmailOTPDiscoveryAuthenticate } from './useEmailOTPDiscoveryAuthenticate';
import { Screen } from '../screens';
import { StytchRNB2BUIConfig } from '../config';
import { MOCK_MEMBER_DISCOVERY_AUTH } from '../mocks';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';

describe('useEmailOTPDiscoveryAuthenticate', () => {
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
  it('dispatches expected success when call succeeds', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [
        {
          ...DEFAULT_UI_STATE,
          memberState: {
            ...DEFAULT_UI_STATE.memberState,
            emailAddress: {
              ...DEFAULT_UI_STATE.memberState.emailAddress,
              emailAddress: 'robot@stytch.com',
            },
          },
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            primaryInfo: {
              ...DEFAULT_UI_STATE.mfaState.primaryInfo,
              enrolledMfaMethods: [],
              memberId: 'member-id',
              memberPhoneNumber: null,
              organizationId: 'organization-id',
              organizationMfaOptionsSupported: [],
              postAuthScreen: Screen.Main,
            },
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      otps: {
        email: {
          discovery: {
            authenticate: jest.fn().mockResolvedValue(MOCK_MEMBER_DISCOVERY_AUTH),
          },
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { emailOTPDiscoveryAuthenticate } = useEmailOTPDiscoveryAuthenticate();
    await emailOTPDiscoveryAuthenticate('token');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'discovery/setDiscoveredOrganizations',
      email: MOCK_MEMBER_DISCOVERY_AUTH.email_address,
      discoveredOrganizations: MOCK_MEMBER_DISCOVERY_AUTH.discovered_organizations,
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'emailOTP/discovery/authenticate/success',
      response: MOCK_MEMBER_DISCOVERY_AUTH,
    });
  });
  it('dispatches expected error when call fails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [
        {
          ...DEFAULT_UI_STATE,
          memberState: {
            ...DEFAULT_UI_STATE.memberState,
            emailAddress: {
              ...DEFAULT_UI_STATE.memberState.emailAddress,
              emailAddress: 'robot@stytch.com',
            },
          },
          mfaState: {
            ...DEFAULT_UI_STATE.mfaState,
            primaryInfo: {
              ...DEFAULT_UI_STATE.mfaState.primaryInfo,
              enrolledMfaMethods: [],
              memberId: 'member-id',
              memberPhoneNumber: null,
              organizationId: 'organization-id',
              organizationMfaOptionsSupported: [],
              postAuthScreen: Screen.Main,
            },
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      otps: {
        email: {
          discovery: {
            authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
          },
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { emailOTPDiscoveryAuthenticate } = useEmailOTPDiscoveryAuthenticate();
    try {
      await emailOTPDiscoveryAuthenticate('code');
    } catch {
      // we updated these hooks to throw for error handling in the UI, but we don't care about the thrown error in tests
    }
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'emailOTP/discovery/authenticate/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
