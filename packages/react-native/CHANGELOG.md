# @stytch/react-native

## 0.70.0

### Minor Changes

- e41e0e1: Update DFP for iOS. `@stytch/react-native-static` is now deprecated, and users should switch back to using the mainline `@stytch/react-native` package.

## 0.69.4

### Patch Changes

- 5a0ad5c: Add external_id to Member and User types and add organization_external_id to Organization type

## 0.69.3

### Patch Changes

- 9fc3655: Bump DFP for Android

## 0.69.2

### Patch Changes

- 96e4b6e: Don't filter out passwords on B2B step-up auth

## 0.69.1

### Patch Changes

- cdd11d2: Bumps reCAPTCHA version for iOS

## 0.69.0

### Minor Changes

- 2da1e4d: Add keepSessionAlive boolean flag to StytchClientOptions. When set, the client will automatically refresh the session as long as the client is active
  Project configuration is now passed into StytchClient and StytchB2BClient through the second constructor parameter as an object. If you had previously passed in the iosDisableUrlCache option as a boolean, make it an object instead.
- f181abf: Include custom org roles in local authorization checks

### Patch Changes

- 17e589c: B2B: Add support for 'ALL_ALLOWED' organization email_jit_provisioning setting

## 0.68.0

### Minor Changes

- 51779f2: Add support for the OAuth Attach flow

## 0.67.1

### Patch Changes

- 25e43f0: Add types for Member.is_admin

## 0.67.0

### Minor Changes

- e4a9fa2: Replace usages of TouchableNativeFeedback buttons with TouchableWithoutFeedback to account for an upstream bug on Android platforms in React Native 0.82+

## 0.66.0

### Minor Changes

- c64d639: When initializing StytchClient, the endpointOptions object is now deprecated
  apiDomain and testApiDomain are now configured using customBaseUrl directly on the root object
  fppaDomain and dfpCdnDomain are now configured as dfppaUrl and dfpCdnUrl directly on the root object

### Patch Changes

- 6aed5ae: Fix export issue for Expo <54 with New Architecture enabled

## 0.65.2

### Patch Changes

- f70353a: NPM publishing issues

## 0.65.1

### Patch Changes

- 9885683: Fix a packaging issue

## 0.65.0

### Minor Changes

- 45a0010: Adds full support for React Native New Architecture. Maintains support for the old architecture, with or without the compatibility/interop layer

## 0.64.1

### Patch Changes

- 290ee5c: Updates to support ReactNative 0.81+

## 0.64.0

### Minor Changes

- 1e3737f: Hack: Add sleep before eml discovery authenticate to make sure obejct is ready.

## 0.63.0

### Minor Changes

- 565767e: Add native console logger and console logs
- e8cd273: Make the RN B2B UI errors more specific

## 0.62.0

### Minor Changes

- e9f280a: Add Encrypted SAML Assertion Support

## 0.61.0

### Minor Changes

- 291c670: Improve handling of on device biometric registrations, to prevent potential lockouts

## 0.60.0

### Minor Changes

- d850be0: Add organization_slug to MemberSession type

## 0.59.0

### Minor Changes

- d27e450: feat: add device history support to all authentication methods

## 0.58.0

### Minor Changes

- 658bbe3: Add locale to UI options and pass through to client endpoints as appropriate

## 0.57.4

### Patch Changes

- 2c1fe71: Improve error logging in specific cases

## 0.57.3

### Patch Changes

- 69cb452: Bump Android DFP version

## 0.57.2

### Patch Changes

- 9f651c4: Ensure event and error callbacks are notified as appropriate
- 9f651c4: Add missing utils client to B2B

## 0.57.1

### Patch Changes

- ae3b2fa: Bump Android DFP version

## 0.57.0

### Minor Changes

- b28ad75: Add StartEmailUpdate to initiate self-serve member email updates

## 0.56.0

### Minor Changes

- 46a346d: In ReactNative for Android, we no longer disallow backups so as to not conflict with other packages that may rely on that behavior

## 0.55.0

### Minor Changes

- a665bfa: Allow specifying text overrides and text translastion via the `strings` configuration.

## 0.54.18

### Patch Changes

- 61dddb6: Fix a bug when using combined email+password component in the discovery flow of PreBuilt B2B UI

## 0.54.17

### Patch Changes

- cbda0b4: Use API-generated error types

## 0.54.16

### Patch Changes

- 499e2ac: Update documentation for B2B Passwords Reset By Email method

## 0.54.15

### Patch Changes

- b037878: Fix logo display and discovery flow borders in prebuilt B2B UI

## 0.54.14

### Patch Changes

- 7b38c7b: Add a unique key to the Divider component in B2B Prebuilt UI

## 0.54.13

### Patch Changes

- fcf21c3: Fix bug in spacing between OAuth and SSO buttons in prebuilt B2B UI

## 0.54.12

### Patch Changes

- 3dd878c: Ensure we handle the error type correctly when registering a biometric registration

## 0.54.11

### Patch Changes

- 9e97735: Add Access Token Exchange headless method for Consumer Sessions

## 0.54.10

### Patch Changes

- dc055c4: Account for instances where users may not have strong enough biometric factors on their device, but normal biometric checking returns successfully

## 0.54.9

### Patch Changes

- a87a73d: More gracefully handle instances where `sessionOptions` is missing from the `StytchB2BUIConfig`

## 0.54.8

### Patch Changes

- 65ccdaa: Fix a crash on initialization for older versions of Android

## 0.54.7

### Patch Changes

