import { logger, RUN_IN_DEV } from '@stytch/core';
import { StytchClientOptions, StytchProjectConfigurationInput } from '@stytch/core/public';
import { StytchClient } from '@stytch/web/headless';

import { mountIdentityProvider } from './idpWebComponent';
import { mountPasskeyRegistration } from './stytchPasskeyRegistration';
import { mountResetPassword } from './stytchResetPassword';
import { mountLogin } from './stytchUI';

/**
 * @deprecated - Use Stytch UI web components instead.
 * See {@link StytchUI}, {@link StytchResetPassword}, {@link StytchPasskeyRegistration} or {@link StytchIdentityProvider}
 */
export class StytchUIClient<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> extends StytchClient<TProjectConfiguration> {
  constructor(publicToken: string, options?: StytchClientOptions) {
    super(publicToken, options);

    RUN_IN_DEV(() => logger.warn('StytchUIClient is deprecated. Use the Stytch web components directly instead.'));
  }

  mountLogin = mountLogin;

  mountResetPassword = mountResetPassword;

  mountPasskeyRegistration = mountPasskeyRegistration;

  mountIdentityProvider = mountIdentityProvider;
}
