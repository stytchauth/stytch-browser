import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

export type BodyTextProps = {
  text: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
};

export const BodyText = (props: BodyTextProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <Text
      testID="BodyText"
      style={{
        fontFamily: getFontFor('IBMPlexSans_Regular'),
        fontSize: 18,
        lineHeight: 25,
        marginBottom: 32,
        textAlign: props.textAlign ?? 'left',
        color: theme.primaryTextColor,
      }}
    >
      {props.text}
    </Text>
  );
};
