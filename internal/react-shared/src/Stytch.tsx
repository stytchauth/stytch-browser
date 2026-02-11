import React, { useRef } from 'react';
import type {
  Callbacks,
  StringsOptions,
  StytchLoginConfig,
  StyleConfig,
  StytchProjectConfigurationInput,
  IDPConsentScreenManifest,
} from '@stytch/vanilla-js';

import { useStytch, isUIClient, useIsMounted__INTERNAL, useStytchUser } from './StytchContext';
import { invariant } from './utils/invariant';
import { noHeadlessClientError, noProviderError } from './utils/errors';
import useIsomorphicLayoutEffect from './utils/useIsomorphicLayoutEffect';

export interface StytchProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StringsOptions {
  /**
   * A {@link StytchLoginConfig} object. Add products and product-specific config to this object to change the login methods shown.
   *
   * @example
   * {
   *   products: ['crypto', 'otps']
   * }
   *
   * @example
   * {
   *   products: ['emailMagicLinks'>]
   *   emailMagicLinksOptions: {
   *     loginRedirectURL: 'https://example.com/authenticate',
   *     signupRedirectURL: 'https://example.com/authenticate',
   *   }
   * }
   *
   * @example
   * {
   *   products: ['oauth'>]
   *   oauthOptions: {
   *   providers: [
   *       { type: 'google', one_tap: true, position: 'embedded' },
   *       { type: 'microsoft' },
   *       { type: 'apple' },
   *       { type: 'facebook' },
   *     ],
   *   }
   * }
   */
  config: StytchLoginConfig;
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
   *      console.error('Stytch login screen error', message)
   *   }
   * }
   *
   * @example
   * {
   *   onEvent: ({type, data}) => {
   *     if(type === StytchEventType.CryptoWalletAuthenticate) {
   *       console.log('Logged in with crypto wallet', data);
   *     }
   *   }
   * }
   */
  callbacks?: Callbacks<TProjectConfiguration>;
}

/**
 * The Stytch Login Screen component.
 * This component can only be used with a Stytch UI Client
 * passed into the StytchProvider.
 *
 * See the {@link https://stytch.com/docs/sdks online reference}
 *
 * @example
 * <StytchLogin
 *   config={{
 *     products: ['emailMagicLinks', 'oauth'],
 *     emailMagicLinksOptions: {
 *       loginRedirectURL: 'https://example.com/authenticate',
 *       signupRedirectURL: 'https://example.com/authenticate',
 *     },
 *     oauthOptions: {
 *      providers: [{ type: OAuthProviders.Google }, { type: OAuthProviders.Microsoft }],
 *    },
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
export const StytchLogin = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  config,
  styles,
  callbacks,
  strings,
}: StytchProps<TProjectConfiguration>) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<StytchLogin />'));
  const stytchClient = useStytch<TProjectConfiguration>();
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
      containerEl.current.id = `stytch-magic-link-${randId}`;
    }

    stytchClient.mountLogin({
      config,
      callbacks,
      elementId: `#${containerEl.current.id}`,
      styles,
      strings,
    });
  }, [stytchClient, config, styles, callbacks, strings]);

  return <div ref={containerEl} />;
};

export interface StytchResetPasswordProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StytchProps<TProjectConfiguration> {
  /**
   * A Stytch password reset token.
   */
  passwordResetToken: string;
}

export type IDPConsentScreenManifestGenerator = (input: {
  scopes: string[];
  clientName: string;
}) => IDPConsentScreenManifest;

export type AuthTokenParams = {
  /**
   * The auth token to provide for attestation prior to running OAuth flow.
   */
  trustedAuthToken: string;
  /**
   * The profile ID of the token.
   */
  tokenProfileID: string;
};

export type IdentityProviderProps = Omit<StytchProps, 'config'> & {
  /**
   * Optional {@link IDPConsentScreenManifestGenerator} to customize the consent screen.
   */
  getIDPConsentManifest?: IDPConsentScreenManifestGenerator;
  /**
   * Optional {@link AuthTokenParams} to provide a trusted auth token to provide for attestation prior to running OAuth flow.
   */
  authTokenParams?: AuthTokenParams;
};

