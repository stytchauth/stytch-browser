import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../ContextProvider';

export const Divider = () => {
  const theme = useTheme();
  return (
    <View
      testID="Divider"
      style={{
        marginTop: 0,
        marginBottom: 24,
        flexDirection: 'row',
        alignContent: 'space-between',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ flex: 1, backgroundColor: theme.disabledTextColor, height: 1 }}></View>
    </View>
  );
};
