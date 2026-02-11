import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { useStytch } from '@stytch/react-native';
import * as Linking from 'expo-linking';
import { styles } from './styles';

function EML() {
  const stytch = useStytch();
  const [email, setEmail] = useState('');

  const redirect = Linking.createURL('Authenticate');

  const login = () => {
    stytch.magicLinks.email
      .loginOrCreate(email, {
        login_magic_link_url: redirect,
      })
      .then(() => {
        alert('Please follow the link in your email');
        // eslint-disable-next-line no-console
        stytch.utils.getPKCEPair().then(console.log);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        key="phone"
        onChangeText={(val: string) => setEmail(val)}
        placeholder="test@stytch.com"
        defaultValue={email}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={login}
      />
      <Button title="Send Email" onPress={login} />
    </View>
  );
}

export default EML;