- 0518cd6: Add `created_at` and `updated_at` fields to the `Member` object type definition

## 0.54.6

### Patch Changes

- 09a6c49: Bump android native DFP version

## 0.54.5

### Patch Changes

- a5728c0: Honor custom API and DFP backend URLs with consumer StytchClient

## 0.54.4

### Patch Changes

- 91c7414: Remove preflight PKCE checks for EML authenticate.

## 0.54.3

### Patch Changes

- 9338296: Add data backup/restore configurations to the React Native module to prevent getting into an invalid state when data is restored after reinstall

## 0.54.2

### Patch Changes

- 20c9b2c: Fix some visual bugs in the RN B2B prebuilt UI

## 0.54.1

### Patch Changes

- 8ab3b5b: Fix a bug in prebuilt B2B UI discovery flows that may lead to a user getting stuck on an error page

## 0.54.0

### Minor Changes

- 4e481d6: Update React Native packages to use native DFP

## 0.53.1

### Patch Changes

- fd9ef5f: Explicitly throw MissingPKCE errors when PKCE is required and we detect that it is missing, instead of waiting for the server to tell us

## 0.53.0

### Minor Changes

- f995e6f: Add expiration times as a parameter for multiple EML and email OTP requests.

### Patch Changes

- cba1e55: Add and throw a new error type when attempting to persist a null or empty biometricRegistrationId.

## 0.52.3

### Patch Changes

- 406d320: Update RN Android biometric flow to throw more nuanced errors when we detect potential problems.

## 0.52.2

### Patch Changes

- 98e8934: Fix issue where organization and application logos were both hidden when both were specified
- 47049e1: Update RN B2B UI to use public SSO DiscoverConnections method instead of internal network client

## 0.52.1

### Patch Changes

- c20addb: Fix some README typos
- 4266e5a: Fix JIT provisioning bug in B2B UI, where members without passwords were treated as non-members

## 0.52.0

### Minor Changes

- cdfe08f: Add support for VerifyEmailTemplateID to Password Configs

## 0.51.3

### Patch Changes

- 818d8b3: Detect and log an error when a consumer Stytch client is instantiated with a public token for a B2B project and vice versa

## 0.51.2

### Patch Changes

- bdc3eca: Relax email address validation

## 0.51.1

### Patch Changes

- c98bfe2: Informative error for discovery logins that are disallowed due to claimed email domains

## 0.51.0

### Minor Changes

- a0edf9a: Added testApiDomain to endpointOptions for the StytchClient.

## 0.50.1

### Patch Changes

- 7d804d9: feat: Add support for accessTokenExchange to B2B Sessions Client

## 0.50.0

### Minor Changes

- 9dabc2b: Modernized build artifacts. If you encounter new errors around import paths after upgrading, ensure you are importing from `@stytch/react-native` or `@stytch/react-native/b2b`, not another path like `@stytch/react-native/dist/...`.
- 9dabc2b: We removed some exports from `@stytch/react-native` that were intended for internal use to avoid confusion. If you encounter an error importing something from `@stytch/react-native` that you were depending on, please email us at support@stytch.com and let us know so we can understand your use case better.

### Patch Changes

- eaebaba: Updates our PrimaryAuthMethod logic to only remove passwords in the Tenanted Case

## 0.49.1

### Patch Changes

- 01474e1: Ensure that fromCache is always toggled on app launch regardless of whether or not a session was found locally

## 0.49.0

### Minor Changes

- bc976e0: Make native OAuth errors warnings and update the description to be more informative. Remove deprecated properties from B2C/B2B clients. Email OTPs expire after 10 minutes, not 2.

## 0.48.0

### Minor Changes

- 332b896: Modify logic for 'or' seperators on B2B home page to place them before and after input products.
- b22a95f: Prevent biometric registration if the user is already enrolled.

### Patch Changes

- 288226b: Respect the component order and tab order in the consumer prebuilt UI.
- Updated dependencies [d4b1fb0]
- Updated dependencies [b22a95f]
  - @stytch/core@2.43.0

## 0.47.2

### Patch Changes

- Updated dependencies [5fdee97]
  - @stytch/core@2.42.2

## 0.47.1

### Patch Changes

- 2dc613d: Fix issue with biometric registration.

## 0.47.0

### Minor Changes

- f0c6384: Add SSO discovery to RN B2B UI

## 0.46.2

### Patch Changes

- Updated dependencies [3ef8b22]
  - @stytch/core@2.42.1

## 0.46.1

### Patch Changes

- Updated dependencies [0abb940]
  - @stytch/core@2.42.0

## 0.46.0

### Minor Changes

- 8205f60: Ensure we wait to call sessions.authenticate after loading any potentially cached sessions from device storage.
- d5ed50c: Added User Impersonation to Consumer

### Patch Changes

- 7cf70c6: Update UI Branding
- Updated dependencies [8205f60]
- Updated dependencies [d5ed50c]
- Updated dependencies [9eb8e8c]
  - @stytch/core@2.41.0

## 0.45.2

### Patch Changes

- Updated dependencies [63d41b2]
- Updated dependencies [63d41b2]
  - @stytch/core@2.40.0

## 0.45.1

### Patch Changes

- c79a967: Catch exceptions on biometrics authenticate so they are propogated to the app instead of crashing

## 0.45.0

### Minor Changes

- 6bd79e9: Deprecate isLoaded in the React Native SDK. It will be removed in a future release. Please use the `useStytchUser`, `useStytchMember`, `useStytchSession`, and `useStytchMemberSession` hooks to determine loading status

