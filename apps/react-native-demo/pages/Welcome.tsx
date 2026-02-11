import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { styles } from './styles';
import { Button, View } from 'react-native';
import { useStytch, useStytchSession } from '@stytch/react-native';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { createErrorAlert } from '../components/errorAlert';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const Welcome = ({ navigation }: Props) => {
  const stytch = useStytch();
  const [hasBiometricFactor, setHasBiometricFactor] = useState(false);
  const passkeysDomain = Constants.expoConfig?.extra?.webAuthnDomain;
  const { session, fromCache } = useStytchSession();

  useEffect(() => {
    stytch.biometrics.isRegistrationAvailable().then((res: boolean) => {
      setHasBiometricFactor(res);
    });
  }, [stytch.biometrics]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('GOT CALLBACK: fromCache = ', fromCache);
  }, [session, fromCache]);

  const authenticateBiometrics = () => {
    stytch.biometrics.authenticate({
      sessionDurationMinutes: 60,
      prompt: 'Login to Stytch',
    });
  };

  const authenticatePasskeys = () => {
    stytch.webauthn
      .authenticate({
        domain: passkeysDomain,
        is_passkey: true,
        session_duration_minutes: 30,
      })
      .catch((err) => createErrorAlert(err));
  };

  const getTelemetryId = () => {
    // eslint-disable-next-line no-console
    stytch.dfp.getTelemetryID().then(console.log).catch(console.log);
  };

  return (
    <View style={styles.container}>
      <Button title="Login with EML" onPress={() => navigation.navigate('EML')} />
      <Button title="Login with OTP" onPress={() => navigation.navigate('OTP')} />
      <Button title="Login with OAuth" onPress={() => navigation.navigate('OAuth')} />
      <Button title="Login with Passkeys" onPress={authenticatePasskeys} />
      {hasBiometricFactor && <Button title="Login with Biometrics" onPress={authenticateBiometrics} />}
      <Button title="Login with Stytch UI" onPress={() => navigation.navigate('StytchUI')} />
      <Button title="Get telemetryid" onPress={getTelemetryId} />
    </View>
  );
};

export default Welcome;
