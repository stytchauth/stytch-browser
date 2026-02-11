import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';

export const useRecoveryCodesRecover = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const organizationId = state.mfaState.primaryInfo?.organizationId;
  const memberId = state.mfaState.primaryInfo?.memberId;
  const recoveryCodesRecover = async (recoveryCode: string) => {
    dispatch({ type: 'mfa/recoveryCode/authenticate' });
    if (!organizationId) {
      dispatch({ type: 'mfa/recoveryCode/authenticate/error', error: { internalError: 'Missing organizationId' } });
      return;
    }
    if (!memberId) {
      dispatch({ type: 'mfa/recoveryCode/authenticate/error', error: { internalError: 'Missing memberId' } });
      return;
    }

    try {
      const response = await stytchClient.recoveryCodes.recover({
        recovery_code: recoveryCode,
        member_id: memberId,
        organization_id: organizationId,
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
      });
      onEvent({ type: StytchEventType.B2BRecoveryCodesRecover, data: response });
      dispatch({ type: 'mfa/recoveryCode/authenticate/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'mfa/recoveryCode/authenticate/error', error: errorResponse });
    }
  };
  return { recoveryCodesRecover };
};
