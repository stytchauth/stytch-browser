import { B2BOAuthProviders } from '@stytch/core/public';
import React from 'react';
import { Image, Text, TouchableWithoutFeedback, View } from 'react-native';

import { useTheme } from '../ContextProvider';
import { useFonts } from '../hooks/useFonts';
import { useOauthStart } from '../hooks/useOauthStart';

type Props = {
  icon: number;
  providerTypeTitle: string;
  providerType: B2BOAuthProviders;
  loginRedirectUrl?: string;
  signupRedirectUrl?: string;
  discoveryRedirectUrl?: string;
  customScopes?: string[];
  providerParams?: Record<string, string>;
};

export const OAuthB2BButton = (props: Props) => {
  const { oauthStart } = useOauthStart();
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <TouchableWithoutFeedback id={`oauth-${props.providerType}`} onPress={() => oauthStart(props)}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          borderWidth: 1,
          borderRadius: theme.buttonBorderRadius,
          borderColor: theme.inputBorderColor,
          backgroundColor: theme.socialButtonBackgroundColor,
          height: 45,
          padding: 0,
          alignContent: 'center',
        }}
      >
        <Image style={{ width: 24, height: 24 }} source={props.icon} />
        <Text
          style={{
            verticalAlign: 'middle',
            lineHeight: 24,
            fontFamily: getFontFor('IBMPlexSans_Regular'),
            fontSize: 18,
            textAlign: 'center',
            color: theme.socialButtonTextColor,
          }}
        >
          Continue with {props.providerTypeTitle}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};
