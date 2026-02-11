import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { PageTitle } from '../components/PageTitle';
import { EmailEntryForm } from '../components/EmailEntryForm';
import { PasswordEntryForm } from '../components/PasswordEntryForm';
import { useGlobalReducer } from '../ContextProvider';
import { StytchButton } from '../components/StytchButton';
import { usePasswordsResetByEmail } from '../hooks/passwordsResetByEmail';

export const SetPasswordScreen = () => {
  const [state] = useGlobalReducer();
  const { resetPasswordByEmail } = usePasswordsResetByEmail();
  return (
    <ScreenWrapper testID="SetPasswordScreen">
      <PageTitle title="Set a new password" />
      <EmailEntryForm editable={false} />
      <PasswordEntryForm />
      <StytchButton
        enabled={state.userState.password.passwordStrengthCheckResponse?.valid_password == true}
        text="Continue"
        onPress={resetPasswordByEmail}
      />
    </ScreenWrapper>
  );
};
