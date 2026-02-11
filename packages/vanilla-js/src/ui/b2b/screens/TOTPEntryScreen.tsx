import { B2BMFAProducts, B2BTOTPAuthenticateResponse, StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useMemo } from 'react';
import BackArrow from '../../../assets/backArrow';
import Button from '../../components/Button';
import { Divider } from '../../components/Divider';
import { Flex } from '../../components/Flex';
import { InlineButton } from '../../components/InlineButton';
import { TOTPEntry } from '../../components/TOTPEntry';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { StytchMutationKey, useMutate } from '../utils';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react';
import { AppScreens } from '../types/AppScreens';

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
    isMutating: isAuthenticating,
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

  const handleSubmit = async (otp: string) => {
    authenticate({ memberId, organizationId, otp, sessionDurationMinutes });
  };

  const handleSwitchToRecoveryCode = () => {
    dispatch({ type: 'transition', history: 'push', screen: AppScreens.RecoveryCodeEntry });
  };

  const handleSwitchToSms = () => {
    dispatch({ type: 'transition', history: 'push', screen: AppScreens.SMSOTPEntry });
  };

  const helperContent = !isEnrolling ? (
    <Trans
      id="mfa.totpEntry.useBackupCode"
      message="Can’t access your authenticator app? <backupCodeLink>Use a backup code</backupCodeLink>"
      components={{
        // @ts-expect-error -- Trans component will pass children prop
        backupCodeLink: <InlineButton onClick={handleSwitchToRecoveryCode} />,
      }}
    />
  ) : (
    t({
      id: 'mfa.totpEntry.getNewCode',
      message: 'If the verification code doesn’t work, go back to your authenticator app to get a new code.',
    })
  );

  return (
    <Flex direction="column" gap={24}>
      {canGoBack && <BackArrow onClick={() => dispatch({ type: 'navigate_back' })} />}
      <TOTPEntry
        helperContent={helperContent}
        isSubmitting={isAuthenticating}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />
      {isSmsOtpAvailable && (
        <>
          <Divider />
          <Button type="button" variant="text" onClick={handleSwitchToSms}>
            {t({ id: 'mfa.totpEntry.switchToSms', message: 'Text me a code instead' })}
          </Button>
        </>
      )}
    </Flex>
  );
};
