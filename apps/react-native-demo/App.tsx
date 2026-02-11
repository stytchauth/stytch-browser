import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  OTPScreen,
  WelcomeScreen,
  ProfileScreen,
  EMLScreen,
  AuthenticateScreen,
  OAuthScreen,
  StytchUIComponent,
} from './pages';
import { StytchProvider, StytchClient, useStytchUser } from '@stytch/react-native';
import Constants from 'expo-constants';

export type RootStackParamList = {
  Welcome: undefined;
  EML: undefined;
  OTP: undefined;
  OAuth: undefined;
  Profile: undefined;
  Authenticate: { stytch_token_type: string; token: string };
  StytchUI: undefined;
};
const publicToken = Constants.expoConfig?.extra?.stytchPublicToken;
const stytch = new StytchClient(publicToken, true, {
  endpoints: {
    testAPIURL: Constants.expoConfig?.extra?.testAPIURL,
    liveAPIURL: Constants.expoConfig?.extra?.liveAPIURL,
    dfpBackendURL: Constants.expoConfig?.extra?.dfpBackendURL,
  },
});

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <StytchProvider stytch={stytch}>
      <Nav />
    </StytchProvider>
  );
}

function Nav() {
  const linking = {
    prefixes: ['rndemo://'],
  };

  const user = useStytchUser();
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {user.user == null ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Authenticate" component={AuthenticateScreen} />
            <Stack.Screen name="EML" component={EMLScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="OAuth" component={OAuthScreen} />
            <Stack.Screen name="StytchUI" component={StytchUIComponent} />
          </>
        ) : (
          <>
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
