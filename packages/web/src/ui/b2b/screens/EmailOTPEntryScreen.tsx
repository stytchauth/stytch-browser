import { useLingui } from '@lingui/react/macro';
import {
  AuthFlowType,
  B2BDiscoveryOTPEmailAuthenticateResponse,
  B2BOTPsEmailAuthenticateResponse,
  StytchAPIError,
} from '@stytch/core/public';
import React from 'react';

import { getTranslatedError } from '../../../utils/getTranslatedError';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import { useCountdown } from '../../components/atoms/Countdown';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import { LoadingScreen } from '../../components/molecules/Loading';
import { ResendOTPButton } from '../../components/organisms/ResendOTPButton';
import { SentOTPEntry } from '../../components/organisms/SentOTPEntry';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { useEmailOtpDiscoverySend } from '../hooks/useEmailOtpDiscoverySend';
import { useEmailOtpLoginOrSignup } from '../hooks/useEmailOtpLoginOrSignup';
import { onAuthenticateSuccess, onDiscoveryAuthenticateSuccess, StytchMutationKey, useMutate } from '../utils';

export const EmailOTPEntryScreen = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const { t } = useLingui();

  const [state, dispatch] = useGlobalReducer();
  const { codeExpiration } = state.formState.otpState;
  const resendCountdown = useCountdown();
  const { userSuppliedEmail } = state.formState.emailState;

  const emailOtp = useEmailOtpLoginOrSignup({ throwOnError: true });
  const emailOtpDiscovery = useEmailOtpDiscoverySend({ throwOnError: true });

  const isSending = emailOtp.isMutating || emailOtpDiscovery.isMutating;
  const sendError = emailOtp.error || emailOtpDiscovery.error;

  const discoveryAuthenticate = useMutate<
    B2BDiscoveryOTPEmailAuthenticateResponse,
    unknown,
    StytchMutationKey,
    { otp: string; email: string }
  >(
    'stytch.otps.email.discovery.authenticate',
    (_: string, { arg: { otp, email } }: { arg: { otp: string; email: string } }) =>
      stytchClient.otps.email.discovery.authenticate({
        code: otp,
        email_address: email,
      }),
    {
      onSuccess: (data) => {
        onDiscoveryAuthenticateSuccess(data, dispatch);
      },
      throwOnError: true,
    },
  );

  const authenticate = useMutate<
    B2BOTPsEmailAuthenticateResponse,
    unknown,
    StytchMutationKey,
    { otp: string; emailAddress: string; organizationId: string; sessionDurationMinutes: number }
  >(
    'stytch.otps.email.authenticate',
    (
      _: string,
      {
        arg: { otp, emailAddress, organizationId, sessionDurationMinutes },
      }: { arg: { otp: string; emailAddress: string; organizationId: string; sessionDurationMinutes: number } },
    ) =>
      stytchClient.otps.email.authenticate({
        code: otp,
        email_address: emailAddress,
        organization_id: organizationId,
        session_duration_minutes: sessionDurationMinutes,
      }),
    {
      onSuccess: (data) => {
        onAuthenticateSuccess(data, dispatch, config);
      },
      throwOnError: true,
    },
  );

  const isAuthenticatingAny = discoveryAuthenticate.isMutating || authenticate.isMutating;
  const error = discoveryAuthenticate.error || authenticate.error || sendError;
  const errorMessage = error ? getTranslatedError(error as StytchAPIError, t) : undefined;

  const resetAll = () => {
    for (const resp of [emailOtp, emailOtpDiscovery, authenticate, discoveryAuthenticate]) {
      resp.reset();
    }
  };

  const handleSubmit = async (otp: string) => {
    resetAll();

    try {
      if (state.flowState.type === AuthFlowType.Discovery) {
        await discoveryAuthenticate.trigger({
          otp,
          email: userSuppliedEmail,
        });
      } else if (
        state.flowState.type === AuthFlowType.Organization &&
        state.flowState.organization &&
        state.formState.emailState.userSuppliedEmail
      ) {
        await authenticate.trigger({
          otp,
          emailAddress: state.formState.emailState.userSuppliedEmail,
          organizationId: state.flowState.organization.organization_id,
          sessionDurationMinutes: config.sessionOptions.sessionDurationMinutes,
        });
      }
    } catch {
      resendCountdown.clear();
    }
  };

  const handleResendOTP = async () => {
    resetAll();

    if (isSending) return;

    if (state.flowState.type === AuthFlowType.Discovery) {
      await emailOtpDiscovery.trigger({ email: userSuppliedEmail });
    } else if (state.flowState.type === AuthFlowType.Organization && state.flowState.organization) {
      await emailOtp.trigger({
        email: userSuppliedEmail,
        organization_id: state.flowState.organization.organization_id,
      });
    }
  };

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  return (
    <Column gap={6}>
      {codeExpiration !== null ? (
        <SentOTPEntry
          isSubmitting={isAuthenticatingAny}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
          expiration={codeExpiration.getTime()}
          formattedDestination={userSuppliedEmail}
        />
      ) : (
        <LoadingScreen />
      )}

      <ButtonColumn>
        <ResendOTPButton countdown={resendCountdown} resendOTP={handleResendOTP} isSubmitting={isAuthenticatingAny} />
        <Button variant="ghost" onClick={handleBack}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      </ButtonColumn>
    </Column>
  );
};
