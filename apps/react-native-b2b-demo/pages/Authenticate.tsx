import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { View, Text } from 'react-native';

import { styles } from './styles';
import { useStytchB2BClient } from '@stytch/react-native/b2b';

type Props = NativeStackScreenProps<RootStackParamList, 'Authenticate'>;

export const Authenticate = ({ route, navigation }: Props) => {
  const stytch = useStytchB2BClient();
  const [status, setStatus] = React.useState('');

  React.useEffect(() => {
    const tokenType = route.params.stytch_token_type;
    const token = route.params.token;
    if (tokenType == 'discovery') {
      stytch.magicLinks.discovery
        .authenticate({
          discovery_magic_links_token: token,
        })
        .then((res) => navigation.navigate('Discovery', { intermediate_session_token: res.intermediate_session_token }))
        .catch((e) => setStatus(e.message));
    } else if (tokenType == 'sso') {
      stytch.sso
        .authenticate({
          sso_token: token,
          session_duration_minutes: 30,
        })
        .then(() => navigation.navigate('Authenticated'))
        .catch((e) => setStatus(e.message));
    } else {
      setStatus('Unrecognized token type');
    }
  }, [navigation, route.params.stytch_token_type, route.params.token, stytch.magicLinks.discovery, stytch.sso]);

  return (
    <View style={styles.container}>
      <Text>{status != '' ? status : `Authenticating...`}</Text>
    </View>
  );
};

export default Authenticate;
