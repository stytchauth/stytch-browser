import React from 'react';
import { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { arrayUtils } from '@stytch/core';
import { OAuthButton } from '../../../components/OAuthButton';
import { GoogleOneTap } from '../../../components/GoogleOneTap';
import { OAuthProviders } from '@stytch/core/public';
import { useConfig } from '../../GlobalContextProvider';
import { Flex } from '../../../components/Flex';
import { Text } from '../../../components/Text';
import AppleIcon from '../../../../assets/apple';
import GithubIcon from '../../../../assets/github';
import FacebookIcon from '../../../../assets/facebook';
import GoogleIcon from '../../../../assets/google';
import MicrosoftIcon from '../../../../assets/microsoft';
import GitLabIcon from '../../../../assets/gitlab';
import DiscordIcon from '../../../../assets/discord';
import SlackIcon from '../../../../assets/slack';
import AmazonIcon from '../../../../assets/amazon';
import BitbucketIcon from '../../../../assets/bitbucket';
import LinkedInIcon from '../../../../assets/linkedin';
import CoinbaseIcon from '../../../../assets/coinbase';
import TwitchIcon from '../../../../assets/twitch';
import TwitterIcon from '../../../../assets/twitter';
import TikTokIcon from '../../../../assets/tiktok';
import SnapchatIcon from '../../../../assets/snapchat';
import FigmaIcon from '../../../../assets/figma';
import SalesforceIcon from '../../../../assets/salesforce';
import YahooIcon from '../../../../assets/yahooLogo';
import { useLastUsedOAuth } from './useLastUsedOAuth';

interface ProviderInfo {
  messageDescriptor: MessageDescriptor;
  icon: React.ReactNode;
}

const providerInfo = {
  [OAuthProviders.Google]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGoogle', message: 'Continue with Google' }),
    icon: <GoogleIcon />,
  },
  [OAuthProviders.Microsoft]: {
    messageDescriptor: msg({ id: 'oauth.continueWithMicrosoft', message: 'Continue with Microsoft' }),
    icon: <MicrosoftIcon />,
  },
  [OAuthProviders.Apple]: {
    messageDescriptor: msg({ id: 'oauth.continueWithApple', message: 'Continue with Apple' }),
    icon: <AppleIcon />,
  },
  [OAuthProviders.Github]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGitHub', message: 'Continue with GitHub' }),
    icon: <GithubIcon />,
  },
  [OAuthProviders.GitLab]: {
    messageDescriptor: msg({ id: 'oauth.continueWithGitLab', message: 'Continue with GitLab' }),
    icon: <GitLabIcon />,
  },
  [OAuthProviders.Facebook]: {
    messageDescriptor: msg({ id: 'oauth.continueWithFacebook', message: 'Continue with Facebook' }),
    icon: <FacebookIcon />,
  },
  [OAuthProviders.Discord]: {
    messageDescriptor: msg({ id: 'oauth.continueWithDiscord', message: 'Continue with Discord' }),
    icon: <DiscordIcon />,
  },
  [OAuthProviders.Salesforce]: {
    messageDescriptor: msg({ id: 'oauth.continueWithSalesforce', message: 'Continue with Salesforce' }),
    icon: <SalesforceIcon />,
  },
  [OAuthProviders.Slack]: {
    messageDescriptor: msg({ id: 'oauth.continueWithSlack', message: 'Continue with Slack' }),
    icon: <SlackIcon />,
  },
  [OAuthProviders.Amazon]: {
    messageDescriptor: msg({ id: 'oauth.continueWithAmazon', message: 'Continue with Amazon' }),
    icon: <AmazonIcon />,
  },
  [OAuthProviders.Bitbucket]: {
    messageDescriptor: msg({ id: 'oauth.continueWithBitbucket', message: 'Continue with Bitbucket' }),
    icon: <BitbucketIcon />,
  },
  [OAuthProviders.LinkedIn]: {
    messageDescriptor: msg({ id: 'oauth.continueWithLinkedIn', message: 'Continue with LinkedIn' }),
    icon: <LinkedInIcon />,
  },
  [OAuthProviders.Coinbase]: {
    messageDescriptor: msg({ id: 'oauth.continueWithCoinbase', message: 'Continue with Coinbase' }),
    icon: <CoinbaseIcon />,
  },
  [OAuthProviders.Twitch]: {
    messageDescriptor: msg({ id: 'oauth.continueWithTwitch', message: 'Continue with Twitch' }),
    icon: <TwitchIcon />,
  },
  [OAuthProviders.Twitter]: {
    messageDescriptor: msg({ id: 'oauth.continueWithTwitter', message: 'Continue with Twitter' }),
    icon: <TwitterIcon />,
  },
  [OAuthProviders.TikTok]: {
    messageDescriptor: msg({ id: 'oauth.continueWithTikTok', message: 'Continue with TikTok' }),
    icon: <TikTokIcon />,
  },
  [OAuthProviders.Snapchat]: {
    messageDescriptor: msg({ id: 'oauth.continueWithSnapchat', message: 'Continue with Snapchat' }),
    icon: <SnapchatIcon />,
  },
  [OAuthProviders.Figma]: {
    messageDescriptor: msg({ id: 'oauth.continueWithFigma', message: 'Continue with Figma' }),
    icon: <FigmaIcon />,
  },
  [OAuthProviders.Yahoo]: {
    messageDescriptor: msg({ id: 'oauth.continueWithYahoo', message: 'Continue with Yahoo' }),
    icon: <YahooIcon />,
  },
} satisfies Record<OAuthProviders, ProviderInfo>;

const defaultProviderInfo = {
  messageDescriptor: null,
  icon: <></>,
};

export const OAuthButtons = () => {
  const { t } = useLingui();
  const config = useConfig();
  const [lastUsedOAuth, setLastUsedOAuth] = useLastUsedOAuth();

  if (!config.oauthOptions) return <></>;
  const { providers, loginRedirectURL, signupRedirectURL } = config.oauthOptions;

  const [reorderedProviders, foundLastUsed] = arrayUtils.moveToFront(
    providers,
    (provider) => provider.type === lastUsedOAuth,
  );

  return (
    <Flex direction="column" gap={8} className="oauth-buttons">
      {reorderedProviders.map((provider, index) => {
        const { icon, messageDescriptor } = providerInfo[provider.type] ?? defaultProviderInfo;

        const providerProps = {
          customScopes: provider.custom_scopes,
          providerParams: provider.provider_params,
        };

        if (provider.one_tap) {
          return (
            <GoogleOneTap
              position={provider.position}
              key={`oauth-${provider.type}`}
              {...providerProps}
              cancelOnTapOutside={provider.cancel_on_tap_outside}
            />
          );
        }

        const button = (
          <OAuthButton
            key={`oauth-${provider.type}`}
            providerType={provider.type}
            icon={icon}
            label={messageDescriptor ? t(messageDescriptor) : ''}
            loginRedirectUrl={loginRedirectURL}
            signupRedirectUrl={signupRedirectURL}
            onSuccess={() => setLastUsedOAuth(provider.type)}
            {...providerProps}
          />
        );

        if (foundLastUsed && index === 0) {
          return (
            <div key={`oauth-${provider.type}`}>
              <Text size="helper" color="secondary" align="right">
                {t({ id: 'provider.lastUsed', message: 'Last used' })}
              </Text>
              {button}
            </div>
          );
        }

        return button;
      })}
    </Flex>
  );
};
