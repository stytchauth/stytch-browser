import React, { useEffect } from 'react';
import { DEFAULT_OTP_EXPIRATION_MINUTES } from '@stytch/core';
import { StytchEventType, OTPMethods, Products, StytchAPIError } from '@stytch/core/public';

import { Flex } from '../../../components/Flex';
import { OTPAuthenticate } from './OTPAuthenticate';
import { EmailConfirmation } from './EmailConfirmation';
import BackArrowIcon from '../../../../assets/backArrow';
import { convertMagicLinkOptions, convertPasswordResetOptions } from '../../../../utils';
import {
  useGlobalReducer,
  useStytch,
  AppScreens,
  useConfig,
  useEventCallback,
  useErrorCallback,
} from '../../GlobalContextProvider';
import { Divider } from '../../../components/Divider';
import { PasswordNewUser } from '../Password/PasswordNewUser';
import { PasswordAuthenticate } from '../Password/PasswordAuthenticate';
import { PasswordlessCreate } from '../Password/PasswordlessCreate';
import { PasswordSecondaryMethod } from '../Password/PasswordSecondaryMethod';

export const Password = () => {
  const config = useConfig();
  const stytchClient = useStytch();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();
  const [state, dispatch] = useGlobalReducer();

  const email = state.formState.passwordState.email;
  const otpMethods = config?.otpOptions?.methods ?? [];
  const hasEmailMagicLink = config.products.includes(Products.emailMagicLinks) && !!config.emailMagicLinksOptions;
  const hasOTPEmail = otpMethods.includes(OTPMethods.Email);
  const secondaryType = hasOTPEmail ? 'otp' : hasEmailMagicLink ? 'eml' : '';
  const userType = state.formState.passwordState.type;

  const emailOptions = config.emailMagicLinksOptions;
  const passwordOptions = config.passwordOptions;

  useEffect(() => {
    // If userType is not passwordless do not continue in running the effect
    if (userType !== 'passwordless') {
      return;
    }

    switch (secondaryType) {
      case 'eml': {
        stytchClient.magicLinks.email
          .loginOrCreate(email, convertMagicLinkOptions(emailOptions))
          .then((data) => {
            onEvent({
              type: StytchEventType.MagicLinkLoginOrCreateEvent,
              data: { ...data, email },
            });
            dispatch({ type: 'set_magic_link_email', email });
          })
          .catch((e: Error) => {
            onError(e);
          });
        return;
      }
      case 'otp': {
        stytchClient.otps.email
          .loginOrCreate(email, {
            expiration_minutes: config.otpOptions?.expirationMinutes ?? DEFAULT_OTP_EXPIRATION_MINUTES,
          })
          .then((data) => {
            onEvent({ type: StytchEventType.OTPsLoginOrCreateEvent, data });
            dispatch({
              type: 'update_otp_state',
              otpState: {
                type: OTPMethods.Email,
                methodId: data.method_id,
                otpDestination: email,
              },
            });
          })
          .catch((e: Error) => {
            onError(e);
          });
        return;
      }
      default: {
        stytchClient.passwords
          .resetByEmailStart(convertPasswordResetOptions(email, passwordOptions))
          .then((data) => {
            onEvent({ type: StytchEventType.PasswordResetByEmailStart, data });
            dispatch({ type: 'transition', screen: AppScreens.PasswordSetNew });
          })
          .catch((e: StytchAPIError) => {
            onError(e);
          });
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, [userType, secondaryType]);

  const ComponentToUserType = {
    new: (
      <>
        {secondaryType && (
          <>
            <PasswordSecondaryMethod secondaryType={secondaryType} />
            <Divider />
          </>
        )}
        <PasswordNewUser />
      </>
    ),
    password: (
      <>
        <PasswordAuthenticate />
        {secondaryType && (
          <>
            <Divider />
            <PasswordSecondaryMethod secondaryType={secondaryType} />
          </>
        )}
      </>
    ),
    passwordless: (
      <>
        <>
          {secondaryType && (
            <>
              {secondaryType === 'eml' ? <EmailConfirmation /> : <OTPAuthenticate hideBackArrow={true} />}
              <Divider />
              <PasswordlessCreate />
            </>
          )}
        </>
      </>
    ),
  };

  return (
    <Flex gap={24} direction="column">
      <BackArrowIcon onClick={() => dispatch({ type: 'transition', screen: AppScreens.Main })} />
      {ComponentToUserType[userType]}
    </Flex>
  );
};
