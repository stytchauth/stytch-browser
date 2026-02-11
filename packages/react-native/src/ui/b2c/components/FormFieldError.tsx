import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

export const FormFieldError = ({ text }: { text: string }) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <Text
      testID="FormFieldError"
      style={{
        marginBottom: 24,
        fontFamily: getFontFor('IBMPlexSans_Regular'),
        fontSize: 16,
        lineHeight: 20,
        color: theme.errorColor,
      }}
    >
      {text}
    </Text>
  );
};
