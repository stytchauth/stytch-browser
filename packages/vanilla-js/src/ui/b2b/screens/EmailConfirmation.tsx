import React, { useState, useEffect } from 'react';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { readB2BInternals } from '../../../utils/internal';
import { EmailConfirmation as _EmailConfirmation } from '../../components/EmailConfirmation';

/**
 * Resolves the best email domain to use as a hint for login
 */
const useEmailDomain = () => {
  const stytch = useStytch();
  const config = useConfig();
  /**
   * Read the emailDomains out of sync storage, then read out of async storage
   * TODO - Should all bootstrap data live in the config somewhere?
   */
  const [emailDomains, setEmailDomains] = useState(() => {
    const { emailDomains } = readB2BInternals(stytch).bootstrap.getSync();
    return emailDomains;
  });

  useEffect(() => {
    readB2BInternals(stytch)
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
  if (emailDomains.length === 1) {
    return emailDomains[0];
  }
  // If it isn't clear who sent the email
  // we simply won't provide a hint!
  return null;
};

export const EmailConfirmation = () => {
  const [state, dispatch] = useGlobalReducer();
  const emailDomain = useEmailDomain();

  const reset = () => {
    dispatch({ type: 'set_user_supplied_email', email: '' });
    dispatch({ type: 'transition', screen: AppScreens.Main });
  };

  return (
    <_EmailConfirmation emailDomain={emailDomain} reset={reset} email={state.formState.emailState.userSuppliedEmail} />
  );
};
