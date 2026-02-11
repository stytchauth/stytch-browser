import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

import { ErrorResponse } from '../../shared/types';
import { useTheme } from '../ContextProvider';
import { useClearErrorState } from '../hooks/useClearErrorState';
import { useFonts } from '../hooks/useFonts';
type ErrorResponseComponentProps = {
  error: ErrorResponse;
};

export const ErrorResponseComponent = (props: ErrorResponseComponentProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  const { clearErrorState } = useClearErrorState();
  let errorMessage: string;
  useEffect(() => {
    setTimeout(clearErrorState, 5000);
  }, [clearErrorState]);
  if (props.error.sdkError) {
    errorMessage = props.error.sdkError.name;
  } else if (props.error.apiError) {
    errorMessage = props.error.apiError.error_message;
  } else if (props.error.internalError) {
    errorMessage = `${props.error.internalError}`;
  } else {
    return;
  }
  return (
    <View
      testID="ErrorResponseComponent"
      style={{
        position: 'absolute',
        bottom: 16,
        left: 32,
        right: 32,
        height: 'auto',
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <View
        style={{
          backgroundColor: theme.warningBackgroundColor,
          padding: 12,
          flex: 1,
          width: 'auto',
          justifyContent: 'center',
          flexDirection: 'row',
          alignContent: 'center',
          alignSelf: 'center',
          alignItems: 'center',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
        <Image style={{ width: 24, height: 24, marginEnd: 8 }} source={require('../../assets/warningIcon.png')} />
        <Text
          testID="FormFieldError"
          style={{
            fontFamily: getFontFor('IBMPlexSans_Regular'),
            fontSize: 16,
            color: theme.warningTextColor,
          }}
        >
          {errorMessage}
        </Text>
      </View>
    </View>
  );
};
