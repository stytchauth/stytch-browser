import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MemberSession } from '@stytch/react-native';
import { useStytchB2BClient } from '@stytch/react-native/b2b';
import * as React from 'react';
import { Button, Text, View } from 'react-native';

import { RootStackParamList } from '../App';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Session'>;

const Session = ({ navigation }: Props) => {
  const stytch = useStytchB2BClient();
  const [status, setStatus] = React.useState('');
  const [session, setSession] = React.useState<MemberSession | null>(null);
  React.useEffect(() => {
    setSession(stytch.session.getSync());
  }, [setSession, setStatus, stytch.session]);

  const logout = () => {
    stytch.session
      .revoke()
      .then(() => navigation.navigate('Welcome'))
      .catch((e) => setStatus(e.message));
  };

  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(session)}</Text>
      <Button title="Logout" onPress={logout} />
      <Text>{status}</Text>
    </View>
  );
};

export default Session;
