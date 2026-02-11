import { StytchEventType } from '@stytch/core/public';
import { useEventCallback, useConfig, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useGetMemberPhoneNumber } from './useGetMemberPhoneNumber';

export const useOTPSMSAuthenticate = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const organizationId = state.mfaState.primaryInfo?.organizationId;
  const memberId = state.mfaState.primaryInfo?.memberId;
  const { getE164Number } = useGetMemberPhoneNumber();
  const otpSMSAuthenticate = async (code: string, orgId: string | undefined = organizationId) => {
    dispatch({ type: 'mfa/smsOtp/authenticate' });
    if (!orgId) {
      dispatch({ type: 'mfa/smsOtp/authenticateError', error: { internalError: 'Missing organization' } });
      return;
    }
    if (!memberId) {
      dispatch({ type: 'mfa/smsOtp/authenticateError', error: { internalError: 'Missing memberId' } });
      return;
    }
    const e164 = getE164Number();

    if (!e164) {
      dispatch({ type: 'mfa/smsOtp/authenticateError', error: { internalError: 'Missing memberPhoneNumber' } });
      return;
    }

    try {
      const response = await stytchClient.otps.sms.authenticate({
        code: code,
        member_id: memberId,
        organization_id: orgId,
        session_duration_minutes: config.productConfig.sessionOptions.sessionDurationMinutes,
      });
      onEvent({ type: StytchEventType.B2BSMSOTPAuthenticate, data: response });
      dispatch({ type: 'mfa/smsOtp/authenticateSuccess', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'mfa/smsOtp/authenticateError', error: errorResponse });
      throw e;
    }
  };
  return { otpSMSAuthenticate };
};
