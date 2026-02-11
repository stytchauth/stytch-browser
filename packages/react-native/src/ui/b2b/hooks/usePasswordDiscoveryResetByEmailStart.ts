import { StytchEventType } from '@stytch/core/public';

import { useConfig, useEventCallback, useGlobalReducer, useRedirectUrl, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const usePasswordDiscoveryResetByEmailStart = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const redirectUrl = useRedirectUrl();
  const onEvent = useEventCallback();
  const passwordDiscoveryResetByEmailStart = async () => {
    try {
      dispatch({ type: 'passwords/discovery/resetByEmailStart' });
      const email = state.memberState.emailAddress.emailAddress;
      if (!email) {
        dispatch({
          type: 'passwords/discovery/resetByEmailStart/error',
          error: { internalError: 'Missing email address' },
        });
        return;
      }
      const response = await stytchClient.passwords.discovery.resetByEmailStart({
        email_address: email,
        discovery_redirect_url: redirectUrl,
        reset_password_redirect_url: redirectUrl,
        reset_password_expiration_minutes: config.productConfig.passwordOptions?.resetPasswordExpirationMinutes,
        reset_password_template_id: config.productConfig.passwordOptions?.resetPasswordTemplateId,
        verify_email_template_id: config.productConfig.passwordOptions?.verifyEmailTemplateId,
        locale: config.productConfig.passwordOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BPasswordDiscoveryResetStart, data: response });
      dispatch({ type: 'passwords/discovery/resetByEmailStart/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/discovery/resetByEmailStart/error', error: errorResponse });
    }
  };
  return { passwordDiscoveryResetByEmailStart };
};
