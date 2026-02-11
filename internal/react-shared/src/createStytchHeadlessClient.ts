import { StytchHeadlessClient, StytchProjectConfigurationInput } from '@stytch/vanilla-js/headless';
import { createStytchSSRProxy } from './StytchSSRProxy';

/**
 * Creates a Headless Stytch client object to call the stytch APIs.
 * The Stytch client is not available serverside.
 * @example
 * const stytch = createStytchHeadlessClient('public-token-<find yours in the stytch dashboard>')
 *
 * return (
 *   <StytchProvider stytch={stytch}>
 *     <App />
 *   </StytchProvider>
 * )
 * @returns A {@link StytchHeadlessClient}
 */
export const createStytchHeadlessClient = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(
  ...args: ConstructorParameters<typeof StytchHeadlessClient<TProjectConfiguration>>
): StytchHeadlessClient<TProjectConfiguration> => {
  if (typeof window === 'undefined') {
    return createStytchSSRProxy();
  }
  return new StytchHeadlessClient<TProjectConfiguration>(...args);
};
