import {
  B2BState,
  ConsumerState,
  SessionTokens,
  UnsubscribeFunction,
  User,
  Session,
  Member,
  MemberSession,
  SessionTokensUpdate,
  Organization,
  StytchProjectConfigurationInput,
  AuthenticateResponse,
  B2BAuthenticateResponse,
  B2BAuthenticateResponseWithMFA,
  B2BDiscoveryAuthenticateResponse,
} from './public';
import { shouldTryRefresh } from './shouldTryRefresh';
import { IStorageClient } from './StorageClient';
import { AllowedOpaqueTokens, IfOpaqueTokens, OpaqueTokensNever, OpaqueTokensNeverConfig } from './typeConfig';
import { SessionUpdateOptions } from './types';

type SubscriberFunction<T> = (value: T | null) => void;
type Subscribers<T> = Record<string, SubscriberFunction<T>>;

const LOCAL_STORAGE_KEY_PREFIX = 'stytch_sdk_state_';

const getLocalStorageKey = (publicToken: string): string => {
  return `${LOCAL_STORAGE_KEY_PREFIX}${publicToken}`;
};

export class SubscriptionDataLayer<T> {
  state: T | null;
  session_token: string | null;
  session_jwt: string | null;
  intermediate_session_token: string | null;
  intermediate_session_token_expiration: number | null;
  subscriptions: Subscribers<T & SessionUpdateOptions>;

  constructor(
    private _publicToken: string,
    private _storageClient: IStorageClient,
  ) {
    this.state = null;
    this.session_token = null;
    this.session_jwt = null;
    this.intermediate_session_token = null;
    this.intermediate_session_token_expiration = null;
    this.subscriptions = {};
  }

  syncToLocalStorage() {
    this._storageClient.setData(
      getLocalStorageKey(this._publicToken),
      JSON.stringify({
        state: this.state,
        session_token: this.session_token,
        session_jwt: this.session_jwt,
        intermediate_session_token: this.intermediate_session_token,
      }),
    );
  }

  syncFromLocalStorage = async (): Promise<StateWithTokensDiff<T, OpaqueTokensNever> | null> => {
    return this._storageClient
      .getData(getLocalStorageKey(this._publicToken))
      .then((localData) => {
        if (!localData) {
          return null;
        }
        let parsedState: unknown;
        try {
          parsedState = JSON.parse(localData);
        } catch {
          // Overwrite the bad data
          this._storageClient.clearData(getLocalStorageKey(this._publicToken));
          // this.removeSessionCookie();
          return null;
        }
        const { state, session_token, session_jwt, intermediate_session_token } =
          parsedState as StateWithTokensLoggedIn<T, OpaqueTokensNever>;
        this.state = state;
        this.session_token = session_token;
        this.session_jwt = session_jwt;
        this.intermediate_session_token = intermediate_session_token;
        return {
          state,
          session_token,
          session_jwt,
          intermediate_session_token,
        };
      })
      .catch(() => {
        return null;
      });
  };
}

const addSubscriber = <T>(collection: Subscribers<T>, subscriber: SubscriberFunction<T>): UnsubscribeFunction => {
  const uniqueId = Math.random().toString(36).slice(-10);
  collection[uniqueId] = subscriber;
  return () => delete collection[uniqueId];
};

const notifySubscribers = <T>(collection: Subscribers<T>, value: T | null): void => {
  Object.values(collection).forEach((cb) => cb(value));
};

type StateWithReadableTokensLoggedIn<TState> = {
  state: TState | null;
  intermediate_session_token: null;
  session_token: string;
  session_jwt: string;
};

type StateWithOpaqueTokensLoggedIn<TState> = {
  state: TState | null;
  intermediate_session_token: null;
  session_token: true;
  session_jwt: true;
};

type StateWithTokensLoggedIn<TState, TOpaqueTokens extends AllowedOpaqueTokens> = IfOpaqueTokens<
  TOpaqueTokens,
  StateWithOpaqueTokensLoggedIn<TState>,
  StateWithReadableTokensLoggedIn<TState>
>;

type StateWithTokensLoggedOut = {
  state: null;
  session_token: null;
  session_jwt: null;
  intermediate_session_token: null;
};

type StateWithReadableIntermediateSessionToken = {
  state: null;
  session_token: null;
  session_jwt: null;
  intermediate_session_token: string;
};

type StateWithOpaqueIntermediateSessionToken = {
  state: null;
  session_token: null;
  session_jwt: null;
  intermediate_session_token: true;
};

