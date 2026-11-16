---
'@stytch/nextjs': minor
'@stytch/react': minor
'@stytch/vanilla-js': minor
---

Adds the `cookieOptions.usesHttpOnlyCookies` option. When a custom API endpoint is configured, set it to `false` to skip the startup session refresh unless a session cookie is present, instead of always refreshing. The default behavior is unchanged.
