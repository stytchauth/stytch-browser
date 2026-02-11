import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useTOTPAuthenticate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const organizationId = state.mfaState.primaryInfo?.organizationId;
  const memberId = state.mfaState.primaryInfo?.memberId;
  const totpAuthenticate = async (code: string) => {
    dispatch({ type: 'mfa/totp/authenticate' });
    if (!organizationId) {
      dispatch({ type: 'mfa/totp/authenticate/error', error: { internalError: 'Missing organization' } });
      return;
    }
    if (!memberId) {
      dispatch({ type: 'mfa/totp/authenticate/error', error: { internalError: 'Missing memberId' } });
      return;
    }
    try {
      const response = await stytchClient.totp.authenticate({
        code: code,
        member_id: memberId,
        organization_id: organizationId,
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
      });
      onEvent({ type: StytchEventType.B2BTOTPAuthenticate, data: response });
      dispatch({ type: 'mfa/totp/authenticate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'mfa/totp/authenticate/error', error: errorResponse });
      throw e;
    }
  };
  return { totpAuthenticate };
};
