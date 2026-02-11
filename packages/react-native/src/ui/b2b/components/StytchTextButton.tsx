import React from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';

import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

type StytchTextButtonProps = {
  text: string;
  onPress(): void;
  marginBottom?: number;
  flex?: number;
  marginHorizontal?: number;
  fontName?: string;
  fontSize?: number;
  enabled?: boolean;
};

export const StytchTextButton = ({
  text,
  onPress,
  marginBottom = 0,
  flex = 0,
  marginHorizontal = 0,
  fontName = 'IBMPlexSans_Regular',
  fontSize = 18,
  enabled = true,
}: StytchTextButtonProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();

  return (
    <TouchableWithoutFeedback disabled={!enabled} onPress={onPress} testID="StytchTextButton">
      <View
        style={{
          height: 45,
          backgroundColor: theme.buttonBackgroundColor,
          borderRadius: theme.buttonBorderRadius,
          marginBottom: marginBottom,
          flex: flex,
          marginHorizontal: marginHorizontal,
        }}
      >
        <Text
          style={{
            color: theme.buttonTextColor,
            fontFamily: getFontFor(fontName),
            fontSize: fontSize,
            lineHeight: 45,
            textAlign: 'center',
          }}
        >
          {text}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};
