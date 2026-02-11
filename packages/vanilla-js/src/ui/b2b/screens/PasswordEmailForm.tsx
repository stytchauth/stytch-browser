import React, { useState } from 'react';
import { useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { Flex } from '../../components/Flex';
import { EmailInput } from '../../components/EmailInput';
import { SubmitButton } from '../../components/SubmitButton';
import { EMAIL_REGEX } from '../../../utils';
import { readB2BInternals } from '../../../utils/internal';
import { PasswordInput } from '../../components/PasswordInput';
import { ErrorText } from '../../components/ErrorText';
import { usePasswordInput } from '../usePasswordInput';
import { useLingui } from '@lingui/react/macro';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import { StytchAPIError } from '@stytch/core/public';
import { useErrorProps } from '../../../utils/accessibility';
import { Label } from '../../components/Label';
import { HelpButton } from '../../components/HelpButton';

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

  const emailProps = useErrorProps(errorMessage);
  const passwordProps = useErrorProps(errorMessage);

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
    <Flex direction="column" gap={36}>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={8}>
          <Flex direction="column" gap={2}>
            <Label htmlFor="email-input">{t({ id: 'formField.email.label', message: 'Email' })}</Label>
            <EmailInput email={email} setEmail={setEmail} {...emailProps.input} />
          </Flex>
          {!hideInput && (
            <Flex direction="column" gap={2}>
              <Label htmlFor="current-password">{t({ id: 'formField.password.label', message: 'Password' })}</Label>
              <PasswordInput password={password} setPassword={setPassword} type="current" {...passwordProps.input} />
            </Flex>
          )}
          <ErrorText errorMessage={errorMessage} {...passwordProps.error} />
          <SubmitButton isSubmitting={isSubmitting} text={t({ id: 'button.continue', message: 'Continue' })} />
          {!hideInput && (
            <HelpButton onClick={onGetHelp}>
              {t({ id: 'link.signupResetPassword', message: 'Sign up or reset password' })}
            </HelpButton>
          )}
        </Flex>
      </form>
    </Flex>
  );
};
