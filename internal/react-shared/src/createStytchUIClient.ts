import { StytchProjectConfigurationInput, StytchUIClient } from '@stytch/vanilla-js';
import { createStytchSSRProxy } from './StytchSSRProxy';

/**
 * Creates a Stytch UI client object to call the Stytch APIs and render Stytch UI components.
 * The Stytch client is not available serverside.
 * If you do not use Stytch UI components, use {@link createStytchHeadlessClient} to reduce your bundle size.
 * @example
 * const stytch = createStytchUIClient('public-token-<find yours in the stytch dashboard>')
 *
 * return (
 *   <StytchProvider stytch={stytch}>
 *     <App />
 *   </StytchProvider>
 * )
 * @returns A {@link StytchUIClient}
 */
export const createStytchUIClient = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(
  ...args: ConstructorParameters<typeof StytchUIClient<TProjectConfiguration>>
): StytchUIClient<TProjectConfiguration> => {
  if (typeof window === 'undefined') {
    return createStytchSSRProxy();
  }
  return new StytchUIClient<TProjectConfiguration>(...args);
};
