import { StytchAPIError } from '@stytch/core/public';
import React from 'react';

import { readB2BInternals } from '../../../internals';
import { CaptionText } from '../components/CaptionText';
import { EmailEntryForm } from '../components/EmailEntryForm';
import { FormFieldError } from '../components/FormFieldError';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchTextButton } from '../components/StytchTextButton';
import { SubtitleText } from '../components/SubtitleText';
import { useGlobalReducer } from '../ContextProvider';
import { usePasswordDiscoveryResetByEmailStart } from '../hooks/usePasswordDiscoveryResetByEmailStart';
import { usePasswordInput } from '../hooks/usePasswordInput';
import { usePasswordResetByEmailStart } from '../hooks/usePasswordResetByEmailStart';

export const PasswordForgotFormScreen = () => {
  const [state] = useGlobalReducer();
  const { stytch, errorMessage, setErrorMessage, isSubmitting, setIsSubmitting, handleNonMemberReset } =
    usePasswordInput();
  const { passwordResetByEmailStart } = usePasswordResetByEmailStart();
  const { passwordDiscoveryResetByEmailStart } = usePasswordDiscoveryResetByEmailStart();
  const onSubmit = () => {
    if (!state.memberState.emailAddress.emailAddress) {
      setErrorMessage('Missing email address');
      setIsSubmitting(false);
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    if (state.authenticationState.organization) {
      readB2BInternals(stytch)
        .searchManager.searchMember(
          state.memberState.emailAddress.emailAddress,
          state.authenticationState.organization.organization_id,
        )
        .then(({ member }) => {
          if (!member) {
            handleNonMemberReset();
            return;
          }
          // Member password flow: call reset password start instead
          passwordResetByEmailStart()
            .catch((err: StytchAPIError) => {
              setErrorMessage(err.error_message);
            })
            .finally(() => setIsSubmitting(false));
        })
        .catch((err: Error) => {
          setIsSubmitting(false);
          let message = err.message;
          if (err instanceof StytchAPIError) {
            message = err.error_message;
          }
          setErrorMessage(message);
        });
    } else {
      // Discovery password flow: call discovery reset password start instead. This flow doesn't need a member object
      passwordDiscoveryResetByEmailStart()
        .catch((err: StytchAPIError) => {
          setErrorMessage(err.error_message);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };
  return (
    <ScreenWrapper testID="PasswordForgotFormScreen">
      <PageTitle title="Check your email for help signing in" />
      <CaptionText text="We'll email you a login link to sign in to your account directly or reset your password if you have one." />
      <SubtitleText text="Email" textAlign="left" />
      <EmailEntryForm editable={true} returnKeyType="done" onSubmitEditing={onSubmit} />
      {errorMessage && <FormFieldError text={errorMessage} />}
      <StytchTextButton text="Continue" onPress={onSubmit} enabled={!isSubmitting} />
    </ScreenWrapper>
  );
};
