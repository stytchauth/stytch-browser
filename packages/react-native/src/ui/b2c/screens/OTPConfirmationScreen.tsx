import { RNUIProducts } from '@stytch/core/public';
import parsePhoneNumberFromString from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import { BodyText } from '../components/BodyText';
import { CaptionText } from '../components/CaptionText';
import { DividerWithText } from '../components/DividerWithText';
import { OTPEntry } from '../components/OTPEntry';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchAlertDialog } from '../components/StytchAlertDialog';
import { StytchTextButton } from '../components/StytchTextButton';
import { useConfig, useGlobalReducer, useTheme } from '../ContextProvider';
import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { useOTPSmsLoginOrCreate } from '../hooks/otpSmsLoginOrCreate';
import { useOTPWhatsappLoginOrCreate } from '../hooks/otpWhatsappLoginOrCreate';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';

export const OTPConfirmationScreen = () => {
  const theme = useTheme();
  const config = useConfig();
  const [state] = useGlobalReducer();
  const { sendEmailOTP } = useOTPEmailLoginOrCreate();
  const { sendSMSOTP } = useOTPSmsLoginOrCreate();
  const { sendWhatsAppOTP } = useOTPWhatsappLoginOrCreate();
  const { resetPasswordByEmailStart } = usePasswordsResetByEmailStart();
  const [showResendDialog, setShowResendDialog] = useState(false);
  let recipient: string | undefined;
  switch (state.authenticationState.otpMethod) {
    case 'email':
      recipient = state.userState.emailAddress.emailAddress;
      break;
    case 'sms':
    case 'whatsapp':
      recipient = parsePhoneNumberFromString(
        `${state.userState.phoneNumber.countryCode} ${state.userState.phoneNumber.phoneNumber}`,
      )?.formatNational();
      break;
  }
  const [countdownTimeString, setCountdownTimeString] = useState(`${config.otpOptions.expirationMinutes}:00`);
  const setCountdownFromSeconds = (initialSeconds: number) => {
    let currentSeconds = initialSeconds;
    const interval = setInterval(() => {
      currentSeconds -= 1;
      if (currentSeconds < 0) {
        clearInterval(interval);
        return;
      }
      const minutes = Math.floor(currentSeconds / 60);
      const seconds = currentSeconds - minutes * 60;
      const timeString = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
      setCountdownTimeString(timeString);
    }, 1000);
  };
  useEffect(() => {
    setCountdownFromSeconds(config.otpOptions.expirationMinutes * 60);
  }, [setCountdownTimeString, config.otpOptions.expirationMinutes]);
  return (
    <>
      <ScreenWrapper testID="OTPConfirmationScreen">
        <PageTitle title="Enter Passcode" textAlign="left" />
        <BodyText text={`A 6-digit passcode was sent to you at ${recipient}.`} />
        <OTPEntry />
        <TouchableWithoutFeedback onPress={() => setShowResendDialog(true)} testID="ShowResendDialogButton">
          <View>
            <CaptionText
              text={`Your code expires in ${countdownTimeString}. Didn’t get it? Resend code.`}
              color={theme.secondaryTextColor}
            />
          </View>
        </TouchableWithoutFeedback>
        {state.userState.userType != 'new' &&
          config.products.includes(RNUIProducts.passwords) &&
          state.userState.emailAddress.emailAddress && (
            <>
              <DividerWithText text="or" />
              <StytchTextButton
                text="Create a password instead"
                onPress={() => {
                  resetPasswordByEmailStart('none');
                }}
              />
            </>
          )}
      </ScreenWrapper>
      {showResendDialog && (
        <StytchAlertDialog
          onDismiss={() => setShowResendDialog(false)}
          title="Resend code"
          body={`A new code will be sent to ${recipient}`}
          cancelText="Cancel"
          acceptText="Send code"
          onAccept={() => {
            setShowResendDialog(false);
            switch (state.authenticationState.otpMethod) {
              case 'email':
                sendEmailOTP();
                break;
              case 'sms':
                sendSMSOTP();
                break;
              case 'whatsapp':
                sendWhatsAppOTP();
                break;
            }
            setCountdownFromSeconds(config.otpOptions.expirationMinutes * 60);
          }}
        />
      )}
    </>
  );
};
