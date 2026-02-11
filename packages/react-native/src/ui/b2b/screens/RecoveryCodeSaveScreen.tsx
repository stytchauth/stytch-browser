import React, { useRef } from 'react';
import { Alert, Share, TouchableWithoutFeedback, View } from 'react-native';

import { CaptionText } from '../components/CaptionText';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchTextButton } from '../components/StytchTextButton';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

export const RecoveryCodeSaveScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const theme = useTheme();
  const viewRef = useRef<View | null>(null);
  const backupCodes = state.mfaState.totp.enrollment?.recoveryCodes ?? [];
  const { copyToClipboard } = useCopyToClipboard();
  const saveFile = (codes: string) => Share.share({ message: codes });
  return (
    <ScreenWrapper testID="RecoveryCodeSaveScreen">
      <PageTitle title="Save your backup codes!" />
      <CaptionText text="This is the only time you will be able to access and save your backup codes." />

      <View
        ref={viewRef}
        style={{
          backgroundColor: theme.disabledButtonBackgroundColor,
          padding: 10,
          borderRadius: 5,
          marginBottom: 8,
        }}
      >
        {backupCodes.map((code, index) => (
          <CaptionText
            key={index}
            text={code}
            alignment="center"
            marginBottom={12}
            fontSize={18}
            fontName="IBMPlexMono_Regular"
            color={theme.disabledInputTextColor}
          />
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <StytchTextButton
          flex={1}
          text="Download codes"
          onPress={() => {
            const codes = backupCodes.join('\n');
            saveFile(codes);
          }}
          fontName="IBMPlexSans_Bold"
        />

        <View style={{ width: 20 }} />

        <StytchTextButton
          flex={1}
          text="Copy all"
          onPress={() => {
            const codes = backupCodes.join('\n');
            copyToClipboard(codes);
            Alert.alert('Codes Copied!', '', [{ text: 'OK' }]);
          }}
          fontName="IBMPlexSans_Bold"
        />
      </View>

      <TouchableWithoutFeedback
        onPress={() => dispatch({ type: 'mfa/recoveryCode/saveAcknowledge' })}
        testID="DoneButton"
      >
        <View>
          <CaptionText
            marginTop={16}
            text={`Done`}
            color={theme.buttonBackgroundColor}
            alignment="center"
            fontName="IBMPlexSans_Bold"
            fontSize={20}
          />
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
};
