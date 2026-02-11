import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { usePasswordResetByEmail } from './usePasswordResetByEmail';
import { StytchRNB2BUIConfig } from '../config';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { MOCK_MEMBER_NEEDS_MFA } from '../mocks';

describe('usePasswordResetByEmail', () => {
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
  it('dispatches expected error when token is missing', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      passwords: {
        resetByEmail: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordResetByEmail } = usePasswordResetByEmail();
    await passwordResetByEmail();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/resetByEmail/error',
      error: { internalError: 'Missing token' },
    });
  });
  it('dispatches expected error when password is missing', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [
        {
          ...DEFAULT_UI_STATE,
          authenticationState: {
            ...DEFAULT_UI_STATE.authenticationState,
            token: 'my-token',
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      passwords: {
        resetByEmail: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordResetByEmail } = usePasswordResetByEmail();
    await passwordResetByEmail();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/resetByEmail/error',
      error: { internalError: 'Missing password' },
    });
  });
  it('dispatches expected success when call succeeds', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [
        {
          ...DEFAULT_UI_STATE,
          authenticationState: {
            ...DEFAULT_UI_STATE.authenticationState,
            token: 'my-token',
          },
          memberState: {
            ...DEFAULT_UI_STATE.memberState,
            password: {
              ...DEFAULT_UI_STATE.memberState.password,
              password: 'my-password',
            },
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      passwords: {
        resetByEmail: jest.fn().mockResolvedValue(MOCK_MEMBER_NEEDS_MFA),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordResetByEmail } = usePasswordResetByEmail();
    await passwordResetByEmail();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/resetByEmail/success',
      response: MOCK_MEMBER_NEEDS_MFA,
    });
  });
  it('dispatches expected error when call fails', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [
        {
          ...DEFAULT_UI_STATE,
          authenticationState: {
            ...DEFAULT_UI_STATE.authenticationState,
            token: 'my-token',
          },
          memberState: {
            ...DEFAULT_UI_STATE.memberState,
            password: {
              ...DEFAULT_UI_STATE.memberState.password,
              password: 'my-password',
            },
          },
        },
        dispatchMock,
      ];
    });
    const mockStytchClient = {
      passwords: {
        resetByEmail: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordResetByEmail } = usePasswordResetByEmail();
    await passwordResetByEmail();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/resetByEmail/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
