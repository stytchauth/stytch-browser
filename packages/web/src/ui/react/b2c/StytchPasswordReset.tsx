import { StytchProjectConfigurationInput } from '@stytch/core/public';

import { ResetPasswordContainer } from '../../b2c/ResetPasswordContainer';
import { createB2CComponent } from '../bindings/createB2CComponent';
import { StytchProps } from './StytchLogin';

export interface StytchResetPasswordProps<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StytchProps<TProjectConfiguration> {
  /**
   * A Stytch password reset token.
   */
  passwordResetToken: string;
}

/**
 * The Stytch Reset Password component.
 * This component can only be used with a Stytch UI Client
 * passed into the StytchProvider.
 *
 * See the {@link https://stytch.com/docs/sdks online reference}
 *
 * @example
 * <StytchPasswordReset
 *   config={{
 *     products: [Products.passwords],
 *     passwordOptions: {
 *       loginRedirectURL: '${exampleURL}/authenticate',
 *       resetPasswordRedirectURL: '${exampleURL}/authenticate',
 *     },
 *   }}
 *   passwordResetToken="PvC5UudZ7TPZbELt95yXAQ-8MeEUCRob8bUQ-g52fIJs"
 *   presentation={{
 *     theme: { primary: '#0577CA' },
 *     options: {},
 *   }}
 *   callbacks={{
 *     onEvent: (event) => console.log(event)
 *   }}
 * />
 */
export const StytchPasswordReset = /* @__PURE__ */ createB2CComponent('StytchPasswordReset', ResetPasswordContainer);
