import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import React from 'react';

import { formatCountdown, useTimeRemaining } from '../atoms/Countdown';
import OTPEntry from '../molecules/OTPEntry';

export interface SentOTPEntryProps {
  expiration: number; // Unix epoch milliseconds
  formattedDestination: string;
  isSubmitting: boolean;
  onSubmit: (otp: string) => void;
  errorMessage?: string;
}

export const SentOTPEntry = ({
  expiration,
  formattedDestination,
  isSubmitting,
  onSubmit,
  errorMessage,
}: SentOTPEntryProps) => {
  const { t } = useLingui();

  // Unfortunately for backwards compatibility, the variable in the localization template
  // must be named timeRemaining
  const [_timeRemaining, active] = useTimeRemaining(expiration);
  const timeRemaining = formatCountdown(_timeRemaining);

  const formattedText = active
    ? t({ id: 'passcode.expirationCountdown', message: `Your code expires in ${timeRemaining}.` })
    : t({ id: 'passcode.expired', message: 'Your code has expired.' });

  return (
    <OTPEntry
      header={t({ id: 'passcode.title', message: 'Enter passcode' })}
      helperContent={formattedText}
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
