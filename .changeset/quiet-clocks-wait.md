---
'@stytch/nextjs': patch
'@stytch/react': patch
'@stytch/vanilla-js': patch
---

Fix the client throwing `RangeError: Internal error. Icu error.` in browsers with an invalid default locale. The telemetry now falls back to a fixed locale to read the time zone.
