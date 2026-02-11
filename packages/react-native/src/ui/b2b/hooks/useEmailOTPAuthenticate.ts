import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useEmailOTPAuthenticate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const email = state.memberState.emailAddress.emailAddress;
  const organizationId =
    state.mfaState.primaryInfo?.organizationId ?? state.authenticationState.organization?.organization_id;
  const emailOTPAuthenticate = async (code: string) => {
    dispatch({ type: 'emailOTP/authenticate' });
    if (!email) {
      dispatch({ type: 'emailOTP/authenticate/error', error: { internalError: 'Missing email address' } });
      return;
    }
    if (!organizationId) {
      dispatch({ type: 'emailOTP/authenticate/error', error: { internalError: 'Missing organization' } });
      return;
    }
    try {
      const response = await stytchClient.otps.email.authenticate({
        code: code,
        email_address: email,
        organization_id: organizationId,
        locale: 'en',
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
      });
      onEvent({ type: StytchEventType.B2BOTPsEmailAuthenticate, data: response });
      dispatch({ type: 'emailOTP/authenticate/success', response: response });
      dispatch({
        type: 'mfa/primaryAuthenticate/success',
        response: response,
        includedMfaMethods: config.productConfig.mfaProductInclude,
      });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'emailOTP/authenticate/error', error: errorResponse });
      throw e;
    }
  };
  return { emailOTPAuthenticate };
};
