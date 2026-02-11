import { useConfig, useGlobalReducer, useTheme } from '../ContextProvider';
import { TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { PageTitle } from '../components/PageTitle';
import { BodyText } from '../components/BodyText';
import { CaptionText } from '../components/CaptionText';
import { RNUIProducts } from '@stytch/core/public';
import { DividerWithText } from '../components/DividerWithText';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';
import { StytchTextButton } from '../components/StytchTextButton';
import { StytchAlertDialog } from '../components/StytchAlertDialog';
import { ScreenWrapper } from '../components/ScreenWrapper';

export const EMLConfirmationScreen = () => {
  const theme = useTheme();
  const config = useConfig();
  const [state] = useGlobalReducer();
  const { sendEML } = useEmlLoginOrCreate();
  const { resetPasswordByEmailStart } = usePasswordsResetByEmailStart();
  const [showResendDialog, setShowResendDialog] = useState(false);

  return (
    <>
      <ScreenWrapper testID="EMLConfirmationScreen">
        <PageTitle title="Check your email" textAlign="left" />
        <BodyText text={`A login link was sent to you at ${state.userState.emailAddress.emailAddress}.`} />
        <TouchableWithoutFeedback onPress={() => setShowResendDialog(true)} testID="ShowResendDialogButton">
          <View>
            <CaptionText text="Didn’t get it? Resend link." color={theme.secondaryTextColor} />
          </View>
        </TouchableWithoutFeedback>
        {state.userState.userType != 'new' && config.products.includes(RNUIProducts.passwords) && (
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
          title="Resend link"
          body={`A new link will be sent to ${state.userState.emailAddress.emailAddress}`}
          cancelText="Cancel"
          acceptText="Send link"
          onAccept={() => {
            setShowResendDialog(false);
            sendEML();
          }}
        />
      )}
    </>
  );
};
