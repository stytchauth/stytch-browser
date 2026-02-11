import { View, Image } from 'react-native';
import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useEventCallback } from '../ContextProvider';
import { StytchEventType } from '@stytch/core/public';
import { useMountEffect } from '../hooks/useMountEffect';

export const SuccessScreen = () => {
  const onEvent = useEventCallback();
  useMountEffect(() => {
    onEvent({ type: StytchEventType.AuthenticateFlowComplete, data: {} });
  });
  return (
    <ScreenWrapper testID="SuccessScreen">
      <View style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <Image source={require('../../assets/successGraphic.png')} />
      </View>
    </ScreenWrapper>
  );
};
