import { PasskeyRegistrationContainer } from '../../b2c/PasskeyRegistrationContainer';
import { createB2CComponent } from '../bindings/createB2CComponent';

/**
 * The Stytch Passkey Registration component.
 * This component can only be used with a Stytch UI Client
 * passed into the StytchProvider.
 *
 * See the {@link https://stytch.com/docs/sdks online reference}
 *
 * @example
 * <StytchPasskeyRegistration
 *   presentation={{
 *     theme: { primary: '#ff00f7' },
 *     options: {},
 *   }}
 *   callbacks={{
 *     onEvent: (event) => console.log(event)
 *   }}
 * />
 */
export const StytchPasskeyRegistration = /* @__PURE__ */ createB2CComponent(
  'StytchPasskeyRegistration',
  PasskeyRegistrationContainer,
);
