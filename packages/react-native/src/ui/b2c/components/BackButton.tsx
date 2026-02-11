import React from 'react';
import { useGoBack } from '../hooks/goBack';
import { TouchableWithoutFeedback, View, Image } from 'react-native';
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
