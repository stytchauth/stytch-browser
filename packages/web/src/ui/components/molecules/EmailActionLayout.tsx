import { useLingui } from '@lingui/react/macro';
import { StytchSDKAPIError } from '@stytch/core/public';
import React, { ReactNode, useState } from 'react';

import { getTranslatedError } from '../../../utils/getTranslatedError';
import Button from '../atoms/Button';
import { chromaticIgnoreClassName } from '../atoms/chromaticIgnoreClassName';
import Column from '../atoms/Column';
import { useCountdown, useTimeRemaining } from '../atoms/Countdown';
import { errorToast } from '../atoms/Toast';
import Typography from '../atoms/Typography';
import VerticalTransition from '../atoms/VerticalTransition';
import ButtonColumn from './ButtonColumn';

type EmailActionProps = {
  header: ReactNode;
  description: ReactNode;

  /**
   * Additional content to display below description
   * Usually used for forms. If you have buttons, use additionalActions instead.
   */
  children?: ReactNode;

  additionalActions?: ReactNode;

  /**
   * We assume pressing this button sent off an email and we will disable the button for 15 seconds.
   */
  resend?: () => Promise<unknown>;

  sendMagicLink?: () => Promise<unknown>;
  goBack?: () => void;
};

/**
 * Handles common layouts for simple email actions
 */
const EmailActionLayout = ({
  header,
  description,
  children,
  additionalActions,
  resend,
  sendMagicLink,
  goBack,
}: EmailActionProps) => {
  const { t } = useLingui();

  const [emailResending, setEmailResending] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const countdown = useCountdown();
  const [timeRemaining, active] = useTimeRemaining(countdown.expiration);

  const resendButton = resend && (
    <Button
      variant="outline"
      onClick={async () => {
        setEmailResending(true);
        try {
          await resend();
          countdown.start(15);
        } catch (error) {
          errorToast({ message: getTranslatedError(error as StytchSDKAPIError, t) });
          countdown.clear();
        } finally {
          setEmailResending(false);
        }
      }}
      loading={emailResending}
      disabled={emailResending || active}
    >
      <VerticalTransition
        className={chromaticIgnoreClassName()}
        triggered={active}
        primary={t({ id: 'button.resendEmail', message: 'Resend email' })}
        secondary={t({ id: 'button.emailResent', message: `Email resent! Try again in ${timeRemaining}s` })}
      />
    </Button>
  );

  const goBackButton = goBack && (
    <Button variant="ghost" onClick={goBack}>
      {t({ id: 'button.goBack', message: 'Go back' })}
    </Button>
  );

  const actions = sendMagicLink ? (
    <ButtonColumn
      top={
        <>
          {additionalActions}
          {resendButton}
        </>
      }
      bottom={
        <>
          <Button
            variant="outline"
            onClick={() => {
              setMagicLinkSent(true);
              sendMagicLink().catch(() => setMagicLinkSent(false));
            }}
            loading={magicLinkSent}
          >
            {t({ id: 'button.loginWithoutPassword', message: 'Log in without a password' })}
          </Button>

          {goBackButton}
        </>
      }
    />
  ) : (
    <ButtonColumn>
      {additionalActions}
      {resendButton}
      {goBackButton}
    </ButtonColumn>
  );

  return (
    <Column gap={6}>
      <Typography variant="header">{header}</Typography>
      <Typography>{description}</Typography>

      {children}

      {actions}
    </Column>
  );
};

export default EmailActionLayout;
