import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useTOTPCreate = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const organizationId = state.mfaState.primaryInfo?.organizationId;
  const memberId = state.mfaState.primaryInfo?.memberId;
  const totpCreate = async () => {
    dispatch({ type: 'mfa/totp/create' });
    if (!organizationId) {
      dispatch({ type: 'mfa/totp/create/error', error: { internalError: 'Missing organization' } });
      return;
    }
    if (!memberId) {
      dispatch({ type: 'mfa/totp/create/error', error: { internalError: 'Missing memberId' } });
      return;
    }
    try {
      const response = await stytchClient.totp.create({
        member_id: memberId,
        organization_id: organizationId,
      });
      onEvent({ type: StytchEventType.B2BTOTPCreate, data: response });
      dispatch({
        type: 'mfa/totp/create/success',
        response: response,
        memberId: memberId,
        organizationId: organizationId,
      });
      dispatch({ type: 'mfa/totp/showCode' });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'mfa/totp/create/error', error: errorResponse });
    }
  };
  return { totpCreate };
};
