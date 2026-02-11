import { OrganizationBySlugMatch } from '@stytch/core/public';
import { useState } from 'react';

import { useGlobalReducer, useStytch } from '../ContextProvider';
import { Screen } from '../screens';
import { useMagicLinksEmailLoginOrSignup } from './useMagicLinksEmailLoginOrSignup';
import { usePasswordDiscoveryAuthenticate } from './usePasswordDiscoveryAuthenticate';
import { usePasswordsAuthenticate } from './usePasswordsAuthenticate';

export const usePasswordInput = () => {
  const [state, dispatch] = useGlobalReducer();
  const stytch = useStytch();
  const { passwordsAuthenticate } = usePasswordsAuthenticate();
  const { passwordDiscoveryAuthenticate } = usePasswordDiscoveryAuthenticate();
  const { magicLinksEmailLoginOrSignup } = useMagicLinksEmailLoginOrSignup();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPassword = async (organization_id: string | undefined) => {
    setErrorMessage('');
    setIsSubmitting(true);
    if (organization_id) {
      passwordsAuthenticate(organization_id).finally(() => setIsSubmitting(false));
    } else {
      passwordDiscoveryAuthenticate().finally(() => setIsSubmitting(false));
    }
  };

  const emailEligibleForJITProvisioning = (
    { email_jit_provisioning, email_allowed_domains }: OrganizationBySlugMatch,
    email: string,
  ) => {
    switch (email_jit_provisioning) {
      case 'ALL_ALLOWED':
        return true;
      case 'NOT_ALLOWED':
        return false;
      case 'RESTRICTED': {
        const emailDomain = email.split('@').pop();
        return emailDomain != null && email_allowed_domains.includes(emailDomain);
      }
    }
  };

  const handleNonMemberReset = () => {
    if (!state.authenticationState.organization || !state.memberState.emailAddress.emailAddress) {
      return;
    }

    if (
      !emailEligibleForJITProvisioning(
        state.authenticationState.organization,
        state.memberState.emailAddress.emailAddress,
      )
    ) {
      setIsSubmitting(false);
      setErrorMessage(
        state.memberState.emailAddress.emailAddress +
          ' does not have access to ' +
          state.authenticationState.organization.organization_name +
          '. If you think this is a mistake, contact your admin.',
      );
      return;
    }
    magicLinksEmailLoginOrSignup()
      .then(() => {
        setIsSubmitting(false);
        dispatch({ type: 'navigate/to', screen: Screen.PasswordResetVerifyConfirmation });
      })
      .catch(() => {
        setErrorMessage('We were unable to verify your email. Please contact your admin.');
        setIsSubmitting(false);
      });
  };

  return {
    stytch,
    errorMessage,
    setErrorMessage,
    isSubmitting,
    setIsSubmitting,
    submitPassword,
    handleNonMemberReset,
  };
};
