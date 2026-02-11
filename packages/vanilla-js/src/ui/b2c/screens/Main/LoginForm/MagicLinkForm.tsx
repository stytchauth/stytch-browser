import React, { useState } from 'react';
import { StytchEventType, StytchAPIError } from '@stytch/core/public';
import { useLingui } from '@lingui/react/macro';

import {
  useConfig,
  useStytch,
  useGlobalReducer,
  AppScreens,
  useErrorCallback,
  useEventCallback,
} from '../../../GlobalContextProvider';
import { EMAIL_REGEX, convertMagicLinkOptions } from '../../../../../utils';
import { SubmitButton } from '../../../../components/SubmitButton';
import { EmailInput } from '../../../../components/EmailInput';
import { Flex } from '../../../../components/Flex';
import { ErrorText } from '../../../../components/ErrorText';
import { Products } from '@stytch/core/public';
import { readB2CInternals } from '../../../../../utils/internal';
import { EmailSentType } from '@stytch/core';
import { getTranslatedError } from '../../../../../utils/getTranslatedError';
import { useErrorProps } from '../../../../../utils/accessibility';

export const MagicLinkEmailForm = () => {
  const { t } = useLingui();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const [, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();
  const emailMagicLinksOptions = config.emailMagicLinksOptions;
  const hasPasskeys = config.products.includes(Products.passkeys);

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const emailProps = useErrorProps(errorMessage);
  const emailInputLabel = t({ id: 'formField.email.label', message: 'Email' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submittingEmail = email;
    if (!submittingEmail.match(EMAIL_REGEX)) {
      setErrorMessage(t({ id: 'error.invalidEmail', message: 'Email format is invalid.' }));
    } else {
      setErrorMessage('');
      setIsSubmitting(true);
      stytchClient.magicLinks.email
        .loginOrCreate(submittingEmail, convertMagicLinkOptions(emailMagicLinksOptions))
        .then((data) => {
          onEvent({ type: StytchEventType.MagicLinkLoginOrCreateEvent, data: { ...data, email: submittingEmail } });
          setIsSubmitting(false);
          dispatch({ type: 'set_magic_link_email', email: submittingEmail });
          dispatch({ type: 'transition', screen: AppScreens.EmailConfirmation });
          readB2CInternals(stytchClient).networkClient.logEvent({
            name: 'email_try_again_clicked',
            details: { email: submittingEmail, type: EmailSentType.LoginOrCreateEML },
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
