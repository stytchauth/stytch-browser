import { PasswordResetType } from '../../shared/types';
import { useConfig, useGlobalReducer, useRedirectUrl, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const usePasswordsResetByEmailStart = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const redirectUrl = useRedirectUrl();
  const email = state.userState.emailAddress.emailAddress;

  const resetPasswordByEmailStart = async (resetType: PasswordResetType) => {
    dispatch({ type: 'passwords/resetByEmailStart', resetType: resetType });

    if (!email) {
      dispatch({ type: 'passwords/resetByEmailStart/error', error: { internalError: 'Missing email address' } });
      return;
    }

    try {
      const response = await stytchClient.passwords.resetByEmailStart({
        email: email,
        login_redirect_url: redirectUrl,
        login_expiration_minutes: config.passwordOptions.loginExpirationMinutes,
        reset_password_redirect_url: redirectUrl,
        reset_password_expiration_minutes: config.passwordOptions.resetPasswordExpirationMinutes,
        reset_password_template_id: config.passwordOptions.resetPasswordTemplateId,
        locale: config.passwordOptions.locale,
      });
      dispatch({ type: 'passwords/resetByEmailStart/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/resetByEmailStart/error', error: errorResponse });
    }
  };
  return { resetPasswordByEmailStart };
};
