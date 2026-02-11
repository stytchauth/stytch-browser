import * as React from 'react';
import { useGlobalReducer, useTheme } from '../ContextProvider';
import { Image, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useSSOStart } from '../hooks/useSSOStart';
import { useFonts } from '../hooks/useFonts';
import { AuthFlowType, SSOActiveConnection } from '@stytch/core/public';
import { Screen } from '../screens';

const Button = ({
  display_name,
  icon,
  onClick,
}: {
  display_name: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => {
  const theme = useTheme();
  const { getFontFor } = useFonts();
  return (
    <TouchableWithoutFeedback id={`sso-${display_name}`} onPress={onClick}>
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
        {icon}
        <Text
          style={{
            verticalAlign: 'middle',
            lineHeight: 24,
            fontFamily: getFontFor('IBMPlexSans_Regular'),
            fontSize: 18,
            textAlign: 'center',
            color: theme.socialButtonTextColor,
          }}
        >{`Continue with ${display_name}`}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

type SamlKnownIdp = 'generic' | 'okta' | 'microsoft-entra' | 'google-workspace';
type OidcKnownIdp = 'generic' | 'okta' | 'microsoft-entra';
type SsoKnownIdp = SamlKnownIdp | OidcKnownIdp;

const iconMap: Record<Exclude<SsoKnownIdp, 'generic'>, number> = {
  'google-workspace': require('../../assets/google.png'),
  'microsoft-entra': require('../../assets/microsoft.png'),
  okta: require('../../assets/okta.png'),
};

const IdentityProviderIcon = ({ identity_provider }: { identity_provider: string | undefined }) => {
  const icon = iconMap[identity_provider as Exclude<SsoKnownIdp, 'generic'>] ?? require('../../assets/sso.png');
  return <Image style={{ width: 24, height: 24 }} source={icon} />;
};

export const SSOButton = ({ provider }: { provider: SSOActiveConnection | null }) => {
  const [, dispatch] = useGlobalReducer();
  const { ssoStart } = useSSOStart();

  const onClick = () => {
    if (provider?.connection_id) {
      ssoStart(provider?.connection_id);
    } else {
      dispatch({ type: 'navigate/to', screen: Screen.SSODiscoveryEmail });
    }
  };
  return (
    <Button
      display_name={provider?.display_name ?? 'SSO'}
      icon={<IdentityProviderIcon identity_provider={provider?.identity_provider} />}
      onClick={onClick}
    />
  );
};

export const SSOButtons = () => {
  const [state] = useGlobalReducer();
  if (state.authenticationState.authFlowType === AuthFlowType.Discovery) {
    return (
      <View style={{ flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        <SSOButton provider={null} />
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'column', gap: 8, marginBottom: 8 }}>
      {state.authenticationState.organization?.sso_active_connections.map((provider) => {
        return <SSOButton key={`sso-button-${provider.display_name}`} provider={provider} />;
      })}
    </View>
  );
};
