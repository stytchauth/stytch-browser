import { StytchEventType } from '@stytch/core/public';

import { useConfig, useEventCallback, useGlobalReducer, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useGetMemberPhoneNumber } from './useGetMemberPhoneNumber';

export const useOTPSMSSend = () => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const { getE164Number } = useGetMemberPhoneNumber();
  const onEvent = useEventCallback();
  const config = useConfig();
  const organizationId = state.mfaState.primaryInfo?.organizationId;
  const memberId = state.mfaState.primaryInfo?.memberId;
  const otpSmsSend = async () => {
    dispatch({ type: 'mfa/smsOtp/send' });
    if (!organizationId) {
      dispatch({ type: 'mfa/smsOtp/send/error', error: { internalError: 'Missing organization' } });
      return;
    }
    if (!memberId) {
      dispatch({ type: 'mfa/smsOtp/send/error', error: { internalError: 'Missing memberId' } });
      return;
    }
    const e164 = getE164Number();

    if (!e164) {
      dispatch({ type: 'mfa/smsOtp/send/error', error: { internalError: 'Missing memberPhoneNumber' } });
      return;
    }

    try {
      const response = await stytchClient.otps.sms.send({
        mfa_phone_number: e164,
        member_id: memberId,
        organization_id: organizationId,
        locale: config.productConfig.smsOtpOptions?.locale,
      });
      onEvent({ type: StytchEventType.B2BSMSOTPSend, data: response });
      dispatch({
        type: 'mfa/smsOtp/send/success',
        response: response,
        phoneNumber: state.mfaState.smsOtp.enrolledNumber?.phoneNumber ?? '',
        countryCode: state.mfaState.smsOtp.enrolledNumber?.countryCode ?? '',
        formattedPhoneNumber: e164,
      });
      dispatch({ type: 'mfa/smsOtp/navigateToEntry' });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'mfa/smsOtp/send/error', error: errorResponse });
    }
  };
  return { otpSmsSend };
};
