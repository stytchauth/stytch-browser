import * as React from 'react';
import { styles } from './styles';
import { useState } from 'react';
import { useStytch, OTPsLoginOrCreateResponse } from '@stytch/react-native';
import { Button, TextInput, View } from 'react-native';

function OTP() {
  const stytch = useStytch();

  const [number, setNumber] = useState('');
  const [methodId, setMethodId] = useState<string | undefined>();

  const login = () => {
    stytch.otps.sms
      .loginOrCreate(number, { expiration_minutes: 5, enable_autofill: true })
      .then((res: OTPsLoginOrCreateResponse) => {
        setMethodId(res.method_id);
      });
  };

  const authenticate = () => {
    if (methodId) {
      stytch.otps.authenticate(number, methodId, {
        session_duration_minutes: 60,
      });
    }
  };

  return methodId ? (
    <View style={styles.container}>
      <TextInput placeholder="123456" onChangeText={setNumber} />
      <Button title="Verify Code" onPress={authenticate} />
    </View>
  ) : (
    <View style={styles.container}>
      <TextInput placeholder="+1(000)000-0000" onChangeText={setNumber} />
      <Button title="Send SMS" onPress={login} />
    </View>
  );
}

export default OTP;
