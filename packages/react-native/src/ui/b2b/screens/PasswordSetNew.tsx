import React from 'react';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { PageTitle } from '../components/PageTitle';
import { TouchableWithoutFeedback, View } from 'react-native';
import { usePasswordResetByEmailStart } from '../hooks/usePasswordResetByEmailStart';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { CaptionText } from '../components/CaptionText';
import { usePasswordDiscoveryResetByEmailStart } from '../hooks/usePasswordDiscoveryResetByEmailStart';

export const PasswordSetNewScreen = () => {
  const [state] = useGlobalReducer();
  const { passwordResetByEmailStart } = usePasswordResetByEmailStart();
  const { passwordDiscoveryResetByEmailStart } = usePasswordDiscoveryResetByEmailStart();
  const theme = useTheme();
  const handleSubmit = () => {
    if (state.authenticationState.organization) {
      passwordResetByEmailStart();
    } else {
      passwordDiscoveryResetByEmailStart();
    }
  };
  return (
    <ScreenWrapper testID="PasswordSetNewScreen">
      <View style={{ flexDirection: 'column', gap: 24 }}>
        <PageTitle title="Check your email!" />
        <CaptionText
          text={`A login link was sent to you at ${state.memberState.emailAddress.emailAddress}`}
          color={theme.secondaryTextColor}
        />
        <TouchableWithoutFeedback onPress={handleSubmit}>
          <CaptionText text={`Didn't get it? Resend email`} color={theme.secondaryTextColor} />
        </TouchableWithoutFeedback>
      </View>
    </ScreenWrapper>
  );
};
