import { View, Image } from 'react-native';
import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { PageTitle } from '../components/PageTitle';
import { BodyText } from '../components/BodyText';

export const SuccessScreen = () => {
  return (
    <ScreenWrapper testID="SuccessScreen">
      <PageTitle title="Success!" />
      <BodyText text="You have successfully logged in." textAlign="center" />
      <View style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <Image source={require('../../assets/successGraphic.png')} />
      </View>
    </ScreenWrapper>
  );
};
