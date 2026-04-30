import { useLingui } from '@lingui/react/macro';
import { DEFAULT_OTP_EXPIRATION_MINUTES } from '@stytch/core';
import { OTPMethods, StytchEventType, StytchSDKAPIError } from '@stytch/core/public';
import { useState } from 'react';

import { convertMagicLinkOptions } from '../../../../utils';
import { getTranslatedError } from '../../../../utils/getTranslatedError';
import { errorToast } from '../../../components/atoms/Toast';
import {
  useConfig,
  useErrorCallback,
  useEventCallback,
  useGlobalReducer,
  useStytch,
} from '../../GlobalContextProvider';

export function usePasswordlessAuthenticate() {
  const { t } = useLingui();

  const stytchClient = useStytch();
  const { emailMagicLinksOptions, otpOptions } = useConfig();
  const [state, dispatch] = useGlobalReducer();
  const onEvent = useEventCallback();
  const onError = useErrorCallback();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const email =
    state.formState.magicLinkState.email !== ''
      ? state.formState.magicLinkState.email
      : state.formState.passwordState.email;

  const sendLink = async () => {
    setIsSubmitting(true);

    try {
      const data = await stytchClient.magicLinks.email.loginOrCreate(
        email,
        convertMagicLinkOptions(emailMagicLinksOptions),
      );
      onEvent({ type: StytchEventType.MagicLinkLoginOrCreateEvent, data: { ...data, email } });
      dispatch({ type: 'set_magic_link_email', email: email });
    } catch (e) {
      onError(e as StytchSDKAPIError);
      errorToast({ message: getTranslatedError(e as StytchSDKAPIError, t) });
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendCode = async () => {
    setIsSubmitting(true);

    try {
      const data = await stytchClient.otps.email.loginOrCreate(email, {
        expiration_minutes: otpOptions?.expirationMinutes ?? DEFAULT_OTP_EXPIRATION_MINUTES,
        locale: otpOptions?.locale,
      });
      onEvent({ type: StytchEventType.OTPsLoginOrCreateEvent, data });
      dispatch({
        type: 'update_otp_state',
        otpState: {
          type: OTPMethods.Email,
          methodId: data.method_id,
          otpDestination: email,
        },
      });
    } catch (e) {
      onError(e as StytchSDKAPIError);
      errorToast({ message: getTranslatedError(e as StytchSDKAPIError, t) });
      throw e;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    sendLink,
    sendCode,
    isSubmitting,
  };
}
