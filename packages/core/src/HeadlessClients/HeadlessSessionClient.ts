import { IConsumerSubscriptionService, INetworkClient } from '..';
import {
  ConsumerState,
  IHeadlessSessionClient,
  SessionAccessTokenExchangeOptions,
  SessionAccessTokenExchangeResponse,
  SessionAttestOptions,
  SessionAttestResponse,
  SessionAuthenticateOptions,
  SessionAuthenticateResponse,
  SessionInfo,
  SessionOnChangeCallback,
  SessionRevokeOptions,
  SessionRevokeResponse,
  SessionTokens,
  SessionTokensUpdate,
  StytchProjectConfigurationInput,
  UNRECOVERABLE_ERROR_TYPES,
} from '../public';
import { ExtractOpaqueTokens, IfOpaqueTokens } from '../typeConfig';
import { omitUser, WithUser } from '../utils';
import { validateInDev } from '../utils/dev';

export class HeadlessSessionClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessSessionClient<TProjectConfiguration>
{
  authenticate: (options?: SessionAuthenticateOptions) => Promise<SessionAuthenticateResponse<TProjectConfiguration>>;

  exchangeAccessToken: (
    data: SessionAccessTokenExchangeOptions,
  ) => Promise<SessionAccessTokenExchangeResponse<TProjectConfiguration>>;

  attest: (data: SessionAttestOptions) => Promise<SessionAttestResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
  ) {
    this.authenticate = this._subscriptionService.withUpdateSession(this._authenticate);

    this.exchangeAccessToken = this._subscriptionService.withUpdateSession(
      async (data: SessionAccessTokenExchangeOptions) => {
        validateInDev('stytch.session.exchangeAccessToken', data, {
          access_token: 'string',
          session_duration_minutes: 'number',
        });
        const resp = await this._networkClient.fetchSDK<
          WithUser<SessionAccessTokenExchangeResponse<TProjectConfiguration>>
        >({
          url: '/sessions/exchange_access_token',
          body: data,
          method: 'POST',
        });

        return omitUser(resp);
      },
    );

    this.attest = this._subscriptionService.withUpdateSession(async (data: SessionAttestOptions) => {
      validateInDev('stytch.session.attest', data, {
        profile_id: 'string',
        token: 'string',
        session_duration_minutes: 'optionalNumber',
      });

      return this._networkClient.fetchSDK<SessionAttestResponse<TProjectConfiguration>>({
        url: '/sessions/attest',
        body: data,
        method: 'POST',
      });
    });
  }

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
