import { useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import 'react-native-url-polyfill/auto';
import { createErrorResponseFromError } from '../utils';
import { useEventLogger } from './useEventLogger';

export const useDeeplinkParser = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const { logEvent } = useEventLogger();
  const [, dispatch] = useGlobalReducer();
  const parseDeeplink = async (deeplink: string) => {
    dispatch({ type: 'deeplink/parse' });
    try {
      const url = new URL(deeplink);
      const tokenType = url.searchParams.get('stytch_token_type');
      const token = url.searchParams.get('token');
      if (!token) throw new Error('No token found');
      switch (tokenType) {
        case 'magic_links':
          await stytchClient.magicLinks.authenticate(token, {
            session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
          });
          break;
        case 'oauth':
          await stytchClient.oauth.authenticate(token, {
            session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
          });
          break;
        case 'reset_password':
          // nothing to do automatically with this type of link, just redirect to the set screen (in reducer)
          break;
        default:
          dispatch({ type: 'deeplink/parse/ignored' });
          return;
      }
      logEvent({ name: 'deeplink_handled_success', details: { token_type: tokenType } });
      dispatch({ type: 'deeplink/parse/success', tokenType: tokenType, token: token });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      logEvent({
        name: 'deeplink_handled_failure',
        details: { error: errorResponse?.apiError ?? errorResponse?.sdkError },
      });
      dispatch({ type: 'deeplink/parse/error', error: errorResponse ?? { internalError: 'Unable to parse deeplink' } });
    }
  };
  return { parseDeeplink };
};
