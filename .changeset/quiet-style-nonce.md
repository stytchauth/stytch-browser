---
'@stytch/nextjs': patch
'@stytch/react': patch
'@stytch/vanilla-js': patch
---

Set `window.__nonce__` as the nonce of the injected `<style>` element so the pre-built UI works under a nonce-based Content Security Policy, as it did in v5.
