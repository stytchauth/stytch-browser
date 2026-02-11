import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const usePasswordsAuthenticate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const email = state.memberState.emailAddress.emailAddress;
  const password = state.memberState.password.password;
  const organization_id = state.authenticationState.organization?.organization_id;
  const passwordsAuthenticate = async (orgId: string | undefined = organization_id) => {
    dispatch({ type: 'passwords/authenticate' });
    if (!email) {
      dispatch({ type: 'passwords/authenticate/error', error: { internalError: 'Missing email address' } });
      return;
    }
    if (!password) {
      dispatch({ type: 'passwords/authenticate/error', error: { internalError: 'Missing password' } });
      return;
    }
    if (!orgId) {
      dispatch({ type: 'passwords/authenticate/error', error: { internalError: 'Missing organization ID' } });
      return;
    }
    try {
      const response = await stytchClient.passwords.authenticate({
        email_address: email,
        organization_id: orgId,
        password: password,
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
        locale: config.productConfig.passwordOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BPasswordAuthenticate, data: response });
      dispatch({ type: 'passwords/authenticate/success', response: response });
      dispatch({
        type: 'mfa/primaryAuthenticate/success',
        response: response,
        includedMfaMethods: config.productConfig.mfaProductInclude,
      });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/authenticate/error', error: errorResponse });
    }
  };
  return { passwordsAuthenticate };
};
