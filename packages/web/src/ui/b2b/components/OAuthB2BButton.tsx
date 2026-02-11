import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { B2BOAuthProviders } from '@stytch/core/public';
import React from 'react';

import Button from '../../components/atoms/Button';
import { IconRegistry } from '../../components/IconRegistry';
import { getButtonId, usePresentation } from '../../components/PresentationConfig';
import { useGlobalReducer, useStytch } from '../GlobalContextProvider';
import type { oauthIcons } from './Icons';

type OauthIconName = keyof typeof oauthIcons;

interface OAuthProviderInfo {
  messageDescriptor: MessageDescriptor;
}

const providerInfo: Record<B2BOAuthProviders, OAuthProviderInfo> = {
  [B2BOAuthProviders.Google]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGoogle', message: 'Continue with Google' }),
  },
  [B2BOAuthProviders.Microsoft]: {
    messageDescriptor: msg({ id: 'oauth.continueWithMicrosoft', message: 'Continue with Microsoft' }),
  },
  [B2BOAuthProviders.HubSpot]: {
    messageDescriptor: msg({ id: 'oauth.continueWithHubSpot', message: 'Continue with HubSpot' }),
  },
  [B2BOAuthProviders.Slack]: {
    messageDescriptor: msg({ id: 'oauth.continueWithSlack', message: 'Continue with Slack' }),
  },
  [B2BOAuthProviders.GitHub]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGitHub', message: 'Continue with GitHub' }),
  },
};

export type OauthB2BButtonProps = {
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
}: OauthB2BButtonProps) => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const [state] = useGlobalReducer();

  const presentation = usePresentation();
  const iconRegistry: IconRegistry<OauthIconName> = presentation.iconRegistry;
  const id = getButtonId(`oauth-${providerType}`, presentation.options);

  const provider = providerInfo[providerType];
  let label: string = providerType;
  let icon = null;
  if (provider) {
    const { messageDescriptor } = provider;
    const Icon = iconRegistry[providerType];
    label = t(messageDescriptor);
    icon = <Icon />;
  }

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
    <Button onClick={onButtonClick} variant="outline" icon={icon} id={id}>
      {label}
    </Button>
  );
};
