import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../ContextProvider';

export const LoadingDialog = () => {
  const theme = useTheme();
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        opacity: 0.5,
        backgroundColor: theme.backgroundColor,
      }}
      testID="LoadingDialog"
    >
      <ActivityIndicator size="large" color={theme.inputTextColor} />
    </View>
  );
};
