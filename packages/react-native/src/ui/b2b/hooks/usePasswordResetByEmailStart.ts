import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useConfig, useGlobalReducer, useRedirectUrl, useStytch } from '../ContextProvider';
import { Screen } from '../screens';
import { createErrorResponseFromError } from '../utils';

export const usePasswordResetByEmailStart = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const redirectUrl = useRedirectUrl();
  const onEvent = useEventCallback();
  const email = state.memberState.emailAddress.emailAddress;
  const organizationId = state.authenticationState.organization?.organization_id;
  const passwordResetByEmailStart = async () => {
    dispatch({ type: 'passwords/resetByEmailStart' });
    if (!email) {
      dispatch({ type: 'passwords/resetByEmailStart/error', error: { internalError: 'Missing email' } });
      return;
    }
    if (!organizationId) {
      dispatch({ type: 'passwords/resetByEmailStart/error', error: { internalError: 'Missing organizationId' } });
      return;
    }

    try {
      const response = await stytchClient.passwords.resetByEmailStart({
        email_address: email,
        organization_id: organizationId,
        login_redirect_url: redirectUrl,
        reset_password_redirect_url: redirectUrl,
        reset_password_expiration_minutes: config.productConfig.passwordOptions?.resetPasswordExpirationMinutes,
        reset_password_template_id: config.productConfig.passwordOptions?.resetPasswordTemplateId,
        verify_email_template_id: config.productConfig.passwordOptions?.verifyEmailTemplateId,
        locale: config.productConfig.passwordOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BPasswordResetByEmailStart, data: response });
      dispatch({ type: 'passwords/resetByEmailStart/success', response: response });
      dispatch({ type: 'navigate/to', screen: Screen.PasswordSetNewConfirmation });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/resetByEmailStart/error', error: errorResponse });
    }
  };
  return { passwordResetByEmailStart };
};