## 0.44.1

### Patch Changes

- Updated dependencies [f68caf9]
- Updated dependencies [a14aa91]
- Updated dependencies [5517ba2]
  - @stytch/core@2.39.0

## 0.44.0

### Minor Changes

- c3463a1: Add `directCreateOrganizationForNoMembership` option to B2B login UI

### Patch Changes

- e0b6bcb: Fix handling of certain project configuration fields
- Updated dependencies [c3463a1]
  - @stytch/core@2.38.0

## 0.43.0

### Minor Changes

- bcde3d7: Fix some biometrics issues, only delete local registration if deleting the remote succeeds.

## 0.42.0

### Minor Changes

- 6daadc7: Add support for TypeScript-based Stytch project configurations
- 6daadc7: Allow configuring API endpoint domain for live projects via `endpointOptions.apiDomain`

### Patch Changes

- 6daadc7: Refactor internal handling of authentication responses
- Updated dependencies [6daadc7]
- Updated dependencies [6daadc7]
- Updated dependencies [6daadc7]
  - @stytch/core@2.37.0

## 0.41.1

### Patch Changes

- Updated dependencies [ba37550]
  - @stytch/core@2.36.2

## 0.41.0

### Minor Changes

- c437e31: Fix codechallenge/codeverifier naming in core Password client; Add Password Discovery flows to RN B2B UI

### Patch Changes

- Updated dependencies [778da18]
- Updated dependencies [c437e31]
  - @stytch/core@2.36.1

## 0.40.0

### Minor Changes

- 5679351: Fix bugs in email otp and add email otp to b2b prebuilt ui.

### Patch Changes

- 41d81af: Only perform user search when passwords are enabled to prevent REQUIRING passwords to be enabled
- b46dd97: Add some QOL improvements to phone and OTP code entry components
- Updated dependencies [5679351]
  - @stytch/core@2.36.0

## 0.39.0

### Minor Changes

- 5ab4a99: RN: Don't wrap native exceptions in placeholder InternalError classes, only do that on the JS side to fully expose the stacktrace; Add stack trace to JS-defined InternalError class

### Patch Changes

- Updated dependencies [c531314]
- Updated dependencies [5ab4a99]
  - @stytch/core@2.35.0

## 0.38.5

### Patch Changes

- c5446d0: Only initiate a session authentication call during app foregrounding IF there is a session to authenticate

## 0.38.4

### Patch Changes

- 6cc9aa1: Fix some style issues and render an error when attempting to load a page that would otherwise not render

## 0.38.3

### Patch Changes

- Updated dependencies [5f9a5bf]
  - @stytch/core@2.34.4

## 0.38.2

### Patch Changes

- 67cbee6a: Add DFPPA to OTP Email Login Or Create
- Updated dependencies [67cbee6a]
  - @stytch/core@2.34.3

## 0.38.1

### Patch Changes

- 2457672f: Relax the requirement for products specified in the UI config to have a corresponding `*Options` configuration set if the product can use default options.
- Updated dependencies [2457672f]
  - @stytch/core@2.34.2

## 0.38.0

### Minor Changes

- 2d8ecb9f: Update B2B client to enable the ability to disable URL caching on iOS

### Patch Changes

- Updated dependencies [24f0e440]
  - @stytch/core@2.34.1

## 0.37.0

### Minor Changes

- ae7e5774: Releasing React Native B2B UI.

## 0.36.1

### Patch Changes

- 1507043c: Fixes a bug where session tokens were not updated after registering a biometric

## 0.36.0

### Minor Changes

- 02d96ca5: Tenanted Email Authenticate to Use EmailAddress as Input Param Over MemberID

### Patch Changes

- Updated dependencies [02d96ca5]
- Updated dependencies [f7f4aef2]
- Updated dependencies [f7f4aef2]
  - @stytch/core@2.34.0

## 0.35.3

### Patch Changes

- Updated dependencies [e85c63d6]
  - @stytch/core@2.33.0

## 0.35.2

### Patch Changes

- Updated dependencies [7323668e]
  - @stytch/core@2.32.0

## 0.35.1

### Patch Changes

- Updated dependencies [e0e84646]
  - @stytch/core@2.31.0

## 0.35.0

### Minor Changes

- 566c8fe2: Add headless TOTP client to RN B2C client

## 0.34.0

### Minor Changes

- 64abf2d2: Add override parameters for the WebAuthn registration endpoint.

### Patch Changes

- 5b117909: Remove unused errorMessage field.
- Updated dependencies [f77f278b]
- Updated dependencies [5b117909]
- Updated dependencies [64abf2d2]
  - @stytch/core@2.30.0

## 0.33.2

### Patch Changes

- aecd4357: Update requirements for ReactNative UI to allow OTP/OAuth as valid configurations

## 0.33.1

### Patch Changes

- Updated dependencies [9dbf9e58]
  - @stytch/core@2.29.0

## 0.33.0

### Minor Changes

- dc2d74a4: Add SCIM client to RN B2B client

## 0.32.4

### Patch Changes

- 1029c1d7: Fix potential DFP multi continuation bug.

## 0.32.3

### Patch Changes

- Updated dependencies [d0b0584a]
- Updated dependencies [ae0e899e]
  - @stytch/core@2.28.0

## 0.32.2

### Patch Changes

- 9ef07d98: Update StandardCharsets since the Facebook implementation is now Deprecated
- Updated dependencies [132a5d1e]
  - @stytch/core@2.27.0

## 0.32.1

### Patch Changes

