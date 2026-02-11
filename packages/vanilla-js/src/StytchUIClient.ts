import { StytchHeadlessClient } from './StytchHeadlessClient';
import {
  Callbacks,
  StytchLoginConfig,
  StyleConfig,
  StytchProjectConfigurationInput,
  StringsOptions,
} from '@stytch/core/public';
import {
  UI_SCREEN_WEB_COMPONENT_NAME,
  UI_RESET_PASSWORD_WEB_COMPONENT_NAME,
  UILoginComponent,
  UIResetPasswordComponent,
  UI_PASSKEY_REGISTRATION_WEB_COMPONENT_NAME,
  UIPasskeyRegistrationComponent,
  UI_IDP_WEB_COMPONENT_NAME,
  UIIdentityProviderComponent,
} from './ui/b2c/App';
import { checkNotSSR } from '@stytch/core';
import { IReactWebComponent } from './ui/CreateWebComponent';
import { SDKConfig, ResetPasswordSDKConfig, IDPSDKConfig, IDPConsentManifestGenerator, AuthTokenParams } from './types';

/**
 * A client used for invoking the Stytch API an.
 * The Stytch UI Client can be used as a drop-in solution for authentication and session management.
 * The Stytch UI client also can be used to render various UI elements for managing users.
 * Full documentation can be found {@link https://stytch.com/docs/sdks/javascript-sdk online.}
 * @example
 * const stytch = new StytchUIClient('public-token-<find yours in the stytch dashboard>');
 * stytch.magicLinks.email.loginOrCreate('sandbox@stytch.com', {
 *   login_magic_link_url: 'https://example.com/authenticate',
 *   login_expiration_minutes: 60,
 *   signup_magic_link_url: 'https://example.com/authenticate',
 *   signup_expiration_minutes: 60,
 * });
 */
export class StytchUIClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StytchHeadlessClient<TProjectConfiguration> {
  constructor(...args: ConstructorParameters<typeof StytchHeadlessClient<TProjectConfiguration>>) {
    checkNotSSR('StytchUIClient');
    super(...args);
  }

