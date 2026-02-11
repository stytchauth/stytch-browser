import { RNUIProductConfig, StytchSDKError } from '@stytch/core/public';

import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchClient } from '../../../StytchClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { useOAuthAuthenticate } from './oauthAuthenticate';
const eventLogMock = jest.fn();
jest.mock('./useEventLogger', () => ({
  useEventLogger: () => ({
    logEvent: eventLogMock,
  }),
}));
describe('oauthAuthenticate', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return {
        otpOptions: {},
        sessionOptions: {},
      } as RNUIProductConfig;
    });
  });
  describe('when missing a authentication token', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const mockStytchClient = {} as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { authenticateOAuthToken } = useOAuthAuthenticate();
      await authenticateOAuthToken();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'oauth/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'oauth/authenticate/error',
        error: { internalError: 'Missing authentication token' },
      });
      expect(eventLogMock).toHaveBeenCalledWith({
        name: 'oauth_failure',
        details: { error: 'Missing authentication token' },
      });
    });
  });
  describe('when a authentication token is present and authenticate succeeds', () => {
    it('dispatches the expected success action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              token: 'auth-token',
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        oauth: {
          authenticate: jest.fn().mockResolvedValue({}),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { authenticateOAuthToken } = useOAuthAuthenticate();
      await authenticateOAuthToken();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'oauth/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'oauth/authenticate/success', response: {} });
      expect(eventLogMock).toHaveBeenCalledWith({ name: 'ui_authentication_success', details: { method: 'oauth' } });
    });
  });
  describe('when a authentication token is present and authenticate fails with a generic error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              token: 'auth-token',
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        oauth: {
          authenticate: jest.fn().mockRejectedValue({ message: 'Something went wrong' }),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { authenticateOAuthToken } = useOAuthAuthenticate();
      await authenticateOAuthToken();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'oauth/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'oauth/authenticate/error' });
      expect(eventLogMock).toHaveBeenCalledWith({ name: 'oauth_failure', details: { error: undefined } });
    });
  });
  describe('when a authentication token is present and authenticate fails with a Stytch API error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              token: 'auth-token',
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        oauth: {
          authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { authenticateOAuthToken } = useOAuthAuthenticate();
      await authenticateOAuthToken();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'oauth/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'oauth/authenticate/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
      expect(eventLogMock).toHaveBeenCalledWith({ name: 'oauth_failure', details: { error: MOCK_STYTCH_API_ERROR } });
    });
    describe('when a authentication token is present and authenticate fails with a Stytch SDK error', () => {
      it('dispatches the expected error action', async () => {
        const dispatchMock = jest.fn();
        jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
          return [
            {
              ...DEFAULT_UI_STATE,
              authenticationState: {
                ...DEFAULT_UI_STATE.authenticationState,
                token: 'auth-token',
              },
            },
            dispatchMock,
          ];
        });

        const mockStytchClient = {
          oauth: {
            authenticate: jest.fn().mockRejectedValue(new StytchSDKError('TestSDKError', 'This is a test SDKError')),
          },
        } as unknown;
        jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
        const { authenticateOAuthToken } = useOAuthAuthenticate();
        await authenticateOAuthToken();
        expect(dispatchMock).toHaveBeenCalledTimes(2);
        expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'oauth/authenticate' });
        expect(dispatchMock).toHaveBeenLastCalledWith({
          type: 'oauth/authenticate/error',
          error: { sdkError: new StytchSDKError('TestSDKError', 'This is a test SDKError') },
        });
        expect(eventLogMock).toHaveBeenCalledWith({
          name: 'oauth_failure',
          details: { error: new StytchSDKError('TestSDKError', 'This is a test SDKError') },
        });
      });
    });
  });
});
