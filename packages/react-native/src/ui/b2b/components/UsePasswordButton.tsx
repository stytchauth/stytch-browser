import React from 'react';
import { Text, TouchableWithoutFeedback } from 'react-native';

import { useGlobalReducer, useTheme } from '../ContextProvider';

export const UsePasswordButton = () => {
  const [, dispatch] = useGlobalReducer();
  const theme = useTheme();
  const onPress = () => dispatch({ type: 'passwords/authenticate/start' });
  return (
    <TouchableWithoutFeedback key={'password'} onPress={onPress}>
      <Text style={{ fontWeight: 'bold', textAlign: 'center', color: theme.secondaryTextColor, marginBottom: 16 }}>
        Use a password instead
      </Text>
    </TouchableWithoutFeedback>
  );
};
