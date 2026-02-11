import { StytchB2BHeadlessClient, StytchProjectConfigurationInput } from '@stytch/vanilla-js/b2b/headless';
import { createStytchSSRProxy } from '../StytchSSRProxy';

/**
 * Creates a Headless Stytch client object to call the stytch B2B APIs.
 * The Stytch client is not available serverside.
 * @example
 * const stytch = createStytchB2BHeadlessClient('public-token-<find yours in the stytch dashboard>')
 *
 * return (
 *   <StytchB2BProvider stytch={stytch}>
 *     <App />
 *   </StytchB2BProvider>
 * )
 * @returns A {@link StytchB2BHeadlessClient}
 */
export const createStytchB2BHeadlessClient = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(
  ...args: ConstructorParameters<typeof StytchB2BHeadlessClient<TProjectConfiguration>>
): StytchB2BHeadlessClient<TProjectConfiguration> => {
  if (typeof window === 'undefined') {
    return createStytchSSRProxy();
  }
  return new StytchB2BHeadlessClient<TProjectConfiguration>(...args);
};
