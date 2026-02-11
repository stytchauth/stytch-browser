import { UnsubscribeFunction } from './public';
import { ISubscriptionService } from './SubscriptionService';
import { AllowedOpaqueTokens } from './typeConfig';

type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export type StateChangeHandler<T> = (state: DeepReadonly<T>) => void;
export type StateChangeRegisterFunction<T> = (callback: StateChangeHandler<T>) => UnsubscribeFunction;

export class StateChangeClient<T> {
  constructor(
    private readonly _subscriptionService: ISubscriptionService<T | null, AllowedOpaqueTokens>,
    private readonly emptyState: T,
  ) {}

  public onStateChange: StateChangeRegisterFunction<T> = (callback) => {
    return this._subscriptionService.subscribeToState((state) => {
      callback(state ?? this.emptyState);
    });
  };
}
