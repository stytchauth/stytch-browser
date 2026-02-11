import { StytchEventType } from '@stytch/core/public';

import { useConfig, useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const usePasswordResetByEmail = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const token = state.authenticationState.token;
  const password = state.memberState.password.password;
  const passwordResetByEmail = async () => {
    dispatch({ type: 'passwords/resetByEmail' });
    if (!token) {
      dispatch({ type: 'passwords/resetByEmail/error', error: { internalError: 'Missing token' } });
      return;
    }
    if (!password) {
      dispatch({ type: 'passwords/resetByEmail/error', error: { internalError: 'Missing password' } });
      return;
    }

    try {
      const response = await stytchClient.passwords.resetByEmail({
        password_reset_token: token,
        password: password,
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
        locale: config.productConfig.passwordOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BPasswordResetByEmail, data: response });
      dispatch({ type: 'passwords/resetByEmail/success', response: response });
      dispatch({
        type: 'mfa/primaryAuthenticate/success',
        response: response,
        includedMfaMethods: config.productConfig.mfaProductInclude,
      });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/resetByEmail/error', error: errorResponse });
    }
  };
  return { passwordResetByEmail };
};
