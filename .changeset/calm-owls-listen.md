---
'@stytch/nextjs': minor
'@stytch/react': minor
'@stytch/vanilla-js': minor
---

Add support for FRE Protected Auth. Adds an optional `freDomain` client option. When FRE Protected Auth is enabled for the project and `freDomain` is set, the SDK loads the FRE script and sends the resulting `fre_telemetry_id` alongside `dfp_telemetry_id`.
