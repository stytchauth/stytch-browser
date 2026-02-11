import { StytchProjectConfigurationInput } from './typeConfig';
import { AuthenticateResponse } from './common';

export type ImpersonationAuthenticateOptions = {
  /**
   * The impersonation token used to authenticate a user
   */
  impersonation_token: string;
};

export type ImpersonationAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration>;

export interface IHeadlessImpersonationClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> {
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/authenticate-impersonation-token Authenticate Impersonation Token} endpoint.
   * The authenticate method wraps the consumer impersonation authenticate endpoint.
   *
   * @param data - {@link ImpersonationAuthenticateOptions}
   * @returns A {@link ImpersonationAuthenticateResponse} indicating that the token has been authenticated
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid token, invalid options, etc.)
   */
  authenticate(
    data: ImpersonationAuthenticateOptions,
  ): Promise<ImpersonationAuthenticateResponse<TProjectConfiguration>>;
}
