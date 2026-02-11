import React from 'react';
import { TextInputProps, View } from 'react-native';
import { useUpdateMemberEmailAddress } from '../hooks/updateMemberEmailAddress';
import { useGlobalReducer } from '../ContextProvider';
import { StytchInput } from './StytchInput';
import { FormFieldError } from './FormFieldError';
import { useDidFinishEditingEmailAddress } from '../hooks/useDidFinishEditingEmailAddress';

type EmailEntryFormProps = {
  onValidEmailEntered?(): void;
  editable?: boolean;
};

export const EMAIL_ADDRESS_PLACEHOLDER = 'example@email.com';

export const EmailEntryForm = (props: TextInputProps & EmailEntryFormProps) => {
  const [state] = useGlobalReducer();
  const { setMemberEmailAddress } = useUpdateMemberEmailAddress();
  const { setDidFinishEditingEmailAddress } = useDidFinishEditingEmailAddress();
  return (
    <View testID="EmailEntryForm">
      <StytchInput
        onChangeText={setMemberEmailAddress}
        value={state.memberState.emailAddress.emailAddress}
        placeholder={EMAIL_ADDRESS_PLACEHOLDER}
        keyboardType="email-address"
        editable={props.editable}
        onBlur={setDidFinishEditingEmailAddress}
        returnKeyType={props.returnKeyType}
        onSubmitEditing={props.onSubmitEditing}
        autoCorrect={false}
      />
      {state.memberState.emailAddress.isValid == false && state.memberState.emailAddress.didFinish == true && (
        <FormFieldError text="Invalid email address"></FormFieldError>
      )}
    </View>
  );
};
