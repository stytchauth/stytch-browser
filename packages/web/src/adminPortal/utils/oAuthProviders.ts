import { B2BAllowedAuthMethods } from '@stytch/core/public';

type OAuthMethods = B2BAllowedAuthMethods & `${string}_oauth`;
type UnsuffixedOAuthMethods = OAuthMethods extends `${infer TUnsuffixedMethod}_oauth` ? TUnsuffixedMethod : never;

export const ALL_OAUTH_TENANT_PROVIDERS = ['github', 'hubspot', 'slack'] as const satisfies UnsuffixedOAuthMethods[];

export type KnownOAuthTenantProvider = (typeof ALL_OAUTH_TENANT_PROVIDERS)[number];

export const getMethodFromProvider = <T extends KnownOAuthTenantProvider>(provider: T) => `${provider}_oauth` as const;
