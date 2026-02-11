import React, { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { DEFAULT_OTP_EXPIRATION_MINUTES } from '@stytch/core';
import { StytchEventType, OTPMethods } from '@stytch/core/public';

import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import Button from '../../../components/Button';

import { convertMagicLinkOptions } from '../../../../utils';
import {
  useGlobalReducer,
  useStytch,
  AppScreens,
  useConfig,
  useEventCallback,
  useErrorCallback,
} from '../../GlobalContextProvider';

export const PasswordSecondaryMethod = ({ secondaryType }: { secondaryType: 'eml' | 'otp' }) => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const config = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const [, setIsSubmitting] = useState(false);
  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const emailOptions = config.emailMagicLinksOptions;

  const email = state.formState.passwordState.email;
  const userType = state.formState.passwordState.type;

  const sendLink = () => {
    stytchClient.magicLinks.email
      .loginOrCreate(email, convertMagicLinkOptions(emailOptions))
      .then((data) => {
        onEvent({ type: StytchEventType.MagicLinkLoginOrCreateEvent, data: { ...data, email } });
        setIsSubmitting(false);
        dispatch({ type: 'set_magic_link_email', email: email });
        dispatch({ type: 'transition', screen: AppScreens.EmailConfirmation });
      })
      .catch((e: Error) => {
        onError(e);
        setIsSubmitting(false);
      });
  };

  const sendCode = () => {
    stytchClient.otps.email
      .loginOrCreate(email, {
        expiration_minutes: config.otpOptions?.expirationMinutes ?? DEFAULT_OTP_EXPIRATION_MINUTES,
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
      })
      .catch((e: Error) => {
        onError(e);
        setIsSubmitting(false);
      });
  };

  const buttonText =
    secondaryType === 'eml'
      ? t({
          id: 'button.emailMagicLink',
          message: 'Email me a login link',
        })
      : t({
          id: 'button.emailOTP',
          message: 'Email me a login code',
        });
  const buttonOnClick = secondaryType === 'eml' ? sendLink : sendCode;

  const NewUser = () => (
    <Flex direction="column" gap={36}>
      <Text size="header">
        {t({
          id: 'createAccount.title',
          message: 'Choose how you would like to create your account.',
        })}
      </Text>
      <Button type="button" onClick={buttonOnClick}>
        {buttonText}
      </Button>
    </Flex>
  );

  const PasswordUser = () => (
    <Button type="button" variant="text" onClick={buttonOnClick}>
      {buttonText}
    </Button>
  );

  const ComponentToUserType = {
    new: <NewUser />,
    password: <PasswordUser />,
    passwordless: null,
  };
  return ComponentToUserType[userType];
};
