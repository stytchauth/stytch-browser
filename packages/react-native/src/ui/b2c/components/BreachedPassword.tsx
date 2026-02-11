import React from 'react';
import { Image, View } from 'react-native';

import { FormFieldError } from './FormFieldError';

export const BreachedPassword = () => {
  return (
    <View testID="BreachedPassword" style={{ flexDirection: 'row', marginBottom: 8 }}>
      <View style={{ width: 16, height: 16, marginEnd: 4 }}>
        <Image testID="CrossImage" source={require('../../assets/cross.png')} />
      </View>
      <FormFieldError text="This password may have been used on a different site that experienced a security issue. Please choose another password." />
    </View>
  );
};
