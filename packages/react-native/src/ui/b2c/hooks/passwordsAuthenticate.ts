import { useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useEventLogger } from './useEventLogger';

export const usePasswordsAuthenticate = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const { logEvent } = useEventLogger();
  const email = state.userState.emailAddress.emailAddress;
  const password = state.userState.password.password;

  const authenticatePassword = async (): Promise<undefined> => {
    dispatch({ type: 'passwords/authenticate' });

    if (!email) {
      dispatch({ type: 'passwords/authenticate/error', error: { internalError: 'Missing email address' } });
      return;
    }
    if (!password) {
      dispatch({ type: 'passwords/authenticate/error', error: { internalError: 'Missing password' } });
      return;
    }

    try {
      const response = await stytchClient.passwords.authenticate({
        email: email,
        password: password,
        session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
      });
      logEvent({ name: 'ui_authentication_success', details: { method: 'passwords' } });
      dispatch({ type: 'passwords/authenticate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/authenticate/error', error: errorResponse });
      throw e;
    }
  };
  return { authenticatePassword };
};
