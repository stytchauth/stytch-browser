import React from 'react';
import { useGoBack } from '../hooks/goBack';
import { View, Image, useColorScheme, TouchableWithoutFeedback } from 'react-native';
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
