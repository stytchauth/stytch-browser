import { useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useOTPEmailLoginOrCreate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const email = state.userState.emailAddress.emailAddress;
  const sendEmailOTP = async () => {
    dispatch({ type: 'otp/email/loginOrCreate' });

    if (!email) {
      dispatch({ type: 'otp/email/loginOrCreate/error', error: { internalError: 'Missing email address' } });
      return;
    }

    try {
      const response = await stytchClient.otps.email.loginOrCreate(email, {
        login_template_id: config.otpOptions.loginTemplateId,
        signup_template_id: config.otpOptions.signupTemplateId,
        expiration_minutes: config.otpOptions.expirationMinutes,
        locale: config.otpOptions.locale,
      });
      dispatch({ type: 'otp/email/loginOrCreate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'otp/email/loginOrCreate/error', error: errorResponse });
    }
  };
  return { sendEmailOTP };
};
