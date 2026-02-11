import { DEV, logger, StringLiteralFromEnum } from '@stytch/core';
import { OAuthProviders, OneTapPositions } from '@stytch/core/public';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { GoogleOneTapClient } from '../../../oneTap/GoogleOneTapClient';
import { OneTapProvider } from '../../../oneTap/OneTapProvider';
import { getRenderedOneTapMode } from '../../../oneTap/positionModes';
import { readB2CInternals } from '../../../utils/internal';
import { CircularProgress } from '../../components/atoms/CircularProgress';
import LastUsed from '../../components/molecules/LastUsed';
import { ErrorMessages, OneTapErrors } from '../../components/organisms/OneTapError';
import { usePresentation } from '../../components/PresentationConfig';
import { useIsMounted } from '../../hooks/useIsMounted';
import { useIsOnlyFloatingOneTap } from '../../hooks/useIsOnlyFloatingOneTap';
import { useConfig, useStytch } from '../GlobalContextProvider';
import { useLastUsedOAuth } from '../screens/Main/useLastUsedOAuth';
import styles from './GoogleOneTap.module.css';
import { OAuthButton } from './OAuthButton';

type Props = {
  position?: StringLiteralFromEnum<OneTapPositions>;
  customScopes?: string[];
  providerParams?: Record<string, string>;
  cancelOnTapOutside?: boolean;
};

const OAUTH_BUTTON_HEIGHT = 38;

// See WebComponents.tsx - when using shadow DOM, the Google script cannot see the
// mount point, so we render it outside and use slot to bring it back in
const OneTapMountNode = ({ enableShadowDOM }: { enableShadowDOM: boolean | undefined }) =>
  enableShadowDOM ? (
    <slot name="one-tap"></slot>
  ) : (
    <div data-prompt_parent_id="g_id_onload" id="google-parent-prompt" />
  );

