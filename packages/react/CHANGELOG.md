# @stytch/react

## 19.18.1

### Patch Changes

- 5a0ad5c: Add external_id to Member and User types and add organization_external_id to Organization type

## 19.18.0

### Minor Changes

- 4c9c7ec: Support passing domain option to passkey auth in StytchLoginConfig

## 19.17.0

### Minor Changes

- 2da1e4d: Add keepSessionAlive boolean flag to StytchClientOptions. When set, the client will automatically refresh the session as long as the client is active
- e4445f3: Add TypeScript typings for strings prop / param. The types is available as Strings and is opt in. We recommend using them like `const strings: Strings = { 'button.usePassword': 'Log in with password' }`. `Strings` is a partial since we recommend you only include strings that you need, but if you need every string mapped (such as in a full localization), you can use `Required<Strings>`.

### Patch Changes

- 17e589c: B2B: Add support for 'ALL_ALLOWED' organization email_jit_provisioning setting

## 19.16.0

### Minor Changes

- 51779f2: Add support for the OAuth Attach flow

## 19.15.2

### Patch Changes

- 2fabc69: Fix endpoint options still being preferred for custom endpoint config
- 4311e82: Fix last used Oauth method not updated when Google One Tap fallback button is clicked
- 25e43f0: Add types for Member.is_admin

## 19.15.1

### Patch Changes

- a640aa9: Fix missing breached password error message for zxcvbn password config in pre-built UI
- 3d625ba: Fix error message when B2B discovery EML auth encounters an error in prebuilt UI

## 19.15.0

### Minor Changes

- c64d639: When initializing StytchClient, the endpointOptions object is now deprecated
  apiDomain and testApiDomain are now configured using customBaseUrl directly on the root object
  fppaDomain and dfpCdnDomain are now configured as dfppaUrl and dfpCdnUrl directly on the root object
- b099ae8: Sourcemaps are now included

## 19.14.0

### Minor Changes

- 3008b9e: Add options to the Admin Portal Member Management and SSO Connections configuration to specify the redirect URL when inviting members and testing SSO connections
- 3008b9e: Add the ability for users to go back from the MFA enrollment screen to change their enrollment method

## 19.13.0

### Minor Changes

- bd48584: Store last used OAuth and SSO method locally and move it to the top of the list the next time users visit the log in page.
  Add "provider.lastUsed" translation string for "Last used" text indicating the last used auth method.

## 19.12.0

### Minor Changes

- 0c1a944: Update labels to use <label> element and improve accessibility
  New `formField.phone.label` string for phone number input label and `formField.countryCode.label` for country code label
  `formField.password.ariaLabel` string has been folded into `formField.password.label` and can be removed

### Patch Changes

- ee4c32f: Update localization library lingui to 5.5.0
- b1af064: Update error message

## 19.11.1

### Patch Changes

- 0af9049: bug fixes

## 19.11.0

### Minor Changes

- 21b1777: refactor trusted auth token attestation in IDPConsentScreen components

## 19.10.0

### Minor Changes

- 2e86f80: Add Encrypted SAML Assertion support

## 19.9.0

### Minor Changes

- 2fc35e7: Export parseOAuthParams function for passing to OAuthAuthorize endpoints

### Patch Changes

- 2fc35e7: Add parseOAuthParams util function for parsing OAuth parameters

## 19.8.0

### Minor Changes

- d27e450: feat: add device history support to all authentication methods

## 19.7.0

### Minor Changes

- 14f8002: Add in Hook and HOC for accessing user roles

## 19.6.1

### Patch Changes

- 8a32b3f: Fix an issue with localization in the PasswordError component when using custom password strength rules

## 19.6.0

### Minor Changes

- a665bfa: Allow specifying text overrides and text translastion via the `strings` configuration.

## 19.5.5

### Patch Changes

- cbda0b4: Use API-generated error types

## 19.5.4

### Patch Changes

- 499e2ac: Update documentation for B2B Passwords Reset By Email method

## 19.5.3

### Patch Changes

- 9349a6b: Add error handling for claimed domains in the Discovery flow when no valid organizations are found