  /**
   * Mounts a login screen inside the element provided.
   * If a login screen has already been rendered inside the element,
   * it will be updated to use the new config, style, and callback options passed in.
   * @example
   * stytchClient.mountLogin({
   *   elementId: '#login-container',
   *   config: {...}
   * });
   *
   * @param elementId - A string containing the id of the element that should contain the login screen.
   * @param config - A {@link StytchLoginConfig} object containing the products that should be registered
   * @param styles - A {@link StyleConfig} object containing custom styling info
   * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
   * @param strings - Optional custom strings to be used in the prebuilt UI.
   * @throws An error when the element specified by elementId cannot be found.
   */
  mountLogin({
    elementId,
    config,
    styles,
    callbacks,
    strings,
  }: {
    elementId: string;
    config: StytchLoginConfig;
    styles?: StyleConfig;
    callbacks?: Callbacks<TProjectConfiguration>;
  } & StringsOptions): void {
    const targetParentDomNode = document.querySelector(elementId);
    if (!targetParentDomNode) {
      throw new Error(
        `The selector you specified (${elementId}) applies to no DOM elements that are currently on the page. Make sure the element exists on the page before calling mountLogin().`,
      );
    }
    /**
     * If mountLogin is called again on the same element,
     * and it already has a stytch-ui child,
     * call its render method to update its internal prop state
     */
    if (
      // HTML Node names are canonically all upper case always
      targetParentDomNode.firstChild?.nodeName.toLowerCase() === UI_SCREEN_WEB_COMPONENT_NAME.toLowerCase()
    ) {
      const node = targetParentDomNode.firstChild as IReactWebComponent<SDKConfig<TProjectConfiguration>>;
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
     * If mountLogin is called for the first time,
     * make a new element!
     */
    const loginElement = UILoginComponent<TProjectConfiguration>({ client: this, config, callbacks, styles, strings });
    targetParentDomNode.appendChild(loginElement);
  }

  /**
   * Mounts a reset password screen inside the element provided.
   * If a reset password screen has already been rendered inside the element,
   * it will be updated to use the new config, style, and callback options passed in.
   * @example
   * stytchClient.mountResetPassword({
   *   elementId: '#login-container',
   *   config: {...}
   * });
   *
   * @param elementId - A string containing the id of the element that should contain the login screen.
   * @param config - A {@link StytchLoginConfig} object containing the products that should be registered
   * @param styles - A {@link StyleConfig} object containing custom styling info
   * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
   * @param strings - Optional custom strings to be used in the prebuilt UI.
   * @throws An error when the element specified by elementId cannot be found.
   */
  mountResetPassword({
    elementId,
    config,
    styles,
    callbacks,
    strings,
    passwordResetToken,
  }: {
    elementId: string;
    config: StytchLoginConfig;
    styles?: StyleConfig;
    callbacks?: Callbacks<TProjectConfiguration>;
    passwordResetToken: string;
  } & StringsOptions): void {
    const targetParentDomNode = document.querySelector(elementId);
    if (!targetParentDomNode) {
      throw new Error(
        `The selector you specified (${elementId}) applies to no DOM elements that are currently on the page. Make sure the element exists on the page before calling mountLogin().`,
      );
    }
    /**
     * If mountResetPassword is called again on the same element,
     * and it already has a stytch-ui child,
     * call its render method to update its internal prop state
     */
    if (
      // HTML Node names are canonically all upper case always
      targetParentDomNode.firstChild?.nodeName.toLowerCase() === UI_RESET_PASSWORD_WEB_COMPONENT_NAME.toLowerCase()
    ) {
      const node = targetParentDomNode.firstChild as IReactWebComponent<ResetPasswordSDKConfig<TProjectConfiguration>>;
      node.render({
        client: this,
        config,
        callbacks,
        styles,
        strings,
        passwordResetToken,
      });
      return;
    }

    /**
     * If mountResetPassword is called for the first time,
     * make a new element!
     */

    const loginElement = UIResetPasswordComponent<TProjectConfiguration>({
      client: this,
      config,
      callbacks,
      styles,
      strings,
      passwordResetToken,
    });
    targetParentDomNode.appendChild(loginElement);
  }

  /**
   * Mounts a Passkey registration screen inside the element provided.
   * If a passkey registration screen has already been rendered inside the element,
   * it will be updated to use the new config, style, and callback options passed in.
   * @example
   * stytchClient.mountPasskeyRegistration({
   *   elementId: '#login-container',
   *   config: {...}
   * });
   *
   * @param elementId - A string containing the id of the element that should contain the login screen.
   * @param config - A {@link StytchLoginConfig} object containing the products that should be registered
   * @param styles - A {@link StyleConfig} object containing custom styling info
   * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
   * @param strings - Optional custom strings to be used in the prebuilt UI.
   * @throws An error when the element specified by elementId cannot be found.
   */
  mountPasskeyRegistration({
    elementId,
    config,
    styles,
    callbacks,
    strings,
  }: {
    elementId: string;
    config: StytchLoginConfig;
    styles?: StyleConfig;
    callbacks?: Callbacks<TProjectConfiguration>;
  } & StringsOptions): void {
    const targetParentDomNode = document.querySelector(elementId);
    if (!targetParentDomNode) {
      throw new Error(
        `The selector you specified (${elementId}) applies to no DOM elements that are currently on the page. Make sure the element exists on the page before calling mountPasskeyRegistration().`,
      );
    }
    /**
     * If mountPasskeyRegistration is called again on the same element,
     * and it already has a stytch-ui child,
     * call its render method to update its internal prop state
     */
    if (
      // HTML Node names are canonically all upper case always
      targetParentDomNode.firstChild?.nodeName.toLowerCase() ===
      UI_PASSKEY_REGISTRATION_WEB_COMPONENT_NAME.toLowerCase()
    ) {
      const node = targetParentDomNode.firstChild as IReactWebComponent<SDKConfig<TProjectConfiguration>>;
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
     * If mountPasskeyRegistration is called for the first time,
     * make a new element!
     */

    const passkeyRegistrationElement = UIPasskeyRegistrationComponent({
      client: this,
      config,
      callbacks,
      styles,
      strings,
    });
    targetParentDomNode.appendChild(passkeyRegistrationElement);
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
   * @param elementId - A string containing the id of the element that should contain the login screen.
   * @param styles - A {@link StyleConfig} object containing custom styling info
   * @param callbacks - Optional {@link Callbacks} triggered by various events in the Stytch SDK.
   * @param strings - Optional custom strings to be used in the prebuilt UI.
   * @param getIDPConsentManifest - Optional {@link IDPConsentManifestGenerator} to render custom scopes
   * @param authTokenParams - Optional {@link AuthTokenParams} to provide a trusted auth token to provide for attestation prior to running OAuth flow.
   * @throws An error when the element specified by elementId cannot be found.
   */
  mountIdentityProvider({
    elementId,
    styles,
    callbacks,
    strings,
    getIDPConsentManifest,
    authTokenParams,
  }: {
    elementId: string;
    styles?: StyleConfig;
    callbacks?: Callbacks<TProjectConfiguration>;
    getIDPConsentManifest?: IDPConsentManifestGenerator;
    authTokenParams?: AuthTokenParams;
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
      targetParentDomNode.firstChild?.nodeName.toLowerCase() === UI_IDP_WEB_COMPONENT_NAME.toLowerCase()
    ) {
      const node = targetParentDomNode.firstChild as IReactWebComponent<IDPSDKConfig<TProjectConfiguration>>;
      node.render({
        client: this,
        callbacks,
        styles,
        strings,
        getIDPConsentManifest,
        authTokenParams,
      });
      return;
    }

    /**
     * If mountIdentityProvider is called for the first time,
     * make a new element!
     */

    const idpElement = UIIdentityProviderComponent({
      client: this,
      callbacks,
      styles,
      strings,
      getIDPConsentManifest,
      authTokenParams,
    });
    targetParentDomNode.appendChild(idpElement);
  }
}
