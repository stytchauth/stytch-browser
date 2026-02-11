import React from 'react';
import { View, Button } from 'react-native';

import { useStytch } from '@stytch/react-native';

import * as Linking from 'expo-linking';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { styles } from './styles';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'OAuth'>;

export const OAuth = ({ navigation }: Props) => {
  const stytch = useStytch();
  const rootLink = Linking.createURL('Authenticate');

  const googleOneTap = () => {
    stytch.oauth.googleOneTap({
      onCompleteCallback: () => {
        navigation.navigate('Profile');
      },
    });
  };

  const signInWithApple = () => {
    stytch.oauth.signInWithApple({
      onCompleteCallback: () => {
        navigation.navigate('Profile');
      },
    });
  };

  const loginWithGoogle = () => {
    stytch.oauth.google.startWithRedirect({
      login_redirect_url: rootLink,
      signup_redirect_url: rootLink,
      provider_params: {
        provider_prompt: 'select_account',
      },
    });
  };

  const loginWithApple = () => {
    stytch.oauth.apple.startWithRedirect({
      login_redirect_url: rootLink,
      signup_redirect_url: rootLink,
    });
  };

  const loginWithFacebook = () => {
    stytch.oauth.facebook.start({ login_redirect_url: rootLink, signup_redirect_url: rootLink });
  };

  const loginWithGithub = () => {
    stytch.oauth.github.start({ login_redirect_url: rootLink, signup_redirect_url: rootLink });
  };

  return (
    <View style={styles.container}>
      <Button title="Login with Google" onPress={loginWithGoogle} />
      <Button title="Login with Apple" onPress={loginWithApple} />
      <Button title="Login with Facebook" onPress={loginWithFacebook} />
      <Button title="Login with Github" onPress={loginWithGithub} />
      <Button title="Google One Tap" onPress={googleOneTap} />
      <Button title="Sign in with Apple" onPress={signInWithApple} />
    </View>
  );
};

export default OAuth;
