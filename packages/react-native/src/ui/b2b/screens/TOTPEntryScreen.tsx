import { B2BMFAProducts } from '@stytch/core/public';
import React, { useMemo } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import { BodyText } from '../components/BodyText';
import { CaptionText } from '../components/CaptionText';
import { AuthType, CodeEntry } from '../components/CodeEntry';
import { Divider } from '../components/Divider';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchTextButton } from '../components/StytchTextButton';
import { useGlobalReducer, useTheme } from '../ContextProvider';

export const TOTPEntryScreen = () => {
  const theme = useTheme();
  const [state, dispatch] = useGlobalReducer();
  const {
    mfaState: { isEnrolling },
  } = state;
  const { enrolledMfaMethods, organizationMfaOptionsSupported } = state.mfaState.primaryInfo!;
  const isSmsOtpAvailable = useMemo(
    () =>
      !isEnrolling &&
      enrolledMfaMethods.includes(B2BMFAProducts.smsOtp) &&
      (organizationMfaOptionsSupported.length === 0 || organizationMfaOptionsSupported.includes(B2BMFAProducts.smsOtp)),
    [enrolledMfaMethods, isEnrolling, organizationMfaOptionsSupported],
  );
  return (
    <ScreenWrapper testID="TOTPEntryScreen">
      <PageTitle title="Enter verification code" />
      <BodyText text={`Enter the 6-digit code from your authenticator app.`} />
      <CodeEntry authType={AuthType.TOTP} />
      {!isEnrolling ? (
        <TouchableWithoutFeedback
          onPress={() => {
            dispatch({ type: 'mfa/recoveryCode/navigateToEntry' });
          }}
          testID="ShowResendDialogButton"
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <CaptionText
              text={`Can’t access your authenticator app?`}
              color={theme.secondaryTextColor}
              marginBottom={12}
            />
            <CaptionText text={`Use a backup code`} color={theme.secondaryTextColor} fontName="IBMPlexSans_Bold" />
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <CaptionText text="If the verification code doesn’t work, go back to your authenticator app to get a new code." />
      )}
      {isSmsOtpAvailable && (
        <>
          <Divider />
          <StytchTextButton
            onPress={() => {
              dispatch({ type: 'mfa/smsOtp/navigateToEntry' });
            }}
            text="Text me a code instead"
          />
        </>
      )}
    </ScreenWrapper>
  );
};
