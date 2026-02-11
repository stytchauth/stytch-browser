import type { StytchProjectConfigurationInput } from '@stytch/core/public';
import { PasskeyRegistrationContainer, SDKConfig } from '@stytch/web';

import { createMountFn, createWebComponent } from '../bindings/WebComponents';

const defaultSdkProps = ['client', 'config', 'presentation', 'callbacks', 'strings'] as const;

/**
 * Renders a Passkey registration screen.
 *
 * @attr {boolean} [shadow] - use shadow DOM to contain styles
 *
 * @prop {StytchClient} client - used to make API calls.
 * @prop {StytchLoginConfig} config - object containing the products that should be registered
 * @prop {PresentationConfig} [presentation] - for customizing the UI styling and presentation
 * @prop {Messages} [strings] - custom strings to be used, to customize text or for localization
 *
 * @event StytchEvent - see {@link import('./idpWebComponent').StytchEvent}
 * @event StytchError - see {@link import('./idpWebComponent').StytchError}
 *
 */
export const StytchPasskeyRegistration = createWebComponent<SDKConfig<StytchProjectConfigurationInput>>(
  PasskeyRegistrationContainer,
  {
    propNames: defaultSdkProps,
  },
);

/**
 * Mounts a Passkey registration screen inside the element provided.
 * If a passkey registration screen has already been rendered inside the element,
 * it will be updated to use the new config, style, and callback options passed in.
 * @example
 * mountPasskeyRegistration({
 *   client: stytchClient,
 *   elementId: '#login-container',
 *   config: {...}
 * });
 *
 * @deprecated Use the StytchPasskeyRegistration web component instead
 *
 * @param client - A {@link StytchClient} instance used for making API calls.
 * @param elementId - A string containing the id of the element that should contain the login screen.
 * @param config - A {@link StytchLoginConfig} object containing the products that should be registered
 * @param presentation - Optional {@link PresentationConfig} object for customizing the UI presentation
 * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
 * @param strings - Optional custom strings to be used in the prebuilt UI.
 * @throws An error when the element specified by elementId cannot be found.
 */
export const mountPasskeyRegistration = createMountFn('stytch-passkey-registration', StytchPasskeyRegistration);
