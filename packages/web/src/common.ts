// Common re-exports shared between B2B and B2C for non-headless exports
export type { IconRegistry, PresentationConfig, PresentationOptions, Theme } from './types';
export { iconsBlack, iconsWhite } from './ui/components/altIcons';
export { shadcnTheme } from './ui/components/themes/shadcn';
export { defaultDarkTheme, defaultTheme } from './ui/components/themes/themes';
export type { OAuthAuthorizeParams, OAuthLogoutParams } from './utils/idpHelpers';
export { parseOAuthAuthorizeParams, parseOAuthLogoutParams } from './utils/idpHelpers';
