import React from 'react';
import { Image, TouchableWithoutFeedback, View } from 'react-native';

import { useGoBack } from '../hooks/goBack';
export const BackButton = () => {
  const { goBack } = useGoBack();
  return (
    <TouchableWithoutFeedback onPress={goBack} testID="BackButton">
      <View style={{ marginBottom: 24, width: 48, height: 48 }}>
        <Image style={{ width: 48, height: 48 }} source={require('../../assets/backArrow.png')} />
      </View>
    </TouchableWithoutFeedback>
  );
};
