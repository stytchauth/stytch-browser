import type { StytchProjectConfigurationInput } from '@stytch/core/public';
import { B2BIDPContainer, B2BIDPSDKConfig } from '@stytch/web/b2b';

import { createMountFn, createWebComponent } from '../bindings/WebComponents';

/**
 * Renders a B2B IDP Consent screen.
 * Parses OAuth Authorization params (client_id, scope, nonce, etc.) out of the page URL.
 * Requires the user to be logged in.
 *
 * @attr {boolean} [shadow] - use shadow DOM to contain styles
 *
 * @prop {StytchB2BClient} client - used to make API calls.
 * @prop {PresentationConfig} [presentation] - for customizing the UI styling and presentation
 * @prop {Messages} [strings] - custom strings to be used in the prebuilt UI.
 * @prop {B2BIDPConsentManifestGenerator} [getIDPConsentManifest] - to customize the consent screen.
 * @prop {AuthTokenParams} [trustedAuthTokenParams] - trusted auth token params for attestation prior to running OAuth flow.
 *
 * @event StytchEvent - see {@link import('../../WebComponents').StytchEvent}
 * @event StytchError - see {@link import('../../WebComponents').StytchError}
 *
 */
export const StytchB2BIdentityProvider = createWebComponent<B2BIDPSDKConfig<StytchProjectConfigurationInput>>(
  B2BIDPContainer,
  {
    propNames: ['client', 'presentation', 'callbacks', 'strings', 'getIDPConsentManifest', 'trustedAuthTokenParams'],
  },
);

/**
 * Mounts a B2B IDP Consent screen inside the element provided.
 * Parses OAuth Authorization params (client_id, scope, nonce, etc.) out of the page URL.
 * Requires the user to be logged in.
 * @example
 * mountB2BIdentityProvider({
 *   client: stytchB2BClient,
 *   elementId: '#idp-container',
 * });
 *
 * @deprecated Prefer the StytchB2BIdentityProvider web component
 *
 * @param client - A {@link StytchB2BClient} instance used for making API calls.
 * @param elementId - A string containing the id of the element that should contain the consent screen.
 * @param presentation - Optional {@link PresentationConfig} object for customizing the UI presentation
 * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
 * @param getIDPConsentManifest - Optional {@link B2BIDPConsentManifestGenerator} to customize the consent screen.
 * @param trustedAuthTokenParams - Optional trusted auth token params for attestation prior to running OAuth flow.
 * @param strings - Optional custom strings to be used in the prebuilt UI.
 * @throws An error when the element specified by elementId cannot be found.
 */
export const mountIdentityProvider = createMountFn('stytch-identity-provider', StytchB2BIdentityProvider);
