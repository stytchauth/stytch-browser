import { StytchEventType } from '@stytch/core/public';

import { useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const usePasswordResetBySession = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const password = state.memberState.password.password;
  const passwordResetBySession = async () => {
    dispatch({ type: 'passwords/resetBySession' });
    if (!password) {
      dispatch({ type: 'passwords/resetBySession/error', error: { internalError: 'Missing password' } });
      return;
    }

    try {
      const response = await stytchClient.passwords.resetBySession({
        password: password,
      });
      onEvent({ type: StytchEventType.B2BPasswordResetBySession, data: response });
      dispatch({ type: 'passwords/resetBySession/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'passwords/resetBySession/error', error: errorResponse });
    }
  };
  return { passwordResetBySession };
};
