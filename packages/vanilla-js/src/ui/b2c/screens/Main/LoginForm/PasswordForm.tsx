import React, { useState } from 'react';
import { useLingui } from '@lingui/react/macro';

import { useConfig, useGlobalReducer, AppScreens, useStytch, useErrorCallback } from '../../../GlobalContextProvider';
import { EMAIL_REGEX } from '../../../../../utils';
import { SubmitButton } from '../../../../components/SubmitButton';
import { EmailInput } from '../../../../components/EmailInput';
import { Flex } from '../../../../components/Flex';
import { readB2CInternals } from '../../../../../utils/internal';
import { EmailSentType } from '@stytch/core';
import { Products, StytchAPIError } from '@stytch/core/public';
import { getTranslatedError } from '../../../../../utils/getTranslatedError';
import { useErrorProps } from '../../../../../utils/accessibility';
import { ErrorText } from '../../../../components/ErrorText';

export const PasswordsEmailForm = () => {
  const { t } = useLingui();
  const [, dispatch] = useGlobalReducer();
  const config = useConfig();
  const stytch = useStytch();
  const onError = useErrorCallback();
  const hasPasskeys = config.products.includes(Products.passkeys);

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const emailProps = useErrorProps(errorMessage);
  const emailInputLabel = t({ id: 'formField.email.label', message: 'Email' });

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
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={8}>
        <Flex direction="column" minHeight={52}>
          <EmailInput
            email={email}
            setEmail={setEmail}
            hasPasskeys={hasPasskeys}
            aria-label={emailInputLabel}
            {...emailProps.input}
          />
          <ErrorText errorMessage={errorMessage} {...emailProps.error} />
        </Flex>
        <SubmitButton
          isSubmitting={isSubmitting}
          text={t({ id: 'button.emailLogin', message: 'Continue with email' })}
        />
      </Flex>
    </form>
  );
};
