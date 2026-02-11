import { ssrSafeClientFactory } from '../ui/react/bindings/StytchSSRProxy';
import { StytchB2BClient } from './StytchB2BClient';

/**
 * Creates a Headless Stytch client object to call the stytch B2B APIs.
 * The Stytch client is not available serverside.
 * @example
 * const stytch = createStytchB2BClient('public-token-<find yours in the stytch dashboard>')
 *
 * return (
 *   <StytchB2BProvider stytch={stytch}>
 *     <App />
 *   </StytchB2BProvider>
 * )
 * @returns A {@link StytchB2BClient}
 */
export const createStytchB2BClient = ssrSafeClientFactory(StytchB2BClient);

/**
 * @deprecated Use {createStytchB2BClient()} instead
 */
export const createStytchB2BHeadlessClient = createStytchB2BClient;

/**
 * @deprecated Use {StytchB2BClient()} instead
 */
export const StytchB2BHeadlessClient = StytchB2BClient;
export { StytchB2BClient };

export type { OAuthAuthorizeParams, OAuthLogoutParams } from '../utils/idpHelpers';
export { parseOAuthAuthorizeParams, parseOAuthLogoutParams } from '../utils/idpHelpers';
export * from '@stytch/core/public';
