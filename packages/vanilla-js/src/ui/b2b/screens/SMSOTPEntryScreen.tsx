import {
  B2BMFAProducts,
  B2BSMSAuthenticateResponse,
  B2BSMSSendResponse,
  StytchAPIError,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import React, { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import BackArrow from '../../../assets/backArrow';
import { readB2BInternals } from '../../../utils/internal';
import Button from '../../components/Button';
import { Divider } from '../../components/Divider';
import { Flex } from '../../components/Flex';
import { LoadingScreen } from '../../components/Loading';
import { SentOTPEntry } from '../../components/SentOTPEntry';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { StytchMutationKey, useMutate } from '../utils';
import { formatNumber } from '../../../utils/handleParsePhoneNumber';
import { useLingui } from '@lingui/react/macro';
import { getTranslatedError } from '../../../utils/getTranslatedError';
import { AppScreens } from '../types/AppScreens';

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
          toast.error(message);
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
    },
  );

  const shouldCreate = codeExpiration === null && !isSending && !sendError;
  useEffect(() => {
    if (shouldCreate) {
      sendSms({ memberId, organizationId, locale: smsOtpOptions?.locale });
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

  return (
    <Flex direction="column" gap={24}>
      {canGoBack && <BackArrow onClick={handleBack} />}
      {codeExpiration !== null ? (
        <SentOTPEntry
          isSubmitting={isAuthenticating}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
          expiration={codeExpiration}
          formattedDestination={formattedDestination ?? memberPhoneNumber ?? ''}
          resendOTP={handleResendOTP}
        />
      ) : (
        <LoadingScreen />
      )}
      {isTotpAvailable && (
        <>
          <Divider />
          <Button type="button" variant="text" onClick={handleSwitchToTotp}>
            {t({ id: 'mfa.methods.authenticatorApp', message: 'Use an authenticator app' })}
          </Button>
        </>
      )}
    </Flex>
  );
};
