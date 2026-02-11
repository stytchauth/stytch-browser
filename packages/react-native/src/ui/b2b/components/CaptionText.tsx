import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

interface CaptionTextProps {
  text: string;
  color?: string;
  marginBottom?: number;
  marginTop?: number;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  fontName?: string;
  fontSize?: number;
}

export const CaptionText = ({
  text,
  color,
  marginBottom = 24,
  marginTop = 0,
  alignment = 'left',
  fontName = 'IBMPlexSans_Regular',
  fontSize = 18,
}: CaptionTextProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();

  return (
    <Text
      testID="CaptionText"
      style={{
        marginBottom: marginBottom,
        marginTop: marginTop,
        fontFamily: getFontFor(fontName),
        fontSize: fontSize,
        lineHeight: 20,
        color: color ?? theme.primaryTextColor,
        textAlign: alignment,
      }}
    >
      {text}
    </Text>
  );
};
