import React from 'react';
import { View } from 'react-native';
import { useUpdateUserEmailAddress } from '../hooks/updateUserEmailAddress';
import { useGlobalReducer } from '../ContextProvider';
import { FormFieldError } from './FormFieldError';
import { StytchInput } from './StytchInput';
import { StytchButton } from './StytchButton';

type EmailEntryFormProps = {
  onValidEmailEntered?(): void;
  editable?: boolean;
};

export const EMAIL_ADDRESS_PLACEHOLDER = 'example@email.com';

export const EmailEntryForm = (props: EmailEntryFormProps) => {
  const [state] = useGlobalReducer();
  const { setUserEmailAddress } = useUpdateUserEmailAddress();
  return (
    <View testID="EmailEntryForm">
      <StytchInput
        onChangeText={setUserEmailAddress}
        value={state.userState.emailAddress.emailAddress}
        placeholder={EMAIL_ADDRESS_PLACEHOLDER}
        keyboardType="email-address"
        editable={props.editable}
      />
      {state.userState.emailAddress.isValid == false &&
        state.userState.emailAddress.emailAddress != undefined &&
        state.userState.emailAddress.emailAddress != '' && (
          <FormFieldError text="Invalid email address"></FormFieldError>
        )}
      {props.onValidEmailEntered && (
        <StytchButton
          enabled={state.userState.emailAddress.isValid == true}
          text="Continue"
          onPress={props.onValidEmailEntered}
        />
      )}
    </View>
  );
};
