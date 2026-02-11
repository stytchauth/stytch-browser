import React, { useEffect, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { AuthType, CodeEntry } from '../components/CodeEntry';
import { PageTitle } from '../components/PageTitle';
import { BodyText } from '../components/BodyText';
import { CaptionText } from '../components/CaptionText';
import { StytchAlertDialog } from '../components/StytchAlertDialog';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { AuthFlowType } from '@stytch/core/public';
import { useEmailOTPEmailLoginOrSignup } from '../hooks/useEmailOTPEmailLoginOrSignup';
import { useEmailOTPEmailDiscoverySend } from '../hooks/useEmailOTPEmailDiscoverySend';

export const EmailOTPEntryScreen = () => {
  const theme = useTheme();
  const [state] = useGlobalReducer();
  const [countdownTimeString, setCountdownTimeString] = useState(`10:00`);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const { emailOTPEmailLoginOrSignup } = useEmailOTPEmailLoginOrSignup();
  const { emailOTPEmailDiscoverySend } = useEmailOTPEmailDiscoverySend();

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
    setCountdownFromSeconds(10 * 60);
  }, [setCountdownTimeString]);

  return (
    <>
      <ScreenWrapper testID="EmailOTPEntryScreen">
        <PageTitle title="Enter verification code" />
        <BodyText text={`A 6-digit passcode was sent to you at ${state.memberState.emailAddress.emailAddress}.`} />
        <CodeEntry authType={AuthType.OTP_EMAIL} />
        <TouchableWithoutFeedback onPress={() => setShowResendDialog(true)} testID="ShowResendDialogButton">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <CaptionText
              text={`Your code expires in ${countdownTimeString}. Didn’t get it?`}
              color={theme.secondaryTextColor}
            />
            <CaptionText text={`Resend code.`} color={theme.secondaryTextColor} fontName="IBMPlexSans_Bold" />
          </View>
        </TouchableWithoutFeedback>
      </ScreenWrapper>
      {showResendDialog && (
        <StytchAlertDialog
          onDismiss={() => setShowResendDialog(false)}
          title="Resend code"
          body={`A new code will be sent to ${state.memberState.emailAddress.emailAddress}`}
          cancelText="Cancel"
          acceptText="Send code"
          onAccept={() => {
            setShowResendDialog(false);
            if (state.authenticationState.authFlowType == AuthFlowType.Organization) {
              emailOTPEmailLoginOrSignup();
            } else {
              emailOTPEmailDiscoverySend();
            }
            setCountdownFromSeconds(2 * 60);
          }}
        />
      )}
    </>
  );
};
