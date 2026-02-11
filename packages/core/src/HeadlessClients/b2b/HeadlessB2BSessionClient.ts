import { ExtractOpaqueTokens, IB2BSubscriptionService, IfOpaqueTokens, INetworkClient } from '../..';
import {
  B2BSessionAccessTokenExchangeOptions,
  B2BSessionAccessTokenExchangeResponse,
  B2BSessionAttestOptions,
  B2BSessionAttestResponse,
  B2BSessionAuthenticateResponse,
  B2BSessionExchangeOptions,
  B2BSessionExchangeResponse,
  B2BSessionOnChangeCallback,
  B2BSessionRevokeOptions,
  IHeadlessB2BSessionClient,
  MemberSessionInfo,
  SessionAuthenticateOptions,
  SessionRevokeResponse,
  SessionTokens,
  SessionTokensUpdate,
  StytchProjectConfigurationInput,
  UNRECOVERABLE_ERROR_TYPES,
} from '../../public';
import { validateInDev } from '../../utils/dev';

export class HeadlessB2BSessionClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BSessionClient<TProjectConfiguration>
{
  getSync = () => {
    return this._subscriptionService.getSession();
  };

  getInfo = (): MemberSessionInfo => ({
    session: this.getSync(),
    fromCache: this._subscriptionService.getFromCache(),
  });

  onChange = (callback: B2BSessionOnChangeCallback) => {
    return this._subscriptionService.subscribeToState((state) => callback(state?.session ?? null));
  };

  revoke = async (options?: B2BSessionRevokeOptions) => {
    /**
     * Revoke destroys the local state if the API request is successful
     * or if we return an unrecoverable error (user is unauthenticated)
     * or if the developer passes in a forceClear option.
     * If the API request returns a recoverable error (the user is offline),
     * we do not destroy the local state to let the developer manually add retry
     * logic to call revoke again.
     */
    try {
      const resp = await this._networkClient.fetchSDK<SessionRevokeResponse>({
        url: `/b2b/sessions/revoke`,
        method: 'POST',
      });

      this._subscriptionService.destroyState();

      return resp;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (options?.forceClear) {
        this._subscriptionService.destroyState();
      } else if (UNRECOVERABLE_ERROR_TYPES.includes(error.error_type)) {
        this._subscriptionService.destroyState();
      }
      throw error;
    }
  };

  revokeForMember = async (options: { member_id: string }) => {
    validateInDev('stytch.session.revokeForMember', options, {
      member_id: 'string',
    });

    return await this._networkClient.fetchSDK<SessionRevokeResponse>({
      url: `/b2b/sessions/revoke/${options.member_id}`,
      method: 'POST',
    });
  };

  private _authenticate = async (
    options?: SessionAuthenticateOptions,
  ): Promise<B2BSessionAuthenticateResponse<TProjectConfiguration>> => {
    const initialSession = this._subscriptionService.getSession();
    const isSessionStale = () =>
      initialSession?.member_session_id !== this._subscriptionService.getSession()?.member_session_id;

    try {
      const requestBody = {
        session_duration_minutes: options?.session_duration_minutes,
      };
      const resp = await this._networkClient.fetchSDK<B2BSessionAuthenticateResponse<TProjectConfiguration>>({
        url: '/b2b/sessions/authenticate',
        body: requestBody,
        method: 'POST',
      });

      if (isSessionStale()) {
        // [SDK-1336] The session was updated out from under us while the
        // request was in flight; discard the response and retry
        return this._authenticate(options);
      }

      return resp;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (isSessionStale()) {
        // [SDK-1336] The session was updated out from under us while the
        // request was in flight; discard the response and retry
        return this._authenticate(options);
      }

      if (UNRECOVERABLE_ERROR_TYPES.includes(error.error_type)) {
        this._subscriptionService.destroySession();
      }
      throw error;
    }
  };

  authenticate: (
    options?: SessionAuthenticateOptions,
  ) => Promise<B2BSessionAuthenticateResponse<TProjectConfiguration>>;

  exchange: (data: B2BSessionExchangeOptions) => Promise<B2BSessionExchangeResponse<TProjectConfiguration>>;

  exchangeAccessToken: (
    data: B2BSessionAccessTokenExchangeOptions,
  ) => Promise<B2BSessionAccessTokenExchangeResponse<TProjectConfiguration>>;

  attest: (data: B2BSessionAttestOptions) => Promise<B2BSessionAttestResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
  ) {
    this.authenticate = this._subscriptionService.withUpdateSession(this._authenticate);

    this.exchange = this._subscriptionService.withUpdateSession(async (data: B2BSessionExchangeOptions) => {
      validateInDev('stytch.session.exchange', data, {
        organization_id: 'string',
        session_duration_minutes: 'number',
        locale: 'optionalString',
      });

      return this._networkClient.fetchSDK<B2BSessionExchangeResponse<TProjectConfiguration>>({
        url: '/b2b/sessions/exchange',
        body: data,
        method: 'POST',
      });
    });

    this.exchangeAccessToken = this._subscriptionService.withUpdateSession(
      async (data: B2BSessionAccessTokenExchangeOptions) => {
        validateInDev('stytch.session.exchange', data, {
          access_token: 'string',
          session_duration_minutes: 'number',
        });
        return this._networkClient.fetchSDK<B2BSessionAccessTokenExchangeResponse<TProjectConfiguration>>({
          url: '/b2b/sessions/exchange_access_token',
          body: data,
          method: 'POST',
        });
      },
    );

    this.attest = this._subscriptionService.withUpdateSession(async (data: B2BSessionAttestOptions) => {
      validateInDev('stytch.session.attest', data, {
        organization_id: 'optionalString',
        profile_id: 'string',
        token: 'string',
        session_duration_minutes: 'optionalNumber',
      });

      return this._networkClient.fetchSDK<B2BSessionAttestResponse<TProjectConfiguration>>({
        url: '/b2b/sessions/attest',
        body: data,
        method: 'POST',
      });
    });
  }

  getTokens() {
    return this._subscriptionService.getTokens() as IfOpaqueTokens<
      ExtractOpaqueTokens<TProjectConfiguration>,
      never,
      SessionTokens | null
    >;
  }

  updateSession(tokens: SessionTokensUpdate): void {
    validateInDev('stytch.session.updateSession', tokens, {
      session_token: 'string',
      session_jwt: 'optionalString',
    });
    this._subscriptionService.updateTokens(tokens);
  }
}
