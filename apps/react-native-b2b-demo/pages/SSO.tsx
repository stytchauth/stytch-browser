import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { styles } from './styles';
import { View, Text, Button } from 'react-native';
import { useStytchB2BClient } from '@stytch/react-native/b2b';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

type Props = NativeStackScreenProps<RootStackParamList, 'SSO'>;

const SSO = (_props: Props) => {
  const samlConnectionId = Constants?.expoConfig?.extra?.samlConnectionId || '';
  const stytch = useStytchB2BClient();
  const [status, setStatus] = React.useState('');
  const redirect = Linking.createURL('Authenticate');
  const samlStart = () => {
    stytch.sso
      .start({
        connection_id: samlConnectionId,
        login_redirect_url: redirect,
        signup_redirect_url: redirect,
      })
      .then((res) => setStatus(JSON.stringify(res)))
      .catch((e) => setStatus(e.message));
  };
  return (
    <View style={styles.container}>
      <Button title="Start SAML Connection" onPress={samlStart} />
      <Text>{status}</Text>
    </View>
  );
};

export default SSO;
