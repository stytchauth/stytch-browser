import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DiscoveredOrganization } from '@stytch/react-native';
import { useStytchB2BClient } from '@stytch/react-native/b2b';
import * as Linking from 'expo-linking';
import * as React from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../App';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Discovery'>;

const Discovery = ({ route, navigation }: Props) => {
  const intermediate_session_token = route?.params?.intermediate_session_token;
  const stytch = useStytchB2BClient();
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [organizations, setOrganizations] = React.useState<DiscoveredOrganization[] | null>(null);
  const redirect = Linking.createURL('Authenticate');
  const [organizationName, setOrganizationName] = React.useState('');

  const sendDiscoveryEML = async () => {
    stytch.magicLinks.email.discovery
      .send({
        email_address: email,
        discovery_redirect_url: redirect,
      })
      .then((res) => setStatus(JSON.stringify(res)))
      .catch((e) => setStatus(e.message));
  };

  const joinOrganization = (organization_id: string) => {
    if (intermediate_session_token != undefined) {
      stytch.discovery.intermediateSessions
        .exchange({
          organization_id: organization_id,
          session_duration_minutes: 30,
        })
        .then(() => navigation.navigate('Authenticated'))
        .catch((e) => setStatus(e.message));
    }
  };

  const createOrganization = () => {
    if (intermediate_session_token != undefined) {
      stytch.discovery.organizations
        .create({
          organization_name: organizationName,
          session_duration_minutes: 30,
        })
        .then(() => navigation.navigate('Authenticated'))
        .catch((e) => setStatus(e.message));
    }
  };

  React.useEffect(() => {
    if (intermediate_session_token != undefined) {
      stytch.discovery.organizations
        .list()
        .then((orgs) => {
          setOrganizations(orgs.discovered_organizations);
          setStatus('');
        })
        .catch((e) => setStatus(e.message));
    } else {
      setOrganizations(null);
    }
  }, [intermediate_session_token, stytch, setOrganizations, setStatus]);

  return (
    <View style={styles.container}>
      {organizations ? (
        <>
          <Text>Your Organizations</Text>
          {organizations.map((org) => {
            const title = `Sign In To ${org.organization.organization_name}`;
            return (
              <Button
                title={title}
                key={org.organization.organization_id}
                onPress={() => joinOrganization(org.organization.organization_id)}
              />
            );
          })}
          <Text>Create An Organization</Text>
          <TextInput
            key="createOrganization"
            onChangeText={(val: string) => setOrganizationName(val)}
            placeholder="New Organization Name"
            defaultValue={organizationName}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button title="Create" onPress={createOrganization} />
        </>
      ) : (
        <>
          <TextInput
            key="email"
            onChangeText={(val: string) => setEmail(val)}
            placeholder="test@stytch.com"
            defaultValue={email}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button title="Send Discovery EML" onPress={sendDiscoveryEML} />
        </>
      )}
      <Text>{status}</Text>
    </View>
  );
};

export default Discovery;
