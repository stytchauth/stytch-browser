import { StytchB2BUIClient, StytchProjectConfigurationInput } from '@stytch/vanilla-js/b2b';
import { createStytchSSRProxy } from '../StytchSSRProxy';

/**
 * Creates a Stytch UI client object to call the Stytch APIs and render Stytch UI components.
 * The Stytch client is not available serverside.
 * If you do not use Stytch UI components, use {@link createStytchB2BHeadlessClient} to reduce your bundle size.
 * @example
 * const stytch = createStytchB2BUIClient('public-token-<find yours in the stytch dashboard>')
 *
 * return (
 *   <StytchB2BProvider stytch={stytch}>
 *     <App />
 *   </StytchB2BProvider>
 * )
 * @returns A {@link StytchB2BUIClient}
 */
export const createStytchB2BUIClient = <
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
>(
  ...args: ConstructorParameters<typeof StytchB2BUIClient<TProjectConfiguration>>
): StytchB2BUIClient<TProjectConfiguration> => {
  if (typeof window === 'undefined') {
    return createStytchSSRProxy();
  }
  return new StytchB2BUIClient<TProjectConfiguration>(...args);
};
