'use client';

import {
  IdentityProvider as IdentityProviderComponent,
  StytchLogin as StytchLoginComponent,
  StytchPasskeyRegistration as StytchPasskeyRegistrationComponent,
  StytchPasswordReset as StytchPasswordResetComponent,
} from '@stytch/web/react/b2c';

import { withSsrSafe } from '../bindings/withSsrSafe';

export const IdentityProvider = /* @__PURE__ */ withSsrSafe(IdentityProviderComponent);
export const StytchLogin = /* @__PURE__ */ withSsrSafe(StytchLoginComponent);
export const StytchPasskeyRegistration = /* @__PURE__ */ withSsrSafe(StytchPasskeyRegistrationComponent);
export const StytchPasswordReset = /* @__PURE__ */ withSsrSafe(StytchPasswordResetComponent);
