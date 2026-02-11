import React from 'react';
import { OTPInput } from '../../shared/components/OTPInput';
import { useOTPAuthenticate } from '../hooks/otpAuthenticate';

export const OTPEntry = () => {
  const { authenticateOTP } = useOTPAuthenticate();

  return <OTPInput onCodeComplete={authenticateOTP} testID="OTPEntry" />;
};
