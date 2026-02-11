import {
  IHeadlessB2BSessionClient,
  B2BSessionOnChangeCallback,
  SessionRevokeResponse,
  SessionAuthenticateOptions,
  B2BSessionAuthenticateResponse,
  B2BSessionRevokeOptions,
  SessionTokensUpdate,
  UNRECOVERABLE_ERROR_TYPES,
  B2BSessionExchangeOptions,
  B2BSessionExchangeResponse,
  MemberSessionInfo,
  StytchProjectConfigurationInput,
  SessionTokens,
  B2BSessionAccessTokenExchangeOptions,
  B2BSessionAccessTokenExchangeResponse,
  B2BSessionAttestResponse,
  B2BSessionAttestOptions,
} from '../../public';
import { validate } from '../../utils';
import { INetworkClient, IB2BSubscriptionService, IfOpaqueTokens, ExtractOpaqueTokens } from '../..';

export class HeadlessB2BSessionClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BSessionClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
  ) {}

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
    validate('stytch.session.revokeForMember').isString('member_id', options.member_id);

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

  authenticate = this._subscriptionService.withUpdateSession(this._authenticate);

  getTokens() {
    return this._subscriptionService.getTokens() as IfOpaqueTokens<
      ExtractOpaqueTokens<TProjectConfiguration>,
      never,
      SessionTokens | null
    >;
  }

  updateSession(tokens: SessionTokensUpdate): void {
    validate('stytch.session.updateSession')
      .isString('session_token', tokens.session_token)
      .isOptionalString('session_jwt', tokens.session_jwt ?? undefined);
    this._subscriptionService.updateTokens(tokens);
  }

  exchange = this._subscriptionService.withUpdateSession(async (data: B2BSessionExchangeOptions) => {
    validate('stytch.session.exchange')
      .isString('organization_id', data.organization_id)
      .isNumber('session_duration_minutes', data.session_duration_minutes)
      .isOptionalString('locale', data.locale);

    return this._networkClient.fetchSDK<B2BSessionExchangeResponse<TProjectConfiguration>>({
      url: '/b2b/sessions/exchange',
      body: data,
      method: 'POST',
    });
  });

  exchangeAccessToken = this._subscriptionService.withUpdateSession(
    async (data: B2BSessionAccessTokenExchangeOptions) => {
      validate('stytch.session.exchange')
        .isString('organization_id', data.access_token)
        .isNumber('session_duration_minutes', data.session_duration_minutes);
      return this._networkClient.fetchSDK<B2BSessionAccessTokenExchangeResponse<TProjectConfiguration>>({
        url: '/b2b/sessions/exchange_access_token',
        body: data,
        method: 'POST',
      });
    },
  );

  attest = this._subscriptionService.withUpdateSession(async (data: B2BSessionAttestOptions) => {
    validate('stytch.session.attest')
      .isOptionalString('organization_id', data.organization_id)
      .isString('profile_id', data.profile_id)
      .isString('token', data.token)
      .isOptionalNumber('session_duration_minutes', data.session_duration_minutes);

    return this._networkClient.fetchSDK<B2BSessionAttestResponse<TProjectConfiguration>>({
      url: '/b2b/sessions/attest',
      body: data,
      method: 'POST',
    });
  });
}
