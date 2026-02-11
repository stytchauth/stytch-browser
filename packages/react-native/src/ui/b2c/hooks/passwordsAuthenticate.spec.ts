import { RNUIProductConfig } from '@stytch/core/public';

import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchClient } from '../../../StytchClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { usePasswordsAuthenticate } from './passwordsAuthenticate';
const eventLogMock = jest.fn();
jest.mock('./useEventLogger', () => ({
  useEventLogger: () => ({
    logEvent: eventLogMock,
  }),
}));
describe('passwordsAuthenticate', () => {
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
  describe('when missing an email address', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { authenticatePassword } = usePasswordsAuthenticate();
      await authenticatePassword();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/authenticate/error',
        error: { internalError: 'Missing email address' },
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
            userState: {
              ...DEFAULT_UI_STATE.userState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
              },
            },
          },
          dispatchMock,
        ];
      });
      const { authenticatePassword } = usePasswordsAuthenticate();
      await authenticatePassword();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/authenticate/error',
        error: { internalError: 'Missing password' },
      });
    });
  });
  describe('when an email address and password is present and authenticate succeeds', () => {
    it('dispatches the expected success action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            userState: {
              ...DEFAULT_UI_STATE.userState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
              },
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
          authenticate: jest.fn().mockResolvedValue({}),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { authenticatePassword } = usePasswordsAuthenticate();
      await authenticatePassword();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'passwords/authenticate/success', response: {} });
      expect(eventLogMock).toHaveBeenCalledWith({
        name: 'ui_authentication_success',
        details: { method: 'passwords' },
      });
    });
  });
  describe('when an email address and password is present and authenticate fails with a generic error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            userState: {
              ...DEFAULT_UI_STATE.userState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
              },
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
          authenticate: jest.fn().mockRejectedValue(new Error('Something went wrong')),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { authenticatePassword } = usePasswordsAuthenticate();
      await expect(authenticatePassword()).rejects.toThrow();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'passwords/authenticate/error' });
    });
  });
  describe('when an email and password is present and authenticate fails with a StytchSDKAPI error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            userState: {
              ...DEFAULT_UI_STATE.userState,
              emailAddress: {
                isValid: true,
                emailAddress: 'my@email.com',
              },
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
          authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { authenticatePassword } = usePasswordsAuthenticate();
      await expect(authenticatePassword()).rejects.toThrow();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'passwords/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'passwords/authenticate/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
