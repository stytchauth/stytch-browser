import { StytchEventType } from '@stytch/core/public';

import { useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useEmailOTPDiscoveryAuthenticate = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const email = state.memberState.emailAddress.emailAddress;
  const emailOTPDiscoveryAuthenticate = async (code: string) => {
    dispatch({ type: 'emailOTP/discovery/authenticate' });
    if (!email) {
      dispatch({ type: 'emailOTP/discovery/authenticate/error', error: { internalError: 'Missing email address' } });
      return;
    }
    try {
      const response = await stytchClient.otps.email.discovery.authenticate({
        code: code,
        email_address: email,
      });
      onEvent({ type: StytchEventType.B2BOTPsEmailDiscoveryAuthenticate, data: response });
      dispatch({
        type: 'discovery/setDiscoveredOrganizations',
        email: response.email_address,
        discoveredOrganizations: response.discovered_organizations,
      });
      dispatch({ type: 'emailOTP/discovery/authenticate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'emailOTP/discovery/authenticate/error', error: errorResponse });
      throw e;
    }
  };
  return { emailOTPDiscoveryAuthenticate };
};
