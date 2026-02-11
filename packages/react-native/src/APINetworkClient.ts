import { IB2BSubscriptionService, IConsumerSubscriptionService, isTestPublicToken } from '@stytch/core';
import { StytchProjectConfigurationInput } from '@stytch/core/public';

import { NetworkClient } from './NetworkClient';

export class APINetworkClient<
  TProjectConfiguration extends StytchProjectConfigurationInput,
> extends NetworkClient<TProjectConfiguration> {
  constructor(
    _publicToken: string,
    _subscriptionService:
      | IConsumerSubscriptionService<TProjectConfiguration>
      | IB2BSubscriptionService<TProjectConfiguration>,
    _liveAPIURL: string,
    _testAPIURL: string,
  ) {
    super(_publicToken, _subscriptionService, isTestPublicToken(_publicToken) ? _testAPIURL : _liveAPIURL);
  }
}
