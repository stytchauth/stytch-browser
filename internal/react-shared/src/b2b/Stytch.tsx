import React, { useRef } from 'react';
import type {
  Callbacks,
  StringsOptions,
  StyleConfig,
  StytchB2BUIConfig,
  StytchProjectConfigurationInput,
} from '@stytch/vanilla-js';

import type { IDPConsentScreenManifest } from '@stytch/vanilla-js/b2b';

import { useStytchB2BClient, isUIClient, useIsMounted__INTERNAL, useStytchMember } from './StytchB2BContext';
import { invariant } from '../utils/invariant';
import { noHeadlessClientError, noProviderError } from '../utils/errors';
import useIsomorphicLayoutEffect from '../utils/useIsomorphicLayoutEffect';

export interface StytchB2BProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StringsOptions {
  /**
   * An optional {@link StyleConfig} to customize the look and feel of the screen.
   *
   * @example
   * {
   *    fontFamily: 'Arial, Helvetica, sans-serif',
   *    width: '360px',
   *    primaryColor: '#19303D',
   * }
   */
  styles?: StyleConfig;
  /**
   * An optional {@link Callbacks} object.
   *
   * @example
   * {
   *   onError: ({message}) => {
   *      console.error('Stytch error', message)
   *   }
   * }
   *
   * @example
   * {
   *   onEvent: ({type, data}) => {
   *     if(type === StytchEventType.B2BMagicLinkAuthenticate) {
   *       console.log('Logged in with', data);
   *     }
   *   }
   * }
   */
  callbacks?: Callbacks<TProjectConfiguration>;
  /**
   * A {@link StytchB2BUIConfig} object. Add products and product-specific config to this object to change the login methods shown.
   *
   *
   * @example
   * {
   *   products: ['emailMagicLinks'],
   *   authFlowType: "Discovery",
   *   emailMagicLinksOptions: {
   *     discoveryRedirectURL: 'https://example.com/authenticate',
   *   },
   *   sessionOptions: {
   *     sessionDurationMinutes: 60,
   *   },
   * }
   *
   * @example
   * {
   *   products: ['emailMagicLinks', 'sso'],
   *   authFlowType: "Organization",
   *   emailMagicLinksOptions: {
   *     loginRedirectURL: 'https://example.com/authenticate',
   *     signupRedirectURL: 'https://example.com/authenticate',
   *   },
   *   ssoOptions: {
   *     loginRedirectURL: 'https://example.com/authenticate',
   *     signupRedirectURL: 'https://example.com/authenticate',
   *   },
   *   sessionOptions: {
   *     sessionDurationMinutes: 60,
   *   },
   * }
   */
  config: StytchB2BUIConfig;
}

export type B2BIDPConsentManifestGenerator = (input: {
  scopes: string[];
  clientName: string;
}) => IDPConsentScreenManifest;

type B2BAuthTokenParams = { trustedAuthToken: string; tokenProfileID: string };

export type B2BIdentityProviderProps = Omit<StytchB2BProps, 'config'> & {
  /**
   * Optional {@link B2BIDPConsentManifestGenerator} to customize the consent screen.
   */
  getIDPConsentManifest?: B2BIDPConsentManifestGenerator;
  /**
   * Optional trusted auth token parameters to attest before the OAuth flow.
   */
  trustedAuthTokenParams?: B2BAuthTokenParams;
};

/**
 * The Stytch B2B UI component.
 * This component can only be used with a Stytch B2B UI Client
 * passed into the StytchB2BProvider.
 *
 * See the {@link https://stytch.com/docs/b2b/sdks online reference}
 *
 * @example
 * <StytchB2B
 *   config={{
 *     authFlowType: "Organization",
 *     emailMagicLinksOptions: {
 *       loginRedirectURL: 'https://example.com/authenticate',
 *       signupRedirectURL: 'https://example.com/authenticate',
 *     },
 *     ssoOptions: {
 *       loginRedirectURL: 'https://example.com/authenticate',
 *       signupRedirectURL: 'https://example.com/authenticate',
 *     },
 *     sessionOptions: {
 *       sessionDurationMinutes: 60,
 *     }
 *   }}
 *   styles={{
 *     fontFamily: '"Helvetica New", Helvetica, sans-serif',
 *     primaryColor: '#0577CA',
 *     width: '321px',
 *   }}
 *   callbacks={{
 *     onEvent: (event) => console.log(event)
 *   }}
 * />
 */
export const StytchB2B = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  styles,
  callbacks,
  config,
  strings,
}: StytchB2BProps<TProjectConfiguration>) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<StytchB2B />', 'StytchB2BProvider'));
  const stytchClient = useStytchB2BClient<TProjectConfiguration>();
  const containerEl = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!isUIClient(stytchClient)) {
      throw Error(noHeadlessClientError);
    }

    if (!containerEl.current) {
      return;
    }

    if (!containerEl.current.id) {
      const randId = Math.floor(Math.random() * 1e6);
      containerEl.current.id = `stytch-b2b-ui-${randId}`;
    }

    stytchClient.mount({
      callbacks,
      config,
      elementId: `#${containerEl.current.id}`,
      styles,
      strings,
    });
  }, [stytchClient, styles, callbacks, strings]);

  return <div ref={containerEl} />;
};

/**
 * The Stytch B2B IDP component.
 * Parses OAuth Authorization params (client_id, scope, nonce, etc.) out of the page URL.
 * Requires the user to be logged in.
 * This component can only be used with a Stytch B2B UI Client
 * passed into the StytchB2BProvider.
 *
 * See the {@link https://stytch.com/docs/b2b/sdks online reference}
 *
 * @example
 * const styles = {
 *   container: {
 *     backgroundColor: '#e11e1e',
 *   },
 *   colors: {
 *     primary: '#ff00f7',
 *     secondary: '#5C727D',
 *   },
 * }
 *
 * <B2BIdentityProvider
 *   styles={styles}
 *   callbacks={{
 *     onEvent: (event) => console.log(event)
 *   }}
 * />
 */
export const B2BIdentityProvider = ({
  styles,
  callbacks,
  getIDPConsentManifest,
  trustedAuthTokenParams,
}: B2BIdentityProviderProps) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<IdentityProvider />'));
  const stytchClient = useStytchB2BClient();
  const { member } = useStytchMember();
  const containerEl = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!isUIClient(stytchClient)) {
      throw Error(noHeadlessClientError);
    }

    if (!containerEl.current) {
      return;
    }

    if (!containerEl.current.id) {
      const randId = Math.floor(Math.random() * 1e6);
      containerEl.current.id = `stytch-b2b-idp-${randId}`;
    }

    stytchClient.mountIdentityProvider({
      callbacks,
      elementId: `#${containerEl.current.id}`,
      styles,
      getIDPConsentManifest,
      trustedAuthTokenParams,
    });
  }, [stytchClient, styles, callbacks, member, getIDPConsentManifest, trustedAuthTokenParams]);

  return <div ref={containerEl} />;
};