- Updated dependencies [b21b3fe6]
  - @stytch/core@2.25.1

## 0.32.0

### Minor Changes

- 0937cda9: Better management of biometric registrations to ensure local and remote registrations stay in sync
- 0937cda9: Update options for enabling SMS autofill in RN and add necessary code changes

### Patch Changes

- Updated dependencies [0937cda9]
- Updated dependencies [0937cda9]
  - @stytch/core@2.25.0

## 0.31.0

### Minor Changes

- e568bca5: Add B2B OAuth for react native. Modifying the visibilty of the base class for the headless B2B OAuth client for purposes of inheritence.

### Patch Changes

- Updated dependencies [a7785552]
- Updated dependencies [e568bca5]
  - @stytch/core@2.24.0

## 0.30.2

### Patch Changes

- Updated dependencies [9742b5a7]
  - @stytch/core@2.23.1

## 0.30.1

### Patch Changes

- Updated dependencies [1ace8943]
  - @stytch/core@2.23.0

## 0.30.0

### Minor Changes

- 2ce25093: Implements Sign in With Ethereum (SIWE) for crypto wallets
- fc59121a: Adds ability to view and unlink retired emails to HeadlessB2BOrganizationClient and HeadlessB2BSelfClient.

### Patch Changes

- 1d36ed03: B2B SSO now properly uses DFP
- Updated dependencies [2ce25093]
- Updated dependencies [1d36ed03]
- Updated dependencies [fc59121a]
  - @stytch/core@2.22.0

## 0.29.2

### Patch Changes

- Updated dependencies [77b72734]
- Updated dependencies [6701e5fa]
  - @stytch/core@2.21.2

## 0.29.1

### Patch Changes

- Updated dependencies [016aa6dd]
- Updated dependencies [2ba86715]
  - @stytch/core@2.21.1

## 0.29.0

### Minor Changes

- bd936f06: Adds dfppaDomain to optional SDK client configuration

### Patch Changes

- Updated dependencies [e4684086]
- Updated dependencies [3183b459]
- Updated dependencies [bd936f06]
- Updated dependencies [fda896c7]
- Updated dependencies [3183b459]
- Updated dependencies [71c830d7]
  - @stytch/core@2.21.0

## 0.28.1

### Patch Changes

- Updated dependencies [aac9a59b]
  - @stytch/core@2.20.0

## 0.28.0

### Minor Changes

- 06b47703: Deprecate some properties in RN UI OAuth options and provide a new type for specifying per-provider options; Correctly support provider_params in RN OAuth flows

### Patch Changes

- Updated dependencies [06b47703]
- Updated dependencies [95964f0b]
  - @stytch/core@2.19.0

## 0.27.4

### Patch Changes

- Updated dependencies [e1b798f4]
  - @stytch/core@2.18.0

## 0.27.3

### Patch Changes

- Updated dependencies [bf21c792]
  - @stytch/core@2.17.2

## 0.27.2

### Patch Changes

- Updated dependencies [31c8b4a1]
  - @stytch/core@2.17.1

## 0.27.1

### Patch Changes

- b20db336: Ensure that DFP/Catcha works for biometrics

## 0.27.0

### Minor Changes

- 4ffb8492: Fix crash when fetching a null biometric registration ID; Delete biometric registration ID when deleting a biometric key; Force popup of biometric prompt when registering a new biometric

## 0.26.5

### Patch Changes

- dd781afc: Attempt to cleanup orphaned IABs to prevent errors
- 38d24b90: Re-release to force inclusion of IAB changes

## 0.26.4

### Patch Changes

- 0e11c2e5: Fix React Native biometrics policy to correctly respect developers intention for fallback
- Updated dependencies [59481ff9]
- Updated dependencies [cbab0c30]
  - @stytch/core@2.17.0

## 0.26.3

### Patch Changes

- Require non-null `session_token` in updateSession()
- Added IDP type to SSO connections
- Updated dependencies [066e9602]
- Updated dependencies [c3a880b8]
  - @stytch/core@2.16.0

## 0.26.2

### Patch Changes

- 07b310a: Update RN Subscription manager to better match vanilla-js
- Updated dependencies [07b310a]
  - @stytch/core@2.15.2

## 0.26.1

### Patch Changes

- 2e33560: Loosen typings for various options to accept both string literals and TypeScript enums
- Updated dependencies [2e33560]
  - @stytch/core@2.15.1

## 0.26.0

### Minor Changes

- 5f4ba4a: Add `stytch.organization.getBySlug` method to B2B clients

### Patch Changes

- Updated dependencies [5f4ba4a]
  - @stytch/core@2.15.0

## 0.25.0

### Migration guide

Due to necessary updates to underlying Google packages to support Google Credential Manager on Android 14, Android builds now require a `compileSdk` version of 34. This necessitates an upgrade of the Android Gradle Plugin to >= 8.1.1. The easiest way to accomplish this is to upgrade to React Native >= 0.73.0, or Expo >= 50.

If you have an existing, bare React Native project (ie: you have an `android` folder in your codebase), you can edit your `android/build.gradle` file to specify a `compileSdk` version of 34, and follow the Android Studio AGP upgrade assistant (`Tools > AGP Upgrade Assistant...`) to upgrade your project.

To use the redirect-based OAuth flows for Google and Apple, use the new `startWithRedirect()` methods, like so:

- `stytch.oauth.google.startWithRedirect()`
- `stytch.oauth.apple.startWithRedirect()`

### Minor Changes

- Migrate from the deprecated Google One Tap implementation to Google Credential Manager
- Add methods for using redirect based OAuth flows for Google and Apple, instead of the native flows

