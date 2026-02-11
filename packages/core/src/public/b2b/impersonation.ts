import { StytchProjectConfigurationInput } from '../typeConfig';
import { B2BAuthenticateResponseWithMFA } from './common';

export type B2BImpersonationAuthenticateOptions = {
  /**
   *  The impersonation token used to authenticate a member
   */
  impersonation_token: string;
};

export type B2BImpersonationAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration>;

export interface IHeadlessB2BImpersonationClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> {
  /**
   * The authenticate method wraps the {@link https://stytch.com/docs/b2b/api/authenticate-impersonation-token authenticate} Impersonation API endpoint.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/impersonation#authenticate Stytch Docs} for a complete reference.
   *
   * @example
   * stytch.impersonation.authenticate({
   *   token: 'token',
   * });
   *
   * @param data - {@link B2BImpersonationAuthenticateOptions}
   *
   * @returns A {@link B2BImpersonationAuthenticateResponse} indicating that the token has been authenticated and the impersonator is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  authenticate(
    data: B2BImpersonationAuthenticateOptions,
  ): Promise<B2BImpersonationAuthenticateResponse<TProjectConfiguration>>;
}
