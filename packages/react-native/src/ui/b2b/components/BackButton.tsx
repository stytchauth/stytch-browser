import React from 'react';
import { Image, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

import { useGoBack } from '../hooks/goBack';
export const BackButton = () => {
  const { goBack } = useGoBack();
  const darkMode = useColorScheme() == 'dark';
  return (
    <TouchableWithoutFeedback onPress={goBack} testID="BackButton">
      <View style={{ marginBottom: 24, width: 48, height: 48, marginLeft: -16 }}>
        <Image
          style={{ width: 48, height: 48 }}
          source={darkMode ? require('../../assets/backArrow_dark.png') : require('../../assets/backArrow.png')}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};