## 19.5.2

### Patch Changes

- 16f3109: Fix exported type declarations for useStytchB2BClient, withStytchB2BClient, and withStytchPermissions

## 19.5.1

### Patch Changes

- 96524b2: Fix packaging issue to include B2C `/headless` and `/ui` entrypoints

## 19.5.0

### Minor Changes

- 1e9ab0e: Add `createStytch*Client` helper functions:

  - `import { createStytchHeadlessClient } from '@stytch/react/headless';`
  - `import { createStytchUIClient } from '@stytch/react/ui';`
  - `import { createStytchB2BHeadlessClient } from '@stytch/react/b2b/headless';`
  - `import { createStytchB2BUIClient } from '@stytch/react/b2b/ui';`

  These are equivalent to the same functions in `@stytch/nextjs` and may be used instead of constructing clients directly (e.g., `new StytchUIClient()`).

- 1e9ab0e: Add `isInitialized` as a returned value from `useStytchUser`, `useStytchSession`, `useStytchMember`, `useStytchMemberSession`, `useStytchOrganization`, and `useStytchIsAuthorized` hooks; add `*IsInitialized` as an injected prop to the `withStytchUser`, `withStytchSession`, `withStytchMember`, `withStytchMemberSession`, and `withStytchOrganization` HOCs. This provides parity with the same APIs in `@stytch/nextjs`.

  If you set `assumeHydrated={false}` in your `StytchProvider` or `StytchB2BProvider`, `isInitialized` will initially be `false` and should be checked before accessing the other values returned by these hooks (or props injected by these HOCs). If you set `assumeHydrated={true}` (the default in `@stytch/react`), `isInitialized` will always be `true`, and it is always safe to access the other values, as in previous versions of `@stytch/react`.

- 1e9ab0e: Add a new `assumeHydrated` prop to the `StytchProvider` and `StytchB2BProvider` components. This prop allows the provider to assume whether or not the app might be hydrated in a browser environment after initially being rendered in a server environment. When `true`, the provider eagerly reads from the browser's local cache to retrieve cached session and related data. When `false`, the provider defers this initialization until after the first render, to avoid hydration errors. This prop defaults to `true` in `@stytch/react`, which preserves the behavior from previous versions.

  We recommend setting `assumeHydrated={false}` if your app hydrates server-rendered content on the client. Otherwise, it is safe to set `assumeHydrated={true}`. If you're unsure or notice hydration errors in your app, set `assumeHydrated={false}`.

### Patch Changes

- 1e9ab0e: Remove errors when attempting to use StytchProvider or StytchB2BProvider in a server environment

## 19.4.4

### Patch Changes

- 54275c2: Make some minor improvements to JSDoc comments
- 54275c2: Add missing default generic type parameters

## 19.4.3

### Patch Changes

- a9fb562: Fix incorrect internal type references

## 19.4.2

### Patch Changes

- c20addb: Fix some README typos

## 19.4.1

### Patch Changes

- 7d804d9: feat: Add support for accessTokenExchange to B2B Sessions Client

## 19.4.0

### Minor Changes

- 0abb940: feat: Connected Apps OAuth Authorization component support (BETA)

## 19.3.0

### Minor Changes

- d5ed50c: Added User Impersonation to Consumer
- 9eb8e8c: Add dfpCdnDomain endpoint configuration

## 19.2.0

### Minor Changes

- 6daadc7: Add support for TypeScript-based Stytch project configurations

### Patch Changes

- ac0778e: Fix error message when mounting Admin Portal components without a StytchB2BProvider

## 19.1.2

### Patch Changes

- 26a2e95: Fixed <StytchB2B /> error message

## 19.1.1

### Patch Changes

- 67cbee6a: Add DFPPA to OTP Email Login Or Create

## 19.1.0

### Minor Changes

- 160124c9: Add `AdminPortalSCIM` component component to `@stytch/react/b2b/adminPortal`

## 19.0.0

### Major Changes

- Updated API routes to use api.stytch.com for live and test.stytch.com for test, replacing web.stytch.com.
  If you use Content Security Policy (CSP) headers, ensure the URL is updated.
  This was done to reduce the number of network calls and simplify internal routing, resulting in faster API response times—improving request speeds by up to 40 milliseconds roundtrip.