type StateWithIntermediateSessionToken<TOpaqueTokens extends AllowedOpaqueTokens> = IfOpaqueTokens<
  TOpaqueTokens,
  StateWithOpaqueIntermediateSessionToken,
  StateWithReadableIntermediateSessionToken
>;

type StateWithTokensDiff<TState, TOpaqueTokens extends AllowedOpaqueTokens> =
  | StateWithTokensLoggedIn<TState, TOpaqueTokens>
  | StateWithTokensLoggedOut
  | StateWithIntermediateSessionToken<TOpaqueTokens>;

// Ensures sessionDurationMinutes is only set if state is not coming from cache
export type InternalSessionUpdateOptions = { fromCache: true } | ({ fromCache: false } & SessionUpdateOptions);

export interface CommonAuthenticateOptions {
  session_duration_minutes?: number;

  // Needed so TS does not complain about "no properties in common" error
  [key: string]: unknown;
}

export interface ISubscriptionService<TState, TOpaqueTokens extends AllowedOpaqueTokens> {
  updateStateAndTokens(diff: StateWithTokensDiff<TState, TOpaqueTokens>): void;

  updateState(state: TState): void;

  updateTokens(tokens: SessionTokensUpdate): void;

  destroyState(): void;

  destroySession(): void;

  getTokens(): IfOpaqueTokens<TOpaqueTokens, never, SessionTokens | null>;

  getIntermediateSessionToken(): string | null;

  subscribeToState(callback: SubscriberFunction<(TState & SessionUpdateOptions) | null>): UnsubscribeFunction;

  getState(): TState | null;

  syncFromDeviceStorage(onCompleteCallback: () => void): void;

  getFromCache(): boolean;

  setCacheRefreshed(): void;
}

export interface IConsumerSubscriptionService<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends ISubscriptionService<ConsumerState, AllowedOpaqueTokens> {
  updateSession(args: AuthenticateResponse<TProjectConfiguration>, options?: SessionUpdateOptions): void;

  /**
   * Decorator version of updateSession that wraps an existing authenticate() implementation to bind its response
   * to subscriptionService.updateSession().
   */
  withUpdateSession<
    // These are a bit messy to be able to type all authenticate() implementations
    Args extends [] | [options?: CommonAuthenticateOptions] | (string | CommonAuthenticateOptions)[],
    Ret extends AuthenticateResponse<TProjectConfiguration> | null,
  >(
    authenticate: (...args: Args) => Promise<Ret>,
  ): (...args: Args) => Promise<Ret>;

  updateUser(user: User): void;
  getUser(): User | null;
  getSession(): Session | null;
}

export interface IB2BSubscriptionService<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends ISubscriptionService<B2BState, AllowedOpaqueTokens> {
  updateSession(
    args:
      | B2BAuthenticateResponse<TProjectConfiguration>
      | B2BAuthenticateResponseWithMFA<TProjectConfiguration>
      | B2BDiscoveryAuthenticateResponse<TProjectConfiguration>,
    options?: SessionUpdateOptions,
  ): void;

  /**
   * Decorator version of updateSession that wraps an existing authenticate() implementation to bind its response
   * to subscriptionService.updateSession()
   */
  withUpdateSession<
    Options extends CommonAuthenticateOptions | undefined,
    Ret extends
      | B2BAuthenticateResponse<TProjectConfiguration>
      | B2BAuthenticateResponseWithMFA<TProjectConfiguration>
      | B2BDiscoveryAuthenticateResponse<TProjectConfiguration>,
  >(
    authenticate: (options: Options) => Promise<Ret>,
  ): (options: Options) => Promise<Ret>;

  updateMember(member: Member): void;
  getMember(): Member | null;
  updateOrganization(organization: Organization): void;
  getOrganization(): Organization | null;
  getSession(): MemberSession | null;
}

