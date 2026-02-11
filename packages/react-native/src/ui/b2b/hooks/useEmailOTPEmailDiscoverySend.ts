import { StytchEventType } from '@stytch/core/public';

import { useConfig, useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useEmailOTPEmailDiscoverySend = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const email = state.memberState.emailAddress.emailAddress;
  const emailOTPEmailDiscoverySend = async () => {
    dispatch({ type: 'emailOTP/email/discovery/send' });
    if (!email) {
      dispatch({ type: 'emailOTP/email/discovery/send/error', error: { internalError: 'Missing email' } });
      return;
    }

    try {
      const response = await stytchClient.otps.email.discovery.send({
        email_address: email,
        login_template_id: config.productConfig.emailOtpOptions?.loginTemplateId,
        locale: config.productConfig.emailOtpOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BOTPsEmailDiscoverySend, data: response });
      dispatch({ type: 'emailOTP/email/discovery/send/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'emailOTP/email/discovery/send/error', error: errorResponse });
    }
  };
  return { emailOTPEmailDiscoverySend };
};
