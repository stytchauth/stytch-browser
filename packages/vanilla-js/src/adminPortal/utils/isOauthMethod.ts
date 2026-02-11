import { B2BAllowedAuthMethods } from '@stytch/core/public';

export const isOauthMethod = (method: B2BAllowedAuthMethods) => method.endsWith('_oauth');
