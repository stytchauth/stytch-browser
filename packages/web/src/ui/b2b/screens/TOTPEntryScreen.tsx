import { useLingui } from '@lingui/react/macro';
import { B2BMFAProducts, B2BTOTPAuthenticateResponse, StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useMemo } from 'react';

import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import OTPEntry from '../../components/molecules/OTPEntry';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { StytchMutationKey, useMutate } from '../utils';

export const TOTPEntryScreen = () => {
  const stytchClient = useStytch();
  const {
    sessionOptions: { sessionDurationMinutes },
  } = useConfig();
  const { t } = useLingui();

  const [state, dispatch] = useGlobalReducer();
  const {
    mfa: { isEnrolling },
  } = state;

  // This screen should only be shown if primary info is available
  const { enrolledMfaMethods, memberId, organizationId, organizationMfaOptionsSupported } = state.mfa.primaryInfo!;

  const {
    trigger: authenticate,
    isMutating: isSubmitting,
    error: authenticateError,
  } = useMutate<
    B2BTOTPAuthenticateResponse<StytchProjectConfigurationInput>,
    unknown,
    StytchMutationKey,
    { memberId: string; organizationId: string; otp: string; sessionDurationMinutes: number }
  >(
    'stytch.totp.authenticate',
    (
      _: string,
      {
        arg: { memberId, organizationId, otp, sessionDurationMinutes },
      }: { arg: { memberId: string; organizationId: string; otp: string; sessionDurationMinutes: number } },
    ) =>
      stytchClient.totp.authenticate({
        code: otp,
        member_id: memberId,
        organization_id: organizationId,
        session_duration_minutes: sessionDurationMinutes,
      }),
    {
      onSuccess: () => {
        dispatch({ type: 'totp/authenticate_success' });
      },
    },
  );

  const isSmsOtpAvailable = useMemo(
    () =>
      !isEnrolling &&
      enrolledMfaMethods.includes(B2BMFAProducts.smsOtp) &&
      (organizationMfaOptionsSupported.length === 0 || organizationMfaOptionsSupported.includes(B2BMFAProducts.smsOtp)),
    [enrolledMfaMethods, isEnrolling, organizationMfaOptionsSupported],
  );

  const errorMessage = authenticateError
    ? t({ id: 'error.passcodeInvalid', message: 'Invalid passcode, please try again.' })
    : undefined;
  const canGoBack = isEnrolling;

  const handleSubmit = (otp: string) => authenticate({ memberId, organizationId, otp, sessionDurationMinutes });

  const handleSwitchToRecoveryCode = () => {
    dispatch({ type: 'transition', history: 'push', screen: AppScreens.RecoveryCodeEntry });
  };

  const handleSwitchToSms = () => {
    dispatch({ type: 'transition', history: 'push', screen: AppScreens.SMSOTPEntry });
  };

  return (
    <Column gap={6}>
      <OTPEntry
        header={t({ id: 'totp.title', message: 'Enter verification code' })}
        instruction={t({ id: 'totp.content', message: 'Enter the 6-digit code from your authenticator app.' })}
        helperContent={
          isEnrolling
            ? t({
                id: 'mfa.totpEntry.getNewCode',
                message: 'If the verification code doesn’t work, go back to your authenticator app to get a new code.',
              })
            : null
        }
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />

      <ButtonColumn
        top={null}
        bottom={
          <>
            {isSmsOtpAvailable && (
              <Button variant="outline" onClick={handleSwitchToSms}>
                {t({ id: 'mfa.totpEntry.switchToSms', message: 'Text me a code instead' })}
              </Button>
            )}

            {!isEnrolling && (
              <Button variant="outline" onClick={handleSwitchToRecoveryCode}>
                {t({ id: 'mfa.totpEntry.useBackupCode', message: 'Use a backup code' })}
              </Button>
            )}

            {canGoBack && (
              <Button variant="ghost" onClick={() => dispatch({ type: 'navigate_back' })}>
                {t({ id: 'button.goBack', message: 'Go back' })}
              </Button>
            )}
          </>
        }
      />
    </Column>
  );
};
