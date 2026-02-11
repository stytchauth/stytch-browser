import React from 'react';

import { CaptionText } from '../components/CaptionText';
import { FormFieldError } from '../components/FormFieldError';
import { PageTitle } from '../components/PageTitle';
import { PhoneEntryForm } from '../components/PhoneEntryForm';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useGlobalReducer } from '../ContextProvider';
import { useOTPSMSSend } from '../hooks/useOTPSMSSend';

export const SMSOTPEnrollmentScreen = () => {
  const { otpSmsSend } = useOTPSMSSend();
  const [state] = useGlobalReducer();
  const sendError = state.mfaState.smsOtp.sendError;
  return (
    <ScreenWrapper testID="SMSOTPEnrollmentScreen">
      <PageTitle title="Enter your phone number to set up Multi-Factor Authentication" />
      <CaptionText text="Your organization requires an additional form of verification to make your account more secure." />
      <PhoneEntryForm onValidPhoneNumberEntered={otpSmsSend} />
      {sendError && <FormFieldError errorResponse={sendError} />}
    </ScreenWrapper>
  );
};
