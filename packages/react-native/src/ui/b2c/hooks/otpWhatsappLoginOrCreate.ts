import { useGlobalReducer, useConfig, useStytch } from '../ContextProvider';
import { parseNumber, format, ParsedNumber } from 'libphonenumber-js';
import { createErrorResponseFromError } from '../utils';

export const useOTPWhatsappLoginOrCreate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const phoneNumber = state.userState.phoneNumber;
  const sendWhatsAppOTP = async () => {
    dispatch({ type: 'otp/whatsapp/loginOrCreate' });

    if (!phoneNumber.phoneNumber) {
      dispatch({ type: 'otp/whatsapp/loginOrCreate/error', error: { internalError: 'Missing phone number' } });
      return;
    }

    try {
      const phoneNumber = parseNumber(
        `${state.userState.phoneNumber.countryCode} ${state.userState.phoneNumber.phoneNumber}`,
      );
      const e164 = format(phoneNumber as ParsedNumber, 'E.164');
      const response = await stytchClient.otps.whatsapp.loginOrCreate(e164, {
        expiration_minutes: config.otpOptions.expirationMinutes,
        locale: config.otpOptions.locale,
      });
      dispatch({ type: 'otp/whatsapp/loginOrCreate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'otp/whatsapp/loginOrCreate/error', error: errorResponse });
    }
  };
  return { sendWhatsAppOTP };
};
