import { format, ParsedNumber, parseNumber } from 'libphonenumber-js';

import { useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useOTPSmsLoginOrCreate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const phoneNumber = state.userState.phoneNumber;
  const sendSMSOTP = async () => {
    dispatch({ type: 'otp/sms/loginOrCreate' });

    if (!phoneNumber.phoneNumber) {
      dispatch({ type: 'otp/sms/loginOrCreate/error', error: { internalError: 'Missing phone number' } });
      return;
    }

    try {
      const parsedNumber = parseNumber(`${phoneNumber.countryCode} ${phoneNumber.phoneNumber}`);
      const e164 = format(parsedNumber as ParsedNumber, 'E.164');
      const response = await stytchClient.otps.sms.loginOrCreate(e164, {
        expiration_minutes: config.otpOptions.expirationMinutes,
        enable_autofill: true,
        locale: config.otpOptions.locale,
      });
      dispatch({ type: 'otp/sms/loginOrCreate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'otp/sms/loginOrCreate/error', error: errorResponse });
    }
  };
  return { sendSMSOTP };
};
