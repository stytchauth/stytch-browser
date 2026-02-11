import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

export type SubtitleTextProps = {
  text: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
};

export const SubtitleText = (props: SubtitleTextProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <Text
      testID="SubtitleText"
      style={{
        fontFamily: getFontFor('IBMPlexSans_Regular'),
        fontSize: 14,
        lineHeight: 25,
        marginBottom: 4,
        textAlign: props.textAlign ?? 'left',
        color: theme.secondaryTextColor,
      }}
    >
      {props.text}
    </Text>
  );
};
