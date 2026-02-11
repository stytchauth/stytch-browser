import { RNUIProducts } from '@stytch/core/public';
import React, { useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import { BodyText } from '../components/BodyText';
import { CaptionText } from '../components/CaptionText';
import { DividerWithText } from '../components/DividerWithText';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchAlertDialog } from '../components/StytchAlertDialog';
import { StytchTextButton } from '../components/StytchTextButton';
import { useConfig, useGlobalReducer, useTheme } from '../ContextProvider';
import { useEmlLoginOrCreate } from '../hooks/emlLoginOrCreate';
import { usePasswordsResetByEmailStart } from '../hooks/passwordsResetByEmailStart';

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
