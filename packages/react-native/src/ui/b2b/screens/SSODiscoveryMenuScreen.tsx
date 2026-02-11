import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { PageTitle } from '../components/PageTitle';
import { useGlobalReducer } from '../ContextProvider';
import { SSOButton } from '../components/SSOButtons';
import { View } from 'react-native';

export const SSODiscoveryMenuScreen = () => {
  const [state] = useGlobalReducer();
  return (
    <ScreenWrapper testID="SSODiscoveryMenuScreen">
      <PageTitle title="Select a connection to continue" />
      <View style={{ flexDirection: 'column', gap: 8 }}>
        {state.ssoDiscoveryState.connections.map((provider) => {
          return <SSOButton key={provider.connection_id} provider={provider} />;
        })}
      </View>
    </ScreenWrapper>
  );
};
