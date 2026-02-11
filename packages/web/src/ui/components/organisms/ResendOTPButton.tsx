import { useLingui } from '@lingui/react/macro';
import React from 'react';

import Button from '../atoms/Button';
import { chromaticIgnoreClassName } from '../atoms/chromaticIgnoreClassName';
import { Countdown, useTimeRemaining } from '../atoms/Countdown';
import VerticalTransition from '../atoms/VerticalTransition';

export type ResendOTPButtonProps = {
  isSubmitting: boolean;
  resendOTP: () => Promise<void>;
  countdown: Countdown;
};

export const ResendOTPButton = ({ isSubmitting, resendOTP, countdown }: ResendOTPButtonProps) => {
  const { t } = useLingui();

  const [timeRemaining, active] = useTimeRemaining(countdown.expiration);

  return (
    <Button
      variant="outline"
      disabled={isSubmitting || active}
      onClick={() => {
        countdown.start(15);
        resendOTP().catch(() => countdown.clear());
      }}
    >
      <VerticalTransition
        className={chromaticIgnoreClassName()}
        primary={t({ id: 'passcode.resendCode', message: 'Resend code' })}
        secondary={t({ id: 'passcode.codeSent', message: `Code sent! Try again in ${timeRemaining}s` })}
        triggered={active}
      />
    </Button>
  );
};