/**
 * The Stytch Reset Password component.
 * This component can only be used with a Stytch UI Client
 * passed into the StytchProvider.
 *
 * See the {@link https://stytch.com/docs/sdks online reference}
 *
 * @example
 * <StytchPasswordReset
 *   config={{
 *     products: ['emailMagicLinks', 'oauth'],
 *     emailMagicLinksOptions: {
 *       loginRedirectURL: 'https://example.com/authenticate',
 *       signupRedirectURL: 'https://example.com/authenticate',
 *     },
 *     oauthOptions: {
 *      providers: [{ type: OAuthProviders.Google }, { type: OAuthProviders.Microsoft }],
 *    },
 *   }}
 *   passwordResetToken="PvC5UudZ7TPZbELt95yXAQ-8MeEUCRob8bUQ-g52fIJs"
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
export const StytchPasswordReset = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  config,
  styles,
  callbacks,
  strings,
  passwordResetToken,
}: StytchResetPasswordProps<TProjectConfiguration>) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<StytchResetPassword />'));
  const stytchClient = useStytch<TProjectConfiguration>();
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
      containerEl.current.id = `stytch-reset-password-${randId}`;
    }

    if (passwordResetToken) {
      stytchClient.mountResetPassword({
        config,
        callbacks,
        elementId: `#${containerEl.current.id}`,
        styles,
        strings,
        passwordResetToken,
      });
    }
  }, [stytchClient, config, styles, callbacks, strings, passwordResetToken]);

  return <div ref={containerEl} />;
};

/**
 * The Stytch Passkey Registration component.
 * This component can only be used with a Stytch UI Client
 * passed into the StytchProvider.
 *
 * See the {@link https://stytch.com/docs/sdks online reference}
 *
 * @example
 * const styles = {
 *     container: {
 *       backgroundColor: '#e11e1e',
 *     },
 *     colors: {
 *       primary: '#ff00f7',
 *       secondary: '#5C727D',
 *     },
 *    }
 *
 * <StytchPasskeyRegistration
 *   styles={styles}
 *   callbacks={{
 *     onEvent: (event) => console.log(event)
 *   }}
 * />
 */
export const StytchPasskeyRegistration = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>({
  config,
  styles,
  callbacks,
  strings,
}: StytchProps<TProjectConfiguration>) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<StytchPasskeyRegistration />'));
  const stytchClient = useStytch<TProjectConfiguration>();
  const user = useStytchUser();
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
      containerEl.current.id = `stytch-passkey-registration-${randId}`;
    }

    stytchClient.mountPasskeyRegistration({
      config,
      callbacks,
      elementId: `#${containerEl.current.id}`,
      styles,
      strings,
    });
  }, [stytchClient, config, styles, callbacks, strings, user]);

  return <div ref={containerEl} />;
};

/**
 * The Stytch IDP component.
 * Parses OAuth Authorization params (client_id, scope, nonce, etc.) out of the page URL.
 * Requires the user to be logged in.
 * This component can only be used with a Stytch UI Client
 * passed into the StytchProvider.
 *
 * See the {@link https://stytch.com/docs/sdks online reference}
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
 * <IdentityProvider
 *   styles={styles}
 *   callbacks={{
 *     onEvent: (event) => console.log(event)
 *   }}
 * />
 */
export const IdentityProvider = ({
  styles,
  callbacks,
  strings,
  getIDPConsentManifest,
  authTokenParams,
}: IdentityProviderProps) => {
  invariant(useIsMounted__INTERNAL(), noProviderError('<IdentityProvider />'));
  const stytchClient = useStytch();
  const user = useStytchUser();
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
      containerEl.current.id = `stytch-idp-${randId}`;
    }

    stytchClient.mountIdentityProvider({
      callbacks,
      elementId: `#${containerEl.current.id}`,
      styles,
      strings,
      getIDPConsentManifest,
      authTokenParams,
    });
  }, [stytchClient, styles, callbacks, user, strings, getIDPConsentManifest, authTokenParams]);

  return <div ref={containerEl} />;
};
