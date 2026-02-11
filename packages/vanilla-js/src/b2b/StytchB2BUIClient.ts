import { StytchB2BHeadlessClient } from './StytchB2BHeadlessClient';
import {
  B2B_UI_SCREEN_WEB_COMPONENT_NAME,
  B2B_UI_IDP_WEB_COMPONENT_NAME,
  B2BUIIdentityProviderComponent,
  B2BUILoginComponent,
} from '../ui/b2b/App';
import {
  Callbacks,
  StringsOptions,
  StyleConfig,
  StytchB2BUIConfig,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { checkB2BNotSSR } from '@stytch/core';
import { IReactWebComponent } from '../ui/CreateWebComponent';
import { B2BIDPConsentManifestGenerator, B2BIDPSDKConfig, B2BSDKConfig } from '../types';

/**
 * A client used for invoking Stytch's B2B APIs.
 * The Stytch UI Client can be used as a drop-in solution for authentication and session management.
 * The Stytch UI client also can be used to render various UI elements for managing users.
 * Full documentation can be found {@link https://stytch.com/docs/b2b/sdks/javascript-sdk online}.
 *
 * @example
 * const stytch = new StytchB2BUIClient('public-token-<find yours in the stytch dashboard>');
 * stytch.magicLinks.email.loginOrCreate({
 *   email: 'sandbox@stytch.com',
 *   organization_id: 'organization-test-123',
 * });
 */
export class StytchB2BUIClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StytchB2BHeadlessClient<TProjectConfiguration> {
  constructor(...args: ConstructorParameters<typeof StytchB2BHeadlessClient<TProjectConfiguration>>) {
    checkB2BNotSSR('StytchB2BUIClient');
    super(...args);
  }

  /**
   * Mounts a login screen inside the element provided.
   * If a login screen has already been rendered inside the element,
   * it will be updated to use the new config, style, and callback options passed in.
   * @example
   * stytchClient.mount({
   *   elementId: '#container',
   *   config: {...}
   * });
   *
   * @param elementId - A string containing the id of the element that should contain the login screen.
   * @param config - A {@link StytchB2BUIConfig} object containing the products that should be registered
   * @param styles - A {@link StyleConfig} object containing custom styling info
   * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
   * @param strings - Optional custom strings to be used in the prebuilt UI.
   * @throws An error when the element specified by elementId cannot be found.
   */
  mount({
    elementId,
    styles,
    callbacks,
    config,
    strings,
  }: {
    elementId: string;
    styles?: StyleConfig;
    callbacks?: Callbacks<TProjectConfiguration>;
    config: StytchB2BUIConfig;
  } & StringsOptions): void {
    const targetParentDomNode = document.querySelector(elementId);
    if (!targetParentDomNode) {
      throw new Error(
        `The selector you specified (${elementId}) applies to no DOM elements that are currently on the page. Make sure the element exists on the page before calling mountLogin().`,
      );
    }
    /**
     * If mount is called again on the same element,
     * and it already has a stytch-ui child,
     * call its render method to update its internal prop state
     */
    if (
      // HTML Node names are canonically all upper case always
      targetParentDomNode.firstChild?.nodeName.toLowerCase() === B2B_UI_SCREEN_WEB_COMPONENT_NAME.toLowerCase()
    ) {
      const node = targetParentDomNode.firstChild as IReactWebComponent<B2BSDKConfig<TProjectConfiguration>>;
      node.render({
        client: this,
        config,
        callbacks,
        styles,
        strings,
      });
      return;
    }

    /**
     * If mount is called for the first time,
     * make a new element!
     */
    const loginElement = B2BUILoginComponent({ client: this, config, callbacks, styles, strings });
    targetParentDomNode.appendChild(loginElement);
  }

  /**
   * Mounts an IDP Consent screen inside the element provided.
   * Parses OAuth Authorization params (client_id, scope, nonce, etc.) out of the page URL.
   * Requires the user to be logged in.
   * @example
   * stytchClient.mountIdentityProvider({
   *   elementId: '#idp-container',
   *   config: {...}
   * });
   *
   * @param elementId - A string containing the id of the element that should contain the consent screen.
   * @param styles - A {@link StyleConfig} object containing custom styling info
   * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
   * @param getIDPConsentManifest - Optional {@link B2BIDPConsentManifestGenerator} to customize the consent screen.
   * @throws An error when the element specified by elementId cannot be found.
   */
  mountIdentityProvider({
    elementId,
    styles,
    callbacks,
    strings,
    getIDPConsentManifest,
    trustedAuthTokenParams,
  }: {
    elementId: string;
    styles?: StyleConfig;
    callbacks?: Callbacks<TProjectConfiguration>;
    getIDPConsentManifest?: B2BIDPConsentManifestGenerator;
    trustedAuthTokenParams?: { trustedAuthToken: string; tokenProfileID: string };
  } & StringsOptions): void {
    const targetParentDomNode = document.querySelector(elementId);
    if (!targetParentDomNode) {
      throw new Error(
        `The selector you specified (${elementId}) applies to no DOM elements that are currently on the page. Make sure the element exists on the page before calling mountIdentityProvider().`,
      );
    }
    /**
     * If mountIdentityProvider is called again on the same element,
     * and it already has a stytch-ui child,
     * call its render method to update its internal prop state
     */
    if (
      // HTML Node names are canonically all upper case always
      targetParentDomNode.firstChild?.nodeName.toLowerCase() === B2B_UI_IDP_WEB_COMPONENT_NAME.toLowerCase()
    ) {
      const node = targetParentDomNode.firstChild as IReactWebComponent<B2BIDPSDKConfig<TProjectConfiguration>>;
      node.render({
        client: this,
        callbacks,
        styles,
        strings,
        getIDPConsentManifest,
        trustedAuthTokenParams,
      });
      return;
    }

    /**
     * If mountIdentityProvider is called for the first time,
     * make a new element!
     */

    const idpElement = B2BUIIdentityProviderComponent({
      client: this,
      callbacks,
      styles,
      strings,
      getIDPConsentManifest,
      trustedAuthTokenParams,
    });
    targetParentDomNode.appendChild(idpElement);
  }
}
