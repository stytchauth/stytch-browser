import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStytch } from '@stytch/react-native';
import * as React from 'react';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { RootStackParamList } from '../App';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Authenticate'>;

export const Authenticate = ({ route }: Props) => {
  const stytch = useStytch();

  useEffect(() => {
    const tokenType = route.params.stytch_token_type;
    const token = route.params.token;

    if (tokenType === 'magic_links') {
      stytch.magicLinks.authenticate(token, { session_duration_minutes: 60 });
    } else {
      // Facebook adds characters "#_=_" to the end of the redirect url.
      // If the token is not 44 characters long, slice the token to the correct length.
      stytch.oauth.authenticate(token.slice(0, 44), { session_duration_minutes: 60 });
    }
  }, [route.params.stytch_token_type, route.params.token, stytch.magicLinks, stytch.oauth]);

  return (
    <View style={styles.container}>
      <Text>Authenticating...</Text>
    </View>
  );
};

export default Authenticate;
