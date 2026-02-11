import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Organization } from '@stytch/react-native';
import { useStytchB2BClient } from '@stytch/react-native/b2b';
import * as Linking from 'expo-linking';
import * as React from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../App';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Passwords'>;

const Passwords = (_props: Props) => {
  const stytch = useStytchB2BClient();
  const [email, setEmail] = React.useState('');
  const [existingPassword, setExistingPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [status, setStatus] = React.useState('');
  const redirect = Linking.createURL('Authenticate');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOrganizationIdOrError = async (block: (organization: Organization) => Promise<any>) => {
    stytch.organization
      .get()
      .then((organization) => {
        if (organization != null) {
          block(organization)
            .then((res) => setStatus(JSON.stringify(res)))
            .catch((e) => setStatus(e.message));
        } else {
          setStatus('You must provide an organization id');
        }
      })
      .catch((e) => setStatus(e.message));
  };
  const authenticate = async () => {
    getOrganizationIdOrError((organization: Organization) => {
      return stytch.passwords.authenticate({
        organization_id: organization.organization_id,
        email_address: email,
        password: existingPassword,
        session_duration_minutes: 30,
      });
    });
  };
  const strengthCheck = () => {
    stytch.passwords
      .strengthCheck({
        email_address: email,
        password: newPassword,
      })
      .then((res) => setStatus(JSON.stringify(res)))
      .catch((e) => setStatus(e.message));
  };
  const resetByEmail = () => {
    getOrganizationIdOrError((organization: Organization) => {
      return stytch.passwords.resetByEmailStart({
        organization_id: organization.organization_id,
        email_address: email,
        login_redirect_url: redirect,
        reset_password_redirect_url: redirect,
      });
    });
  };
  const resetByExisting = () => {
    getOrganizationIdOrError((organization: Organization) => {
      return stytch.passwords.resetByExistingPassword({
        organization_id: organization.organization_id,
        email_address: email,
        existing_password: existingPassword,
        new_password: newPassword,
        session_duration_minutes: 30,
      });
    });
  };
  const resetBySession = () => {
    getOrganizationIdOrError((organization: Organization) => {
      return stytch.passwords.resetBySession({
        organization_id: organization.organization_id,
        password: newPassword,
      });
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        key="email"
        onChangeText={(val: string) => setEmail(val)}
        placeholder="test@stytch.com"
        defaultValue={email}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        key="existingPassword"
        onChangeText={(val: string) => setExistingPassword(val)}
        placeholder="existing password"
        defaultValue={existingPassword}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        key="newPassword"
        onChangeText={(val: string) => setNewPassword(val)}
        placeholder="new password"
        defaultValue={newPassword}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title="Authenticate With Password" onPress={authenticate} />
      <Button title="Check Password Strength" onPress={strengthCheck} />
      <Button title="Reset Password By Email" onPress={resetByEmail} />
      <Button title="Reset Password By Existing" onPress={resetByExisting} />
      <Button title="Reset Password By Session" onPress={resetBySession} />
      <Text>{status}</Text>
    </View>
  );
};

export default Passwords;
