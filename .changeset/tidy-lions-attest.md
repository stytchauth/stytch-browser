---
'@stytch/react': patch
'@stytch/vanilla-js': patch
'@stytch/nextjs': patch
---

Fix the Identity Provider consent screen hanging when trusted token attestation revokes an expired cached session. Continue attestation after a `user_unauthenticated` revoke error and report other revoke errors through `onError` while clearing the loading state.
