import {
  AuthFlowType,
  B2BDiscoveryOTPEmailAuthenticateResponse,
  B2BOTPsEmailAuthenticateResponse,
  StytchAPIError,
} from '@stytch/core/public';
import React from 'react';
import { useLingui } from '@lingui/react/macro';
import BackArrow from '../../../assets/backArrow';
import { Flex } from '../../components/Flex';
import { LoadingScreen } from '../../components/Loading';
import { SentOTPEntry } from '../../components/SentOTPEntry';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { useEmailOtpDiscoverySend } from '../hooks/useEmailOtpDiscoverySend';
import { useEmailOtpLoginOrSignup } from '../hooks/useEmailOtpLoginOrSignup';
import { StytchMutationKey, onAuthenticateSuccess, onDiscoveryAuthenticateSuccess, useMutate } from '../utils';
import { getTranslatedError } from '../../../utils/getTranslatedError';

export const EmailOTPEntryScreen = () => {
  const stytchClient = useStytch();
  const config = useConfig();
  const { t } = useLingui();

  const [state, dispatch] = useGlobalReducer();
  const { codeExpiration } = state.formState.otpState;

  const { userSuppliedEmail } = state.formState.emailState;

  const {
    trigger: sendOtp,
    isMutating: isSendingOtp,
    error: sendOtpError,
  } = useEmailOtpLoginOrSignup({
    throwOnError: true,
  });
  const {
    trigger: sendOtpDiscovery,
    isMutating: isSendingDiscovery,
    error: sendDiscoveryError,
    reset: resetSendDiscovery,
    // Throw on error to ensure promise is rejected
  } = useEmailOtpDiscoverySend({ throwOnError: true });

  const isSending = isSendingDiscovery || isSendingOtp;
  const sendError = sendDiscoveryError || sendOtpError;

  const {
    trigger: discoveryAuthenticate,
    isMutating: isDiscoveryAuthenticating,
    error: discoveryAuthenticateError,
    reset: resetDiscoveryAuthenticate,
  } = useMutate<B2BDiscoveryOTPEmailAuthenticateResponse, unknown, StytchMutationKey, { otp: string; email: string }>(
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
    },
  );

  const {
    trigger: authenticate,
    isMutating: isAuthenticating,
    error: authenticateError,
    reset: resetAuthenticate,
  } = useMutate<
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
    },
  );

  const isAuthenticatingAny = isDiscoveryAuthenticating || isAuthenticating;
  const error = discoveryAuthenticateError || authenticateError || sendError;
  const errorMessage = error ? getTranslatedError(error as StytchAPIError, t) : undefined;

  const resetAll = () => {
    resetDiscoveryAuthenticate();
    resetAuthenticate();
    resetSendDiscovery();
  };

  const handleSubmit = (otp: string) => {
    resetAll();

    if (state.flowState.type === AuthFlowType.Discovery) {
      discoveryAuthenticate({ otp, email: userSuppliedEmail });
    } else if (
      state.flowState.type === AuthFlowType.Organization &&
      state.flowState.organization &&
      state.formState.emailState.userSuppliedEmail
    ) {
      authenticate({
        otp,
        emailAddress: state.formState.emailState.userSuppliedEmail,
        organizationId: state.flowState.organization.organization_id,
        sessionDurationMinutes: config.sessionOptions.sessionDurationMinutes,
      });
    }
  };

  const handleResendOTP = async () => {
    resetAll();

    if (!isSending) {
      if (state.flowState.type === AuthFlowType.Discovery) {
        await sendOtpDiscovery({ email: userSuppliedEmail });
      } else if (state.flowState.type === AuthFlowType.Organization && state.flowState.organization) {
        await sendOtp({
          email: userSuppliedEmail,
          organization_id: state.flowState.organization.organization_id,
        });
      }
    }
  };

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrow onClick={handleBack} />
      {codeExpiration !== null ? (
        <SentOTPEntry
          isSubmitting={isAuthenticatingAny}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
          expiration={codeExpiration}
          formattedDestination={userSuppliedEmail}
          resendOTP={handleResendOTP}
        />
      ) : (
        <LoadingScreen />
      )}
    </Flex>
  );
};