### Patch Changes

- Updated dependencies [3c39a997]
  - @stytch/vanilla-js@5.0.0

## 18.3.3

### Patch Changes

- 6d06cce0: Load Admin Portal components from vanilla-js directly

## 18.3.2

### Patch Changes

- 7d2c2878: Fix admin portal component props

## 18.3.1

### Patch Changes

- 089c986a: Guard references to localStorage and sessionStorage

## 18.3.0

### Minor Changes

- 3183b459: Add `AdminPortalMemberManagement` component to `@stytch/react/b2b/adminPortal`

## 18.2.0

### Minor Changes

- 1ade8d93: Add `AdminPortalOrgSettings` component to `@stytch/react/b2b/adminPortal`

## 18.1.0

### Minor Changes

- a99f21b8: Add `AdminPortalSSO` component to `@stytch/react/b2b/adminPortal`

### Patch Changes

- Updated dependencies [0f448e7e]
- Updated dependencies [a99f21b8]
  - @stytch/vanilla-js@4.13.0

## 18.0.0

### Patch Changes

- Updated dependencies [cbab0c30]
  - @stytch/vanilla-js@4.12.0

## 17.0.0

### Major Changes

- a0fbe9f: Update minimum peer dependency on `@stytch/vanilla-js` to `^4.9.0`

### Patch Changes

- Updated dependencies [a0fbe9f]
- Updated dependencies [a0fbe9f]
  - @stytch/vanilla-js@4.9.0

## 16.0.0

### Patch Changes

- Updated dependencies [f604dcb]
  - @stytch/vanilla-js@4.7.0

## 15.0.0

### Minor Changes

- 223e30e: Add `useStytchOrganization` hook for B2B

### Patch Changes

- Updated dependencies [223e30e]
  - @stytch/vanilla-js@4.2.0

## 14.0.1

### Patch Changes

- e6832cb: Fix an issue where `fromCache` would not update to `false` after cached data was refreshed
- Updated dependencies [e6832cb]
  - @stytch/vanilla-js@4.1.1

## 14.0.0

### Patch Changes

- Updated dependencies [2379b29]
  - @stytch/vanilla-js@4.1.0

## 13.0.0

### Minor Changes

- 6890694: Mark stytch.member as deprecated in favor of stytch.self
  Adds RBAC functionality

### Patch Changes

- Updated dependencies [9ee61b3]
- Updated dependencies [b34293a]
- Updated dependencies [c3c108b]
- Updated dependencies [6890694]
  - @stytch/vanilla-js@4.0.0

## 12.0.0

### Patch Changes

- Updated dependencies [ec1962c]
  - @stytch/vanilla-js@3.2.0

## 11.0.0

### Minor Changes

- 8cff174: B2C Passkeys Headless Support & UI components

### Patch Changes

- Updated dependencies [8cff174]
  - @stytch/vanilla-js@3.1.0

## 10.0.0

### Patch Changes

- Updated dependencies [5dd9d24]
  - @stytch/vanilla-js@3.0.0

## 9.0.0

### Patch Changes

- 47eb388: Add Device Fingerprinting to the React Native SDK
- Updated dependencies [47eb388]
- Updated dependencies [d008ef5]
- Updated dependencies [47eb388]
- Updated dependencies [7c1940e]
  - @stytch/vanilla-js@2.2.0

## 8.0.0

### Patch Changes

- Updated dependencies [67d42f0]
  - @stytch/vanilla-js@2.1.0

## 7.0.2

### Patch Changes

- 1b1ea1b: updateStateAndTokens call in resetBySession and resetExistingPassword
- Updated dependencies [1b1ea1b]
- Updated dependencies [47cd46c]
  - @stytch/vanilla-js@2.0.3

## 7.0.1

### Patch Changes

- 0a18c34: Add docs for new verified fields on Member objects, and fix some docs links
- Updated dependencies [9fd5d96]
- Updated dependencies [0a18c34]
  - @stytch/vanilla-js@2.0.1

