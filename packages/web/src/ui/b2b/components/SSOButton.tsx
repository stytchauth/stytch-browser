import { useLingui } from '@lingui/react/macro';
import { SSOActiveConnection } from '@stytch/core/public';
import React from 'react';

import { SSOIcon } from '../../../assets';
import { SsoKnownIdp } from '../../../utils/KnownIdp';
import Button from '../../components/atoms/Button';
import { getButtonId, usePresentation } from '../../components/PresentationConfig';
import { useConfig, useStytch } from '../GlobalContextProvider';
import type { ssoIcons } from './Icons';

type SsoIconNames = keyof typeof ssoIcons;

const iconMap: Record<string, SsoIconNames> = {
  'google-workspace': 'google',
  'microsoft-entra': 'microsoft',
  okta: 'okta',
} satisfies Record<Exclude<SsoKnownIdp, 'generic'>, SsoIconNames>;

export interface SSOButtonProps {
  connection: SSOActiveConnection;
  onStart?: (connection: SSOActiveConnection) => void;
}

export const SSOButton = ({ connection, onStart }: SSOButtonProps) => {
  const { t } = useLingui();
  const stytchClient = useStytch();
  const { ssoOptions } = useConfig();
  const { iconRegistry, options } = usePresentation();

  const { connection_id, display_name, identity_provider } = connection;

  const id = getButtonId(`sso-${display_name}`, options);

  const onButtonClick = () =>
    stytchClient.sso
      .start({
        connection_id,
        signup_redirect_url: ssoOptions?.signupRedirectURL,
        login_redirect_url: ssoOptions?.loginRedirectURL,
      })
      .then(() => {
        onStart?.(connection);
      });

  const iconName = iconMap[identity_provider];
  const Icon = iconRegistry[iconName] ?? SSOIcon;

  return (
    <Button variant="outline" onClick={onButtonClick} icon={<Icon />} id={id}>
      {t({ id: 'provider.continueWith', message: `Continue with ${display_name}` })}
    </Button>
  );
};
