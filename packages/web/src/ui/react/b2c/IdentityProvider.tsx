import { AuthTokenParams, IDPConsentManifestGenerator } from '../../../types';
import { IDPContainer } from '../../b2c/IDPContainer';
import { createB2CComponent } from '../bindings/createB2CComponent';
import { StytchProps } from './StytchLogin';

export type IdentityProviderProps = Omit<StytchProps, 'config'> & {
  /**
   * Optional {@link IDPConsentManifestGenerator} to customize the consent screen.
   */
  getIDPConsentManifest?: IDPConsentManifestGenerator;
  /**
   * Optional {@link AuthTokenParams} to provide a trusted auth token to provide for attestation prior to running OAuth flow.
   */
  authTokenParams?: AuthTokenParams;
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
 * <IdentityProvider
 *   presentation={{
 *     theme: { primary: '#ff00f7' },
 *     options: {},
 *   }}
 *   callbacks={{
 *     onEvent: (event) => console.log(event)
 *   }}
 * />
 */
export const IdentityProvider = /* @__PURE__ */ createB2CComponent('IdentityProvider', IDPContainer);
