import { B2BMFAProducts } from '@stytch/core/public';

export const B2B_MFA_METHODS = [B2BMFAProducts.totp, B2BMFAProducts.smsOtp] as const;

export type B2BTokenType =
  | 'discovery'
  | 'discovery_oauth'
  | 'oauth'
  | 'sso'
  | 'multi_tenant_magic_links'
  | 'multi_tenant_passwords';
