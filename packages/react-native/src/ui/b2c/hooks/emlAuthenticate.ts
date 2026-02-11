import { useGlobalReducer, useStytch, useConfig } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useEventLogger } from './useEventLogger';

export const useEmlAuthenticate = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const config = useConfig();
  const { logEvent } = useEventLogger();
  const token = state.authenticationState.token;
  const sessionOptions = config.sessionOptions;

  const authenticateEML = async () => {
    dispatch({ type: 'eml/authenticate' });

    if (!token) {
      dispatch({ type: 'eml/authenticate/error', error: { internalError: 'Missing authentication token' } });
      return;
    }

    try {
      const response = await stytchClient.magicLinks.authenticate(token, {
        session_duration_minutes: sessionOptions.sessionDurationMinutes,
      });
      logEvent({ name: 'ui_authentication_success', details: { method: 'magicLinks' } });
      dispatch({ type: 'eml/authenticate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'eml/authenticate/error', error: errorResponse });
    }
  };

  return { authenticateEML };
};
