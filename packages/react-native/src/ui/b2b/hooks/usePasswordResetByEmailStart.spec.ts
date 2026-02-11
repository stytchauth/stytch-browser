import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchRNB2BUIConfig } from '../config';
import * as ContextProvider from '../ContextProvider';
import { MOCK_MEMBER_NEEDS_MFA, MOCK_ORGANIZATION } from '../mocks';
import { DEFAULT_UI_STATE } from '../states';
import { usePasswordResetByEmailStart } from './usePasswordResetByEmailStart';

describe('usePasswordResetByEmailStart', () => {
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
  it('dispatches expected error when email is missing', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      passwords: {
        resetByEmailStart: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordResetByEmailStart } = usePasswordResetByEmailStart();
    await passwordResetByEmailStart();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/resetByEmailStart/error',
      error: { internalError: 'Missing email' },
    });
  });
  it('dispatches expected error when orgId is missing', async () => {
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
      passwords: {
        resetByEmailStart: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordResetByEmailStart } = usePasswordResetByEmailStart();
    await passwordResetByEmailStart();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/resetByEmailStart/error',
      error: { internalError: 'Missing organizationId' },
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
          authenticationState: {
            ...DEFAULT_UI_STATE.authenticationState,
            organization: MOCK_ORGANIZATION,
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      passwords: {
        resetByEmailStart: jest.fn().mockResolvedValue(MOCK_MEMBER_NEEDS_MFA),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordResetByEmailStart } = usePasswordResetByEmailStart();
    await passwordResetByEmailStart();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/resetByEmailStart/success',
      response: MOCK_MEMBER_NEEDS_MFA,
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
          authenticationState: {
            ...DEFAULT_UI_STATE.authenticationState,
            organization: MOCK_ORGANIZATION,
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      passwords: {
        resetByEmailStart: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordResetByEmailStart } = usePasswordResetByEmailStart();
    await passwordResetByEmailStart();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/resetByEmailStart/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
