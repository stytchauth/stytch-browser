import { MULTIPLE_STYTCH_CLIENTS_DETECTED_WARNING } from './constants';
import {
  B2BState,
  ConsumerState,
  IHeadlessB2BSessionClient,
  IHeadlessSessionClient,
  SessionAuthenticateOptions,
  StytchProjectConfigurationInput,
  UNRECOVERABLE_ERROR_TYPES,
} from './public';
import { shouldTryRefresh } from './shouldTryRefresh';
import { IB2BSubscriptionService, IConsumerSubscriptionService } from './SubscriptionService';
import { logger } from './utils';
import { SessionUpdateOptions } from './types';

class SessionManagerRegistry {
  private hasWarned = false;

  private registry = new Map<string, ISessionManager>();

  public register(key: string, sessionManager: ISessionManager) {
    const otherManager = this.registry.get(key);

    // If there appears to be another registered session manager, issue a
    // warning and cancel its background refresh in favor the newer registration
    if (otherManager && otherManager !== sessionManager) {
      if (!this.hasWarned) {
        logger.warn(MULTIPLE_STYTCH_CLIENTS_DETECTED_WARNING);
        this.hasWarned = true;
      }
      otherManager.cancelBackgroundRefresh();
    }
    this.registry.set(key, sessionManager);
  }

  public unregister(publicToken: string, sessionManager: ISessionManager) {
    const otherManager = this.registry.get(publicToken);
    if (otherManager && otherManager === sessionManager) {
      this.registry.delete(publicToken);
    }
  }
}

export interface ISessionManager {
  performBackgroundRefresh: () => void;
  cancelBackgroundRefresh: () => void;
}

export class SessionManager<TProjectConfiguration extends StytchProjectConfigurationInput> implements ISessionManager {
  // Three minutes
  private static REFRESH_INTERVAL_MS = 1000 * 60 * 3;
  // When testing - it's often more useful to set to a shorter duration
  // private static REFRESH_INTERVAL_MS = 1000 * 3;

  private timeout: ReturnType<typeof setTimeout> | null = null;

  /** In minutes */
  private lastAuthenticationSessionDuration: number | undefined;

  private static registry = new SessionManagerRegistry();

  private register() {
    SessionManager.registry.register(this._publicToken, this);
  }

  private unregister() {
    SessionManager.registry.unregister(this._publicToken, this);
  }

  constructor(
    private _subscriptionService:
      | IConsumerSubscriptionService<TProjectConfiguration>
      | IB2BSubscriptionService<TProjectConfiguration>,
    private _headlessSessionClient:
      | IHeadlessSessionClient<TProjectConfiguration>
      | IHeadlessB2BSessionClient<TProjectConfiguration>,
    private _publicToken: string,
    private _options: { keepSessionAlive?: boolean },
  ) {
    this._subscriptionService.subscribeToState(this._onDataChange);
  }

  /**
   * The core logic of the session refresh recursive trampoline
   * - Refreshes the currently issued session
   * - Schedules a future refresh if successful
   */
  performBackgroundRefresh() {
    logger.debug('performing background refresh at ', Date.now());
    this._reauthenticateWithBackoff()
      .then(() => {
        this.scheduleBackgroundRefresh();
      })
      .catch((error: unknown) => {
        logger.warn('Session background refresh failed. Signalling to app that user is logged out.', { error });
        this._subscriptionService.destroySession();
      });
  }

  private scheduleBackgroundRefresh() {
    /* Highlander rules - there can only ever be one */
    this.cancelBackgroundRefresh();
    this.register();
    logger.debug('Scheduling bg refresh', Date.now());
    this.timeout = setTimeout(() => {
      this.performBackgroundRefresh();
    }, SessionManager.REFRESH_INTERVAL_MS);
  }

  cancelBackgroundRefresh() {
    if (this.timeout !== null) {
      this.unregister();
      logger.debug('Cancelling bg refresh', Date.now());
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  /**
   * We need to listen to a few types of events:
   * - If the user logs in via invoking a .authenticate() call, we should start the background worker
   * - If the user steps up their authentication via another .authenticate call(), we should restart the background worker
   * - If the user logs out, we should terminate the worker
   * - We should ignore session changes that we ourselves caused - so if we already have a timeout, leave it be!
   */
  private _onDataChange = (
    state: (ConsumerState & SessionUpdateOptions) | (B2BState & SessionUpdateOptions) | null,
  ) => {
    if (state != null && state.sessionDurationMinutes) {
      this.lastAuthenticationSessionDuration = state.sessionDurationMinutes;
    }

    if (shouldTryRefresh(state)) {
      this.scheduleBackgroundRefresh();
    } else {
      this.cancelBackgroundRefresh();
    }
  };

  // In cases where we cannot get a satisfactory request:
  // - Stytch is hard-down
  // - The user's network is disconnected for an extended period of time
  // we will continue to retry every 4 minutes ad infinum
  private _reauthenticateWithBackoff = async () => {
    let count = 0;
    while (true) {
      try {
        const options: SessionAuthenticateOptions = {
          session_duration_minutes: this._options.keepSessionAlive ? this.lastAuthenticationSessionDuration : undefined,
        };

        return await this._headlessSessionClient.authenticate(options);
      } catch (err) {
        if (SessionManager.isUnrecoverableError(err)) {
          return Promise.reject(err);
        }
        count++;
        await new Promise((done) => setTimeout(done, SessionManager.timeoutForAttempt(count)));
      }
    }
  };

  // We start with a backoff of 2000ms and increase exponentially to ~4 minutes (+/- 175 ms for jitter)
  // A short backoff initially helps increase the chance that we refresh the session before the JWT expires
  static timeoutForAttempt(count: number) {
    count = Math.min(count, 7);
    const jitter = Math.floor(Math.random() * 350) - 175;
    const delayMS = 2000 * 2 ** count;
    return jitter + delayMS;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isUnrecoverableError(error: any) {
    return UNRECOVERABLE_ERROR_TYPES.includes(error.error_type);
  }
}
