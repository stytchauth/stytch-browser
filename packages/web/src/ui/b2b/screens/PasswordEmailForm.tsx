import { useLingui } from '@lingui/react/macro';
import { StytchAPIError } from '@stytch/core/public';
import React, { useState } from 'react';

import { EMAIL_REGEX } from '../../../utils';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import { readB2BInternals } from '../../../utils/internal';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import EmailInput from '../../components/molecules/EmailInput';
import { PasswordInput } from '../../components/molecules/PasswordInput';
import { useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { usePasswordInput } from '../usePasswordInput';

export const PasswordsEmailForm = () => {
  const [, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  const {
    stytch,
    email,
    setEmail,
    password,
    setPassword,
    organization,
    errorMessage,
    setErrorMessage,
    isSubmitting,
    setIsSubmitting,
    submitPassword,
    submitDiscoveryPassword,
    handleNonMemberReset,
  } = usePasswordInput();

  const [hideInput, setHideInput] = useState(!!organization && !email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (organization) {
      const organization_id = organization.organization_id;

      // If we have processed the email, submit the password field
      if (!hideInput) {
        submitPassword(organization_id);
        return;
      }

      // Validate we have a member with a password. Otherwise, check if we can jit
      // provision and kickoff verification and session reset
      if (!email.match(EMAIL_REGEX)) {
        setErrorMessage(t({ id: 'error.invalidEmailAddress', message: 'Invalid email address' }));
        return;
      }
      setErrorMessage('');
      setIsSubmitting(true);
      readB2BInternals(stytch)
        .searchManager.searchMember(email, organization.organization_id)
        .then(({ member }) => {
          if (member) {
            setHideInput(false);
            setIsSubmitting(false);
            dispatch({ type: 'set_password_state', email });
            return;
          }
          // No member password flow: verify email and use reset by session
          handleNonMemberReset();
        })
        .catch((err: StytchAPIError) => {
          setIsSubmitting(false);
          setErrorMessage(getTranslatedError(err, t));
        });
    } else {
      // Discovery flow
      submitDiscoveryPassword();
    }
  };

  const onGetHelp = () => {
    dispatch({ type: 'set_password_state', email: email });
    dispatch({ type: 'transition', screen: AppScreens.PasswordForgotForm });
  };

  return (
    <Column as="form" onSubmit={handleSubmit} gap={2}>
      <EmailInput email={email} setEmail={setEmail} />

      {!hideInput && (
        <PasswordInput password={password} setPassword={setPassword} type="current" error={errorMessage} />
      )}

      <Button variant="primary" loading={isSubmitting} type="submit">
        {t({ id: 'button.continue', message: 'Continue' })}
      </Button>

      {!hideInput && (
        <Button variant="outline" onClick={onGetHelp}>
          {t({ id: 'link.signupResetPassword', message: 'Sign up or reset password' })}
        </Button>
      )}
    </Column>
  );
};
