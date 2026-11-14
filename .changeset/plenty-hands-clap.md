---
'@stytch/react-native': minor
'@stytch/core': minor
---

Distinguish user cancellation from missing credentials in the Android Google One Tap flow. `oauth.googleOneTap()` now returns `reason: 'No Credentials Available'` with a `NoCredentialsPresentError` when Credential Manager reports no available credential, instead of reporting every failure as `reason: 'User Canceled'`.
