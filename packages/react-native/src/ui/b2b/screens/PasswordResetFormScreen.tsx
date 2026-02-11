import { StytchAPIError } from '@stytch/core/public';
import React, { useState } from 'react';

import { FormFieldError } from '../components/FormFieldError';
import { PageTitle } from '../components/PageTitle';
import { PasswordEntryForm } from '../components/PasswordEntryForm';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchTextButton } from '../components/StytchTextButton';
import { SubtitleText } from '../components/SubtitleText';
import { useGlobalReducer } from '../ContextProvider';
import { usePasswordDiscoveryResetByEmail } from '../hooks/usePasswordDiscoveryResetByEmail';
import { usePasswordResetByEmail } from '../hooks/usePasswordResetByEmail';

export const PasswordResetFormScreen = () => {
  const [state] = useGlobalReducer();
  const { passwordResetByEmail } = usePasswordResetByEmail();
  const { passwordDiscoveryResetByEmail } = usePasswordDiscoveryResetByEmail();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setErrorMessage('');
    setIsSubmitting(true);
    let hook = passwordResetByEmail;
    if (state.authenticationState.tokenType == 'discovery') {
      hook = passwordDiscoveryResetByEmail;
    }
    hook()
      .catch((e: Error) => {
        let message = e.message;
        if (e instanceof StytchAPIError) {
          message = e.error_message;
        }
        setErrorMessage(message);
      })
      .finally(() => setIsSubmitting(false));
  };
  return (
    <ScreenWrapper testID="PasswordResetFormScreen">
      <PageTitle title="Set a new password" />
      <SubtitleText text="Password" textAlign="left" />
      <PasswordEntryForm onSubmitEditing={handleSubmit} />
      {errorMessage && <FormFieldError text={errorMessage} />}
      <StytchTextButton text="Continue" onPress={handleSubmit} enabled={!isSubmitting} />
    </ScreenWrapper>
  );
};
