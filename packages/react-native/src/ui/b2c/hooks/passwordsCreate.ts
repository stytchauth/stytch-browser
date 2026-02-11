import { useGlobalReducer, useConfig, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useEventLogger } from './useEventLogger';

export const usePasswordsCreate = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const { logEvent } = useEventLogger();
  const email = state.userState.emailAddress.emailAddress;
  const password = state.userState.password.password;

  const createPassword = async () => {
    dispatch({ type: 'passwords/create' });

    if (!email) {
      dispatch({ type: 'passwords/create/error', error: { internalError: 'Missing email address' } });
      return;
    }
    if (!password) {
      dispatch({ type: 'passwords/create/error', error: { internalError: 'Missing password' } });
      return;
    }

    try {
      const response = await stytchClient.passwords.create({
        email: email,
        password: password,
        session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
      });
      logEvent({ name: 'ui_authentication_success', details: { method: 'passwords' } });
      dispatch({ type: 'passwords/create/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/create/error', error: errorResponse });
    }
  };
  return { createPassword };
};
