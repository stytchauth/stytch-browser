import React from 'react';
import { Image, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

import { CaptionText } from '../components/CaptionText';
import { Divider } from '../components/Divider';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useGlobalReducer } from '../ContextProvider';
import { useTOTPCreate } from '../hooks/useTOTPCreate';
import { Screen } from '../screens';

export const MFAEnrollmentSelectionScreen = () => {
  const [state, dispatch] = useGlobalReducer();
  const { totpCreate } = useTOTPCreate();
  const onUseAnAuthenticator = () => {
    if (state.mfaState.totp.enrollment) {
      // user has already started enrollment and probably pressed back
      dispatch({ type: 'mfa/totp/showCode' });
      return;
    }
    totpCreate();
  };
  const darkMode = useColorScheme() == 'dark';
  return (
    <ScreenWrapper testID="MFAEnrollmentSelectionScreen">
      <PageTitle title="Set up Multi-Factor Authentication" />
      <CaptionText text="Your organization requires an additional form of verification to make your account more secure." />
      <TouchableWithoutFeedback onPress={onUseAnAuthenticator} testID="UseAnAuthenticatorAppButton">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <CaptionText text={`Use an authenticator app`} fontName="IBMPlexSans_Bold" />
          <Image
            style={{ width: 24, height: 24 }}
            testID="KeyboardArrowRight"
            source={
              darkMode
                ? require('../../assets/keyboard_arrow_right_dark.png')
                : require('../../assets/keyboard_arrow_right.png')
            }
          />
        </View>
      </TouchableWithoutFeedback>
      <Divider />
      <TouchableWithoutFeedback
        onPress={() => {
          dispatch({ type: 'navigate/to', screen: Screen.SMSOTPEnrollment });
        }}
        testID="TextMeACodeButton"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <CaptionText text={`Text me a code`} fontName="IBMPlexSans_Bold" />
          <Image
            style={{ width: 24, height: 24 }}
            testID="KeyboardArrowRight"
            source={
              darkMode
                ? require('../../assets/keyboard_arrow_right_dark.png')
                : require('../../assets/keyboard_arrow_right.png')
            }
          />
        </View>
      </TouchableWithoutFeedback>
      <Divider />
    </ScreenWrapper>
  );
};