export const GoogleOneTap = ({ position, customScopes, providerParams, cancelOnTapOutside }: Props) => {
  const oneTapRenderMode = getRenderedOneTapMode(position);
  const shouldRenderEmbeddedOneTap = oneTapRenderMode === 'embedded';
  const shouldRenderOneTap = !!oneTapRenderMode;

  const config = useConfig();
  const stytch = useStytch();
  const isOnlyFloatingOneTap = useIsOnlyFloatingOneTap(config);
  const [pending, setPending] = useState(shouldRenderEmbeddedOneTap);
  const [canDisplayOneTap, setCanDisplayOneTap] = useState(true);
  const [height, setHeight] = useState(OAUTH_BUTTON_HEIGHT);
  const [oneTapError, setOneTapError] = useState<OneTapErrors>();
  const resizeCount = useRef(0);
  const timeout = useRef<number>();
  const isMounted = useIsMounted();
  const [lastUsedMethod, setLastUsedOAuth] = useLastUsedOAuth();
  const { options } = usePresentation();

  /*
   * Begin One Tap Render Smoothing Logic
   */
  // Gets height of rendered one-tap UI, and sets the container height to that.
  // Animation is added for a smoother transition,
  const onResize = useCallback<ResizeObserverCallback>(([el]) => {
    if (timeout.current != null) {
      clearTimeout(timeout.current);
    }
    // On initial load, the one-tap ui rapidly changes heights 3 times. Checking
    // the resizeCount lets us debounce the first 2 resizes, so they will get
    // cancelled, but if they don't, it will resize after the short delay.
    if (resizeCount.current > 1) {
      // While setting the height, if the contentRect height is 0, it could also mean that the
      // oauthOptions props are being changed, and in that scenario if we can continue to display
      // one tap, we are setting the container height to the current height. If one tap cannot display
      // one tap, we will set the container height to the height of the button component.
      // Else we will set the height to the contentRect height.
      setHeight((currentHeight) =>
        el.contentRect.height === 0 ? (canDisplayOneTap ? currentHeight : OAUTH_BUTTON_HEIGHT) : el.contentRect.height,
      );
    } else {
      timeout.current = window.setTimeout(
        () =>
          setHeight((currentHeight) =>
            el.contentRect.height === 0
              ? canDisplayOneTap
                ? currentHeight
                : OAUTH_BUTTON_HEIGHT
              : el.contentRect.height,
          ),
        100,
      );
    }
    resizeCount.current++;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, []);

  // If we are in embedded mode, initialize the resize observer and bind it to the React callback
  useEffect(() => {
    if (shouldRenderEmbeddedOneTap) {
      const el = document.getElementById('google-parent-prompt');
      if (el) {
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(el);
        return () => resizeObserver.disconnect();
      }
    }
  }, [onResize, shouldRenderEmbeddedOneTap]);
  /*
   * End One Tap Render Smoothing Logic
   */

  /*
   * Begin One Tap Loading / Initialization Logic
   */
  //
  const attemptToLoadOneTap = useCallback(async () => {
    if (!shouldRenderOneTap) {
      return;
    }

    const { oneTap } = readB2CInternals(stytch);
    const clientResult = await oneTap.createOneTapClient();
    if (!clientResult.success) {
      if (clientResult.reason === 'oauth_config_not_found') {
        setOneTapError(OneTapErrors.NoConfiguredOAuthClient);
      } else if (clientResult.reason === 'no_signup_redirect_urls_set') {
        setOneTapError(OneTapErrors.NoConfiguredSignupRedirectUrls);
      } else if (clientResult.reason === 'no_login_redirect_urls_set') {
        setOneTapError(OneTapErrors.NoConfiguredLoginRedirectUrls);
      } else {
        logger.error('Unable to load One Tap settings for project', clientResult);
      }
      return;
    }
    const { client } = clientResult;

    const onOneTapCancelled = (showError?: boolean) => {
      setCanDisplayOneTap(false);
      setHeight(OAUTH_BUTTON_HEIGHT);
      if (showError) {
        setOneTapError(OneTapErrors.OriginNotAllowedForClient);
      }
    };

    /**
     * One Tap is composed of two calls, an init() call and a prompt() call.
     * The init() call takes in a parent_id where One Tap should be shown
     * prompt() does the actual showing.
     * If the element does not exist, we show One Tap in the upper right corner.
     * If the element does exist, One Tap's lifecycle is tied to the lifecycle of said element.
     * Here, we call init() then prompt() in the useEffect. If the component unmounts before
     * prompt() is called, One Tap falls back to the element-does-not-exist behavior.
     * Fix: add a check for whether the component is still rendered immediately before we
     * call prompt, preventing this race condition
     */
    if (!isMounted.current) {
      return;
    }

    const renderResult = await client.render({
      callback: oneTap.createOnSuccessHandler({
        loginRedirectUrl: config.oauthOptions?.loginRedirectURL,
        signupRedirectUrl: config.oauthOptions?.signupRedirectURL,
        onSuccess: oneTap.redirectOnSuccess,
      }),
      onOneTapCancelled,
      style: { position },
      cancelOnTapOutside,
    });

    // Check if the component has become unmounted during the async OT render process
    // Kill the rest of the logic if so
    if (!isMounted.current) {
      client.cancel();
      return;
    }

    setCanDisplayOneTap(renderResult.success);
    setPending(false);

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
    shouldRenderOneTap,
    stytch,
    isMounted,
    config.oauthOptions?.loginRedirectURL,
    config.oauthOptions?.signupRedirectURL,
    position,
    cancelOnTapOutside,
  ]);

  useEffect(() => {
    let client: GoogleOneTapClient | undefined;
    attemptToLoadOneTap()
      .then(($client) => (client = $client))
      .catch((err) => {
        logger.error('Unable to render One Tap prompt', err);
        setCanDisplayOneTap(false);
        setPending(false);
      });
    return () => client?.cancel();
  }, [attemptToLoadOneTap]);
  /*
   * End One Tap Loading / Initialization Logic
   */

  // Fallback Google auth button in case One Tap cannot be displayed
  const fallbackButton = (
    <OAuthButton
      providerType={OAuthProviders.Google}
      loginRedirectUrl={config.oauthOptions?.loginRedirectURL}
      signupRedirectUrl={config.oauthOptions?.signupRedirectURL}
      customScopes={customScopes}
      providerParams={providerParams}
      onSuccess={() => setLastUsedOAuth(OAuthProviders.Google)}
    />
  );

  const fallbackWithLastUsed =
    lastUsedMethod === OAuthProviders.Google ? <LastUsed>{fallbackButton}</LastUsed> : fallbackButton;

  if (isOnlyFloatingOneTap) {
    return <OneTapMountNode enableShadowDOM={options.enableShadowDOM} />;
  }

  if (oneTapError) {
    return (
      <>
        {DEV(<ErrorMessages error={oneTapError} />)}
        {fallbackWithLastUsed}
      </>
    );
  }

  if (shouldRenderEmbeddedOneTap && OneTapProvider.willGoogleOneTapShowEmbedded()) {
    return (
      <div className={classNames(styles.container, { [styles.pending]: pending })} style={{ height: height + 'px' }}>
        {pending && <CircularProgress size={25} />}
        {canDisplayOneTap ? <OneTapMountNode enableShadowDOM={options.enableShadowDOM} /> : fallbackButton}
      </div>
    );
  }

  return fallbackWithLastUsed;
};
