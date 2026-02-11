import { useEffect, useState } from 'react';

import { readB2BInternals } from '../../../utils/internal';
import { useConfig, useStytch } from '../GlobalContextProvider';

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
