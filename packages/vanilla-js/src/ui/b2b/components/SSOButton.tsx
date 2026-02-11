import React from 'react';
import { SSOActiveConnection } from '@stytch/core/public';
import { useLingui } from '@lingui/react/macro';
import { AuthButton } from './AuthButton';
import { useConfig, useStytch } from '../GlobalContextProvider';
import { SsoKnownIdp } from '../../../utils/KnownIdp';

import GoogleIcon from '../../../assets/google';
import MicrosoftIcon from '../../../assets/microsoft';
import OktaIcon from '../../../assets/okta';
import SSOIcon from '../../../assets/sso';

const iconMap: Record<Exclude<SsoKnownIdp, 'generic'>, React.ElementType> = {
  'google-workspace': GoogleIcon,
  'microsoft-entra': MicrosoftIcon,
  okta: OktaIcon,
};

export const IdentityProviderIcon = ({ identityProvider }: { identityProvider: string }) => {
  const Icon = iconMap[identityProvider as Exclude<SsoKnownIdp, 'generic'>] ?? SSOIcon;

  return <Icon />;
};

interface Props {
  connection: SSOActiveConnection;
  onStart?: (connection: SSOActiveConnection) => void;
}

export const SSOButton = (props: Props) => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const config = useConfig();

  const onButtonClick = () =>
    stytchClient.sso
      .start({
        connection_id: props.connection.connection_id,
        signup_redirect_url: config.ssoOptions?.signupRedirectURL,
        login_redirect_url: config.ssoOptions?.loginRedirectURL,
      })
      .then(() => {
        props.onStart?.(props.connection);
      });

  const { display_name: displayName } = props.connection;

  const icon = <IdentityProviderIcon identityProvider={props.connection.identity_provider} />;

  return (
    <AuthButton id={`sso-${displayName}`} onClick={onButtonClick} icon={icon}>
      {t({ id: 'provider.continueWith', message: `Continue with ${displayName}` })}
    </AuthButton>
  );
};
