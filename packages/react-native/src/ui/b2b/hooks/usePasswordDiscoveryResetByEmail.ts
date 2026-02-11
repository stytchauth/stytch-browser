import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const usePasswordDiscoveryResetByEmail = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const passwordDiscoveryResetByEmail = async () => {
    dispatch({ type: 'passwords/discovery/resetByEmail' });
    if (!state.authenticationState.token) {
      dispatch({ type: 'passwords/discovery/resetByEmail/error', error: { internalError: 'Missing reset token' } });
      return;
    }
    if (!state.memberState.password.password) {
      dispatch({ type: 'passwords/discovery/resetByEmail/error', error: { internalError: 'Missing password' } });
      return;
    }
    try {
      const response = await stytchClient.passwords.discovery.resetByEmail({
        password_reset_token: state.authenticationState.token,
        password: state.memberState.password.password,
      });
      onEvent({ type: StytchEventType.B2BDiscoveryPasswordReset, data: response });
      dispatch({
        type: 'discovery/setDiscoveredOrganizations',
        email: response.email_address,
        discoveredOrganizations: response.discovered_organizations,
      });
      dispatch({ type: 'passwords/discovery/resetByEmail/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/discovery/resetByEmail/error', error: errorResponse });
    }
  };
  return { passwordDiscoveryResetByEmail };
};
