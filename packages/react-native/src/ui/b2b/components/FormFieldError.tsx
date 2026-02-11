import React from 'react';
import { Text } from 'react-native';

import { ErrorResponse } from '../../shared/types';
import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

export const FormFieldError = ({ text, errorResponse }: { text?: string; errorResponse?: ErrorResponse }) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  const error =
    text ?? errorResponse?.sdkError?.message ?? errorResponse?.apiError?.error_message ?? errorResponse?.internalError;
  return (
    <Text
      testID="FormFieldError"
      style={{
        marginTop: 16,
        marginBottom: 24,
        fontFamily: getFontFor('IBMPlexSans_Regular'),
        fontSize: 16,
        lineHeight: 20,
        color: theme.errorColor,
      }}
    >
      {error}
    </Text>
  );
};
