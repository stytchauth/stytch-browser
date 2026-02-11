import React from 'react';
import { Image, View } from 'react-native';

import { BodyText } from '../components/BodyText';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';

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
