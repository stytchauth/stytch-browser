---
'@stytch/vanilla-js': patch
---

Remove token from URL as authenticate() call is made rather than after success. This prevents rare double calling if the user reloads the page while the call was being made.