## 7.0.0

### Major Changes

- a4083c7: Breaking Changes: The intermediate session token (IST) will no longer be accepted as an argument for the discovery list organizations, intermediate sessions exchange, and create organization via discovery endpoints. The IST will be passed in automatically. ISTs are stored as browser cookies or persisted on device when they are generated after calls to discovery authenticate endpoints, such as email magic link discovery authenticate, or primary authenticate endpoints in the case where MFA is required, such as email magic link authenticate or SSO authenticate.

  New Features: Our B2B product now supports multi-factor authentication (MFA) with one-time passcodes (OTPs) via SMS. MFA policies can be set on the Organization level or on the Member level. See the Stytch docs for more information.

### Patch Changes

- Updated dependencies [a4083c7]
  - @stytch/vanilla-js@2.0.0

## 6.0.0

### Patch Changes

- Updated dependencies [e7302d7]
  - @stytch/vanilla-js@1.1.0

## 5.0.0

### Patch Changes

- Updated dependencies [f9c36c9]
  - @stytch/vanilla-js@1.0.0

## 4.0.0

### Minor Changes

- c8e2d0b: B2B Passwords UI components

### Patch Changes

- Updated dependencies [c8e2d0b]
  - @stytch/vanilla-js@0.14.0

## 3.0.0

### Minor Changes

- 15dbe7d: Releasing UI components for our B2B SDKs.

### Patch Changes

- Updated dependencies [15dbe7d]
  - @stytch/vanilla-js@0.13.0

## 2.0.0

### Patch Changes

- 6a27584: Make organization name and slug optional for discovery organization create
- Updated dependencies [dde1f2a]
- Updated dependencies [6a27584]
  - @stytch/vanilla-js@0.12.0

## 1.0.2

### Patch Changes

- 79ca7ba: Add locale argument to B2B email magic link methods
- Updated dependencies [79ca7ba]
  - @stytch/vanilla-js@0.11.3

## 1.0.1

### Patch Changes

- c924765: Include the b2b directory in package.json for the B2B SDK entrypoint
- Updated dependencies [c924765]
  - @stytch/vanilla-js@0.11.2

## 1.0.0

### Minor Changes

- c0e42bc: Add B2B Discovery headless client and session exchange method

### Patch Changes

- Updated dependencies [c0e42bc]
  - @stytch/vanilla-js@0.11.0

## 0.10.3

### Patch Changes

- 1652706: Fix session/user persisting after logging out
- Updated dependencies [1652706]
  - @stytch/vanilla-js@0.10.7

## 0.10.2

### Patch Changes

- ca5a31d: SDK-877 Fix session/user persisting after logging out
- Updated dependencies [ca5a31d]
  - @stytch/vanilla-js@0.10.6

## 0.10.1

### Patch Changes

- f1810c4: Add React Native OAuth callback, PKCE fix
- Updated dependencies [f1810c4]
  - @stytch/vanilla-js@0.10.2

## 0.10.0

### Minor Changes

- Launching B2B SDKs

### Patch Changes

- Updated dependencies
  - @stytch/vanilla-js@0.10.0

## 0.9.0

### Patch Changes

- Updated dependencies
  - @stytch/vanilla-js@0.9.0

## 0.6.0

### Minor Changes

- Add support for template ID parameters to Magic link Login or create and Send methods, Email OTP Login or create and Send methods, and Reset Password Start

### Patch Changes

- Updated dependencies
- Updated dependencies [ac0cf89]
  - @stytch/vanilla-js@0.6.0

## 0.5.0

### Patch Changes

- 422c698: Add type definitions for User Metadata fields
- Updated dependencies [422c698]
- Updated dependencies
  - @stytch/vanilla-js@0.5.0

## 0.4.6

### Patch Changes

- Add support for custom email domains in magic link confirmation screen
- Updated dependencies
  - @stytch/vanilla-js@0.4.6

## 0.4.5

### Patch Changes

- Reset Password component doc fixes

## 0.4.4

### Patch Changes

- Send methods in the SDK
- Updated dependencies
  - @stytch/vanilla-js@0.4.4
