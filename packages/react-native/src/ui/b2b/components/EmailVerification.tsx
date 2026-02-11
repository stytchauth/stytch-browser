import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { PageTitle } from './PageTitle';
import { CaptionText } from './CaptionText';

interface EmailVerificationProps {
  title?: string;
  message?: string;
  primarySubtext?: string;
  secondaryBoldSubtext?: string;
  onPress: () => void;
}

export const EmailVerification = ({
  title,
  message,
  primarySubtext,
  secondaryBoldSubtext,
  onPress,
}: EmailVerificationProps) => {
  const theme = useTheme();
  const [state] = useGlobalReducer();

  return (
    <>
      <PageTitle title={`${title}`} />
      <CaptionText text={`${message} `} color={theme.primaryTextColor} marginBottom={8} />
      <CaptionText
        text={`${state.memberState.emailAddress.emailAddress}`}
        color={theme.primaryTextColor}
        fontName="IBMPlexSans_Bold"
        marginBottom={24}
      />
      <TouchableWithoutFeedback onPress={onPress} testID="Resend Email Button">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <CaptionText text={`${primarySubtext} `} color={theme.primaryTextColor} />
          <CaptionText text={`${secondaryBoldSubtext}`} color={theme.primaryTextColor} fontName="IBMPlexSans_Bold" />
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};