export class SubscriptionService<T extends ConsumerState | B2BState>
  implements ISubscriptionService<T, OpaqueTokensNever>
{
  private _datalayer: SubscriptionDataLayer<T>;
  /**
   * Whether the state was retrieved from the cache and is awaiting a refresh
   */
  private fromCache = true;

  constructor(publicToken: string, storageClient: IStorageClient) {
    // TODO: Generalize this for Mobile and Web based SDKs
    this._datalayer = new SubscriptionDataLayer(publicToken, storageClient);
    const session = this._datalayer.state?.session;
    if (session && Date.parse(session.expires_at) < Date.now()) {
      this.destroyState();
      return;
    }
  }

  syncFromDeviceStorage(onCompleteCallback: () => void): void {
    this._datalayer
      .syncFromLocalStorage()
      .then((res) => {
        if (!res) {
          this.setCacheRefreshed();
        } else if (res.state?.session && Date.parse(res.state.session.expires_at) < Date.now()) {
          this.destroyState();
        } else {
          // If we retrieved a possibly valid session, indicate whether we
          // intend to refresh it (via a background refresh)
          this.updateStateAndTokens(res, { fromCache: shouldTryRefresh(res.state) });
        }
      })
      .finally(() => {
        onCompleteCallback();
      });
  }

  getState(): T | null {
    return this._datalayer.state;
  }

  getTokens(): SessionTokens | null {
    if (!(typeof this._datalayer.session_token === 'string') || !(typeof this._datalayer.session_jwt === 'string')) {
      return null;
    }
    return {
      session_token: this._datalayer.session_token,
      session_jwt: this._datalayer.session_jwt,
    };
  }

  removeIST() {
    this._datalayer.intermediate_session_token = null;
    this._datalayer.intermediate_session_token_expiration = null;
  }

  removeSessionTokens() {
    this._datalayer.session_jwt = null;
    this._datalayer.session_token = null;
  }

  getIntermediateSessionToken(): string | null {
    if (
      this._datalayer.intermediate_session_token_expiration &&
      Date.now() > this._datalayer.intermediate_session_token_expiration
    ) {
      this.removeIST();
    }
    return this._datalayer.intermediate_session_token;
  }

  destroyState() {
    this.updateStateAndTokens({
      state: null,
      session_token: null,
      session_jwt: null,
      intermediate_session_token: null,
    });
  }

  destroySession() {
    this.updateStateAndTokens({
      state: null,
      session_token: null,
      session_jwt: null,
      intermediate_session_token: this.getIntermediateSessionToken(),
    });
  }

  _updateStateAndTokensInternal(
    stateDiff: StateWithTokensDiff<T, OpaqueTokensNever>,
    options: InternalSessionUpdateOptions,
  ) {
    const { state, session_token, session_jwt, intermediate_session_token } = stateDiff;
    const newData = state == null ? null : ({ ...this._datalayer.state, ...state } as T);
    this._datalayer.state = newData;
    if (newData) {
      this._datalayer.session_token = session_token;
      this._datalayer.session_jwt = session_jwt;
      this.removeIST();
    } else if (intermediate_session_token) {
      this.removeSessionTokens();
      this._datalayer.intermediate_session_token = intermediate_session_token;
      // ISTs are only valid for 10 minutes
      this._datalayer.intermediate_session_token_expiration = Date.now() + 10 * 60 * 1000;
    } else {
      this.removeSessionTokens();
      this.removeIST();
    }
    if (!options.fromCache) {
      this.setCacheRefreshed();
    }

    let notification: (T & SessionUpdateOptions) | null;
    if (newData == null || options.fromCache) {
      notification = newData;
    } else {
      notification = {
        ...newData,
        sessionDurationMinutes: options.sessionDurationMinutes,
      };
    }
    notifySubscribers(this._datalayer.subscriptions, notification);
  }

  updateStateAndTokens(
    stateDiff: StateWithTokensDiff<T, OpaqueTokensNever>,
    options: InternalSessionUpdateOptions = { fromCache: false },
  ) {
    this._updateStateAndTokensInternal(stateDiff, options);
    this._datalayer.syncToLocalStorage();
  }

  updateState(state: T | null) {
    const newState: T | null = state ? { ...this._datalayer.state, ...state } : null;
    this._datalayer.state = newState;
    this.setCacheRefreshed();

    notifySubscribers(this._datalayer.subscriptions, newState);
    // Delay notifying other tabs until after we have refreshed ourselves
    this._datalayer.syncToLocalStorage();
  }

  updateTokens(tokens: SessionTokensUpdate) {
    this._datalayer.session_token = tokens.session_token;
    this._datalayer.session_jwt = tokens.session_jwt ?? null;
    this._datalayer.syncToLocalStorage();
  }

  subscribeToState(callback: SubscriberFunction<T & SessionUpdateOptions>): UnsubscribeFunction {
    return addSubscriber(this._datalayer.subscriptions, callback);
  }

  getFromCache(): boolean {
    return this.fromCache;
  }

  setCacheRefreshed() {
    this.fromCache = false;
  }
}

