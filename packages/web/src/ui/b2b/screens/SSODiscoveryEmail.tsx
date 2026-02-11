import { useLingui } from '@lingui/react/macro';
import React, { useState } from 'react';

import { extractErrorMessage } from '../../../utils/extractErrorMessage';
import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import EmailInput from '../../components/molecules/EmailInput';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { useSsoDiscoveryConnection } from '../hooks/useSsoDiscoveryConnection';

export const SSODiscoveryEmail = () => {
  const [, dispatch] = useGlobalReducer();
  const [email, setEmail] = useState('');
  const { t } = useLingui();

  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const { trigger } = useSsoDiscoveryConnection();

  const stytch = useStytch();
  const { ssoOptions } = useConfig();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    const tryGetConnections = async () => {
      try {
        const response = await trigger({ emailAddress: email });

        if (!response) {
          return [];
        }

        return response.connections;
      } catch (e) {
        setError(
          extractErrorMessage(
            e,
            t({
              id: 'ssoDiscovery.email.error.unknown',
              message: 'Something went wrong. Try again later or contact your admin for help.',
            }),
          ),
        );
      }
    };

    try {
      setIsLoading(true);

      const connections = await tryGetConnections();

      if (connections?.length === 1) {
        const [connection] = connections;
        await stytch.sso.start({
          connection_id: connection.connection_id,
          login_redirect_url: ssoOptions?.loginRedirectURL,
          signup_redirect_url: ssoOptions?.signupRedirectURL,
        });

        // We intentionally leave `isLoading` set to `true` since we're expecting
        // the user to be redirected
        return;
      }

      setIsLoading(false);

      if (connections) {
        dispatch({ type: 'set_sso_discovery_state', connections });
      }
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  return (
    <Column gap={6}>
      <Typography variant="header">
        {t({ id: 'ssoDiscovery.email.title', message: 'Enter your email to continue' })}
      </Typography>

      <Column as="form" onSubmit={handleSubmit} gap={2}>
        <EmailInput email={email} setEmail={setEmail} hideLabel error={error} />

        <Button variant="primary" loading={isLoading} type="submit">
          {t({ id: 'button.continue', message: 'Continue' })}
        </Button>

        <Button variant="ghost" onClick={handleBack}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      </Column>
    </Column>
  );
};
