import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import React, { useState } from 'react';
import { DEFAULT_OTP_EXPIRATION_MINUTES, EmailSentType, CountryCode } from '@stytch/core';
import { OTPMethods, StytchEventType, StytchAPIError, Products } from '@stytch/core/public';
import { EMAIL_REGEX } from '../../../../../utils';
import {
  useConfig,
  useGlobalReducer,
  AppScreens,
  useStytch,
  useErrorCallback,
  useEventCallback,
} from '../../../GlobalContextProvider';
import { PhoneInput } from '../../../../components/PhoneInput';
import { EmailInput } from '../../../../components/EmailInput';
import { SubmitButton } from '../../../../components/SubmitButton';
import { Flex } from '../../../../components/Flex';
import { ErrorText } from '../../../../components/ErrorText';
import { readB2CInternals } from '../../../../../utils/internal';
import { formatNumberToIncludeCountryCode } from '../../../../../utils/handleParsePhoneNumber';
import { getTranslatedError } from '../../../../../utils/getTranslatedError';
import { useErrorProps } from '../../../../../utils/accessibility';

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

  const hasPasskeys = config.products.includes(Products.passkeys);
  const emailProps = useErrorProps(errorMessage);
  const emailInputLabel = t({ id: 'formField.email.label', message: 'Email' });

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
    <form onSubmit={handleEmailSubmit}>
      <Flex direction="column" gap={8}>
        <Flex direction="column" minHeight={52}>
          <EmailInput
            email={email}
            setEmail={setEmail}
            hasPasskeys={hasPasskeys}
            aria-label={emailInputLabel}
            {...emailProps.input}
          />
          <ErrorText errorMessage={errorMessage} {...emailProps.error} />
        </Flex>
        <SubmitButton isSubmitting={isSubmitting} text={t(OTPButtonText[OTPMethods.Email])} />
      </Flex>
    </form>
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
  const hasPasskeys = config.products.includes(Products.passkeys);
  const phoneProps = useErrorProps(errorMessage);
  const phoneInputLabel = t({ id: 'formField.phone.label', message: 'Phone number' });

  const stopSubmit = (errorText: string) => {
    onError({ message: errorText });
    setIsSubmitting(false);
    return setErrorMessage(errorText);
  };

  const parsePhoneNumber = async (phoneNumber: string, countryCode?: string) => {
    return readB2CInternals(stytchClient).clientsideServices.parsedPhoneNumber({
      phoneNumber,
      regionCode: countryCode,
    });
  };

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
    <form onSubmit={handlePhoneSubmit}>
      <Flex direction="column" gap={8}>
        <Flex direction="column" minHeight={52}>
          <PhoneInput
            phone={phoneNumber}
            setPhone={setPhoneNumber}
            country={country}
            setCountry={setCountry}
            parsePhoneNumber={parsePhoneNumber}
            hasPasskeys={hasPasskeys}
            aria-label={phoneInputLabel}
            {...phoneProps.input}
          />
          <ErrorText errorMessage={errorMessage} {...phoneProps.error} />
        </Flex>
        <SubmitButton isSubmitting={isSubmitting} text={t(OTPButtonText[method])} />
      </Flex>
    </form>
  );
};
