import { AuthFlowType } from '@stytch/core/public';
import React from 'react';

import { useCountdown } from '../../components/atoms/Countdown';
import { EmailConfirmationView } from '../../components/organisms/EmailConfirmationView';
import { useGlobalReducer } from '../GlobalContextProvider';
import { useEmlDiscoverySend } from '../hooks/useEmlDiscoverySend';
import { useEmlLoginOrSignup } from '../hooks/useEmlLoginOrSignup';
import { AppScreens } from '../types/AppScreens';
import { useEmailDomain } from './useEmailDomain';

export const EmailConfirmation = () => {
  const [state, dispatch] = useGlobalReducer();
  const emailDomain = useEmailDomain();
  const countdown = useCountdown();

  const { trigger: sendLoginOrSignupEml, isMutating: isSendingLoginOrSignupEml } = useEmlLoginOrSignup();
  const { trigger: sendDiscoveryEml, isMutating: isSendingDiscoveryEml } = useEmlDiscoverySend();

  const email = state.formState.emailState.userSuppliedEmail;

  const goBack = () => {
    dispatch({ type: 'set_user_supplied_email', email: '' });
    dispatch({ type: 'transition', screen: AppScreens.Main });
  };

  const resend = async () => {
    if (state.flowState.type === AuthFlowType.Discovery) {
      await sendDiscoveryEml({ email });
    } else if (state.flowState.type === AuthFlowType.Organization && state.flowState.organization) {
      await sendLoginOrSignupEml({
        email,
        organization_id: state.flowState.organization.organization_id,
      });
    }
  };

  const isSubmitting = isSendingLoginOrSignupEml || isSendingDiscoveryEml;

  return (
    <EmailConfirmationView
      emailDomain={emailDomain}
      email={email}
      goBack={goBack}
      resend={resend}
      countdown={countdown}
      isSubmitting={isSubmitting}
    />
  );
};
