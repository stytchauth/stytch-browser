import * as ContextProvider from '../ContextProvider';
import { useOTPEmailLoginOrCreate } from './otpEmailLoginOrCreate';
import { DEFAULT_UI_STATE } from '../states';
import { StytchClient } from '../../../StytchClient';
import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { RNUIProductConfig } from '@stytch/core/public';

describe('otpEmailLoginOrCreate', () => {
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
  describe('when missing an email address', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { sendEmailOTP } = useOTPEmailLoginOrCreate();
      await sendEmailOTP();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/email/loginOrCreate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'otp/email/loginOrCreate/error',
        error: { internalError: 'Missing email address' },
      });
    });
  });
  describe('when an email address is present and loginOrCreate succeeds', () => {
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
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        otps: {
          email: {
            loginOrCreate: jest.fn().mockResolvedValue({}),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { sendEmailOTP } = useOTPEmailLoginOrCreate();
      await sendEmailOTP();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/email/loginOrCreate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'otp/email/loginOrCreate/success', response: {} });
    });
  });
  describe('when an email address is present and loginOrCreate fails with a generic error', () => {
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
      const mockStytchClient = {
        otps: {
          email: {
            loginOrCreate: jest.fn().mockRejectedValue({ message: 'Something went wrong' }),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { sendEmailOTP } = useOTPEmailLoginOrCreate();
      await sendEmailOTP();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/email/loginOrCreate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'otp/email/loginOrCreate/error' });
    });
  });
  describe('when an email address is present and loginOrCreate fails with a StytchSDKAPI error', () => {
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
      const mockStytchClient = {
        otps: {
          email: {
            loginOrCreate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { sendEmailOTP } = useOTPEmailLoginOrCreate();
      await sendEmailOTP();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/email/loginOrCreate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'otp/email/loginOrCreate/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
