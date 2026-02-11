import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { EmailVerification } from '../components/EmailVerification';
import { useGlobalReducer } from '../ContextProvider';

export const PasswordResetVerifyConfirmationScreen = () => {
  const [, dispatch] = useGlobalReducer();
  return (
    <ScreenWrapper testID="PasswordResetVerifyConfirmationScreen">
      <EmailVerification
        title="Please verify your email"
        message="A login link was sent to you at"
        primarySubtext="Didn't get it?"
        secondaryBoldSubtext="Resend email"
        onPress={() => {
          dispatch({ type: 'navigate/reset' });
        }}
      />
    </ScreenWrapper>
  );
};
