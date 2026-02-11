import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';

export type DividerWithTextProps = {
  text: string;
};

export const DividerWithText = (props: DividerWithTextProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <View
      testID="DividerWithText"
      style={{
        marginTop: 12,
        marginBottom: 24,
        flexDirection: 'row',
        alignContent: 'space-between',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ flex: 1, backgroundColor: theme.disabledTextColor, height: 1 }}></View>
      <Text
        style={{
          textAlign: 'center',
          color: theme.disabledTextColor,
          fontFamily: getFontFor('IBMPlexSans_Regular'),
          fontSize: 18,
          lineHeight: 25,
          paddingHorizontal: 4,
        }}
      >
        {props.text}
      </Text>
      <View style={{ flex: 1, backgroundColor: theme.disabledTextColor, height: 1 }}></View>
    </View>
  );
};
