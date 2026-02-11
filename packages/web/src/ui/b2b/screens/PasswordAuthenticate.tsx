import { useLingui } from '@lingui/react/macro';
import React from 'react';

import { EMAIL_REGEX } from '../../../utils';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import EmailInput from '../../components/molecules/EmailInput';
import { PasswordInput } from '../../components/molecules/PasswordInput';
import { useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { usePasswordInput } from '../usePasswordInput';

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
    <Column gap={6}>
      <Typography variant="header">
        {t({ id: 'password.login.title', message: 'Log in with email and password' })}
      </Typography>

      <Column as="form" onSubmit={handleSubmit} gap={4}>
        <EmailInput email={email} setEmail={setEmail} />

        <PasswordInput password={password} setPassword={setPassword} type="current" error={errorMessage} />

        <ButtonColumn>
          <Button variant="primary" loading={isSubmitting} type="submit">
            {t({ id: 'button.continue', message: 'Continue' })}
          </Button>

          <Button variant="outline" onClick={onGetHelp}>
            {t({ id: 'link.signupResetPassword', message: 'Sign up or reset password' })}
          </Button>

          <Button variant="ghost" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
            {t({ id: 'button.goBack', message: 'Go back' })}
          </Button>
        </ButtonColumn>
      </Column>
    </Column>
  );
};
