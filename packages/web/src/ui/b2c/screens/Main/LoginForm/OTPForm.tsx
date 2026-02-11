import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { CountryCode, DEFAULT_OTP_EXPIRATION_MINUTES, EmailSentType } from '@stytch/core';
import { OTPMethods, StytchAPIError, StytchEventType } from '@stytch/core/public';
import React, { useState } from 'react';

import { EMAIL_REGEX } from '../../../../../utils';
import { getTranslatedError } from '../../../../../utils/getTranslatedError';
import { formatNumberToIncludeCountryCode } from '../../../../../utils/handleParsePhoneNumber';
import { readB2CInternals } from '../../../../../utils/internal';
import Button from '../../../../components/atoms/Button';
import Column from '../../../../components/atoms/Column';
import EmailInput from '../../../../components/molecules/EmailInput';
import PhoneInput, { getPhoneNumberProps } from '../../../../components/molecules/PhoneInput';
import {
  AppScreens,
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../../GlobalContextProvider';
import { hasProduct } from '../../../utils';

export const OTPButtonText = {
  [OTPMethods.SMS]: msg({ id: 'button.sms', message: 'Continue with text message' }),
  [OTPMethods.WhatsApp]: msg({ id: 'button.whatsapp', message: 'Continue with WhatsApp' }),
  [OTPMethods.Email]: msg({ id: 'button.emailLogin', message: 'Continue with email' }),
};

export const OTPEmailForm = () => {
  const { t } = useLingui();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const stytchClient = useStytch();
  const config = useConfig();
  const [, dispatch] = useGlobalReducer();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const hasPasskeys = hasProduct(config.products, 'passkeys');

  const stopSubmit = (errorText: string) => {
    onError({ message: errorText });
    setIsSubmitting(false);
    return setErrorMessage(errorText);
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email.match(EMAIL_REGEX))
      return stopSubmit(t({ id: 'errors.invalidEmail', message: 'Invalid email address.' }));

    setErrorMessage('');
    setIsSubmitting(true);

    stytchClient.otps.email
      .loginOrCreate(email, {
        expiration_minutes: config.otpOptions?.expirationMinutes ?? DEFAULT_OTP_EXPIRATION_MINUTES,
        login_template_id: config.otpOptions?.loginTemplateId,
        signup_template_id: config.otpOptions?.signupTemplateId,
        locale: config.otpOptions?.locale,
      })
      .then((data) => {
        setIsSubmitting(false);
        onEvent({ type: StytchEventType.OTPsLoginOrCreateEvent, data });
        dispatch({
          type: 'update_otp_state',
          otpState: {
            type: OTPMethods.Email,
            methodId: data.method_id,
            otpDestination: email,
          },
        });
        dispatch({ type: 'transition', screen: AppScreens.OTPAuthenticate });
        readB2CInternals(stytchClient).networkClient.logEvent({
          name: 'email_sent',
          details: { email: email, type: EmailSentType.LoginOrCreateOTP },
        });
      })
      .catch((e: StytchAPIError) => {
        onError(e);
        setIsSubmitting(false);
        setErrorMessage(getTranslatedError(e, t));
      });
  };

  return (
    <Column as="form" onSubmit={handleEmailSubmit} gap={4}>
      <EmailInput email={email} setEmail={setEmail} hasPasskeys={hasPasskeys} hideLabel error={errorMessage} />
      <Button variant="primary" loading={isSubmitting} type="submit">
        {t(OTPButtonText[OTPMethods.Email])}
      </Button>
    </Column>
  );
};

export const PhoneForm = ({ method }: { method: OTPMethods }) => {
  const { t } = useLingui();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const stytchClient = useStytch();
  const config = useConfig();
  const [, dispatch] = useGlobalReducer();
  const [phoneNumber, setPhoneNumber] = useState('');
  // eslint-disable-next-line lingui/no-unlocalized-strings
  const [country, setCountry] = useState<CountryCode>('US');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const hasPasskeys = hasProduct(config.products, 'passkeys');

  const stopSubmit = (errorText: string) => {
    onError({ message: errorText });
    setIsSubmitting(false);
    setErrorMessage(errorText);
  };

  const { parsePhoneNumber, getExampleNumber } = getPhoneNumberProps(readB2CInternals(stytchClient).clientsideServices);

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsedNumber = await formatNumberToIncludeCountryCode({
      parsePhoneNumber,
      phoneNumber,
      country,
    });

    if (!parsedNumber.isValid) {
      return stopSubmit(
        t({
          id: 'error.invalidPhoneNumber',
          message: 'Phone number format is invalid. Ensure the phone number is in the E.164 format.',
        }),
      );
    }

    setIsSubmitting(true);
    setErrorMessage('');

    stytchClient.otps[method]
      .loginOrCreate(parsedNumber.number, {
        expiration_minutes: config.otpOptions?.expirationMinutes ?? DEFAULT_OTP_EXPIRATION_MINUTES,
      })
      .then((data) => {
        setIsSubmitting(false);
        onEvent({ type: StytchEventType.OTPsLoginOrCreateEvent, data });
        dispatch({
          type: 'update_otp_state',
          otpState: {
            type: method,
            methodId: data.method_id,
            otpDestination: parsedNumber.number,
          },
        });
        dispatch({ type: 'transition', screen: AppScreens.OTPAuthenticate });
      })
      .catch((e: StytchAPIError) => {
        onError(e);
        setIsSubmitting(false);
        setErrorMessage(getTranslatedError(e, t));
      });
  };
  return (
    <Column as="form" gap={4} onSubmit={handlePhoneSubmit}>
      <PhoneInput
        phone={phoneNumber}
        setPhone={setPhoneNumber}
        country={country}
        setCountry={setCountry}
        parsePhoneNumber={parsePhoneNumber}
        getExampleNumber={getExampleNumber}
        hasPasskeys={hasPasskeys}
        error={errorMessage}
      />

      <Button variant="primary" loading={isSubmitting} type="submit">
        {t(OTPButtonText[method])}
      </Button>
    </Column>
  );
};
