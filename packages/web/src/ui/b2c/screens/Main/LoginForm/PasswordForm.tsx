import { useLingui } from '@lingui/react/macro';
import { EmailSentType } from '@stytch/core';
import { StytchAPIError } from '@stytch/core/public';
import React, { useState } from 'react';

import { EMAIL_REGEX } from '../../../../../utils';
import { getTranslatedError } from '../../../../../utils/getTranslatedError';
import { readB2CInternals } from '../../../../../utils/internal';
import Button from '../../../../components/atoms/Button';
import Column from '../../../../components/atoms/Column';
import EmailInput from '../../../../components/molecules/EmailInput';
import { AppScreens, useConfig, useErrorCallback, useGlobalReducer, useStytch } from '../../../GlobalContextProvider';
import { hasProduct } from '../../../utils';

export const PasswordsEmailForm = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();
  const config = useConfig();
  const stytch = useStytch();
  const onError = useErrorCallback();
  const hasPasskeys = hasProduct(config.products, 'passkeys');

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.match(EMAIL_REGEX)) {
      setErrorMessage(t({ id: 'error.invalidEmail', message: 'Email format is invalid.' }));
    } else {
      setErrorMessage('');
      setIsSubmitting(true);

      readB2CInternals(stytch)
        .searchManager.searchUser(email)
        .then(({ userType }) => {
          dispatch({ type: 'update_password_state', passwordState: { email, type: userType } });
          dispatch({ type: 'transition', screen: AppScreens.PasswordCreateOrLogin });
          readB2CInternals(stytch).networkClient.logEvent({
            name: 'email_sent',
            details: { email: email, type: EmailSentType.ResetPassword },
          });
        })
        .catch((e: StytchAPIError) => {
          onError(e);
          setIsSubmitting(false);
          setErrorMessage(getTranslatedError(e, t));
        });
    }
  };

  return (
    <Column as="form" onSubmit={handleSubmit} gap={4}>
      <EmailInput email={email} setEmail={setEmail} hasPasskeys={hasPasskeys} hideLabel error={errorMessage} />
      <Button variant="primary" loading={isSubmitting} type="submit">
        {t({ id: 'button.emailLogin', message: 'Continue with email' })}
      </Button>
    </Column>
  );
};
