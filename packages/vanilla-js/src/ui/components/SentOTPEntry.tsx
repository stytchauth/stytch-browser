import React, { useEffect, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react';
import styled, { keyframes } from 'styled-components';
import { InlineButton } from './InlineButton';
import { OTPEntry } from './OTPEntry';
import { Flex } from './Flex';
import { ErrorText } from './ErrorText';

export interface SentOTPEntryProps {
  expiration: Date;
  formattedDestination: string;
  isSubmitting: boolean;
  onSubmit: (otp: string) => void;
  resendOTP: () => Promise<void>;
  errorMessage?: string;
  resendErrorMessage?: string;
}

const getSecondsRemaining = (expiration: Date) => {
  const now = new Date();
  return Math.ceil((expiration.getTime() - now.getTime()) / 1000);
};

const rollToSuccess = keyframes`
  from {
    transform: translateY(0%);
  }
  to {
    transform: translateY(-50%);
  }
`;

const rollToDefault = keyframes`
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0%);
  }
`;

const AnimatedWrapper = styled.div`
  position: relative;
  overflow: hidden;
  /* Set an explicit height to create the "window" the animation will be displayed in.  We match to the line height to ensure it looks inline with the text */
  height: ${({ theme }) => theme.typography.helper.lineHeight};
`;

const RollingContainer = styled.div<{ displayCodeSent: boolean; shouldAnimate: boolean }>`
  display: flex;
  flex-direction: column;
  animation: ${({ displayCodeSent, shouldAnimate }) => {
      if (!shouldAnimate) return 'none';
      return displayCodeSent ? rollToSuccess : rollToDefault;
    }}
    0.3s ease-out;
  transform: ${({ displayCodeSent }) => (displayCodeSent ? 'translateY(-50%)' : 'translateY(0%)')};
`;

const StyledInlineButton = styled(InlineButton)<{ isCodeSending: boolean }>`
  color: ${({ theme, isCodeSending }) => (isCodeSending ? theme.colors.success : 'inherit')};
`;

const ExpirationMessage = ({
  expiration,
  resendOTP,
  errorMessage,
}: {
  expiration: Date;
  resendOTP: () => Promise<void>;
  errorMessage?: string;
}) => {
  const { t } = useLingui();
  const [seconds, setSeconds] = useState(() => getSecondsRemaining(expiration));

  // "initial" state is to ensure that the animation does not run on mount
  const [resendState, setResendState] = useState<'initial' | 'sending' | 'sent' | 'waiting'>('initial');

  const codeExpired = seconds <= 0;
  useEffect(() => {
    if (!codeExpired) {
      const updateSeconds = () => setSeconds(getSecondsRemaining(expiration));

      const interval = setInterval(updateSeconds, 1000);
      updateSeconds();

      return () => clearInterval(interval);
    }
  }, [codeExpired, expiration]);

  const handleResendClick = async () => {
    try {
      setResendState('sending');
      await resendOTP();
      setResendState('sent');

      // Reset after 2 seconds
      setTimeout(() => {
        setResendState('waiting');
      }, 2000);
    } catch {
      setResendState('initial');
    }
  };

  const displayMinutes = Math.floor(Number(seconds / 60));
  const displaySeconds = seconds - displayMinutes * 60;

  const timeRemaining = `${displayMinutes}:${displaySeconds < 10 ? `0${displaySeconds}` : displaySeconds}`;
  const formattedText =
    seconds > 0
      ? t({ id: 'passcode.expirationCountdown', message: `Your code expires in ${timeRemaining}.` })
      : t({ id: 'passcode.expired', message: 'Your code has expired.' });

  return (
    <>
      {formattedText}
      <Flex direction="row" gap={8} alignItems="center">
        {t({ id: 'passcode.didntGetIt', message: "Didn't get it?" })}
        <AnimatedWrapper>
          <RollingContainer
            displayCodeSent={resendState === 'sent'}
            shouldAnimate={resendState === 'sent' || resendState === 'waiting'}
          >
            <StyledInlineButton
              onClick={handleResendClick}
              isCodeSending={false}
              disabled={resendState === 'sending' || resendState === 'sent'}
            >
              {t({ id: 'passcode.resendCode', message: 'Resend code' })}
            </StyledInlineButton>
            <StyledInlineButton onClick={handleResendClick} isCodeSending={true} disabled>
              {t({ id: 'passcode.codeSent', message: 'Code sent' })}
            </StyledInlineButton>
          </RollingContainer>
        </AnimatedWrapper>
      </Flex>
      <ErrorText errorMessage={errorMessage ?? ''} />
    </>
  );
};

export const SentOTPEntry = ({
  expiration,
  formattedDestination,
  isSubmitting,
  onSubmit,
  errorMessage,
  resendOTP,
  resendErrorMessage,
}: SentOTPEntryProps) => {
  const { t } = useLingui();

  const helperContent = (
    <ExpirationMessage expiration={expiration} resendOTP={resendOTP} errorMessage={resendErrorMessage} />
  );

  return (
    <OTPEntry
      header={t({ id: 'passcode.title', message: 'Enter passcode' })}
      helperContent={helperContent}
      instruction={
        <Trans
          id="passcode.sentConfirmation"
          message="A 6-digit passcode was sent to you at <bold>{destination}</bold>."
          components={{ bold: <b /> }}
          values={{ destination: formattedDestination }}
        />
      }
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      errorMessage={errorMessage}
    />
  );
};
