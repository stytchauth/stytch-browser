import React, { ReactElement } from 'react';
import { StringLiteralFromEnum } from '@stytch/core';
import { OAuthProviders, ProviderOptions, RNUIOAuthOptions } from '@stytch/core/public';
import { useOAuthStart } from '../hooks/oauthStart';
import { useTheme } from '../ContextProvider';
import { Text, TouchableWithoutFeedback, View, Image } from 'react-native';
import { useFonts } from '../hooks/useFonts';

export type OAuthButtonProps = {
  provider: StringLiteralFromEnum<OAuthProviders> | ProviderOptions;
  deprecatedOptions: RNUIOAuthOptions;
};

const mapProviderToIcon = (provider: StringLiteralFromEnum<OAuthProviders>): ReactElement => {
  switch (provider as OAuthProviders) {
    case OAuthProviders.Amazon:
      return <Image style={{ width: 24, height: 24 }} testID="Amazon" source={require('../../assets/amazon.png')} />;
    case OAuthProviders.Apple:
      return <Image style={{ width: 24, height: 24 }} testID="Apple" source={require('../../assets/apple.png')} />;
    case OAuthProviders.Bitbucket:
      return (
        <Image style={{ width: 24, height: 24 }} testID="Bitbucket" source={require('../../assets/bitbucket.png')} />
      );
    case OAuthProviders.Coinbase:
      return (
        <Image style={{ width: 24, height: 24 }} testID="Coinbase" source={require('../../assets/coinbase.png')} />
      );
    case OAuthProviders.Discord:
      return <Image style={{ width: 24, height: 24 }} testID="Discord" source={require('../../assets/discord.png')} />;
    case OAuthProviders.Facebook:
      return (
        <Image style={{ width: 24, height: 24 }} testID="Facebook" source={require('../../assets/facebook.png')} />
      );
    case OAuthProviders.Figma:
      return <Image style={{ width: 24, height: 24 }} testID="Figma" source={require('../../assets/figma.png')} />;
    case OAuthProviders.GitLab:
      return <Image style={{ width: 24, height: 24 }} testID="Gitlab" source={require('../../assets/gitlab.png')} />;
    case OAuthProviders.Github:
      return <Image style={{ width: 24, height: 24 }} testID="Github" source={require('../../assets/github.png')} />;
    case OAuthProviders.Google:
      return <Image style={{ width: 24, height: 24 }} testID="Google" source={require('../../assets/google.png')} />;
    case OAuthProviders.LinkedIn:
      return (
        <Image style={{ width: 24, height: 24 }} testID="Linkedin" source={require('../../assets/linkedin.png')} />
      );
    case OAuthProviders.Microsoft:
      return (
        <Image style={{ width: 24, height: 24 }} testID="Microsoft" source={require('../../assets/microsoft.png')} />
      );
    case OAuthProviders.Salesforce:
      return (
        <Image style={{ width: 24, height: 24 }} testID="Salesforce" source={require('../../assets/salesforce.png')} />
      );
    case OAuthProviders.Slack:
      return <Image style={{ width: 24, height: 24 }} testID="Slack" source={require('../../assets/slack.png')} />;
    case OAuthProviders.Snapchat:
      return (
        <Image style={{ width: 24, height: 24 }} testID="Snapchat" source={require('../../assets/snapchat.png')} />
      );
    case OAuthProviders.TikTok:
      return <Image style={{ width: 24, height: 24 }} testID="Tiktok" source={require('../../assets/tiktok.png')} />;
    case OAuthProviders.Twitch:
      return <Image style={{ width: 24, height: 24 }} testID="Twitch" source={require('../../assets/twitch.png')} />;
    case OAuthProviders.Twitter:
      return <Image style={{ width: 24, height: 24 }} testID="Twitter" source={require('../../assets/twitter.png')} />;
    case OAuthProviders.Yahoo:
      return <Image style={{ width: 24, height: 24 }} testID="Yahoo" source={require('../../assets/yahoo.png')} />;
  }
};

export type SafeOAuthProviderOptions = {
  provider: OAuthProviders;
  customScopes?: string[];
  providerParams?: Record<string, string>;
};

const getParamsFromOAuthProviderConfig = (
  provider: string | ProviderOptions,
  deprecatedOptions: RNUIOAuthOptions | undefined,
): SafeOAuthProviderOptions => {
  let providerType = '';
  let customScopes: string[] = [];
  let providerParams: Record<string, string> = {};
  if (typeof provider === 'string') {
    providerType = provider;
    customScopes = deprecatedOptions?.customScopes || [];
    providerParams = deprecatedOptions?.providerParams || {};
  } else {
    providerType = provider.type;
    customScopes = provider.custom_scopes || [];
    providerParams = provider.provider_params || {};
  }
  const oauthProvider = providerType as OAuthProviders;
  return { provider: oauthProvider, customScopes, providerParams };
};

export const OAuthButton = (props: OAuthButtonProps) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  const { startOAuthForProvider } = useOAuthStart();
  const providerProps = getParamsFromOAuthProviderConfig(props.provider, props.deprecatedOptions);
  return (
    <TouchableWithoutFeedback onPress={() => startOAuthForProvider(providerProps)} testID="OAuthButton">
      <View
        style={{
          borderWidth: 1,
          borderRadius: theme.buttonBorderRadius,
          borderColor: theme.inputBorderColor,
          backgroundColor: theme.socialButtonBackgroundColor,
          height: 45,
          padding: 0,
          marginBottom: 12,
          flexDirection: 'row',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: 24, height: 24, marginEnd: 4 }}>{mapProviderToIcon(providerProps.provider)}</View>
        <Text
          style={{
            lineHeight: 24,
            fontFamily: getFontFor('IBMPlexSans_Regular'),
            fontSize: 18,
            textAlign: 'center',
            color: theme.socialButtonTextColor,
          }}
        >
          Continue with {providerProps.provider.charAt(0).toUpperCase() + providerProps.provider.slice(1)}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};
