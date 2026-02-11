import React, { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { AnimatedContainer } from './AnimatedContainer';
import { ErrorText } from './ErrorText';
import { Flex } from './Flex';
import { LoadingBar } from './LoadingBar';
import { OTPInput } from './OTPInput';
import { Text } from './Text';

export interface OTPControlProps {
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (otp: string) => void;
}

const OTP_CODE_LENGTH = 6;

export const OTPControl = ({ isSubmitting, onSubmit, errorMessage }: OTPControlProps) => {
  const { t } = useLingui();
  const [otp, setOtp] = useState('');

  const handleOtpChange = (otp: string) => {
    setOtp(otp);

    if (otp.length === OTP_CODE_LENGTH) {
      onSubmit(otp);
    }
  };

  return (
    <Flex direction="column" maxWidth={316}>
      <OTPInput otp={otp} setOtp={handleOtpChange} disabled={isSubmitting} />
      <AnimatedContainer isOpen={isSubmitting}>
        <Flex direction="column" gap={8} marginTop={8}>
          <Text color="secondary" size="helper">
            {t({ id: 'formField.passcode.status.verifying', message: 'Verifying passcode...' })}
          </Text>
          <LoadingBar isLoading={isSubmitting} />
        </Flex>
      </AnimatedContainer>
      {!isSubmitting && <ErrorText errorMessage={errorMessage ?? ''} />}
    </Flex>
  );
};
