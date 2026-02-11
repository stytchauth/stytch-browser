import { Callbacks, StringsOptions, StytchProjectConfigurationInput } from '@stytch/core/public';

import { PresentationConfig, StytchB2BUIConfig } from '../../../types';
import { AppContainer } from '../../b2b/App';
import { createB2BComponent } from '../bindings/createB2BComponent';

export interface StytchB2BProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StringsOptions {
  /**
   * An optional {@link PresentationConfig} to customize the UI presentation.
   */
  presentation?: PresentationConfig;
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
   *   products: [B2BProducts.emailMagicLinks],
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
   *   products: [B2BProducts.emailMagicLinks, B2BProducts.sso],
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
 *   presentation={{
 *     theme: { primary: '#0577CA' },
 *     options: {},
 *   }}
 *   callbacks={{
 *     onEvent: (event) => console.log(event)
 *   }}
 * />
 */
export const StytchB2B = /* @__PURE__ */ createB2BComponent('StytchB2B', AppContainer);
