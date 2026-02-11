import React, { useEffect, useState } from 'react';
import { View, Image, TouchableWithoutFeedback } from 'react-native';
import { useGlobalReducer } from '../ContextProvider';
import { StytchInput } from './StytchInput';
import { useUpdateUserPassword } from '../hooks/updateUserPassword';
import { usePasswordsStrengthCheck } from '../hooks/passwordsStrengthCheck';
import { BreachedPassword } from './BreachedPassword';
import { ZXCVBNFeedback } from './ZXCVBNFeedback';
import { LUDSFeedback } from './LUDSFeedback';

type PasswordEntryFormProps = {
  skipStrengthCheck?: boolean;
};

export const PasswordEntryForm = (props: PasswordEntryFormProps) => {
  const [state] = useGlobalReducer();
  const passwordState = state.userState.password;
  const strengthCheckResponse = passwordState.passwordStrengthCheckResponse;
  const { setUserPassword } = useUpdateUserPassword();
  const { checkPasswordStrength } = usePasswordsStrengthCheck();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  useEffect(() => {
    if (props.skipStrengthCheck != true && state.userState.password.password) {
      checkPasswordStrength();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.userState.password.password]);

  return (
    <View testID="PasswordEntryForm">
      <View style={{ position: 'relative' }}>
        <StytchInput
          onChangeText={setUserPassword}
          value={passwordState.password}
          placeholder="Password"
          keyboardType="default"
          secureTextEntry={secureTextEntry}
          returnKeyType="go"
          autoCorrect={false}
        />
        <TouchableWithoutFeedback
          onPress={() => {
            setSecureTextEntry(!secureTextEntry);
          }}
          testID="RevealPassword"
        >
          <View style={{ marginBottom: 24, width: 48, height: 48, position: 'absolute', end: 0, top: 0 }}>
            <Image
              style={{ width: 48, height: 48 }}
              source={secureTextEntry ? require('../../assets/eye.png') : require('../../assets/eyeOff.png')}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      {strengthCheckResponse?.strength_policy == 'zxcvbn' && (
        <ZXCVBNFeedback
          score={strengthCheckResponse?.score ?? 0}
          suggestions={strengthCheckResponse?.feedback.suggestions ?? []}
        />
      )}
      {strengthCheckResponse?.strength_policy == 'luds' && (
        <LUDSFeedback
          missingCharacters={strengthCheckResponse?.feedback.luds_requirements.missing_characters}
          missingComplexity={strengthCheckResponse?.feedback.luds_requirements.missing_complexity}
        />
      )}
      {strengthCheckResponse?.breached_password == true && <BreachedPassword />}
    </View>
  );
};
