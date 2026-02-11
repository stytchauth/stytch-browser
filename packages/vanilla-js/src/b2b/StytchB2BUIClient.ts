import { logger, RUN_IN_DEV } from '@stytch/core';
import { StytchB2BClient, StytchClientOptions, StytchProjectConfigurationInput } from '@stytch/web/b2b/headless';

import { mountIdentityProvider } from './idpWebComponent';
import { mount } from './loginWebComponent';

/**
 * @deprecated - Use Stytch UI web components instead.
 * See {@link StytchB2B} or {@link StytchB2BIdentityProvider}
 */
export class StytchB2BUIClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StytchB2BClient<TProjectConfiguration> {
  constructor(publicToken: string, options?: StytchClientOptions) {
    super(publicToken, options);

    RUN_IN_DEV(() => logger.warn('StytchB2BUIClient is deprecated. Use the Stytch web components directly instead.'));
  }

  mount = mount;

  mountIdentityProvider = mountIdentityProvider;
}
