import { OTPMethods, RNUIProducts, StytchAPIError } from '@stytch/core/public';
import React from 'react';
import { View } from 'react-native';

import { DividerWithText } from '../components/DividerWithText';
import { EmailEntryForm } from '../components/EmailEntryForm';
import { PageTitle } from '../components/PageTitle';
import { PasswordEntryForm } from '../components/PasswordEntryForm';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchButton } from '../components/StytchButton';
import { StytchTextButton } from '../components/StytchTextButton';
import { useConfig, useGlobalReducer } from '../ContextProvider';
import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { useOTPEmailLoginOrCreate } from '../hooks/otpEmailLoginOrCreate';
import { usePasswordsAuthenticate } from '../hooks/passwordsAuthenticate';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';

export const ReturningUserScreen = () => {
  const config = useConfig();
  const [state] = useGlobalReducer();
  const { sendEML } = useEmlLoginOrCreate();
  const { sendEmailOTP } = useOTPEmailLoginOrCreate();
  const { authenticatePassword } = usePasswordsAuthenticate();
  const { resetPasswordByEmailStart } = usePasswordsResetByEmailStart();
  const hasEML = config.products.includes(RNUIProducts.emailMagicLinks);
  const hasEOTP = config.products.includes(RNUIProducts.otp) && config.otpOptions.methods.includes(OTPMethods.Email);
  return (
    <ScreenWrapper testID="ReturningUserScreen">
      <PageTitle title="Log in" textAlign="left" />
      <EmailEntryForm editable={false} />
      <PasswordEntryForm skipStrengthCheck={true} />
      <StytchButton
        enabled={
          state.userState.emailAddress.emailAddress != undefined && state.userState.password.password != undefined
        }
        text="Continue"
        onPress={() => {
          authenticatePassword().catch((e) => {
            if (e instanceof StytchAPIError) {
              if (e.error_type == 'reset_password') {
                // TODO: I feel like this is where we would determine between 'breached' and 'dedupe', but vanilla-js just always says 'dedupe'...
                resetPasswordByEmailStart('dedupe');
              }
            }
          });
        }}
      />
      <View style={{ height: 24 }} />
      <StytchTextButton
        text="Forgot password?"
        onPress={() => {
          resetPasswordByEmailStart('forgot');
        }}
      />
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
  );
};
