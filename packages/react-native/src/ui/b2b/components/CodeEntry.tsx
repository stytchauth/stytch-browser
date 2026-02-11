import React from 'react';
import { OTPInput } from '../../shared/components/OTPInput';
import { useTOTPAuthenticate } from '../hooks/useTOTPAuthenticate';
import { useOTPSMSAuthenticate } from '../hooks/useOTPSMSAuthenticate';
import { useEmailOTPAuthenticate } from '../hooks/useEmailOTPAuthenticate';
import { useEmailOTPDiscoveryAuthenticate } from '../hooks/useEmailOTPDiscoveryAuthenticate';
import { useGlobalReducer } from '../ContextProvider';
import { AuthFlowType } from '@stytch/core/public';

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
