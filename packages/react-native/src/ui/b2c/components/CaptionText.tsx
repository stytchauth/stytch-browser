import React from 'react';
import { Text } from 'react-native';

import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

export const CaptionText = ({ text, color, marginBottom }: { text: string; color?: string; marginBottom?: number }) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <Text
      testID="CaptionText"
      style={{
        marginBottom: marginBottom ?? 24,
        fontFamily: getFontFor('IBMPlexSans_Regular'),
        fontSize: 16,
        lineHeight: 20,
        color: color ?? theme.primaryTextColor,
      }}
    >
      {text}
    </Text>
  );
};