### Patch Changes

- Updated dependencies [821c884]
  - @stytch/core@2.14.1

## 0.24.3

### Patch Changes

- Updated dependencies [807fcec]
  - @stytch/core@2.14.0

## 0.24.2

### Patch Changes

- 0055ad8: Remove result check and rely on intent handling to handle user cancellations for Android Google OneTap
- Updated dependencies [0055ad8]
  - @stytch/core@2.13.1

## 0.24.1

### Patch Changes

- fcd5549: Remove import of unavailable dependency introduced in previous release

## 0.24.0

### Minor Changes

- a0fbe9f: Add `stytch.onStateChange` event listener to headless clients
- a0fbe9f: Add `getInfo` method to user, session, member, and organization

### Patch Changes

- Updated dependencies [a0fbe9f]
- Updated dependencies [a0fbe9f]
  - @stytch/core@2.13.0

## 0.23.6

### Patch Changes

- Updated dependencies [b007d98]
  - @stytch/core@2.12.0

## 0.23.5

### Patch Changes

- Updated dependencies [cae4f3d]
  - @stytch/core@2.11.0

## 0.23.4

### Patch Changes

- Updated dependencies [bf6f8f6]
  - @stytch/core@2.10.2

## 0.23.3

### Patch Changes

- Updated dependencies [2881b68]
  - @stytch/core@2.10.1

## 0.23.2

### Patch Changes

- Updated dependencies [b7f2e1d]
  - @stytch/core@2.10.0

## 0.23.1

### Patch Changes

- e83a832: Added DFP functionality to users search in passwords screen
- Updated dependencies [e83a832]
  - @stytch/core@2.9.1

## 0.23.0

### Minor Changes

- f604dcb: Release RN B2C UI

### Patch Changes

- Updated dependencies [c4c8c23]
- Updated dependencies [f604dcb]
  - @stytch/core@2.9.0

## 0.22.7

### Patch Changes

- Updated dependencies [692c6c7]
  - @stytch/core@2.8.0

## 0.22.6

### Patch Changes

- eb8e140: Fix incorrect imports
- Updated dependencies [eb8e140]
  - @stytch/core@2.7.2

## 0.22.5

### Patch Changes

- ad75a65: Fix transient keystore issues in RN Android

## 0.22.4

### Patch Changes

- 060ee3b: Fix handling of SSO authentication when MFA is required
- Updated dependencies [060ee3b]
- Updated dependencies [060ee3b]
  - @stytch/core@2.7.1

## 0.22.3

### Patch Changes

- Updated dependencies [dcc20e2]
  - @stytch/core@2.7.0

## 0.22.2

### Patch Changes

- fc6a467: Update react-native resolution path to be platform agnostic when doing replacement so it works on windows

## 0.22.1

### Patch Changes

- f6ca430: Changes to React Native iOS DFP client

## 0.22.0

### Minor Changes

- 9c4f190: Bump Recaptcha Version

### Patch Changes

- b9dd1d2: Fixed session not refreshing after app reopening

## 0.21.2

### Patch Changes

- Updated dependencies [521fc22]
  - @stytch/core@2.6.0

## 0.21.1

