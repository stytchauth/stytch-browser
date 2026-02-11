import React from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';

import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

export type StytchButtonProps = {
  onPress(): void;
  text: string;
  enabled: boolean;
};

export const StytchButton = (props: StytchButtonProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  let buttonBackgroundColor: string;
  let buttonBorderColor: string;
  let buttonTextColor: string;
  if (props.enabled) {
    buttonBackgroundColor = theme.buttonBackgroundColor;
    buttonBorderColor = theme.buttonBorderColor;
    buttonTextColor = theme.buttonTextColor;
  } else {
    buttonBackgroundColor = theme.disabledButtonBackgroundColor;
    buttonBorderColor = theme.disabledButtonBorderColor;
    buttonTextColor = theme.disabledButtonTextColor;
  }
  return (
    <TouchableWithoutFeedback onPress={props.onPress} testID="StytchButton" disabled={!props.enabled}>
      <View
        style={{
          height: 45,
          backgroundColor: buttonBackgroundColor,
          borderRadius: theme.buttonBorderRadius,
          borderWidth: 1,
          borderColor: buttonBorderColor,
        }}
      >
        <Text
          style={{
            color: buttonTextColor,
            fontFamily: getFontFor('IBMPlexSans_Regular'),
            fontSize: 18,
            lineHeight: 45,
            textAlign: 'center',
          }}
        >
          {props.text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};
