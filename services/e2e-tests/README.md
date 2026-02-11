# e2e-tests

This repository contains a set of e2e tests that run against:

- https://demo-sdk-app.staging.stytch.com/ (`react-demo`)
- https://demo-sdk-b2b-app.staging.stytch.com/ (`react-b2b-demo`)

To run the tests locally, it's recommended to build the demo app and start it locally first.

```shell
yarn build
yarn workspace react-demo start
yarn workspace react-b2b-demo start
yarn workspace e2e-tests dev
```

Your env.local should end up looking something like

```shell
CYPRESS_BASE_URL=http://localhost:3000
CYPRESS_B2B_BASE_URL=http://localhost:3000
CYPRESS_MAILOSAUR_API_KEY=<From 1Password>
CYPRESS_MAILOSAUR_SERVER_ID=<From 1Password>
```
