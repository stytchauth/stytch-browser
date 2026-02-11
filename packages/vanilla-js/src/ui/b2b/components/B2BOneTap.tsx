import { useConfig, useGlobalReducer, useStytch } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { useIsOnlyFloatingOneTap } from '../hooks/useIsOnlyFloatingOneTap';
import { useIsUnmounted } from '../../hooks/useIsMounted';
import React, { useCallback, useEffect, useState } from 'react';
import { readB2BInternals } from '../../../utils/internal';
import { isTestPublicToken, logger } from '@stytch/core';
import { B2BOAuthProviders, OneTapPositions } from '@stytch/core/public';
import { GoogleOneTapClient } from '../../../oneTap/GoogleOneTapClient';
import { OAuthB2BButton } from './OAuthB2BButton';
import { OneTapErrors, ErrorMessages } from '../../components/GoogleOneTap';
import type { CredentialResponse } from 'google-one-tap';
import { useLastUsedAuthMethod } from '../hooks/useLastUsedAuthMethod';
import { Text } from '../../components/Text';
import { useLingui } from '@lingui/react/macro';

export const B2BGoogleOneTap = ({
  customScopes,
  providerParams,
  cancelOnTapOutside,
}: {
  customScopes?: string[];
  providerParams?: Record<string, string>;
  cancelOnTapOutside?: boolean;
}) => {
  const { t } = useLingui();

  const stytch = useStytch();
  const config = useConfig();
  const isOnlyFloatingOneTap = useIsOnlyFloatingOneTap();
  const [oneTapError, setOneTapError] = useState<OneTapErrors>(OneTapErrors.None);
  const isUnmounted = useIsUnmounted();
  const [state, dispatch] = useGlobalReducer();

  const [lastUsedMethod, setLastUsedMethod] = useLastUsedAuthMethod();

  /*
   * Begin One Tap Loading / Initialization Logic
   */
  //
  const attemptToLoadOneTap = useCallback(async () => {
    const { oneTap } = readB2BInternals(stytch);
    const clientResult = await oneTap.createOneTapClient();
    if (!clientResult.success) {
      if (clientResult.reason === 'oauth_config_not_found') {
        setOneTapError(OneTapErrors.NoConfiguredOAuthClient);
      } else if (clientResult.reason === 'default_provider_not_allowed') {
        setOneTapError(OneTapErrors.DefaultProviderNotAllowed);
      } else {
        logger.error('Unable to load One Tap settings for project', clientResult);
      }
      return;
    }
    const { client } = clientResult;

    /**
     * One tap is composed of two calls, an init() call and a prompt() call
     * the init() call takes in a parent_id where one tap should be shown
     * prompt() does the actual showing. if the element does not exist,
     * we show One Tap in the upper right corner
     * if the element does exist, One Tap's lifecycle is tied to the lifecycle of said element
     * here, we call init() then prompt() in the useeffect. If the component unmounts before
     * prompt() is called, One Tap falls back to the element-does-not-exist behavior.
     * Fix: add a check for whether the component is still rendered immediately before we
     * call prompt, preventing this race condition
     */
    if (isUnmounted.current) {
      return;
    }

    let oneTapCallback: (response: CredentialResponse) => void;
    if (state.flowState.organization) {
      oneTapCallback = oneTap.createOnSuccessHandler({
        organizationId: state.flowState.organization.organization_id,
        signupRedirectUrl: config.oauthOptions?.signupRedirectURL,
        loginRedirectUrl: config.oauthOptions?.loginRedirectURL,
        onSuccess: oneTap.redirectOnSuccess,
        onError: () => dispatch({ type: 'transition', screen: AppScreens.Error }),
      });
    } else {
      oneTapCallback = oneTap.createOnDiscoverySuccessHandler({
        discoveryRedirectUrl: config.oauthOptions?.discoveryRedirectURL,
        onSuccess: oneTap.redirectOnSuccess,
        onError: () => dispatch({ type: 'transition', screen: AppScreens.Error }),
      });
    }
    const renderResult = await client.render({
      callback: oneTapCallback,
      style: {
        position: OneTapPositions.floating,
      },
      cancelOnTapOutside,
    });

    // Check if the component has become unmounted during the async OT render process
    // Kill the rest of the logic if so
    if (isUnmounted.current) {
      client.cancel();
      return;
    }

    if (!renderResult.success) {
      if (renderResult.reason === 'unregistered_origin') {
        setOneTapError(OneTapErrors.OriginNotAllowedForClient);
      }
      if (renderResult.reason === 'invalid_client') {
        setOneTapError(OneTapErrors.InvalidOAuthClient);
      }
      logger.error('Unable to render One Tap prompt', renderResult);
    }
    return client;
  }, [
    stytch,
    isUnmounted,
    state.flowState.organization,
    config.oauthOptions?.signupRedirectURL,
    config.oauthOptions?.loginRedirectURL,
    config.oauthOptions?.discoveryRedirectURL,
    dispatch,
    cancelOnTapOutside,
  ]);

  useEffect(() => {
    let client: GoogleOneTapClient | undefined;
    attemptToLoadOneTap()
      .then(($client) => (client = $client))
      .catch((err) => {
        logger.error('Unable to render One Tap prompt', err);
      });
    return () => client?.cancel();
  }, [attemptToLoadOneTap]);
  /*
   * End One Tap Loading / Initialization Logic
   */

  if (isOnlyFloatingOneTap) {
    return null;
  }

  const fallbackButton = (
    <OAuthB2BButton
      providerType={B2BOAuthProviders.Google}
      loginRedirectUrl={config.oauthOptions?.loginRedirectURL}
      signupRedirectUrl={config.oauthOptions?.signupRedirectURL}
      discoveryRedirectUrl={config.oauthOptions?.discoveryRedirectURL}
      customScopes={customScopes}
      providerParams={providerParams}
      onSuccess={() => setLastUsedMethod(B2BOAuthProviders.Google)}
    />
  );

  const fallbackWithLastUsed =
    lastUsedMethod === B2BOAuthProviders.Google ? (
      <div>
        <Text size="helper" color="secondary" align="right">
          {t({ id: 'provider.lastUsed', message: 'Last used' })}
        </Text>
        {fallbackButton}
      </div>
    ) : (
      fallbackButton
    );

  const { publicToken } = readB2BInternals(stytch);

  if (oneTapError !== OneTapErrors.None) {
    return (
      <>
        {isTestPublicToken(publicToken) ? ErrorMessages[oneTapError] : null}
        {fallbackWithLastUsed}
      </>
    );
  }

  return fallbackWithLastUsed;
};
