import React, { useEffect, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';

import { DEFAULT_OTP_EXPIRATION_MINUTES, DEFAULT_SESSION_DURATION_MINUTES } from '@stytch/core';
import { OTPMethods, StytchAPIError, StytchEventType } from '@stytch/core/public';
import { EmailSentType } from '@stytch/core';
import BackArrowIcon from '../../../../assets/backArrow';
import { readB2CInternals } from '../../../../utils/internal';
import { Flex } from '../../../components/Flex';
import { SentOTPEntry } from '../../../components/SentOTPEntry';
import { formatNumber } from '../../../../utils/handleParsePhoneNumber';
import { getTranslatedError } from '../../../../utils/getTranslatedError';

export const OTPAuthenticate = ({ hideBackArrow = false }: { hideBackArrow?: boolean }) => {
  const { t } = useLingui();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const destination = state.formState.otpState.otpDestination;
  const selectionMethod = state.formState.otpState.type;
  const [errorMessage, setErrorMessage] = useState('');
  const [resendErrorMessage, setResendErrorMessage] = useState('');
  const [formattedDestination, setFormattedDestination] = useState(destination);

  const calculateExpiration = () =>
    new Date(Date.now() + 1000 * 60 * (config.otpOptions?.expirationMinutes ?? DEFAULT_OTP_EXPIRATION_MINUTES));

  useEffect(() => {
    const parseDestination = async () => {
      const parsePhoneNumber = (phoneNumber: string) =>
        readB2CInternals(stytchClient).clientsideServices.parsedPhoneNumber({ phoneNumber });

      const national = await formatNumber({
        parsePhoneNumber,
        phoneNumber: destination,
      });

      setFormattedDestination(selectionMethod === OTPMethods.Email ? destination : national);
    };

    parseDestination();
  }, [selectionMethod, destination, stytchClient]);

  const [expiration, setExpiration] = useState(calculateExpiration);

  const resendOTP = async () => {
    if (selectionMethod === OTPMethods.Email) {
      readB2CInternals(stytchClient).networkClient.logEvent({
        name: 'email_try_again_clicked',
        details: { email: destination, type: EmailSentType.LoginOrCreateOTP },
      });
    }

    try {
      const data = await stytchClient.otps[selectionMethod].loginOrCreate(destination, {
        expiration_minutes: config.otpOptions?.expirationMinutes ?? DEFAULT_OTP_EXPIRATION_MINUTES,
      });

      onEvent({ type: StytchEventType.OTPsLoginOrCreateEvent, data });
      setExpiration(calculateExpiration());
      dispatch({
        type: 'update_otp_state',
        otpState: {
          type: selectionMethod,
          methodId: data.method_id,
          otpDestination: destination,
        },
      });
    } catch (e: unknown) {
      onError(e as StytchAPIError);
      setResendErrorMessage(getTranslatedError(e as StytchAPIError, t));
      throw e;
    }
  };
  const handleSubmit = async (otp: string) => {
    setIsSubmitting(true);
    stytchClient.otps
      .authenticate(otp, state.formState.otpState.methodId, {
        session_duration_minutes: config.sessionOptions?.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
      })
      .then((data) => {
        onEvent({ type: StytchEventType.OTPsAuthenticate, data });
        setIsSubmitting(false);
        dispatch({
          type: 'transition',
          screen: AppScreens.OTPConfirmation,
        });
      })
      .catch((e: StytchAPIError) => {
        onError(e);
        setIsSubmitting(false);
        setErrorMessage(getTranslatedError(e, t));
      });
  };

  return (
    <Flex direction="column" gap={24}>
      {!hideBackArrow && <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />}

      <SentOTPEntry
        expiration={expiration}
        formattedDestination={formattedDestination}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        resendOTP={resendOTP}
        errorMessage={errorMessage}
        resendErrorMessage={resendErrorMessage}
      />
    </Flex>
  );
};
