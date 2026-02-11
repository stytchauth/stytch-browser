import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { usePasswordResetByEmailStart } from '../hooks/usePasswordResetByEmailStart';
import { EmailVerification } from '../components/EmailVerification';

export const PasswordSetNewConfirmationScreen = () => {
  const { passwordResetByEmailStart } = usePasswordResetByEmailStart();
  return (
    <ScreenWrapper testID="PasswordSetNewConfirmationScreen">
      <EmailVerification
        title="Check your email!"
        message="A login link was sent to you at"
        primarySubtext="Didn't get it?"
        secondaryBoldSubtext="Resend email"
        onPress={passwordResetByEmailStart}
      />
    </ScreenWrapper>
  );
};
