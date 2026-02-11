import { StytchEventType } from '@stytch/core/public';

import { useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useSsoDiscoveryConnection = () => {
  const stytch = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const ssoDiscoverConnection = async () => {
    dispatch({ type: 'sso/discovery' });
    const email = state.memberState.emailAddress.emailAddress;
    if (!email) {
      dispatch({ type: 'sso/discovery/error', error: { internalError: 'Missing email address' } });
      return;
    }
    try {
      const response = await stytch.sso.discoverConnections(email);
      onEvent({ type: StytchEventType.B2BSSODiscoverConnections, data: response });
      dispatch({ type: 'sso/discovery/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'sso/discovery/error', error: errorResponse });
    }
  };
  return { ssoDiscoverConnection };
};
