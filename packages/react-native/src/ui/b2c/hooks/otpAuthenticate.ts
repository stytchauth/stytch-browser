import { useGlobalReducer, useConfig, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useEventLogger } from './useEventLogger';
import { useCallback } from 'react';
export const useOTPAuthenticate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const { logEvent } = useEventLogger();
  const methodId = state.authenticationState.methodId;
  const sessionDurationMinutes = config.sessionOptions.sessionDurationMinutes;
  const otpClient = stytchClient.otps;
  const authenticateOTP = useCallback(
    async (otpCode: string): Promise<undefined> => {
      dispatch({ type: 'otp/authenticate' });

      if (!methodId) {
        dispatch({ type: 'otp/authenticate/error', error: { internalError: 'Missing method id' } });
        return;
      }

      try {
        const response = await otpClient.authenticate(otpCode, methodId, {
          session_duration_minutes: sessionDurationMinutes,
        });
        logEvent({ name: 'ui_authentication_success', details: { method: 'otp' } });
        dispatch({ type: 'otp/authenticate/success', response: response });
      } catch (e: unknown) {
        const errorResponse = createErrorResponseFromError(e);
        dispatch({ type: 'otp/authenticate/error', error: errorResponse });
        throw e;
      }
    },
    [sessionDurationMinutes, dispatch, logEvent, methodId, otpClient],
  );
  return { authenticateOTP };
};
