import { useLingui } from '@lingui/react/macro';
import { EmailSentType } from '@stytch/core';
import { StytchAPIError, StytchEventType } from '@stytch/core/public';
import React, { useState } from 'react';

import { convertMagicLinkOptions, EMAIL_REGEX } from '../../../../../utils';
import { getTranslatedError } from '../../../../../utils/getTranslatedError';
import { readB2CInternals } from '../../../../../utils/internal';
import Button from '../../../../components/atoms/Button';
import Column from '../../../../components/atoms/Column';
import EmailInput from '../../../../components/molecules/EmailInput';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../../GlobalContextProvider';
import { hasProduct } from '../../../utils';

export const MagicLinkEmailForm = () => {
  const { t } = useLingui();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const [, dispatch] = useGlobalReducer();
  const stytchClient = useStytch();
  const config = useConfig();
  const emailMagicLinksOptions = config.emailMagicLinksOptions;
  const hasPasskeys = hasProduct(config.products, 'passkeys');

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    <Column as="form" onSubmit={handleSubmit} gap={4}>
      <EmailInput email={email} setEmail={setEmail} hasPasskeys={hasPasskeys} hideLabel error={errorMessage} />
      <Button variant="primary" loading={isSubmitting} type="submit">
        {t({ id: 'button.emailLogin', message: 'Continue with email' })}
      </Button>
    </Column>
  );
};
