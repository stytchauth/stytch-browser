import type { StytchProjectConfigurationInput } from '@stytch/core/public';
import { IDPContainer, IDPSDKConfig } from '@stytch/web';

import { createMountFn, createWebComponent } from '../bindings/WebComponents';

// region identityProvider
/**
 * Renders an IDP Consent screen.
 * Parses OAuth Authorization params (client_id, scope, nonce, etc.) out of the page URL.
 * Requires the user to be logged in.
 *
 * @attr {boolean} [shadow] - use shadow DOM to contain styles
 *
 * @prop {StytchClient} client - used to make API calls.
 * @prop {PresentationConfig} [presentation] - for customizing the UI styling and presentation
 * @prop {Messages} [strings] - custom strings to be used, to customize text or for localization
 * @prop {IDPConsentManifestGenerator} [getIDPConsentManifest] - to render custom scopes
 * @prop {AuthTokenParams} [authTokenParams] - to provide a trusted auth token to provide for attestation prior to running OAuth flow.
 *
 * @event StytchEvent - see {@link import('../../WebComponents').StytchEvent}
 * @event StytchError - see {@link import('../../WebComponents').StytchError}
 *
 */
export const StytchIdentityProvider = createWebComponent<IDPSDKConfig<StytchProjectConfigurationInput>>(IDPContainer, {
  propNames: ['client', 'presentation', 'strings', 'getIDPConsentManifest', 'authTokenParams'],
});

/**
 * Mounts an IDP Consent screen inside the element provided.
 * Parses OAuth Authorization params (client_id, scope, nonce, etc.) out of the page URL.
 * Requires the user to be logged in.
 * @example
 * mountIdentityProvider({
 *   client: stytchClient,
 *   elementId: '#idp-container'
 * });
 *
 * @deprecated Use the StytchIdentityProvider web component instead
 *
 * @param client - A {@link StytchClient} instance used for making API calls.
 * @param elementId - A string containing the id of the element that should contain the login screen.
 * @param presentation - Optional {@link PresentationConfig} object for customizing the UI presentation
 * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
 * @param strings - Optional custom strings to be used in the prebuilt UI.
 * @param getIDPConsentManifest - Optional {@link IDPConsentManifestGenerator} to render custom scopes
 * @param authTokenParams - Optional {@link AuthTokenParams} to provide a trusted auth token to provide for attestation prior to running OAuth flow.
 * @throws An error when the element specified by elementId cannot be found.
 */
export const mountIdentityProvider = createMountFn('stytch-identity-provider', StytchIdentityProvider);

// endregion
