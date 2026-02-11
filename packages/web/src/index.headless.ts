import { StytchClient } from './StytchClient';
import { ssrSafeClientFactory } from './ui/react/bindings/StytchSSRProxy';

/**
 * Creates a Headless Stytch client object to call the stytch APIs.
 * The Stytch client is not available serverside.
 * @example
 * const stytch = createStytchClient('public-token-<find yours in the stytch dashboard>')
 *
 * return (
 *   <StytchProvider stytch={stytch}>
 *     <App />
 *   </StytchProvider>
 * )
 * @returns A {@link StytchClient}
 */
export const createStytchClient = ssrSafeClientFactory(StytchClient);

/**
 * @deprecated Use createStytchClient instead
 */
export const createStytchHeadlessClient = createStytchClient;

/**
 * @deprecated Use StytchClient instead
 */
export const StytchHeadlessClient = StytchClient;

export { StytchClient };

export type { OAuthAuthorizeParams, OAuthLogoutParams } from './utils/idpHelpers';
export { parseOAuthAuthorizeParams, parseOAuthLogoutParams } from './utils/idpHelpers';
export * from '@stytch/core/public';
