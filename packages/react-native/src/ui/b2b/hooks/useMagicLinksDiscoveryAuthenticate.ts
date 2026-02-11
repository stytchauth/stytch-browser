import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useMagicLinksDiscoveryAuthenticate = () => {
  const stytchClient = useStytch();
  const [, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const magicLinksDiscoveryAuthenticate = async (token: string) => {
    dispatch({ type: 'magicLinks/discovery/authenticate' });
    try {
      await new Promise((r) => setTimeout(r, 50));
      const response = await stytchClient.magicLinks.discovery.authenticate({
        discovery_magic_links_token: token,
      });
      onEvent({ type: StytchEventType.B2BMagicLinkDiscoveryAuthenticate, data: response });
      dispatch({
        type: 'discovery/setDiscoveredOrganizations',
        email: response.email_address,
        discoveredOrganizations: response.discovered_organizations,
      });
      dispatch({ type: 'magicLinks/discovery/authenticate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'magicLinks/discovery/authenticate/error', error: errorResponse });
    }
  };
  return { magicLinksDiscoveryAuthenticate };
};
