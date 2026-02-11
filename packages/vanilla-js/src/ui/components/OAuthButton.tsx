import { StringLiteralFromEnum } from '@stytch/core';
import { OAuthProviders } from '@stytch/core/public';
import React, { ReactNode } from 'react';
import { useStytch } from '../b2c/GlobalContextProvider';
import Button from './Button';
import { Flex } from './Flex';

type Props = {
  providerType: StringLiteralFromEnum<OAuthProviders>;
  label: string;
  icon?: ReactNode;
  loginRedirectUrl?: string;
  signupRedirectUrl?: string;
  customScopes?: string[];
  providerParams?: Record<string, string>;
  onSuccess?: () => void;
};

export const OAuthButton = (props: Props) => {
  const stytchClient = useStytch();

  const onButtonClick = async () => {
    await stytchClient.oauth[props.providerType].start({
      login_redirect_url: props.loginRedirectUrl,
      signup_redirect_url: props.signupRedirectUrl,
      custom_scopes: props.customScopes,
      provider_params: props.providerParams,
    });
    props.onSuccess?.();
  };

  return (
    <Button id={`oauth-${props.providerType}`} type="button" onClick={onButtonClick} variant="outlined">
      <Flex justifyContent="center" alignItems="center" gap={4}>
        {props.icon}
        <span style={{ verticalAlign: 'middle' }}>{props.label}</span>
      </Flex>
    </Button>
  );
};
