import { StytchEventType } from '@stytch/core/public';

import { useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const usePasswordDiscoveryAuthenticate = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const passwordDiscoveryAuthenticate = async () => {
    dispatch({ type: 'passwords/discovery/authenticate' });
    if (!state.memberState.emailAddress.emailAddress) {
      dispatch({ type: 'passwords/discovery/authenticate/error', error: { internalError: 'Missing email address' } });
      return;
    }
    if (!state.memberState.password.password) {
      dispatch({ type: 'passwords/discovery/authenticate/error', error: { internalError: 'Missing password' } });
      return;
    }
    try {
      const response = await stytchClient.passwords.discovery.authenticate({
        email_address: state.memberState.emailAddress.emailAddress,
        password: state.memberState.password.password,
      });
      onEvent({ type: StytchEventType.B2BPasswordDiscoveryAuthenticate, data: response });
      dispatch({
        type: 'discovery/setDiscoveredOrganizations',
        email: response.email_address,
        discoveredOrganizations: response.discovered_organizations,
      });
      dispatch({ type: 'passwords/discovery/authenticate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/discovery/authenticate/error', error: errorResponse });
    }
  };
  return { passwordDiscoveryAuthenticate };
};
