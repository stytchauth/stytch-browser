import React from 'react';
import { useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { Flex } from '../../components/Flex';
import { EmailInput } from '../../components/EmailInput';
import { Text } from '../../components/Text';
import { SubmitButton } from '../../components/SubmitButton';
import { PasswordInput } from '../../components/PasswordInput';
import { ErrorText } from '../../components/ErrorText';
import { EMAIL_REGEX } from '../../../utils';
import BackArrowIcon from '../../../assets/backArrow';
import { usePasswordInput } from '../usePasswordInput';
import { useLingui } from '@lingui/react/macro';
import { useErrorProps } from '../../../utils/accessibility';
import { Label } from '../../components/Label';
import { HelpButton } from '../../components/HelpButton';

export const PasswordsAuthenticate = () => {
  const [, dispatch] = useGlobalReducer();
  const { t } = useLingui();

  const {
    email,
    setEmail,
    password,
    setPassword,
    organization,
    errorMessage,
    setErrorMessage,
    isSubmitting,
    submitPassword,
    submitDiscoveryPassword,
  } = usePasswordInput();

  const passwordProps = useErrorProps(errorMessage);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.match(EMAIL_REGEX)) {
      setErrorMessage(t({ id: 'error.invalidEmailAddress', message: 'Invalid email address' }));
    } else {
      if (!organization) {
        submitDiscoveryPassword();
      } else {
        submitPassword(organization.organization_id);
      }
    }
  };

  const onGetHelp = () => {
    dispatch({ type: 'set_password_state', email: email });
    dispatch({ type: 'transition', screen: AppScreens.PasswordForgotForm });
  };

  return (
    <Flex direction="column" gap={28}>
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      <Text size="header">{t({ id: 'password.login.title', message: 'Log in with email and password' })}</Text>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={8}>
          <Flex direction="column" gap={2}>
            <Label htmlFor="email-input">{t({ id: 'formField.email.label', message: 'Email' })}</Label>
            <EmailInput email={email} setEmail={setEmail} />
          </Flex>
          <Flex direction="column" gap={2}>
            <Label htmlFor="current-password">{t({ id: 'formField.password.label', message: 'Password' })}</Label>
            <PasswordInput password={password} setPassword={setPassword} type="current" {...passwordProps.input} />
            <ErrorText errorMessage={errorMessage} {...passwordProps.error} />
          </Flex>
          <SubmitButton isSubmitting={isSubmitting} text={t({ id: 'button.continue', message: 'Continue' })} />

          <HelpButton onClick={onGetHelp}>
            {t({ id: 'link.signupResetPassword', message: 'Sign up or reset password' })}
          </HelpButton>
        </Flex>
      </form>
    </Flex>
  );
};
