import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Member, Organization } from '@stytch/react-native';
import { useStytchB2BClient } from '@stytch/react-native/b2b';
import * as React from 'react';
import { ScrollView, Text } from 'react-native';

import { RootStackParamList } from '../App';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Authenticated'>;

const Authenticated = (_props: Props) => {
  const stytch = useStytchB2BClient();
  const [status, setStatus] = React.useState('');
  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [member, setMember] = React.useState<Member | null>(null);
  React.useEffect(() => {
    stytch.organization
      .get()
      .then((org) => {
        setOrganization(org);
        setStatus('');
      })
      .catch((e) => setStatus(e.message));
    stytch.member
      .get()
      .then((member) => {
        setMember(member);
        setStatus('');
      })
      .catch((e) => setStatus(e.message));
  }, [setOrganization, setStatus, setMember, stytch.organization, stytch.member]);

  return (
    <ScrollView style={styles.container}>
      <Text>{organization?.organization_name}</Text>
      <Text>{JSON.stringify(organization)}</Text>
      <Text>{member?.name}</Text>
      <Text>{JSON.stringify(member)}</Text>
      <Text>{status}</Text>
    </ScrollView>
  );
};

export default Authenticated;
