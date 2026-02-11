import { AuthTokenParams, B2BIDPConsentManifestGenerator } from '../../../types';
import { B2BIDPContainer } from '../../b2b/App';
import { createB2BComponent } from '../bindings/createB2BComponent';
import { StytchB2BProps } from './Stytch';

export type B2BIdentityProviderProps = Omit<StytchB2BProps, 'config'> & {
  /**
   * Optional {@link B2BIDPConsentManifestGenerator} to customize the consent screen.
   */
  getIDPConsentManifest?: B2BIDPConsentManifestGenerator;
  /**
   * Optional trusted auth token parameters to attest before the OAuth flow.
   */
  trustedAuthTokenParams?: AuthTokenParams;
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
 * <B2BIdentityProvider
 *   presentation={{
 *     theme: { primary: '#ff00f7' },
 *     options: {},
 *   }}
 *   callbacks={{
 *     onEvent: (event) => console.log(event)
 *   }}
 * />
 */
export const B2BIdentityProvider = /* @__PURE__ */ createB2BComponent('B2BIdentityProvider', B2BIDPContainer);
