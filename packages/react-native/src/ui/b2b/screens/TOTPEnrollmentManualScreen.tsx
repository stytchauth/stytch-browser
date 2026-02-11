import React from 'react';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { CaptionText } from '../components/CaptionText';
import { StytchTextButton } from '../components/StytchTextButton';
import { TouchableWithoutFeedback, View, Image, Alert } from 'react-native';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { Screen } from '../screens';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { FormFieldError } from '../components/FormFieldError';

export const TOTPEnrollmentManualScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const { copyToClipboard } = useCopyToClipboard();
  const theme = useTheme();
  const createError = state.mfaState.totp.createError;
  const secret = state.mfaState.totp.enrollment?.secret ?? '';
  const displaySecret = secret.toLowerCase();
  const secretChunked = displaySecret.split(/(.{4})/g).filter(Boolean);
  return (
    <ScreenWrapper testID="TOTPEnrollmentManualScreen">
      <PageTitle title="Copy the code below to link your authenticator app" />
      <CaptionText text="Enter the key below into your authenticator app. If you don’t have an authenticator app, you’ll need to install one first." />
      <View
        style={{
          backgroundColor: theme.disabledButtonBackgroundColor,
          padding: 10,
          borderRadius: 5,
          marginBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <CaptionText
          text={secretChunked.join(' ')}
          alignment="center"
          marginBottom={12}
          fontSize={18}
          fontName="IBMPlexMono_Regular"
          color={theme.disabledInputTextColor}
        />

        <TouchableWithoutFeedback
          onPress={() => {
            copyToClipboard(displaySecret);
            Alert.alert('Secret Copied!', '', [{ text: 'OK' }]);
          }}
          testID="CopyButton"
        >
          <Image style={{ width: 24, height: 24 }} testID="Copy" source={require('../../assets/copy.png')} />
        </TouchableWithoutFeedback>
      </View>
      <StytchTextButton
        text="Continue"
        onPress={() => {
          dispatch({ type: 'navigate/to', screen: Screen.TOTPEntry });
        }}
      />
      {createError && <FormFieldError errorResponse={createError} />}
    </ScreenWrapper>
  );
};
