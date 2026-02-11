import { InternalError, useStytch, useStytchUser } from '@stytch/react-native';
import Constants from 'expo-constants';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import { createErrorAlert } from '../components/errorAlert';
import { styles } from './styles';

const Profile = () => {
  const passkeysDomain = Constants.expoConfig?.extra?.webAuthnDomain;
  const stytch = useStytch();
  const { user } = useStytchUser();

  const [registrationId, setRegistrationId] = useState<string | undefined>('');
  const [sessionToken, setSessionToken] = useState(stytch.session.getTokens()?.session_token);
  const [sessionExpirationDate, setSessionExpirationDate] = useState(stytch.session.getSync()?.expires_at);

  const [isAvailable, setIsAvailable] = useState(Boolean);
  const [telemetryID, setTelemetryID] = useState<string | undefined>(undefined);

  const checkBiometricAvailability = useCallback(async () => {
    const available = await stytch.biometrics.isRegistrationAvailable();
    setIsAvailable(available);
  }, [stytch.biometrics]);

  // Function to get telemetry ID
  const fetchTelemetryID = useCallback(async () => {
    const id = await stytch.dfp.getTelemetryID();
    setTelemetryID(id);
  }, [stytch.dfp]);

  useEffect(() => {
    checkBiometricAvailability();
    fetchTelemetryID();
  }, [checkBiometricAvailability, fetchTelemetryID]);

  const registerBiometrics = () => {
    stytch.biometrics
      .register({
        prompt: 'Register Your Biometric Factor',
        allowFallbackToCleartext: true,
      })
      .then(() => {
        setSessionToken(stytch.session.getTokens()?.session_token);
        setSessionExpirationDate(stytch.session.getSync()?.expires_at);
      })
      .catch((e) => {
        /* eslint-disable no-console */
        if (e instanceof InternalError) {
          console.log(e.name);
          console.log(e.message);
          console.log(e.nativeStack);
        }
      });
  };

  const deleteBiometricsRegistration = () => {
    stytch.biometrics.removeRegistration();
  };

  const registerPasskey = () => {
    stytch.webauthn
      .register({
        domain: passkeysDomain,
        authenticator_type: 'platform',
        is_passkey: true,
        session_duration_minutes: 60,
      })
      .catch((err) => createErrorAlert(err));
  };

  const getRegistrationId = () => {
    setRegistrationId('Fetching...');
    stytch.biometrics
      .getBiometricRegistrationId()
      .then(setRegistrationId)
      .catch((err) => createErrorAlert(err));
  };

  const authenticateBiometrics = () => {
    stytch.biometrics.authenticate({
      sessionDurationMinutes: 60,
      prompt: 'Login to Stytch',
    });
  };

  const createTotp = () => {
    stytch.totp
      .create({
        expiration_minutes: 10,
      })
      .catch(createErrorAlert);
  };

  return (
    <View style={styles.container}>
      <Text>Name: {user?.name.first_name}</Text>
      <Text>Biometric registration ID: {registrationId?.trim() !== '' ? registrationId : 'Empty String'}</Text>
      <Text>Session Token: {sessionToken}</Text>
      <Text>Session Expiration: {sessionExpirationDate}</Text>
      <Text>Biometric Registration Available: {isAvailable === null ? 'Checking...' : isAvailable ? 'Yes' : 'No'}</Text>
      <Text>Telemetry ID: {telemetryID === undefined ? 'Fetching...' : telemetryID || 'No ID available'}</Text>
      <Button title="Add Biometrics Registration" onPress={registerBiometrics} />
      <Button title="Delete Biometrics Registration" onPress={deleteBiometricsRegistration} />
      <Button title="Get Biometrics RegId" onPress={getRegistrationId} />
      <Button title="Check Biometric isRegistrationAvailable" onPress={checkBiometricAvailability} />
      <Button title="Register Passkey" onPress={registerPasskey} />
      <Button title="Login with Biometrics" onPress={authenticateBiometrics} />
      <Button title="Create TOTP" onPress={createTotp} />
      <Button title="Get New Telemetry ID" onPress={fetchTelemetryID} />
      <Button title="Logout" onPress={() => stytch.session.revoke()} />
    </View>
  );
};

export default Profile;
