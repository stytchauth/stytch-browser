import { RNUIProductConfig } from '@stytch/core/public';
import { renderHook } from '@testing-library/react-native';

import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchClient } from '../../../StytchClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { useOTPAuthenticate } from './otpAuthenticate';

const eventLogMock = jest.fn();
jest.mock('./useEventLogger', () => ({
  useEventLogger: () => ({
    logEvent: eventLogMock,
  }),
}));
describe('otpAuthenticate', () => {
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
  describe('when missing a method id', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { result } = renderHook(() => useOTPAuthenticate());
      await result.current.authenticateOTP('123456');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'otp/authenticate/error',
        error: { internalError: 'Missing method id' },
      });
    });
  });
  describe('when a method id is present and authenticate succeeds', () => {
    it('dispatches the expected success action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              methodId: 'auth-method-id',
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        otps: {
          authenticate: jest.fn().mockResolvedValue({}),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValue(mockStytchClient as StytchClient);
      const { result } = renderHook(() => useOTPAuthenticate());
      await result.current.authenticateOTP('123456');
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'otp/authenticate/success', response: {} });
      expect(eventLogMock).toHaveBeenCalledWith({ name: 'ui_authentication_success', details: { method: 'otp' } });
    });
  });
  describe('when a method id is present and authenticate fails with a generic error and propagates it', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => [
        {
          ...DEFAULT_UI_STATE,
          authenticationState: {
            ...DEFAULT_UI_STATE.authenticationState,
            methodId: 'auth-method-id',
          },
        },
        dispatchMock,
      ]);

      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce({
        otps: {
          authenticate: jest.fn().mockRejectedValue(new Error('Something went wrong')),
        },
      } as unknown as StytchClient);
      const { result } = renderHook(() => useOTPAuthenticate());
      await expect(result.current.authenticateOTP('123456')).rejects.toThrow();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'otp/authenticate/error' });
    });
  });
  describe('when a method id is present and authenticate fails with a StytchSDKAPI error and propagates it', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            authenticationState: {
              ...DEFAULT_UI_STATE.authenticationState,
              methodId: 'auth-method-id',
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        otps: {
          authenticate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { result } = renderHook(() => useOTPAuthenticate());
      await expect(result.current.authenticateOTP('123456')).rejects.toThrow();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/authenticate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'otp/authenticate/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
