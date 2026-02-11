import React, { useState } from 'react';
import BackArrow from '../../../assets/backArrow';
import Button from '../../components/Button';
import { ErrorText } from '../../components/ErrorText';
import { Flex } from '../../components/Flex';
import { Input } from '../../components/Input';
import { SubmitButton } from '../../components/SubmitButton';
import { Text } from '../../components/Text';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { useMutate } from '../utils';
import { useLingui } from '@lingui/react/macro';
import { useErrorProps } from '../../../utils/accessibility';

export const SSODiscoveryFallback = () => {
  const [, dispatch] = useGlobalReducer();
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stytchClient = useStytch();
  const { ssoOptions } = useConfig();
  const { t } = useLingui();

  const { trigger: lookupOrganization } = useMutate(
    'stytch.organization.getBySlug',
    async (_: string, { arg: { slug } }: { arg: { slug: string } }) =>
      stytchClient.organization.getBySlug({ organization_slug: slug }),
    {
      onError: () => {
        setError(t({ id: 'ssoDiscovery.fallback.error.unknown', message: 'An error occurred. Please try again.' }));
        setIsSubmitting(false);
      },
    },
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await lookupOrganization({ slug });
    if (result) {
      const { organization } = result;
      if (organization === null) {
        setError(
          t({ id: 'ssoDiscovery.fallback.error.orgNotFound', message: 'Organization not found. Please try again.' }),
        );
        setIsSubmitting(false);
      } else if (organization.sso_active_connections.length === 1) {
        const [connection] = organization.sso_active_connections;
        await stytchClient.sso.start({
          connection_id: connection.connection_id,
          login_redirect_url: ssoOptions?.loginRedirectURL,
          signup_redirect_url: ssoOptions?.signupRedirectURL,
        });
      } else {
        dispatch({
          type: 'set_organization',
          organization,
        });
        dispatch({ type: 'transition', screen: AppScreens.Main });
      }
    }
  };

  const slugProps = useErrorProps(error);

  const handleTryAnotherMethod = () => {
    dispatch({ type: 'transition', screen: AppScreens.Main });
  };

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  return (
    <Flex direction="column" gap={24}>
      <BackArrow onClick={handleBack} />
      <Text size="header">
        {t({ id: 'ssoDiscovery.fallback.title', message: "Sorry, we couldn't find any connections." })}
      </Text>
      <Text>
        {t({
          id: 'ssoDiscovery.fallback.content',
          message:
            "Please input the Organization's unique slug to continue. If you don't know the unique slug, log in through another method to view all of your available Organizations.",
        })}
      </Text>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={8}>
          <Flex direction="column" minHeight={52}>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t({ id: 'formField.orgSlug.placeholder', message: 'Enter org slug' })}
              {...slugProps.input}
            />
            {error && <ErrorText errorMessage={error} {...slugProps.error} />}
          </Flex>
          <SubmitButton
            text={t({ id: 'button.continue', message: 'Continue' })}
            disabled={!slug}
            isSubmitting={isSubmitting}
          />
        </Flex>
      </form>
      <Button type="button" variant="text" onClick={handleTryAnotherMethod}>
        {t({ id: 'ssoDiscovery.fallback.button.reset', message: 'Try another log in method' })}
      </Button>
    </Flex>
  );
};