**NOTE**: From v0.21.1 onwards, in order to use Apple OAuth, you _must_ toggle `Manage user data` setting **ON** in the Frontend SDK settings of your [Dashboard](https://stytch.com/dashboard/sdk-configuration?env=test).

### Patch Changes

- 082a867: Fixed React Native Sign in with Apple not returning name values
- Updated dependencies [56fd625]
- Updated dependencies [119952e]
  - @stytch/core@2.5.1

## 0.21.0

### Minor Changes

- 00ce5da: Fix biometrics issues in iOS

## 0.20.0

### Minor Changes

- 50bb749: Adds headless methods for interacting with b2b recovery codes

### Patch Changes

- Updated dependencies [50bb749]
- Updated dependencies [e4c0a70]
  - @stytch/core@2.5.0

## 0.19.4

### Patch Changes

- Updated dependencies [61417c3]
  - @stytch/core@2.4.2

## 0.19.3

### Patch Changes

- Updated dependencies [e21c507]
  - @stytch/core@2.4.1

## 0.19.2

### Patch Changes

- Updated dependencies [5877da8]
  - @stytch/core@2.4.0

## 0.19.1

### Patch Changes

- Updated dependencies [c50b9ad]
  - @stytch/core@2.3.0

## 0.19.0

### Minor Changes

- 223e30e: Add `useStytchOrganization` hook for B2B

### Patch Changes

- Updated dependencies [223e30e]
  - @stytch/core@2.2.0

## 0.18.1

### Patch Changes

- 555f073: Fix packaging issue for RN iOS

## 0.18.0

### Minor Changes

- 2379b29: Add B2B TOTPs (Create/Authenticate)

### Patch Changes

- Updated dependencies [2379b29]
  - @stytch/core@2.1.0

## 0.17.0

### Minor Changes

- b34293a: Improvements to error types in the JS and React Native SDKs
- 6890694: Mark stytch.member as deprecated in favor of stytch.self
  Adds RBAC functionality

### Patch Changes

- d748135: Remove unused dependencies from package manifest
- Updated dependencies [76ad832]
- Updated dependencies [b34293a]
- Updated dependencies [b34293a]
- Updated dependencies [6890694]
  - @stytch/core@2.0.0

## 0.16.1

### Patch Changes

- a179fd4: Add DFP Protected Auth to the React Native B2B SDK

## 0.16.0

### Minor Changes

- 28b3b19: Migrate RN iOS keys to be available after unlock

## 0.15.1

### Patch Changes

- Updated dependencies [2f46248]
  - @stytch/core@1.4.2

## 0.15.0

### Minor Changes

- 570dcec: Added Passkeys in React Native SDK

## 0.14.4

### Patch Changes

- 628b667: Add a toplevel DFP client to RN SDK
- Updated dependencies [7666f2b]
- Updated dependencies [6ece044]
  - @stytch/core@1.4.1

## 0.14.3

### Patch Changes

- Updated dependencies [ec1962c]
  - @stytch/core@1.4.0

## 0.14.2

### Patch Changes

- Updated dependencies [8cff174]
  - @stytch/core@1.3.0

## 0.14.1

### Patch Changes

- 32ed73a: Resolved a critical severity vulnerability with the @babel/traverse dependency
- Updated dependencies [ecef75b]
- Updated dependencies [2b9ed9c]
- Updated dependencies [32ed73a]
  - @stytch/core@1.2.3

## 0.14.0

### Minor Changes

- 311388d: Export DFP type for use in RN; Embed Recaptcha dependencies to avoid forcing a dynamic framework on developers

### Patch Changes

- Updated dependencies [70475b5]
- Updated dependencies [311388d]
  - @stytch/core@1.2.2

## 0.13.1

### Patch Changes

- 9a8b2fc: Add a getPKCEPair util method to react-native StytchClient

## 0.13.0

### Minor Changes

- 04cec1b: Revert DFP on RN

### Patch Changes

- Updated dependencies [04cec1b]
  - @stytch/core@1.2.1

## 0.12.2

### Patch Changes

- 3054046: Make the React Native StytchClient params optional

## 0.12.1

### Patch Changes

- 432814d: Adds fallback to redirect-based OAuth when native OAuth fails (Google One Tap or Sign in with Apple) in the React Native SDK

## 0.12.0

### Minor Changes

- 47eb388: Add Device Fingerprinting to the React Native SDK

### Patch Changes

- 47eb388: Add support for Observation and decisioning mode for DFP
- Updated dependencies [47eb388]
- Updated dependencies [47eb388]
- Updated dependencies [7c1940e]
  - @stytch/core@1.2.0

## 0.11.1

### Patch Changes

- Updated dependencies [ab22732]
  - @stytch/core@1.1.1

## 0.11.0

### Minor Changes

- 67d42f0: Add Device Fingerprinting Bot Detection to SDKs
- 42bf09d: Added separate methods for native OAuth (googleOneTap and signInWithApple) in the React Native SDK.

### Patch Changes

- Updated dependencies [67d42f0]
- Updated dependencies [42bf09d]
- Updated dependencies [a07cf3a]
  - @stytch/core@1.1.0

## 0.10.4

### Patch Changes

- Updated dependencies [81c47aa]
  - @stytch/core@1.0.1

## 0.10.3

### Patch Changes

- 2b8f0e6: Fix PKCE logic for password resets log in without password flow
- Updated dependencies [2b8f0e6]
  - @stytch/core@1.0.0

## 0.10.2

### Patch Changes

- Updated dependencies [1b1ea1b]
  - @stytch/core@0.15.2

## 0.10.1

### Patch Changes

- Updated dependencies [0a18c34]
  - @stytch/core@0.15.1

## 0.10.0

### Minor Changes

- a4083c7: Breaking Changes: The intermediate session token (IST) will no longer be accepted as an argument for the discovery list organizations, intermediate sessions exchange, and create organization via discovery endpoints. The IST will be passed in automatically. ISTs are stored as browser cookies or persisted on device when they are generated after calls to discovery authenticate endpoints, such as email magic link discovery authenticate, or primary authenticate endpoints in the case where MFA is required, such as email magic link authenticate or SSO authenticate.

  New Features: Our B2B product now supports multi-factor authentication (MFA) with one-time passcodes (OTPs) via SMS. MFA policies can be set on the Organization level or on the Member level. See the Stytch docs for more information.

### Patch Changes

- Updated dependencies [a4083c7]
  - @stytch/core@0.15.0

## 0.9.6

### Patch Changes

- Updated dependencies [f3d8a3b]
  - @stytch/core@0.14.4

## 0.9.5

### Patch Changes

- a821766: Add a flag to disable the URLCache on iOS

## 0.9.4

### Patch Changes

- 83c017e: Updated types for the password strength method. Updated UI for the password strength check while using LUDS
- Updated dependencies [83c017e]
  - @stytch/core@0.14.3

## 0.9.3

### Patch Changes

- 00eb1ce: Yahoo OAuth Fix (build)
- Updated dependencies [00eb1ce]
  - @stytch/core@0.14.2

## 0.9.2

### Patch Changes

- e97e8ba: Yahoo OAuth
- Updated dependencies [e97e8ba]
  - @stytch/core@0.14.1

## 0.9.1

### Patch Changes

- d2cf728: Add B2B for ReactNative
- Updated dependencies [e7302d7]
  - @stytch/core@0.14.0

## 0.9.0

### Minor Changes

- e7302d7: The intermediate session token will now be stored as a cookie after calls to the B2B magic link discovery authenticate endpoint and the OAuth discovery authenticate endpoint.

## 0.8.14

### Patch Changes

- d847d9d: Added new OAuth Providers
- Updated dependencies [d847d9d]
  - @stytch/core@0.13.5

## 0.8.13

### Patch Changes

- 2443028: Add OAuthStartResponse type to Headless OAuth start calls
- Updated dependencies [2443028]
  - @stytch/core@0.13.4

## 0.8.12

### Patch Changes

- 8d22b5b: Update dependency to stytch named fork

## 0.8.11

### Patch Changes

- cf08b12: Match BC dependency to expo-updates to alleviate issues with EAS builds

## 0.8.10

### Patch Changes

- 31ffd5f: Robustify react-native dependency resolution

## 0.8.9

### Patch Changes

- Updated dependencies [f9c36c9]
  - @stytch/core@0.13.3

## 0.8.8

### Patch Changes

- 25e1f58: Import React in SessionMigrationHelper, which is needed for some reason in bare RN projects?

## 0.8.7

### Patch Changes

- Updated dependencies [55dcfdb]
- Updated dependencies [84fd502]
  - @stytch/core@0.13.2

## 0.8.6

### Patch Changes

- 87165fd: Get timezone from native code

## 0.8.5

### Patch Changes

- 2e1d01b: Update targetSDK version
- Updated dependencies [0a626d1]
  - @stytch/core@0.13.1

## 0.8.4

### Patch Changes

- 0d828ea: Add the podspec for StytchReactNativeModule

## 0.8.3

### Patch Changes

- 3a8dc60: Add Android test files to npmignore to reduce package size

## 0.8.2

### Patch Changes

- 5f40414: Include native modules in react-native package

## 0.8.1

### Patch Changes

- ae9da93: Update package README

## 0.8.0

### Migration guide

We have made significant changes to the Stytch React Native SDK to make installation and configuration easier for developers. This is a migration guide for all developers using the Stytch React Native and React Native Expo SDKs prior to v0.8.

- If you are currently using Expo Go, start at **Development builds** below.
- If you are currently using Expo development builds, start at **Stytch React Native Expo SDK** below.
- Otherwise, start at **Stytch React Native SDK** near the bottom of this section.

#### Development builds

The Stytch React Native SDK requires the use of custom native code for the best auth experience. [Expo Go does not allow custom native code](https://docs.expo.dev/workflow/customizing), and as a result, we no longer support apps using Expo Go.

We recommend moving to [development builds](https://docs.expo.dev/develop/development-builds/introduction) to support custom native code and to continue using the Stytch React Native SDK. You may want to complete the steps in **Stytch React Native Expo SDK** and **Stytch React Native SDK** before starting to create a development build to have the correct dependencies set up. The Expo documentation provides an [in-depth guide](https://docs.expo.dev/develop/development-builds/installation) for creating a development build, but these are the main steps:

1. [Create an Expo account](https://expo.dev/signup) if you don't already have one.
2. Install the eas-cli package globally.
   ```Bash
   npm install -g eas-cli
   ```
3. Log into your Expo account.
   ```Bash
   eas login
   ```
4. Install the expo-dev-client package in your project.
   ```Bash
   npx expo install expo-dev-client
   ```
5. Create a development build using EAS Build.
   ```Bash
   eas build
   ```

#### Stytch React Native Expo SDK

All React Native and Expo projects can now use `@stytch/react-native`. The `@stytch/react-native-expo` package will no longer be maintained but is still available for existing customers using this version.

To migrate your Expo project to `@stytch/react-native`, the only changes that you'll need to make to your are installing the `@stytch/react-native` package and uninstalling the `@stytch/react-native-expo` package (along with other dependencies that are no longer required):

```Bash
# Remove old package and dependencies
npm uninstall @stytch/react-native-expo @stytch/react-native-modules react-native-keychain react-native-device-info react-native-get-random-values

# Install new package
npm install @stytch/react-native @stytch/react-native-inappbrowser-reborn
```

#### Stytch React Native SDK

The `@stytch/react-native-modules` package is now included in `@stytch/react-native` by default.

Some of the previous dependencies for `@stytch/react-native` can be removed, this includes `react-native-keychain`, `react-native-device-info`, and `react-native-get-random-values`.

We recommend removing these old dependencies and adding the new `@stytch/react-native-inappbrowser-reborn` dependency to keep your build clean:

```Bash
# Remove old dependencies
npm uninstall @stytch/react-native-modules react-native-keychain react-native-device-info react-native-get-random-values

# Install new dependency
npm install @stytch/react-native-inappbrowser-reborn
```

### Minor Changes

- cf68a7c: Unify React Native and Expo SDKs

## 0.7.6

### Patch Changes

- Updated dependencies [3f261b0]
  - @stytch/react-native-modules@0.2.9

## 0.7.5

### Patch Changes

- Updated dependencies [91c0ee1]
  - @stytch/core@0.13.0

## 0.7.4

### Patch Changes

- Updated dependencies [1f54b59]
- Updated dependencies [459b8e5]
  - @stytch/core@0.12.1
  - @stytch/react-native-modules@0.2.8

## 0.7.3

### Patch Changes

- Updated dependencies [c8e2d0b]
  - @stytch/core@0.12.0

## 0.7.2

### Patch Changes

- Updated dependencies [661a993]
  - @stytch/react-native-modules@0.2.7

## 0.7.1

### Patch Changes

- e1fd555: Expose Biometric Registration ID in BiometricsClients
- Updated dependencies [e1fd555]
- Updated dependencies [b1ac8be]
- Updated dependencies [1309266]
  - @stytch/core@0.11.1

## 0.7.0

### Minor Changes

- 15dbe7d: Releasing UI components for our B2B SDKs.

### Patch Changes

- Updated dependencies [15dbe7d]
  - @stytch/core@0.11.0

## 0.6.4

### Patch Changes

- 21ef0da: Fix broken React Native OAuth redirect

## 0.6.3

### Patch Changes

- Updated dependencies [e486932]
  - @stytch/react-native-modules@0.2.6

## 0.6.2

### Patch Changes

- Updated dependencies [8d68904]
  - @stytch/core@0.10.1

## 0.6.1

### Patch Changes

- Updated dependencies [dde1f2a]
- Updated dependencies [6a27584]
  - @stytch/core@0.10.0

## 0.6.0

`@stytch/react-native@0.6.0` updates the `useStytchUser` and `useStytchSession` hooks. The `useStytchUser` and `useStytchSession` hooks now return envelope objects, `{(user, fromCache)}` and `{(session, fromCache)}` respectively. On first render, the SDK will read the user or session out of local storage, and serve them with `fromCache: true`. The SDK will make network requests to update the user and session objects, and serve them with `fromCache: false`.

### Minor Changes

- c1a312c: Add ability to tell if user is new/returning for native OAuth
- ec57fc5: Adds fromCache value into User and Session objects

### Patch Changes

- Updated dependencies [c1a312c]
  - @stytch/core@0.9.0

## 0.5.13

### Patch Changes

- Updated dependencies [79ca7ba]
  - @stytch/core@0.8.2

## 0.5.12

### Patch Changes

- 9242f56: Switch to using an in-app browser for non-native OAuth flows

## 0.5.11

### Patch Changes

- b68a8ff: Clear Stytch Keychain items from iOS on fresh install
- Updated dependencies [b68a8ff]
  - @stytch/react-native-modules@0.2.5

## 0.5.10

### Patch Changes

- b55bc55: Add Session.updateSession to hydrate sessions from the backend
- Updated dependencies [8e01eef]
- Updated dependencies [b55bc55]
  - @stytch/core@0.8.1

## 0.5.9

### Patch Changes

- 0708073: initialize user and session in StytchProvider

## 0.5.8

### Patch Changes

- Updated dependencies [c0e42bc]
  - @stytch/core@0.8.0

## 0.5.7

### Patch Changes

- Updated dependencies
  - @stytch/core@0.7.7

## 0.5.6

### Patch Changes

- Updated dependencies [8ad1ec9]
  - @stytch/core@0.7.6

## 0.5.5

### Patch Changes

- 1652706: Fix session/user persisting after logging out
- Updated dependencies [1652706]
  - @stytch/core@0.7.5
  - @stytch/react-native-modules@0.2.4

## 0.5.4

### Patch Changes

- ca5a31d: SDK-877 Fix session/user persisting after logging out
- Updated dependencies [36c8114]
- Updated dependencies [ca5a31d]
  - @stytch/core@0.7.4
  - @stytch/react-native-modules@0.2.3

## 0.5.3

### Patch Changes

- 21e88af: Fixed PKCE mismatch and session revoke bugs in React Native
- 3f1f1ea: Add sessionDurationMinutes parameter for biometrics.register()
- Updated dependencies [c6db664]
- Updated dependencies [21e88af]
- Updated dependencies [3f1f1ea]
  - @stytch/core@0.7.3

## 0.5.2

### Patch Changes

- Updated dependencies [bf518f8]
  - @stytch/core@0.7.2

## 0.5.1

### Patch Changes

- f1810c4: Add React Native OAuth callback, PKCE fix
- Updated dependencies [f1810c4]
  - @stytch/core@0.7.1
  - @stytch/react-native-modules@0.2.2

## 0.5.0

### Minor Changes

- Launching B2B SDKs

### Patch Changes

- Updated dependencies
  - @stytch/core@0.7.0

## 0.4.2

### Patch Changes

- Updated dependencies
  - @stytch/core@0.6.1

## 0.4.1

### Patch Changes

- Updated dependencies
  - @stytch/react-native-modules@0.2.1

## 0.4.0

### Minor Changes

- Add React Native OAuth

### Patch Changes

- Updated dependencies
  - @stytch/core@0.6.0
  - @stytch/react-native-modules@0.2.0

## 0.3.1

### Patch Changes

- Updated dependencies
  - @stytch/core@0.5.1

## 0.3.0

### Minor Changes

- Add support for template ID parameters to Magic link Login or create and Send methods, Email OTP Login or create and Send methods, and Reset Password Start

### Patch Changes

- Updated dependencies
  - @stytch/core@0.5.0

## 0.2.12

### Patch Changes

- Fix bug with PKCE code verifiers being shared over multiple methods

## 0.2.11

### Patch Changes

- Add React Native biometrics
- Updated dependencies
  - @stytch/core@0.4.9
  - @stytch/react-native-modules@0.1.1

## 0.2.9

### Patch Changes

- Updated dependencies
  - @stytch/core@0.4.7

## 0.2.8

### Patch Changes

- Fixes an issue where the isLoaded property was prematurely returning 'true'
- Updated dependencies
  - @stytch/core@0.4.6

## 0.2.7

### Patch Changes

- Updated dependencies [b68343c]
  - @stytch/core@0.4.5

## 0.2.6

### Patch Changes

- 422c698: Add type definitions for User Metadata fields
- Updated dependencies [422c698]
- Updated dependencies
  - @stytch/core@0.4.4

## 0.2.5

### Patch Changes

- Updated dependencies
  - @stytch/core@0.4.3

## 0.2.4

### Patch Changes

- Add support for password client

## 0.2.3

### Patch Changes

- Updated dependencies
  - @stytch/core@0.4.2
