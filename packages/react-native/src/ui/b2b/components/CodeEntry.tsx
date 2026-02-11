import { AuthFlowType } from '@stytch/core/public';
import React from 'react';

import { OTPInput } from '../../shared/components/OTPInput';
import { useGlobalReducer } from '../ContextProvider';
import { useEmailOTPAuthenticate } from '../hooks/useEmailOTPAuthenticate';
import { useEmailOTPDiscoveryAuthenticate } from '../hooks/useEmailOTPDiscoveryAuthenticate';
import { useOTPSMSAuthenticate } from '../hooks/useOTPSMSAuthenticate';
import { useTOTPAuthenticate } from '../hooks/useTOTPAuthenticate';

export enum AuthType {
  OTP_SMS = 'otpSMS',
  OTP_EMAIL = 'otpEmail',
  TOTP = 'totp',
}

interface CodeEntryProps {
  authType: AuthType;
}

export const CodeEntry = ({ authType }: CodeEntryProps) => {
  const { otpSMSAuthenticate } = useOTPSMSAuthenticate();
  const { totpAuthenticate } = useTOTPAuthenticate();
  const { emailOTPAuthenticate } = useEmailOTPAuthenticate();
  const { emailOTPDiscoveryAuthenticate } = useEmailOTPDiscoveryAuthenticate();
  const [state] = useGlobalReducer();

  const handleCodeComplete = (() => {
    switch (authType) {
      case AuthType.OTP_SMS:
        return otpSMSAuthenticate;

      case AuthType.TOTP:
        return totpAuthenticate;

      case AuthType.OTP_EMAIL:
        if (state.authenticationState.authFlowType == AuthFlowType.Organization) {
          return emailOTPAuthenticate;
        } else {
          return emailOTPDiscoveryAuthenticate;
        }
    }
  })();

  return <OTPInput onCodeComplete={handleCodeComplete} testID="CodeEntry" />;
};
