import React, { useState } from 'react';
import BackArrow from '../../../assets/backArrow';
import { extractErrorMessage } from '../../../utils/extractErrorMessage';
import { EmailInput } from '../../components/EmailInput';
import { ErrorText } from '../../components/ErrorText';
import { Flex } from '../../components/Flex';
import { SubmitButton } from '../../components/SubmitButton';
import { Text } from '../../components/Text';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { useSsoDiscoveryConnection } from '../hooks/useSsoDiscoveryConnection';
import { useLingui } from '@lingui/react/macro';
import { useErrorProps } from '../../../utils/accessibility';

export const SSODiscoveryEmail = () => {
  const [, dispatch] = useGlobalReducer();
  const [email, setEmail] = useState('');
  const { t } = useLingui();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { trigger } = useSsoDiscoveryConnection();
  const emailProps = useErrorProps(error);
  const emailInputLabel = t({ id: 'formField.email.label', message: 'Email' });

  const stytch = useStytch();
  const { ssoOptions } = useConfig();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

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
          ) ?? null,
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
    <Flex direction="column" gap={24}>
      <BackArrow onClick={handleBack} />
      <Text size="header">{t({ id: 'ssoDiscovery.email.title', message: 'Enter your email to continue' })}</Text>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={8}>
          <Flex direction="column" minHeight={52}>
            <EmailInput email={email} setEmail={setEmail} aria-label={emailInputLabel} {...emailProps.input} />
            {error && <ErrorText errorMessage={error} {...emailProps.error} />}
          </Flex>
          <SubmitButton isSubmitting={isLoading} text={t({ id: 'button.continue', message: 'Continue' })} />
        </Flex>
      </form>
    </Flex>
  );
};
