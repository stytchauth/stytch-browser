import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { styles } from './styles';
import { Button, View, Text } from 'react-native';
import { useStytchB2BClient, useStytchMember, useStytchOrganization } from '@stytch/react-native/b2b';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const Welcome = ({ navigation }: Props) => {
  const { member } = useStytchMember();
  const { organization } = useStytchOrganization();
  const stytch = useStytchB2BClient();
  const logout = () => {
    stytch.session.revoke();
  };

  return (
    <View style={styles.container}>
      {member && (
        <>
          <Text>You are {member.email_address}</Text>
          <Text>You are a member of {organization?.organization_name ?? '(unknown organization)'}</Text>
          <Button title="Passwords" onPress={() => navigation.navigate('Passwords')} />
          <Button title="Sessions" onPress={() => navigation.navigate('Session')} />
        </>
      )}
      {!member && (
        <>
          <Text>You are currently logged out</Text>
          <Button
            title="Discovery"
            onPress={() => navigation.navigate('Discovery', { intermediate_session_token: undefined })}
          />
          <Button title="SSO" onPress={() => navigation.navigate('SSO')} />
          <Button title="OAuth" onPress={() => navigation.navigate('OAuth')} />
          <Button
            title="B2B UI (single org, no MFA)"
            onPress={() => navigation.navigate('StytchB2BUIComponent', { type: 'single_org_no_mfa' })}
          />
          <Button
            title="B2B UI (single org, with MFA)"
            onPress={() => navigation.navigate('StytchB2BUIComponent', { type: 'single_org_with_mfa' })}
          />
          <Button
            title="B2B UI (discovery)"
            onPress={() => navigation.navigate('StytchB2BUIComponent', { type: 'discovery' })}
          />
          <Button
            title="B2B UI (org passwords only)"
            onPress={() => navigation.navigate('StytchB2BUIComponent', { type: 'org_passwords_only' })}
          />
          <Button
            title="B2B UI (discovery passwords only)"
            onPress={() => navigation.navigate('StytchB2BUIComponent', { type: 'discovery_passwords_only' })}
          />
          <Button title="Force logout/cleanup" onPress={logout} />
        </>
      )}
    </View>
  );
};

export default Welcome;
