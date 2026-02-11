import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { PageTitle } from '../components/PageTitle';
import { CaptionText } from '../components/CaptionText';
import { TouchableWithoutFeedback, View, Image, useColorScheme } from 'react-native';
import { Divider } from '../components/Divider';
import { useEmailOTPEmailDiscoverySend } from '../hooks/useEmailOTPEmailDiscoverySend';
import { useEmailOTPEmailLoginOrSignup } from '../hooks/useEmailOTPEmailLoginOrSignup';
import { useMagicLinksEmailDiscoverySend } from '../hooks/useMagicLinksEmailDiscoverySend';
import { useMagicLinksEmailLoginOrSignup } from '../hooks/useMagicLinksEmailLoginOrSignup';
import { useGlobalReducer } from '../ContextProvider';
import { AuthFlowType } from '@stytch/core/public';

export const EmailMethodSelectionScreen = () => {
  const [state] = useGlobalReducer();
  const darkMode = useColorScheme() == 'dark';
  const { magicLinksEmailLoginOrSignup } = useMagicLinksEmailLoginOrSignup();
  const { magicLinksEmailDiscoverySend } = useMagicLinksEmailDiscoverySend();
  const { emailOTPEmailLoginOrSignup } = useEmailOTPEmailLoginOrSignup();
  const { emailOTPEmailDiscoverySend } = useEmailOTPEmailDiscoverySend();
  return (
    <ScreenWrapper testID="EmailMethodSelectionScreen">
      <PageTitle title="Select how you'd like to continue." />
      <TouchableWithoutFeedback
        onPress={() => {
          if (state.authenticationState.authFlowType == AuthFlowType.Organization) {
            magicLinksEmailLoginOrSignup();
          } else {
            magicLinksEmailDiscoverySend();
          }
        }}
        testID="EmailMeALogInLinkButton"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <CaptionText text={`Email me a log in link`} fontName="IBMPlexSans_Bold" />
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
          if (state.authenticationState.authFlowType == AuthFlowType.Organization) {
            emailOTPEmailLoginOrSignup();
          } else {
            emailOTPEmailDiscoverySend();
          }
        }}
        testID="EmailMeALogInCodeButton"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <CaptionText text={`Email me a log in code`} fontName="IBMPlexSans_Bold" />
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
