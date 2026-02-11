import React from 'react';

import { EmailEntryForm } from '../components/EmailEntryForm';
import { PageTitle } from '../components/PageTitle';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StytchTextButton } from '../components/StytchTextButton';
import { SubtitleText } from '../components/SubtitleText';
import { useGlobalReducer } from '../ContextProvider';
import { useSsoDiscoveryConnection } from '../hooks/useSSODiscoverConnections';

export const SSODiscoveryEmailScreen = () => {
  const [state] = useGlobalReducer();
  const { ssoDiscoverConnection } = useSsoDiscoveryConnection();
  return (
    <ScreenWrapper testID="SSODiscoveryEmailScreen">
      <PageTitle title="Enter your email to continue" />
      <SubtitleText text="Email" textAlign="left" />
      <EmailEntryForm editable={true} returnKeyType="next" />
      <StytchTextButton
        text="Continue"
        enabled={state.memberState.emailAddress.isValid == true}
        onPress={ssoDiscoverConnection}
      />
    </ScreenWrapper>
  );
};
