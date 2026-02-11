import { OTPMethods, RNUIProducts } from '@stytch/core/public';
import React from 'react';
import { View } from 'react-native';

import { BodyText } from '../components/BodyText';
import { DividerWithText } from '../components/DividerWithText';
import { EmailEntryForm } from '../components/EmailEntryForm';
import { PageTitle } from '../components/PageTitle';
import { PasswordEntryForm } from '../components/PasswordEntryForm';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchButton } from '../components/StytchButton';
import { useConfig, useGlobalReducer } from '../ContextProvider';
import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { usePasswordsCreate } from '../hooks/passwordsCreate';

export const NewUserScreen = () => {
  const config = useConfig();
  const [state] = useGlobalReducer();
  const { sendEML } = useEmlLoginOrCreate();
  const { sendEmailOTP } = useOTPEmailLoginOrCreate();
  const hasEML = config.products.includes(RNUIProducts.emailMagicLinks);
  const hasEOTP = config.products.includes(RNUIProducts.otp) && config.otpOptions.methods.includes(OTPMethods.Email);
  const hasPasswords = config.products.includes(RNUIProducts.passwords);
  const { createPassword } = usePasswordsCreate();
  const userState = state.userState;

  return (
    <ScreenWrapper testID="NewUserScreen">
      {((hasEML || hasEOTP) && (
        <>
          <PageTitle title="Choose how you would like to create your account." textAlign="left" />
          <StytchButton
            enabled={true}
            text={(hasEML && 'Email me a login link') || 'Email me a login code'}
            onPress={(hasEML && sendEML) || sendEmailOTP}
          />
          {hasPasswords && (
            <>
              <View style={{ height: 24 }} />
              <DividerWithText text="or" />
              <BodyText text="Finish creating your account by setting a password." />
            </>
          )}
        </>
      )) ||
        (hasPasswords && <PageTitle title="Create Account" textAlign="left" />)}
      {hasPasswords && (
        <>
          <EmailEntryForm />
          <PasswordEntryForm />
          <StytchButton
            enabled={
              userState.emailAddress.isValid == true &&
              userState.password.passwordStrengthCheckResponse?.valid_password == true
            }
            text="Continue"
            onPress={createPassword}
          />
        </>
      )}
    </ScreenWrapper>
  );
};
