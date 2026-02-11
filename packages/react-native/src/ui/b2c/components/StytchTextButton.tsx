import React from 'react';
import { useTheme } from '../ContextProvider';
import { TouchableWithoutFeedback, View, Text } from 'react-native';
import { useFonts } from '../hooks/useFonts';

type StytchTextButtonProps = {
  text: string;
  onPress(): void;
};
export const StytchTextButton = (props: StytchTextButtonProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <TouchableWithoutFeedback onPress={props.onPress} testID="StytchTextButton">
      <View
        style={{
          height: 45,
          backgroundColor: theme.backgroundColor,
          borderRadius: theme.buttonBorderRadius,
        }}
      >
        <Text
          style={{
            color: theme.primaryTextColor,
            fontFamily: getFontFor('IBMPlexSans_Regular'),
            fontSize: 18,
            lineHeight: 31.5,
            textAlign: 'center',
          }}
        >
          {props.text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};
