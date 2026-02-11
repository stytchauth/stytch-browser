import { StytchAPIError } from '@stytch/core/public';
import React, { useRef } from 'react';
import { Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

import { readB2BInternals } from '../../../internals';
import { EMAIL_REGEX } from '../../shared/utils';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { usePasswordInput } from '../hooks/usePasswordInput';
import { Screen } from '../screens';
import { EmailEntryForm } from './EmailEntryForm';
import { FormFieldError } from './FormFieldError';
import { PasswordEntryForm } from './PasswordEntryForm';
import { StytchButton } from './StytchButton';

export const PasswordsEmailForm = () => {
  const [state, dispatch] = useGlobalReducer();
  const theme = useTheme();
  const { stytch, errorMessage, setErrorMessage, isSubmitting, setIsSubmitting, submitPassword, handleNonMemberReset } =
    usePasswordInput();
  const passwordsEntryFormRef = useRef<TextInput | null>(null);
  const handleSubmit = async () => {
    if (!state.memberState.emailAddress.emailAddress) {
      return;
    }
    const organization_id = state.authenticationState.organization?.organization_id;

    // Validate we have a member with a password. Otherwise, check if we can jit
    // provision and kickoff verification and session reset
    if (!state.memberState.emailAddress.emailAddress.match(EMAIL_REGEX)) {
      setErrorMessage('Invalid email address');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    if (organization_id) {
      readB2BInternals(stytch)
        .searchManager.searchMember(state.memberState.emailAddress.emailAddress, organization_id)
        .then(({ member }) => {
          if (member) {
            setIsSubmitting(false);
            submitPassword(organization_id);
            return;
          }
          // No member password flow: verify email and use reset by session
          handleNonMemberReset();
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
      submitPassword(organization_id);
    }
  };

  const onGetHelp = () => dispatch({ type: 'navigate/to', screen: Screen.PasswordForgotForm });
  const onEmailEntered = () => {
    passwordsEntryFormRef.current?.focus();
  };

  return (
    <View style={{ flexDirection: 'column', gap: 36 }}>
      <View style={{ flexDirection: 'column', gap: 8 }}>
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <Text style={{ color: theme.primaryTextColor }}>Email</Text>
          <EmailEntryForm returnKeyType="next" onSubmitEditing={onEmailEntered} />
        </View>
        <View style={{ flexDirection: 'column', gap: 2 }}>
          <Text style={{ color: theme.primaryTextColor }}>Password</Text>
          <PasswordEntryForm
            skipStrengthCheck={true}
            onSubmitEditing={handleSubmit}
            reference={passwordsEntryFormRef}
          />
        </View>
        {errorMessage && <FormFieldError text={errorMessage} />}
        <StytchButton onPress={handleSubmit} enabled={!isSubmitting} text="Continue" />
        <TouchableWithoutFeedback onPress={onGetHelp}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: theme.primaryTextColor }}>Having trouble signing in?</Text>
            <Text style={{ fontWeight: 'bold', color: theme.primaryTextColor }}>Get help</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};
