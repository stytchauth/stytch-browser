import React from 'react';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { CaptionText } from '../components/CaptionText';
import { PhoneEntryForm } from '../components/PhoneEntryForm';
import { useOTPSMSSend } from '../hooks/useOTPSMSSend';
import { useGlobalReducer } from '../ContextProvider';
import { FormFieldError } from '../components/FormFieldError';

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
