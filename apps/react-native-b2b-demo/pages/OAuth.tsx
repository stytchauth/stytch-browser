import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { styles } from './styles';
import { View, Text, Button } from 'react-native';
import { useStytchB2BClient } from '@stytch/react-native/b2b';
import Constants from 'expo-constants';

type Props = NativeStackScreenProps<RootStackParamList, 'OAuth'>;

const OAuth = (_props: Props) => {
  const organization_id = Constants?.expoConfig?.extra?.stytchOrgId;
  const redirect_url = Constants?.expoConfig?.extra?.stytchOauthUrl;
  const stytch = useStytchB2BClient();
  const [status, setStatus] = React.useState('');
  const start = () => {
    stytch.oauth.google
      .start({
        organization_id: organization_id,
        login_redirect_url: redirect_url,
        signup_redirect_url: redirect_url,
        custom_scopes: [],
        provider_params: {},
      })
      .then((res) => setStatus(JSON.stringify(res)))
      .catch((e) => setStatus(e.message));
  };
  return (
    <View style={styles.container}>
      <Button title="Start" onPress={start} />
      <Text>{status}</Text>
    </View>
  );
};

export default OAuth;
