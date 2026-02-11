import { RNUIProductConfig } from '@stytch/core/public';

import { MOCK_STYTCH_API_ERROR } from '../../../mocks';
import { StytchClient } from '../../../StytchClient';
import * as ContextProvider from '../ContextProvider';
import { DEFAULT_UI_STATE } from '../states';
import { useOTPWhatsappLoginOrCreate } from './otpWhatsappLoginOrCreate';

describe('otpWhatsappLoginOrCreate', () => {
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
  describe('when missing a phone number', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [DEFAULT_UI_STATE, dispatchMock];
      });
      const { sendWhatsAppOTP } = useOTPWhatsappLoginOrCreate();
      await sendWhatsAppOTP();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/whatsapp/loginOrCreate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'otp/whatsapp/loginOrCreate/error',
        error: { internalError: 'Missing phone number' },
      });
    });
  });
  describe('when a phone number is present and loginOrCreate succeeds', () => {
    it('dispatches the expected success action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            userState: {
              ...DEFAULT_UI_STATE.userState,
              phoneNumber: {
                countryCode: '+1',
                phoneNumber: '1234567890',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        otps: {
          whatsapp: {
            loginOrCreate: jest.fn().mockResolvedValue({}),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { sendWhatsAppOTP } = useOTPWhatsappLoginOrCreate();
      await sendWhatsAppOTP();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/whatsapp/loginOrCreate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'otp/whatsapp/loginOrCreate/success', response: {} });
    });
  });
  describe('when a phone number is present and loginOrCreate fails with a generic error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            userState: {
              ...DEFAULT_UI_STATE.userState,
              phoneNumber: {
                countryCode: '+1',
                phoneNumber: '1234567890',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        otps: {
          whatsapp: {
            loginOrCreate: jest.fn().mockRejectedValue({ message: 'Something went wrong' }),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { sendWhatsAppOTP } = useOTPWhatsappLoginOrCreate();
      await sendWhatsAppOTP();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/whatsapp/loginOrCreate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({ type: 'otp/whatsapp/loginOrCreate/error' });
    });
  });
  describe('when a phone number is present and loginOrCreate fails with a StytchSDKAPI error', () => {
    it('dispatches the expected error action', async () => {
      const dispatchMock = jest.fn();
      jest.spyOn(ContextProvider, 'useGlobalReducer').mockImplementation(() => {
        return [
          {
            ...DEFAULT_UI_STATE,
            userState: {
              ...DEFAULT_UI_STATE.userState,
              phoneNumber: {
                countryCode: '+1',
                phoneNumber: '1234567890',
              },
            },
          },
          dispatchMock,
        ];
      });
      const mockStytchClient = {
        otps: {
          whatsapp: {
            loginOrCreate: jest.fn().mockRejectedValue(MOCK_STYTCH_API_ERROR),
          },
        },
      } as unknown;
      jest.spyOn(ContextProvider, 'useStytch').mockReturnValueOnce(mockStytchClient as StytchClient);
      const { sendWhatsAppOTP } = useOTPWhatsappLoginOrCreate();
      await sendWhatsAppOTP();
      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: 'otp/whatsapp/loginOrCreate' });
      expect(dispatchMock).toHaveBeenLastCalledWith({
        type: 'otp/whatsapp/loginOrCreate/error',
        error: { apiError: MOCK_STYTCH_API_ERROR },
      });
    });
  });
});
