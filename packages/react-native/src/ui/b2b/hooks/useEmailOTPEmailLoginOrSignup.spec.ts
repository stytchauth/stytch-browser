import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchRNB2BUIConfig } from '../config';
import * as ContextProvider from '../ContextProvider';
import { MOCK_MEMBER_DISCOVERY_AUTH } from '../mocks';
import { DEFAULT_UI_STATE } from '../states';
import { useEmailOTPEmailLoginOrSignup } from './useEmailOTPEmailLoginOrSignup';

describe('useEmailOTPEmailLoginOrSignup', () => {
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
    jest.spyOn(ContextProvider, 'useRedirectUrl').mockReturnValue('stytch-ui-something://deeplink');
    jest.spyOn(ContextProvider, 'useEventCallback').mockReturnValue(jest.fn());
  });
  it('dispatches expected error when no email is present', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const { emailOTPEmailLoginOrSignup } = useEmailOTPEmailLoginOrSignup();
    await emailOTPEmailLoginOrSignup();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'emailOTP/email/loginOrSignup/error',
      error: { internalError: 'Missing email address' },
    });
  });
  it('dispatches expected error when no orgId is present', async () => {
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
        },
        dispatchMock,
      ];
    });
    const { emailOTPEmailLoginOrSignup } = useEmailOTPEmailLoginOrSignup();
    await emailOTPEmailLoginOrSignup();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'emailOTP/email/loginOrSignup/error',
      error: { internalError: 'Missing organization' },
    });
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
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      otps: {
        email: {
          loginOrSignup: jest.fn().mockResolvedValue(MOCK_MEMBER_DISCOVERY_AUTH),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { emailOTPEmailLoginOrSignup } = useEmailOTPEmailLoginOrSignup();
    await emailOTPEmailLoginOrSignup('org-id');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'emailOTP/email/loginOrSignup/success',
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
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      otps: {
        email: {
          loginOrSignup: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { emailOTPEmailLoginOrSignup } = useEmailOTPEmailLoginOrSignup();
    await emailOTPEmailLoginOrSignup('org-id');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'emailOTP/email/loginOrSignup/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