export class ConsumerSubscriptionService<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends SubscriptionService<ConsumerState>
  implements IConsumerSubscriptionService<TProjectConfiguration & OpaqueTokensNeverConfig>
{
  updateSession: IConsumerSubscriptionService<TProjectConfiguration & OpaqueTokensNeverConfig>['updateSession'] = (
    resp,
    options,
  ) => {
    // This is a bit of a hack to get the type inference to work. In practice,
    // opaque tokens are only a concern on web.
    const { session, user, session_jwt, session_token } = resp as typeof resp &
      AuthenticateResponse<OpaqueTokensNeverConfig>;

    this.updateStateAndTokens(
      {
        state: { session, user },
        session_jwt,
        session_token,
        intermediate_session_token: null,
      },
      {
        fromCache: false,
        sessionDurationMinutes: options?.sessionDurationMinutes,
      },
    );
  };

  withUpdateSession =
    <
      Args extends [] | [options?: CommonAuthenticateOptions] | (string | CommonAuthenticateOptions)[],
      Ret extends AuthenticateResponse<TProjectConfiguration & OpaqueTokensNeverConfig> | null,
    >(
      authenticate: (...args: Args) => Promise<Ret>,
    ): ((...args: Args) => Promise<Ret>) =>
    async (...args) => {
      const resp = await authenticate(...args);
      if (resp != null) {
        const options = args.find((a): a is CommonAuthenticateOptions => a != null && !(typeof a === 'string'));
        this.updateSession(resp, {
          sessionDurationMinutes: options?.session_duration_minutes,
        });
      }
      return resp;
    };

  updateUser = (user: User) => this.updateState({ user });
  getUser = () => this.getState()?.user ?? null;
  getSession = () => this.getState()?.session ?? null;
}

export class B2BSubscriptionService<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends SubscriptionService<B2BState>
  implements IB2BSubscriptionService<TProjectConfiguration & OpaqueTokensNeverConfig>
{
  updateSession: IB2BSubscriptionService<TProjectConfiguration & OpaqueTokensNeverConfig>['updateSession'] = (
    originalResp,
    options,
  ) => {
    // This is a bit of a hack to get the type inference to work. In practice,
    // opaque tokens are only a concern on web.
    const resp = originalResp as
      | B2BAuthenticateResponse<OpaqueTokensNeverConfig>
      | B2BAuthenticateResponseWithMFA<OpaqueTokensNeverConfig>
      | B2BDiscoveryAuthenticateResponse<OpaqueTokensNeverConfig>;

    if ('member_session' in resp && resp.member_session) {
      this.updateStateAndTokens(
        {
          state: {
            session: resp.member_session,
            member: resp.member,
            organization: resp.organization,
          },
          session_token: resp.session_token,
          session_jwt: resp.session_jwt,
          intermediate_session_token: null,
        },
        {
          fromCache: false,
          sessionDurationMinutes: options?.sessionDurationMinutes,
        },
      );
    } else {
      this.updateStateAndTokens(
        {
          state: null,
          session_token: null,
          session_jwt: null,
          intermediate_session_token: resp.intermediate_session_token,
        },
        {
          fromCache: false,
          sessionDurationMinutes: options?.sessionDurationMinutes,
        },
      );
    }
  };

  withUpdateSession =
    <
      Options extends CommonAuthenticateOptions | undefined,
      Ret extends
        | B2BAuthenticateResponse<TProjectConfiguration & OpaqueTokensNeverConfig>
        | B2BAuthenticateResponseWithMFA<TProjectConfiguration & OpaqueTokensNeverConfig>
        | B2BDiscoveryAuthenticateResponse<TProjectConfiguration & OpaqueTokensNeverConfig>,
    >(
      authenticate: (options: Options) => Promise<Ret>,
    ): ((options: Options) => Promise<Ret>) =>
    async (options) => {
      const resp = await authenticate(options);
      this.updateSession(resp, {
        sessionDurationMinutes: options?.session_duration_minutes,
      });
      return resp;
    };

  updateMember = (member: Member) => this.updateState({ member });
  getMember = () => this.getState()?.member ?? null;
  updateOrganization = (organization: Organization) => this.updateState({ organization });
  getOrganization = () => this.getState()?.organization ?? null;
  getSession = () => this.getState()?.session ?? null;
}
