export * from './b2c/idpWebComponent';
export * from './b2c/stytchPasskeyRegistration';
export * from './b2c/stytchResetPassword';
export * from './b2c/stytchUI';
export { StytchUIClient } from './b2c/StytchUIClient';
export type { StytchDOMEvent, StytchError } from './bindings/WebComponents';
export * from '@stytch/core/public';
export type {
  AuthTokenParams,
  IDPConsentManifestGenerator,
  IDPSDKConfig,
  ResetPasswordSDKConfig,
  SDKConfig,
  Strings,
  StytchLoginConfig,
} from '@stytch/web';
export { Products } from '@stytch/web';
export * from '@stytch/web/common';
export * from '@stytch/web/headless';
