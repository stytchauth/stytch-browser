import { StytchEventType } from '@stytch/core/public';

import { useEventCallback, useGlobalReducer, useRedirectUrl, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useSSOStart = () => {
  const stytchClient = useStytch();
  const [, dispatch] = useGlobalReducer();
  const redirectUrl = useRedirectUrl();
  const onEvent = useEventCallback();
  const ssoStart = async (connection_id: string) => {
    dispatch({ type: 'sso/start' });
    try {
      await stytchClient.sso.start({
        connection_id: connection_id,
        signup_redirect_url: redirectUrl,
        login_redirect_url: redirectUrl,
      });
      dispatch({ type: 'sso/start/success' });
      onEvent({ type: StytchEventType.B2BSSOStart, data: {} });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'sso/start/error', error: errorResponse });
    }
  };
  return { ssoStart };
};
