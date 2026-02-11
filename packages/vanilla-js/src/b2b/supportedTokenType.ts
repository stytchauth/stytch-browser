const supportedTokenTypes = [
  'discovery',
  'discovery_oauth',
  'oauth',
  'sso',
  'multi_tenant_magic_links',
  'multi_tenant_impersonation',
] as const;

export type SupportedTokenType = (typeof supportedTokenTypes)[number];
export const supportedTokenTypesSet = new Set(supportedTokenTypes);
