import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useEmailOTPEmailLoginOrSignup = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const email = state.memberState.emailAddress.emailAddress;
  const organizationId =
    state.mfaState.primaryInfo?.organizationId ?? state.authenticationState.organization?.organization_id;
  const emailOTPEmailLoginOrSignup = async (orgId: string | undefined = organizationId) => {
    dispatch({ type: 'emailOTP/email/loginOrSignup' });
    if (!email) {
      dispatch({ type: 'emailOTP/email/loginOrSignup/error', error: { internalError: 'Missing email address' } });
      return;
    }
    if (!orgId) {
      dispatch({ type: 'emailOTP/email/loginOrSignup/error', error: { internalError: 'Missing organization' } });
      return;
    }

    try {
      const response = await stytchClient.otps.email.loginOrSignup({
        email_address: email,
        organization_id: orgId,
        login_template_id: config.productConfig.emailOtpOptions?.loginTemplateId,
        signup_template_id: config.productConfig.emailOtpOptions?.signupTemplateId,
        locale: config.productConfig.emailOtpOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BOTPsEmailLoginOrSignup, data: response });
      dispatch({ type: 'emailOTP/email/loginOrSignup/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'emailOTP/email/loginOrSignup/error', error: errorResponse });
    }
  };
  return { emailOTPEmailLoginOrSignup };
};
