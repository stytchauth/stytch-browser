import { StytchEventType } from '@stytch/core/public';

import { useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useOauthDiscoveryAuthenticate = () => {
  const stytchClient = useStytch();
  const [, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const oauthDiscoveryAuthenticate = async (token: string) => {
    dispatch({ type: 'oauth/discovery/authenticate' });
    try {
      const response = await stytchClient.oauth.discovery.authenticate({
        discovery_oauth_token: token,
      });
      onEvent({ type: StytchEventType.B2BOAuthDiscoveryAuthenticate, data: response });
      dispatch({ type: 'oauth/discovery/authenticate/success', response: response });
      dispatch({
        type: 'discovery/setDiscoveredOrganizations',
        email: response.email_address,
        discoveredOrganizations: response.discovered_organizations,
      });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'oauth/discovery/authenticate/error', error: errorResponse });
    }
  };
  return { oauthDiscoveryAuthenticate };
};
