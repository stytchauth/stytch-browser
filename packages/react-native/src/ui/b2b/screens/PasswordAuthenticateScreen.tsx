import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { PageTitle } from '../components/PageTitle';
import { EmailEntryForm } from '../components/EmailEntryForm';
import { PasswordEntryForm } from '../components/PasswordEntryForm';
import { StytchTextButton } from '../components/StytchTextButton';
import { TouchableWithoutFeedback, View } from 'react-native';
import { CaptionText } from '../components/CaptionText';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { SubtitleText } from '../components/SubtitleText';
import { usePasswordInput } from '../hooks/usePasswordInput';
import { FormFieldError } from '../components/FormFieldError';
import { Screen } from '../screens';

export const PasswordAuthenticateScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const theme = useTheme();
  const { errorMessage, isSubmitting, submitPassword } = usePasswordInput();
  const getHelp = () => dispatch({ type: 'navigate/to', screen: Screen.PasswordForgotForm });
  const organization = state.authenticationState.organization;
  const onSubmit = () => submitPassword(organization?.organization_id);
  return (
    <ScreenWrapper testID="PasswordAuthenticateScreen">
      <PageTitle title="Log in with email and password" />
      <SubtitleText text="Email" textAlign="left" />
      <EmailEntryForm editable={true} returnKeyType="next" />
      <SubtitleText text="Password" textAlign="left" />
      <PasswordEntryForm skipStrengthCheck={true} onSubmitEditing={onSubmit} />
      <StytchTextButton text="Continue" enabled={!isSubmitting} onPress={onSubmit} />
      {errorMessage && <FormFieldError text={errorMessage}></FormFieldError>}
      <TouchableWithoutFeedback onPress={getHelp} testID="GetHelpButton">
        <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
          <CaptionText text={`Having trouble signing in? `} color={theme.secondaryTextColor} />
          <CaptionText text={`Get help`} color={theme.secondaryTextColor} fontName="IBMPlexSans_Bold" />
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
};
