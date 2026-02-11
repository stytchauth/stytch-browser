import { useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useEventLogger } from './useEventLogger';

export const usePasswordsResetByEmail = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const { logEvent } = useEventLogger();
  const token = state.authenticationState.token;
  const password = state.userState.password.password;

  const resetPasswordByEmail = async () => {
    dispatch({ type: 'passwords/resetByEmail' });

    if (!token) {
      dispatch({ type: 'passwords/resetByEmail/error', error: { internalError: 'Missing authentication token' } });
      return;
    }
    if (!password) {
      dispatch({ type: 'passwords/resetByEmail/error', error: { internalError: 'Missing password' } });
      return;
    }

    try {
      const response = await stytchClient.passwords.resetByEmail({
        token: token,
        password: password,
        session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
      });
      logEvent({ name: 'ui_authentication_success', details: { method: 'passwords' } });
      dispatch({ type: 'passwords/resetByEmail/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/resetByEmail/error', error: errorResponse });
    }
  };
  return { resetPasswordByEmail };
};
