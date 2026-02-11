import { useLingui } from '@lingui/react/macro';
import { DEFAULT_OTP_EXPIRATION_MINUTES, DEFAULT_SESSION_DURATION_MINUTES, EmailSentType } from '@stytch/core';
import { OTPMethods, StytchAPIError, StytchEventType } from '@stytch/core/public';
import React, { useEffect, useState } from 'react';

import { getTranslatedError } from '../../../../utils/getTranslatedError';
import { formatNumber } from '../../../../utils/handleParsePhoneNumber';
import { readB2CInternals } from '../../../../utils/internal';
import Button from '../../../components/atoms/Button';
import Column from '../../../components/atoms/Column';
import { useCountdown } from '../../../components/atoms/Countdown';
import ButtonColumn from '../../../components/molecules/ButtonColumn';
import { ResendOTPButton } from '../../../components/organisms/ResendOTPButton';
import { SentOTPEntry } from '../../../components/organisms/SentOTPEntry';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';

export const OTPAuthenticate = ({ hideBackButton = false }: { hideBackButton?: boolean }) => {
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
  const [formattedDestination, setFormattedDestination] = useState(destination);

  const calculateExpiration = () =>
    Date.now() + 1000 * 60 * (config.otpOptions?.expirationMinutes ?? DEFAULT_OTP_EXPIRATION_MINUTES);

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
  const resendCountdown = useCountdown();

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
      setErrorMessage(getTranslatedError(e as StytchAPIError, t));
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
        resendCountdown.clear();
        setIsSubmitting(false);
        setErrorMessage(getTranslatedError(e, t));
      });
  };

  return (
    <Column gap={6}>
      <SentOTPEntry
        expiration={expiration}
        formattedDestination={formattedDestination}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        errorMessage={errorMessage}
      />

      <ButtonColumn>
        <ResendOTPButton countdown={resendCountdown} resendOTP={resendOTP} isSubmitting={isSubmitting} />

        {!hideBackButton && (
          <Button variant="ghost" onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })}>
            {t({ id: 'button.goBack', message: 'Go back' })}
          </Button>
        )}
      </ButtonColumn>
    </Column>
  );
};
