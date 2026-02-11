import { RNUIProductConfig } from '@stytch/core/public';

import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchClient } from '../../../StytchClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { useEmlAuthenticate } from './emlAuthenticate';
const eventLogMock = jest.fn();
jest.mock('./useEventLogger', () => ({
  useEventLogger: () => ({
    logEvent: eventLogMock,
  }),
}));
describe('emlAuthenticate', () => {
  beforeAll(() => {
    jest.spyOn(ContextProvider, 'useGlobalContext').mockImplementation();
    jest.spyOn(ContextProvider, 'useStytch').mockImplementation(() => {
      return {} as StytchClient;
    });
    jest.spyOn(ContextProvider, 'useConfig').mockImplementation(() => {
      return {
        emailMagicLinksOptions: {},
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
      const { authenticateEML } = useEmlAuthenticate();
      await authenticateEML();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'eml/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'eml/authenticate/error',
        error: { internalError: 'Missing authentication token' },
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
        magicLinks: {
          authenticate: jest.fn().mockResolvedValue({}),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { authenticateEML } = useEmlAuthenticate();
      await authenticateEML();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'eml/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'eml/authenticate/success', response: {} });
      expect(eventLogMock).toHaveBeenCalledWith({
        name: 'ui_authentication_success',
        details: { method: 'magicLinks' },
      });
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
        magicLinks: {
          authenticate: jest.fn().mockRejectedValue({ message: 'Something went wrong' }),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { authenticateEML } = useEmlAuthenticate();
      await authenticateEML();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'eml/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'eml/authenticate/error' });
    });
  });
  describe('when a authentication token is present and authenticate fails with a StytchSDKAPI error', () => {
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
        magicLinks: {
          authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { authenticateEML } = useEmlAuthenticate();
      await authenticateEML();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'eml/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'eml/authenticate/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
