import { useLingui } from '@lingui/react/macro';
import React, { useState } from 'react';

import Button from '../../components/atoms/Button';
import Column from '../../components/atoms/Column';
import Typography from '../../components/atoms/Typography';
import Input from '../../components/molecules/Input';
import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { useMutate } from '../utils';

export const SSODiscoveryFallback = () => {
  const [, dispatch] = useGlobalReducer();
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string>();
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
    setError(undefined);
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

  const handleTryAnotherMethod = () => {
    dispatch({ type: 'transition', screen: AppScreens.Main });
  };

  const handleBack = () => {
    dispatch({ type: 'navigate_back' });
  };

  return (
    <Column gap={6}>
      <Typography variant="header">
        {t({ id: 'ssoDiscovery.fallback.title', message: "Sorry, we couldn't find any connections" })}
      </Typography>
      <Typography>
        {t({
          id: 'ssoDiscovery.fallback.content',
          message:
            "Please input the Organization's unique slug to continue. If you don't know the unique slug, log in through another method to view all of your available Organizations.",
        })}
      </Typography>

      <Column as="form" onSubmit={handleSubmit} gap={2}>
        <Input
          id="organization-slug"
          hideLabel
          label={t({ id: 'formField.orgSlug.label', message: 'Organization slug' })}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={t({ id: 'formField.orgSlug.label', message: 'Organization slug' })}
          error={error}
        />

        <Button variant="primary" loading={isSubmitting} type="submit" disabled={!slug || isSubmitting}>
          {t({ id: 'button.continue', message: 'Continue' })}
        </Button>

        <Button variant="outline" onClick={handleTryAnotherMethod}>
          {t({ id: 'ssoDiscovery.fallback.button.reset', message: 'Try another method' })}
        </Button>

        <Button variant="ghost" onClick={handleBack}>
          {t({ id: 'button.goBack', message: 'Go back' })}
        </Button>
      </Column>
    </Column>
  );
};
