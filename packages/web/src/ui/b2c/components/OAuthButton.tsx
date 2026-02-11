import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { StringLiteralFromEnum } from '@stytch/core';
import { OAuthProviders } from '@stytch/core/public';
import React from 'react';

import Button from '../../components/atoms/Button';
import { IconRegistry } from '../../components/IconRegistry';
import { getButtonId, usePresentation } from '../../components/PresentationConfig';
import { useStytch } from '../GlobalContextProvider';
import type { oauthIcons } from './Icons';

interface ProviderInfo {
  messageDescriptor: MessageDescriptor;
}

const providerInfo = {
  [OAuthProviders.Google]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGoogle', message: 'Continue with Google' }),
  },
  [OAuthProviders.Microsoft]: {
    messageDescriptor: msg({ id: 'oauth.continueWithMicrosoft', message: 'Continue with Microsoft' }),
  },
  [OAuthProviders.Apple]: {
    messageDescriptor: msg({ id: 'oauth.continueWithApple', message: 'Continue with Apple' }),
  },
  [OAuthProviders.Github]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGitHub', message: 'Continue with GitHub' }),
  },
  [OAuthProviders.GitLab]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGitLab', message: 'Continue with GitLab' }),
  },
  [OAuthProviders.Facebook]: {
    messageDescriptor: msg({ id: 'oauth.continueWithFacebook', message: 'Continue with Facebook' }),
  },
  [OAuthProviders.Discord]: {
    messageDescriptor: msg({ id: 'oauth.continueWithDiscord', message: 'Continue with Discord' }),
  },
  [OAuthProviders.Salesforce]: {
    messageDescriptor: msg({ id: 'oauth.continueWithSalesforce', message: 'Continue with Salesforce' }),
  },
  [OAuthProviders.Slack]: {
    messageDescriptor: msg({ id: 'oauth.continueWithSlack', message: 'Continue with Slack' }),
  },
  [OAuthProviders.Amazon]: {
    messageDescriptor: msg({ id: 'oauth.continueWithAmazon', message: 'Continue with Amazon' }),
  },
  [OAuthProviders.Bitbucket]: {
    messageDescriptor: msg({ id: 'oauth.continueWithBitbucket', message: 'Continue with Bitbucket' }),
  },
  [OAuthProviders.LinkedIn]: {
    messageDescriptor: msg({ id: 'oauth.continueWithLinkedIn', message: 'Continue with LinkedIn' }),
  },
  [OAuthProviders.Coinbase]: {
    messageDescriptor: msg({ id: 'oauth.continueWithCoinbase', message: 'Continue with Coinbase' }),
  },
  [OAuthProviders.Twitch]: {
    messageDescriptor: msg({ id: 'oauth.continueWithTwitch', message: 'Continue with Twitch' }),
  },
  [OAuthProviders.Twitter]: {
    messageDescriptor: msg({ id: 'oauth.continueWithX', message: 'Continue with X' }),
  },
  [OAuthProviders.TikTok]: {
    messageDescriptor: msg({ id: 'oauth.continueWithTikTok', message: 'Continue with TikTok' }),
  },
  [OAuthProviders.Snapchat]: {
    messageDescriptor: msg({ id: 'oauth.continueWithSnapchat', message: 'Continue with Snapchat' }),
  },
  [OAuthProviders.Figma]: {
    messageDescriptor: msg({ id: 'oauth.continueWithFigma', message: 'Continue with Figma' }),
  },
  [OAuthProviders.Yahoo]: {
    messageDescriptor: msg({ id: 'oauth.continueWithYahoo', message: 'Continue with Yahoo' }),
  },
} satisfies Record<OAuthProviders, ProviderInfo>;

type Props = {
  providerType: StringLiteralFromEnum<OAuthProviders>;
  loginRedirectUrl?: string;
  signupRedirectUrl?: string;
  customScopes?: string[];
  providerParams?: Record<string, string>;
  onSuccess?: () => void;
};

export const OAuthButton = ({
  providerType,
  loginRedirectUrl,
  signupRedirectUrl,
  customScopes,
  providerParams,
  onSuccess,
}: Props) => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const presentation = usePresentation();
  const iconRegistry: IconRegistry<keyof typeof oauthIcons> = presentation.iconRegistry;
  const id = getButtonId(`oauth-${providerType}`, presentation.options);

  const provider = providerInfo[providerType];
  let label: string = providerType;
  let icon = null;
  if (provider) {
    const { messageDescriptor } = provider;

    const iconName = providerType === 'twitter' ? 'xTwitter' : providerType;
    const Icon = iconRegistry[iconName];

    label = t(messageDescriptor);
    icon = <Icon />;
  }

  const onButtonClick = async () => {
    await stytchClient.oauth[providerType].start({
      login_redirect_url: loginRedirectUrl,
      signup_redirect_url: signupRedirectUrl,
      custom_scopes: customScopes,
      provider_params: providerParams,
    });
    onSuccess?.();
  };

  return (
    <Button onClick={onButtonClick} variant="outline" icon={icon} id={id}>
      {label}
    </Button>
  );
};
