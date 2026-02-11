import { useLingui } from '@lingui/react/macro';
import {
  B2BMFAProducts,
  B2BSMSAuthenticateResponse,
  B2BSMSSendResponse,
  StytchAPIError,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import React, { useEffect, useMemo } from 'react';

import { getTranslatedError } from '../../../utils/getTranslatedError';
import { formatNumber } from '../../../utils/handleParsePhoneNumber';
import { readB2BInternals } from '../../../utils/internal';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import { useCountdown } from '../../components/atoms/Countdown';
import { errorToast } from '../../components/atoms/Toast';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import { LoadingScreen } from '../../components/molecules/Loading';
import { ResendOTPButton } from '../../components/organisms/ResendOTPButton';
import { SentOTPEntry } from '../../components/organisms/SentOTPEntry';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { StytchMutationKey, useMutate } from '../utils';

export const SMSOTPEntryScreen = () => {
  const stytchClient = useStytch();
  const {
    sessionOptions: { sessionDurationMinutes },
    smsOtpOptions,
  } = useConfig();
  const { t } = useLingui();

  const [state, dispatch] = useGlobalReducer();
  const {
    mfa: { isEnrolling, smsOtp, primaryInfo },
  } = state;

  const { codeExpiration, formattedDestination } = smsOtp;

  // This screen should only be shown if primary info is available
  const { enrolledMfaMethods, memberId, memberPhoneNumber, organizationId, organizationMfaOptionsSupported } =
    primaryInfo!;

  const resendCountdown = useCountdown();

  const {
    trigger: sendSms,
    isMutating: isSending,
    error: sendError,
  } = useMutate<
    B2BSMSSendResponse,
    unknown,
    StytchMutationKey,
    { memberId: string; organizationId: string; locale?: string }
  >(
    'stytch.otps.sms.send',
    (
      _: string,
      {
        arg: { memberId, organizationId, locale },
      }: { arg: { memberId: string; organizationId: string; locale?: string } },
    ) => {
      dispatch({ type: 'sms_otp/send' });
      return stytchClient.otps.sms.send({ member_id: memberId, organization_id: organizationId, locale });
    },
    {
      onSuccess: (response) => {
        dispatch({ type: 'sms_otp/send_success', response });
      },
      onError: (error) => {
        const message = getTranslatedError(error as StytchAPIError, t);
        if (message) {
          errorToast({ message });
        }
        dispatch({ type: 'sms_otp/send_error', error: message });
      },
      // Throw on error to ensure promise is rejected
      throwOnError: true,
    },
  );

  const {
    trigger: authenticate,
    isMutating: isAuthenticating,
    error: authenticateError,
  } = useMutate<
    B2BSMSAuthenticateResponse<StytchProjectConfigurationInput>,
    unknown,
    StytchMutationKey,
    { otp: string; memberId: string; organizationId: string; sessionDurationMinutes: number }
  >(
    'stytch.otps.sms.authenticate',
    (
      _: string,
      {
        arg: { otp, memberId, organizationId, sessionDurationMinutes },
      }: { arg: { otp: string; memberId: string; organizationId: string; sessionDurationMinutes: number } },
    ) =>
      stytchClient.otps.sms.authenticate({
        code: otp,
        member_id: memberId,
        organization_id: organizationId,
        session_duration_minutes: sessionDurationMinutes,
      }),
    {
      onSuccess: () => {
        dispatch({ type: 'sms_otp/authenticate_success' });
      },
      onError: () => {
        resendCountdown.clear();
      },
    },
  );

  const shouldCreate = codeExpiration === null && !isSending && !sendError;
  useEffect(() => {
    if (shouldCreate) {
      sendSms({ memberId, organizationId, locale: smsOtpOptions?.locale }).catch(() => {
        // error in the UI is handled through the error object so we just swallow it here when auto-sending
      });
    }
  }, [memberId, organizationId, sendSms, shouldCreate, smsOtpOptions?.locale]);

  useEffect(() => {
    if (!formattedDestination && memberPhoneNumber) {
      const handleFormatNumber = async () => {
        const parsePhoneNumber = (phoneNumber: string) =>
          readB2BInternals(stytchClient).clientsideServices.parsedPhoneNumber({
            phoneNumber,
          });

        const national = await formatNumber({
          parsePhoneNumber,
          phoneNumber: memberPhoneNumber,
        });

        dispatch({
          type: 'sms_otp/format_destination',
          formattedPhoneNumber: national,
        });
      };

      handleFormatNumber();
    }
  }, [dispatch, formattedDestination, stytchClient, memberPhoneNumber]);

  const isTotpAvailable = useMemo(
    () =>
      !isEnrolling &&
      enrolledMfaMethods.includes(B2BMFAProducts.totp) &&
      (organizationMfaOptionsSupported.length === 0 || organizationMfaOptionsSupported.includes(B2BMFAProducts.totp)),
    [enrolledMfaMethods, isEnrolling, organizationMfaOptionsSupported],
  );
  const errorMessage = authenticateError
    ? t({ id: 'error.passcodeInvalid', message: 'Invalid passcode, please try again.' })
    : undefined;

  // The user can go back to change their phone number if either:
  // - we are in an enrollment flow
  // - they are not enrolled in any MFA methods at all
  // - they are not enrolled in any of the limited MFA methods supported by the organization
  const canGoBack = useMemo(
    () =>
      isEnrolling ||
      enrolledMfaMethods.length === 0 ||
      (organizationMfaOptionsSupported.length > 0 &&
        !enrolledMfaMethods.some((enrolledMethod) => organizationMfaOptionsSupported.includes(enrolledMethod))),
    [enrolledMfaMethods, isEnrolling, organizationMfaOptionsSupported],
  );

  const handleSubmit = (otp: string) => {
    authenticate({ otp, memberId, organizationId, sessionDurationMinutes });
  };

  const handleSwitchToTotp = () => {
    dispatch({ type: 'transition', history: 'push', screen: AppScreens.TOTPEntry });
  };

  const handleResendOTP = async () => {
    await sendSms({ memberId, organizationId, locale: smsOtpOptions?.locale });
  };

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  const resendButton = (
    <ResendOTPButton countdown={resendCountdown} isSubmitting={isAuthenticating} resendOTP={handleResendOTP} />
  );
  const switchToTotpButton = isTotpAvailable && (
    <Button variant="ghost" onClick={handleSwitchToTotp}>
      {t({ id: 'mfa.methods.authenticatorApp', message: 'Use an authenticator app' })}
    </Button>
  );
  const backButton = canGoBack && (
    <Button variant="ghost" onClick={handleBack}>
      {t({ id: 'button.goBack', message: 'Go back' })}
    </Button>
  );

  return (
    <Column gap={6}>
      {codeExpiration !== null ? (
        <SentOTPEntry
          isSubmitting={isAuthenticating}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
          expiration={codeExpiration.getTime()}
          formattedDestination={formattedDestination ?? memberPhoneNumber ?? ''}
        />
      ) : (
        <LoadingScreen />
      )}

      {switchToTotpButton && backButton ? (
        <ButtonColumn
          top={resendButton}
          bottom={
            <>
              {switchToTotpButton}
              {backButton}
            </>
          }
        />
      ) : (
        <ButtonColumn>
          {resendButton}
          {switchToTotpButton}
          {backButton}
        </ButtonColumn>
      )}
    </Column>
  );
};
