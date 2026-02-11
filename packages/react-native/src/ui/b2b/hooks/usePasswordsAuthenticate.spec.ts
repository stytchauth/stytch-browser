import { StytchB2BClient } from '../../../b2b/StytchB2BClient';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchRNB2BUIConfig } from '../config';
import * as ContextProvider from '../ContextProvider';
import { MOCK_MEMBER_NEEDS_MFA } from '../mocks';
import { DEFAULT_UI_STATE } from '../states';
import { usePasswordsAuthenticate } from './usePasswordsAuthenticate';

describe('usePasswordsAuthenticate', () => {
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
  it('dispatches expected error when email is missing', async () => {
    const dispatchMock = jest.fn();
    jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
      return [DEFAULT_UI_STATE, dispatchMock];
    });
    const mockStytchClient = {
      passwords: {
        authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordsAuthenticate } = usePasswordsAuthenticate();
    await passwordsAuthenticate('org-id');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/authenticate/error',
      error: { internalError: 'Missing email address' },
    });
  });
  it('dispatches expected error when password is missing', async () => {
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
        authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordsAuthenticate } = usePasswordsAuthenticate();
    await passwordsAuthenticate('org-id');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/authenticate/error',
      error: { internalError: 'Missing password' },
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
        authenticate: jest.fn().mockResolvedValue(MOCK_MEMBER_NEEDS_MFA),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordsAuthenticate } = usePasswordsAuthenticate();
    await passwordsAuthenticate('org-id');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/authenticate/success',
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
        authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
      },
    } as unknown;
    jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchB2BClient);
    const { passwordsAuthenticate } = usePasswordsAuthenticate();
    await passwordsAuthenticate('org-id');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'passwords/authenticate/error',
      error: { apiError: MOCK_STYTCH_API_ERROR },
    });
  });
});
