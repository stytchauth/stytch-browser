import {
  IHeadlessSessionClient,
  SessionOnChangeCallback,
  SessionRevokeResponse,
  SessionAuthenticateOptions,
  SessionAuthenticateResponse,
  SessionAccessTokenExchangeOptions,
  SessionAccessTokenExchangeResponse,
  SessionTokens,
  UNRECOVERABLE_ERROR_TYPES,
  SessionRevokeOptions,
  ConsumerState,
  SessionTokensUpdate,
  SessionInfo,
  StytchProjectConfigurationInput,
  SessionAttestOptions,
  SessionAttestResponse,
} from '../public';
import { IConsumerSubscriptionService, INetworkClient } from '..';
import { ExtractOpaqueTokens, IfOpaqueTokens } from '../typeConfig';
import { omitUser, WithUser, validate } from '../utils';

export class HeadlessSessionClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessSessionClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
  ) {}

  getSync = () => {
    return this._subscriptionService.getSession();
  };

  getInfo = (): SessionInfo => {
    const session = this.getSync();
    const fromCache = this._subscriptionService.getFromCache();
    return { session, fromCache };
  };

  onChange = (callback: SessionOnChangeCallback) => {
    let lastVal = this._subscriptionService.getSession();
    const listener = (state: ConsumerState | null) => {
      if (state?.session !== lastVal) {
        lastVal = state?.session ?? null;
        callback(lastVal);
      }
    };
    return this._subscriptionService.subscribeToState(listener);
  };

  revoke = async (options?: SessionRevokeOptions) => {
    /**
     * Revoke destroys the local state if the API request is successful
     * or if we return an unrecoverable error (user is unauthenticated)
     * or if the developer passses in a forceClear option.
     * If the API request returns a recoverable error (the user is offline),
     * we do not destroy the local state to let the developer manually add retry
     * logic to call revoke again.
     */

    try {
      const resp = await this._networkClient.fetchSDK<SessionRevokeResponse>({
        url: `/sessions/revoke`,
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

  private _authenticate = async (
    options?: SessionAuthenticateOptions,
  ): Promise<SessionAuthenticateResponse<TProjectConfiguration>> => {
    const initialSession = this._subscriptionService.getSession();
    const isSessionStale = () => initialSession?.session_id !== this._subscriptionService.getSession()?.session_id;

    try {
      const requestBody = {
        session_duration_minutes: options?.session_duration_minutes,
      };
      const resp = await this._networkClient.fetchSDK<WithUser<SessionAuthenticateResponse<TProjectConfiguration>>>({
        url: '/sessions/authenticate',
        body: requestBody,
        method: 'POST',
      });

      if (isSessionStale()) {
        // [SDK-1336] The session was updated out from under us while the
        // request was in flight; discard the response and retry
        return this._authenticate(options);
      }

      return omitUser(resp);
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

  exchangeAccessToken = this._subscriptionService.withUpdateSession(async (data: SessionAccessTokenExchangeOptions) => {
    validate('stytch.session.exchangeAccessToken')
      .isString('access_token', data.access_token)
      .isNumber('session_duration_minutes', data.session_duration_minutes);
    const resp = await this._networkClient.fetchSDK<
      WithUser<SessionAccessTokenExchangeResponse<TProjectConfiguration>>
    >({
      url: '/sessions/exchange_access_token',
      body: data,
      method: 'POST',
    });

    return omitUser(resp);
  });

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

  attest = this._subscriptionService.withUpdateSession(async (data: SessionAttestOptions) => {
    validate('stytch.session.attest')
      .isString('profile_id', data.profile_id)
      .isString('token', data.token)
      .isOptionalNumber('session_duration_minutes', data.session_duration_minutes);

    return this._networkClient.fetchSDK<SessionAttestResponse<TProjectConfiguration>>({
      url: '/sessions/attest',
      body: data,
      method: 'POST',
    });
  });
}
