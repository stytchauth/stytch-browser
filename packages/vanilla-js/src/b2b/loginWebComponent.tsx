import type { StytchProjectConfigurationInput } from '@stytch/core/public';
import { AppContainer, B2BSDKConfig } from '@stytch/web/b2b';

import { createMountFn, createWebComponent } from '../bindings/WebComponents';

/**
 * Renders a B2B log in screen.
 *
 * @attr {boolean} [shadow] - use shadow DOM to contain styles
 *
 * @prop {StytchB2BClient} client - used to make API calls.
 * @prop {StytchB2BUIConfig} config - object containing the products that should be registered
 * @prop {PresentationConfig} [presentation] - for customizing the UI styling and presentation
 * @prop {Messages} [strings] - custom strings to be used, to customize text or for localization
 *
 * @event StytchEvent - see {@link import('../../WebComponents').StytchEvent}
 * @event StytchError - see {@link import('../../WebComponents').StytchError}
 *
 */
export const StytchB2B = createWebComponent<B2BSDKConfig<StytchProjectConfigurationInput>>(AppContainer, {
  propNames: ['client', 'config', 'presentation', 'callbacks', 'strings'],
});

/**
 * Mounts a B2B login screen inside the element provided.
 * If a login screen has already been rendered inside the element,
 * it will be updated to use the new config, style, and callback options passed in.
 * @example
 * mountB2B({
 *   client: stytchB2BClient,
 *   elementId: '#container',
 *   config: {...}
 * });
 *
 * @deprecated Prefer the StytchB2B web component
 *
 * @param client - A {@link StytchB2BClient} instance used for making API calls.
 * @param elementId - A string containing the id of the element that should contain the login screen.
 * @param config - A {@link StytchB2BUIConfig} object containing the products that should be registered
 * @param presentation - Optional {@link PresentationConfig} object for customizing the UI presentation
 * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
 * @param strings - Optional custom strings to be used in the prebuilt UI.
 * @throws An error when the element specified by elementId cannot be found.
 */
export const mount = createMountFn('stytch-ui', StytchB2B);
