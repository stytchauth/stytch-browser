import React from 'react';
import { B2BOAuthProviders } from '@stytch/core/public';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { MessageDescriptor } from '@lingui/core';
import { AuthButton } from './AuthButton';
import { useGlobalReducer, useStytch } from '../GlobalContextProvider';

import GoogleIcon from '../../../assets/google';
import MicrosoftIcon from '../../../assets/microsoft';
import HubSpotIcon from '../../../assets/hubspot';
import SlackIcon from '../../../assets/slack';
import GitHubIcon from '../../../assets/github';

interface OAuthProviderInfo {
  messageDescriptor: MessageDescriptor;
  icon: React.ReactNode;
}

const providerInfo: Record<B2BOAuthProviders, OAuthProviderInfo> = {
  [B2BOAuthProviders.Google]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGoogle', message: 'Continue with Google' }),
    icon: <GoogleIcon />,
  },
  [B2BOAuthProviders.Microsoft]: {
    messageDescriptor: msg({ id: 'oauth.continueWithMicrosoft', message: 'Continue with Microsoft' }),
    icon: <MicrosoftIcon />,
  },
  [B2BOAuthProviders.HubSpot]: {
    messageDescriptor: msg({ id: 'oauth.continueWithHubSpot', message: 'Continue with HubSpot' }),
    icon: <HubSpotIcon />,
  },
  [B2BOAuthProviders.Slack]: {
    messageDescriptor: msg({ id: 'oauth.continueWithSlack', message: 'Continue with Slack' }),
    icon: <SlackIcon />,
  },
  [B2BOAuthProviders.GitHub]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGitHub', message: 'Continue with GitHub' }),
    icon: <GitHubIcon />,
  },
};

const defaultProviderInfo = {
  messageDescriptor: null,
  icon: <></>,
};

type Props = {
  providerType: B2BOAuthProviders;
  loginRedirectUrl?: string;
  signupRedirectUrl?: string;
  discoveryRedirectUrl?: string;
  customScopes?: string[];
  providerParams?: Record<string, string>;
  onSuccess?: () => void;
};

export const OAuthB2BButton = ({
  providerType,
  loginRedirectUrl,
  signupRedirectUrl,
  discoveryRedirectUrl,
  customScopes,
  providerParams,
  onSuccess,
}: Props) => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const [state] = useGlobalReducer();

  const { messageDescriptor, icon } = providerInfo[providerType] ?? defaultProviderInfo;

  const onButtonClick = async () => {
    const providerClient = stytchClient.oauth[providerType];

    if (state.flowState.organization) {
      await providerClient.start({
        login_redirect_url: loginRedirectUrl,
        signup_redirect_url: signupRedirectUrl,
        custom_scopes: customScopes,
        organization_id: state.flowState.organization.organization_id,
        provider_params: providerParams,
      });
    } else {
      await providerClient.discovery.start({
        discovery_redirect_url: discoveryRedirectUrl,
        custom_scopes: customScopes,
        provider_params: providerParams,
      });
    }

    onSuccess?.();
  };

  return (
    <AuthButton id={`oauth-${providerType}`} onClick={onButtonClick} icon={icon}>
      {messageDescriptor ? t(messageDescriptor) : null}
    </AuthButton>
  );
};
