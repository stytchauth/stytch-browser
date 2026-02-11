import { Callbacks, StringsOptions, StytchProjectConfigurationInput } from '@stytch/core/public';

import { PresentationConfig, StytchLoginConfig } from '../../../types';
import { AppContainer } from '../../b2c/AppContainer';
import { createB2CComponent } from '../bindings/createB2CComponent';

export interface StytchProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StringsOptions {
  /**
   * A {@link StytchLoginConfig} object. Add products and product-specific config to this object to change the login methods shown.
   *
   * @example
   * {
   *   products: [Products.crypto, Products.otp]
   * }
   *
   * @example
   * {
   *   products: [Products.emailMagicLinks]
   *   emailMagicLinksOptions: {
   *     loginRedirectURL: 'https://example.com/authenticate',
   *     signupRedirectURL: 'https://example.com/authenticate',
   *   }
   * }
   *
   * @example
   * {
   *   products: [Products.oauth]
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
   * An optional {@link PresentationConfig} to customize the UI presentation.
   */
  presentation?: PresentationConfig;
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
 *     products: [Products.emailMagicLinks, Products.oauth],
 *     emailMagicLinksOptions: {
 *       loginRedirectURL: 'https://example.com/authenticate',
 *       signupRedirectURL: 'https://example.com/authenticate',
 *     },
 *     oauthOptions: {
 *      providers: [{ type: OAuthProviders.Google }, { type: OAuthProviders.Microsoft }],
 *    },
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
export const StytchLogin = /* @__PURE__ */ createB2CComponent('StytchLogin', AppContainer);
