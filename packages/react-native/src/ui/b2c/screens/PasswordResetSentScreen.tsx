import React, { useState } from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { PageTitle } from '../components/PageTitle';
import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { OTPMethods, RNUIProducts } from '@stytch/core/public';
import { useConfig, useGlobalReducer, useTheme } from '../ContextProvider';
import { StytchAlertDialog } from '../components/StytchAlertDialog';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';
import { TouchableWithoutFeedback, View } from 'react-native';
import { CaptionText } from '../components/CaptionText';
import { BodyText } from '../components/BodyText';
import { DividerWithText } from '../components/DividerWithText';
import { StytchTextButton } from '../components/StytchTextButton';

export const PasswordResetSentScreen = () => {
  const [state] = useGlobalReducer();
  const config = useConfig();
  const theme = useTheme();
  const { sendEML } = useEmlLoginOrCreate();
  const { sendEmailOTP } = useOTPEmailLoginOrCreate();
  const { resetPasswordByEmailStart } = usePasswordsResetByEmailStart();
  const hasEML = config.products.includes(RNUIProducts.emailMagicLinks);
  const hasEOTP = config.products.includes(RNUIProducts.otp) && config.otpOptions.methods.includes(OTPMethods.Email);
  const [showResendDialog, setShowResendDialog] = useState(false);
  // this should never be the case, but if we don't know the reset type, assume there is no password
  const resetType = state.userState.password.resetType ?? 'none';
  const recipient = state.userState.emailAddress.emailAddress;
  let pageTitle: string;
  let bodyText: string;
  switch (resetType) {
    case 'breached':
      pageTitle = 'Check your email to set a new password';
      bodyText = `A different site where you use the same password had a security issue recently. For your safety, an email was sent to you at ${recipient} to reset your password.`;
      break;
    case 'dedupe':
      pageTitle = 'Check your email to set a new password';
      bodyText = `We want to make sure your account is secure and that it’s really you logging in! A login link was sent to you at ${recipient}.`;
      break;
    case 'forgot':
      pageTitle = 'Forgot password?';
      bodyText = `A link to reset your password was sent to you at ${recipient}.`;
      break;
    case 'none':
      pageTitle = 'Check your email to set a new password';
      bodyText = `A login link was sent to you at ${recipient} to create a password for your account.`;
      break;
  }
  return (
    <>
      <ScreenWrapper testID="PasswordResetSentScreen">
        <PageTitle title={pageTitle} textAlign="left" />
        <BodyText text={bodyText} />
        <TouchableWithoutFeedback onPress={() => setShowResendDialog(true)} testID="ShowResendDialogButton">
          <View>
            <CaptionText text="Didn’t get it? Resend link." color={theme.secondaryTextColor} />
          </View>
        </TouchableWithoutFeedback>
        {(hasEML || hasEOTP) && (
          <>
            <DividerWithText text="or" />
            <StytchTextButton
              text={(hasEML && 'Email me a login link') || 'Email me a login code'}
              onPress={(hasEML && sendEML) || sendEmailOTP}
            />
          </>
        )}
      </ScreenWrapper>
      {showResendDialog && (
        <StytchAlertDialog
          onDismiss={() => setShowResendDialog(false)}
          title="Resend link"
          body={`A new link will be sent to ${recipient}`}
          cancelText="Cancel"
          acceptText="Send link"
          onAccept={() => {
            setShowResendDialog(false);
            resetPasswordByEmailStart(resetType);
          }}
        />
      )}
    </>
  );
};
