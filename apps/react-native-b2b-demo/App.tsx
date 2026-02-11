import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  WelcomeScreen,
  PasswordScreen,
  DiscoveryScreen,
  AuthenticateScreen,
  AuthenticatedScreen,
  SessionScreen,
  SSOScreen,
  OAuthScreen,
  StytchB2BUIComponent,
} from './pages';
import { StytchB2BProvider, StytchB2BClient } from '@stytch/react-native/b2b';
import Constants from 'expo-constants';
import { B2BUIFlowType } from './pages/StytchB2BUIComponent';

export type RootStackParamList = {
  Welcome: undefined;
  Passwords: undefined;
  Discovery: { intermediate_session_token: string | undefined };
  Authenticate: { stytch_token_type: string; token: string };
  Authenticated: undefined;
  Session: undefined;
  SSO: undefined;
  OAuth: undefined;
  StytchB2BUIComponent: { type: B2BUIFlowType };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const publicToken = Constants?.expoConfig?.extra?.stytchPublicToken;
  const stytch = new StytchB2BClient(publicToken);

  return (
    <StytchB2BProvider stytch={stytch}>
      <Nav />
    </StytchB2BProvider>
  );
}

function Nav() {
  const linking = {
    prefixes: ['rnb2bdemo://'],
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Passwords" component={PasswordScreen} />
        <Stack.Screen name="Discovery" component={DiscoveryScreen} />
        <Stack.Screen name="Authenticate" component={AuthenticateScreen} />
        <Stack.Screen name="Authenticated" component={AuthenticatedScreen} />
        <Stack.Screen name="Session" component={SessionScreen} />
        <Stack.Screen name="SSO" component={SSOScreen} />
        <Stack.Screen name="OAuth" component={OAuthScreen} />
        <Stack.Screen name="StytchB2BUIComponent" component={StytchB2BUIComponent} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
