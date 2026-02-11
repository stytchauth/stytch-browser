import { useGlobalReducer, useConfig, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useEventLogger } from './useEventLogger';

export const useOAuthAuthenticate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const { logEvent } = useEventLogger();
  const token = state.authenticationState.token;
  const authenticateOAuthToken = async () => {
    dispatch({ type: 'oauth/authenticate' });

    if (!token) {
      logEvent({ name: 'oauth_failure', details: { error: 'Missing authentication token' } });
      dispatch({ type: 'oauth/authenticate/error', error: { internalError: 'Missing authentication token' } });
      return;
    }

    try {
      const response = await stytchClient.oauth.authenticate(token, {
        session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
      });
      logEvent({ name: 'oauth_success', details: { provider_type: response.provider_type } });
      logEvent({ name: 'ui_authentication_success', details: { method: 'oauth' } });
      dispatch({ type: 'oauth/authenticate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      logEvent({ name: 'oauth_failure', details: { error: errorResponse?.apiError ?? errorResponse?.sdkError } });
      dispatch({ type: 'oauth/authenticate/error', error: errorResponse });
    }
  };
  return { authenticateOAuthToken };
};
