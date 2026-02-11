import React, { LegacyRef, useEffect, useState } from 'react';
import { Image, TextInput, TextInputProps, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

import { useGlobalReducer } from '../ContextProvider';
import { usePasswordsStrengthCheck } from '../hooks/passwordsStrengthCheck';
import { useUpdateMemberPassword } from '../hooks/updateMemberPassword';
import { BreachedPassword } from './BreachedPassword';
import { LUDSFeedback } from './LUDSFeedback';
import { StytchInput } from './StytchInput';
import { ZXCVBNFeedback } from './ZXCVBNFeedback';

type PasswordEntryFormProps = {
  skipStrengthCheck?: boolean;
  reference?: LegacyRef<TextInput>;
};

export const PasswordEntryForm = (props: TextInputProps & PasswordEntryFormProps) => {
  const [state] = useGlobalReducer();
  const passwordState = state.memberState.password;
  const strengthCheckResponse = passwordState.passwordStrengthCheckResponse;
  const { setMemberPassword } = useUpdateMemberPassword();
  const { checkPasswordStrength } = usePasswordsStrengthCheck();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const darkMode = useColorScheme() == 'dark';
  useEffect(() => {
    if (props.skipStrengthCheck != true && state.memberState.password.password) {
      checkPasswordStrength();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.memberState.password.password]);

  return (
    <View testID="PasswordEntryForm">
      <View style={{ position: 'relative' }}>
        <StytchInput
          reference={props.reference}
          onChangeText={setMemberPassword}
          value={passwordState.password}
          placeholder="Password"
          keyboardType="default"
          secureTextEntry={secureTextEntry}
          returnKeyType="go"
          autoCorrect={false}
          onSubmitEditing={props.onSubmitEditing}
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
              source={
                secureTextEntry
                  ? darkMode
                    ? require('../../assets/eye_dark.png')
                    : require('../../assets/eye.png')
                  : darkMode
                    ? require('../../assets/eyeOff_dark.png')
                    : require('../../assets/eyeOff.png')
              }
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      {strengthCheckResponse?.strength_policy == 'zxcvbn' && (
        <ZXCVBNFeedback
          score={strengthCheckResponse?.score ?? 0}
          suggestions={strengthCheckResponse?.zxcvbn_feedback.suggestions ?? []}
        />
      )}
      {strengthCheckResponse?.strength_policy == 'luds' && (
        <LUDSFeedback
          missingCharacters={strengthCheckResponse?.luds_feedback.missing_characters}
          missingComplexity={strengthCheckResponse?.luds_feedback.missing_complexity}
        />
      )}
      {strengthCheckResponse?.breached_password == true && <BreachedPassword />}
    </View>
  );
};
