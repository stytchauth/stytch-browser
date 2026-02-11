import React, { useState } from 'react';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchInput } from '../components/StytchInput';
import { CaptionText } from '../components/CaptionText';
import { StytchTextButton } from '../components/StytchTextButton';
import { useRecoveryCodesRecover } from '../hooks/useRecoveryCodesRecover';

export const RecoveryCodeEntryScreen = () => {
  const [code, setCode] = useState('');
  const { recoveryCodesRecover } = useRecoveryCodesRecover();
  return (
    <ScreenWrapper testID="RecoveryCodeEntryScreen">
      <PageTitle title="Enter backup code" />
      <CaptionText text="Enter one of the backup codes you saved when setting up your authenticator app." />
      <StytchInput
        onChangeText={setCode}
        value={code}
        placeholder={'Enter backup code'}
        keyboardType="numeric"
        editable={true}
      />
      <StytchTextButton
        text="Continue"
        onPress={() => {
          recoveryCodesRecover(code);
        }}
      />
    </ScreenWrapper>
  );
};
