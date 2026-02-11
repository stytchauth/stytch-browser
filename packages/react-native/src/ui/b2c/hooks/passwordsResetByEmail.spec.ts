import * as ContextProvider from '../ContextProvider';
import { usePasswordsResetByEmail } from './passwordsResetByEmail';
import { DEFAULT_UI_STATE } from '../states';
import { StytchClient } from '../../../StytchClient';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { RNUIProductConfig } from '@stytch/core/public';
const eventLogMock = jest.fn();
jest.mock('./useEventLogger', () => ({
  useEventLogger: () => ({
    logEvent: eventLogMock,
  }),
}));
describe('passwordsResetByEmail', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return {
        passwordOptions: {},
        sessionOptions: {},
      } as RNUIProductConfig;
    });
  });
  describe('when missing a token', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { resetPasswordByEmail } = usePasswordsResetByEmail();
      await resetPasswordByEmail();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/resetByEmail' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/resetByEmail/error',
        error: { internalError: 'Missing authentication token' },
      });
    });
  });
  describe('when missing a password', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              token: 'my-authentication-token',
            },
          },
          dispatchMock,
        ];
      });
      const { resetPasswordByEmail } = usePasswordsResetByEmail();
      await resetPasswordByEmail();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/resetByEmail' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/resetByEmail/error',
        error: { internalError: 'Missing password' },
      });
    });
  });
  describe('when a token and password is present and passwordsResetByEmail succeeds', () => {
    it('dispatches the expected success action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              token: 'my-authentication-token',
            },
            userState: {
              ...DEFAULT_UI_STATE.userState,
              password: {
                password: 'my cool password',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        passwords: {
          resetByEmail: jest.fn().mockResolvedValue({}),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { resetPasswordByEmail } = usePasswordsResetByEmail();
      await resetPasswordByEmail();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/resetByEmail' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'passwords/resetByEmail/success', response: {} });
      expect(eventLogMock).toHaveBeenCalledWith({
        name: 'ui_authentication_success',
        details: { method: 'passwords' },
      });
    });
  });
  describe('when a token and password is present and resetByEmail fails with a generic error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              token: 'my-authentication-token',
            },
            userState: {
              ...DEFAULT_UI_STATE.userState,
              password: {
                password: 'my cool password',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        passwords: {
          resetByEmail: jest.fn().mockRejectedValue({ message: 'Something went wrong' }),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { resetPasswordByEmail } = usePasswordsResetByEmail();
      await resetPasswordByEmail();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/resetByEmail' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'passwords/resetByEmail/error' });
    });
  });
  describe('when a token and password is present and resetByEmail fails with a StytchSDKAPI error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              token: 'my-authentication-token',
            },
            userState: {
              ...DEFAULT_UI_STATE.userState,
              password: {
                password: 'my cool password',
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
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { resetPasswordByEmail } = usePasswordsResetByEmail();
      await resetPasswordByEmail();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/resetByEmail' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/resetByEmail/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
