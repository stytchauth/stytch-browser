import React from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { PageTitle } from '../components/PageTitle';
import { EmailEntryForm } from '../components/EmailEntryForm';
import { SubtitleText } from '../components/SubtitleText';
import { StytchTextButton } from '../components/StytchTextButton';
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
