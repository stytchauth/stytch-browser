import { Trans } from '@lingui/react';
import { useLingui } from '@lingui/react/macro';
import React from 'react';

import Button from '../atoms/Button';
import { chromaticIgnoreClassName } from '../atoms/chromaticIgnoreClassName';
import { Countdown, useTimeRemaining } from '../atoms/Countdown';
import VerticalTransition from '../atoms/VerticalTransition';
import EmailActionLayout from '../molecules/EmailActionLayout';
import { emailProviderInfo, EmailProviderLink } from '../molecules/EmailProviderLink';

/**
 * Base component for the two EmailConfirmation in B2B and B2C. This component controls the presentation
 * and do not have any of the B2C/B2B specific code
 */
export const EmailConfirmationView = ({
  emailDomain,
  email,
  goBack,
  resend,
  countdown,
  isSubmitting,
}: {
  emailDomain: string | null;
  email: string;
  goBack?: () => void;
  resend?: () => Promise<void>;
  countdown?: Countdown;
  isSubmitting?: boolean;
}) => {
  const { t } = useLingui();
  const [timeRemaining, active] = useTimeRemaining(countdown?.expiration ?? 0);

  return (
    <EmailActionLayout
      header={t({ id: 'emailConfirmation.title', message: 'Check your email' })}
      description={
        <Trans
          id="emailConfirmation.content"
          message="An email was sent to <bold>{email}</bold>."
          components={{ bold: <b /> }}
          values={{ email }}
        />
      }
      additionalActions={
        <>
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.gmail} />
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.yahoo} />
          <EmailProviderLink emailDomain={emailDomain} providerInfo={emailProviderInfo.outlook} />

          {resend && countdown && (
            <Button
              variant="outline"
              disabled={isSubmitting || active}
              onClick={() => {
                countdown.start(15);
                resend().catch(() => countdown.clear());
              }}
            >
              <VerticalTransition
                className={chromaticIgnoreClassName()}
                primary={t({ id: 'button.resendEmail', message: 'Resend email' })}
                secondary={t({
                  id: 'emailConfirmation.emailSent',
                  message: `Email sent! Try again in ${timeRemaining}s`,
                })}
                triggered={active}
              />
            </Button>
          )}

          {goBack && (
            <Button variant="ghost" onClick={goBack}>
              {t({ id: 'button.goBack', message: 'Go back' })}
            </Button>
          )}
        </>
      }
    />
  );
};
