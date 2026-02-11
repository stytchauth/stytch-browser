import { EmailSentType } from '@stytch/core';
import React, { useEffect, useState } from 'react';

import { readB2CInternals } from '../../../../utils/internal';
import { useCountdown } from '../../../components/atoms/Countdown';
import { EmailConfirmationView } from '../../../components/organisms/EmailConfirmationView';
import { AppScreens, useConfig, useGlobalReducer, useStytch } from '../../GlobalContextProvider';
import { usePasswordlessAuthenticate } from './usePasswordlessAuthenticate';

/**
 * Resolves the best email domain to use as a hint for login
 */
export const useEmailDomain = () => {
  const stytch = useStytch();
  const config = useConfig();
  /**
   * Read the emailDomains out of sync storage, then read out of async storage
   * TODO - Should all bootstrap data live in the config somewhere?
   */
  const [emailDomains, setEmailDomains] = useState(() => {
    const { emailDomains } = readB2CInternals(stytch).bootstrap.getSync();
    return emailDomains;
  });

  useEffect(() => {
    readB2CInternals(stytch)
      .bootstrap.getAsync()
      .then(({ emailDomains }) => {
        setEmailDomains(emailDomains);
      });
  }, [stytch]);

  // If a domain is explicitly passed in, use it!
  if (config.emailMagicLinksOptions?.domainHint) {
    return config.emailMagicLinksOptions?.domainHint;
  }
  // If there can only be one logical choice, use it!
  if (emailDomains?.length === 1) {
    return emailDomains[0];
  }
  // If it isn't clear who sent the email
  // we simply won't provide a hint!
  return null;
};

export const EmailConfirmation = ({ showGoBack = true }: { showGoBack?: boolean }) => {
  const stytchClient = useStytch();
  const [state, dispatch] = useGlobalReducer();
  const emailDomain = useEmailDomain();
  const countdown = useCountdown();
  const { sendLink, isSubmitting } = usePasswordlessAuthenticate();

  const email =
    state.formState.magicLinkState.email !== ''
      ? state.formState.magicLinkState.email
      : state.formState.passwordState.email;

  const goBack = () => {
    dispatch({ type: 'set_magic_link_email', email: '' });
    dispatch({ type: 'transition', screen: AppScreens.Main });
    readB2CInternals(stytchClient).networkClient.logEvent({
      name: 'email_try_again_clicked',
      details: { email: email, type: EmailSentType.LoginOrCreateEML },
    });
  };

  return (
    <EmailConfirmationView
      emailDomain={emailDomain}
      email={email}
      goBack={showGoBack ? goBack : undefined}
      resend={sendLink}
      countdown={countdown}
      isSubmitting={isSubmitting}
    />
  );
};
