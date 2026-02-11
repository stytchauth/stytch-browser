import React from 'react';

import { EmailEntryForm } from '../components/EmailEntryForm';
import { PageTitle } from '../components/PageTitle';
import { PasswordEntryForm } from '../components/PasswordEntryForm';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchButton } from '../components/StytchButton';
import { useGlobalReducer } from '../ContextProvider';
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
