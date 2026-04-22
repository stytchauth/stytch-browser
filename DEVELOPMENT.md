# Development

All commands should be run from the root of the repository, unless otherwise specified.

## System prerequisites

### Node.js

The current version is stored in [.nvmrc](./.nvmrc). We recommend using a tool like [nvm](https://github.com/nvm-sh/nvm) or [asdf](https://asdf-vm.com/) to manage your local node versions and select the right one.

```bash
# install the right node version
nvm install

# start using the right node version
nvm use
```

### Yarn

We use Yarn instead of npm. The version of Yarn is specified in `package.json`.

After installing node, you can install Yarn via corepack:

```bash
corepack enable
```

### jq

jq is used during the build process.

```bash
brew install jq
```

## Setup

### Install and build

After cloning the repository, or pulling the latest changes, ensure you have the latest dependencies installed:

```bash
yarn install
```

The easiest way to build everything is to run:

```bash
yarn build
```

This is a good way to help verify that your environment is set up correctly.

## IDE configuration

You can use any IDE you like, but we recommend using [Visual Studio Code](https://code.visualstudio.com/). Consider installing these extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Also consider adding these settings to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "[javascript][javascriptreact][typescript][typescriptreact][json][jsonc][yaml][github-actions-workflow][markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "eslint.rules.customizations": [
    {
      "rule": "prettier/prettier",
      "severity": "off"
    }
  ]
}
```

### IntelliJ / Webstorm

We don't have a default project configuration, but we recommend tuning these setting. You also need IntelliJ Ultimate Edition since IntelliJ Community Edition does not come with plugins for web development.

- Increase memory available to IDE - 8192 MB is a good starting point https://www.jetbrains.com/help/idea/increasing-memory-heap.html
- Settings > Enable git and GitHub if not auto-detected
- Settings > Prettier:
  - Automatic Prettier Configuration
  - Prefer Prettier configuration to IDE code style
- Settings > ESLint > Automatic ESLint Configuration
- Project structure > Modules - Add this to Exclude files: `.yarn;.turbo;coverage`

You should also consider turning on "Fix on save" for ESLint and Prettier.

## Linting and formatting

We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io) to enforce code quality and formatting. The easiest way to use them is to configure your editor to provide feedback as you write code and apply formatting on save, but you can also run them manually.

To check for linting or formatting issues (without making changes):

```bash
yarn lint
```

To automatically fix linting and formatting issues (where possible):

```bash
yarn format
```

## Documentation

Headless client methods and other exports are documented with JSDoc comments, which can be surfaced to developers directly in their IDEs. To avoid maintaining multiple sources of truth, we also use some of these comments as the basis for certain content in our hosted documentation.

Method descriptions are based on the JSDoc block corresponding to the method's signature. RBAC information is specified using a bespoke `@rbac` tag that specifies the action and resource the method requires. For example:

```js
/**
 * ...
 * @rbac action="create", resource="stytch.member"
 * ...
 */
```

## Testing

We use Jest for testing.

Run tests for all packages:

```bash
yarn test
```

Run tests for a specific package:

```bash
yarn workspace @stytch/vanilla-js test
```

Run tests for a specific package in watch mode:

```bash
yarn workspace @stytch/vanilla-js test --watch
```

### Storybook

For UI components in `@stytch/vanilla-js`, we use Storybook to develop and test components in isolation.

To start Storybook:

```bash
yarn workspace @stytch/vanilla-js storybook
# or
cd packages/vanilla-js && yarn storybook
```

After launching Storybook, it will be accessible at [`http://localhost:6006`](http://localhost:6006/).

While Storybook is running, you can run all Storybook tests from the command line:

```bash
yarn test-storybook
```

### Manual testing

You should also manually test changes before opening a PR. A quick way to do that is to follow the [Workbench](./README.md#workbench) instructions to run the demo app locally.

If you are a Stytch developer, for simple changes to the React or Vanilla JS SDK you can also open a PR and use the PR Vercel deployment to test your changes.

## Managing dependencies

We use Yarn Workspaces for per-project isolation and Turborepo for build pipeline management.
If you're familiar with NPM + single-artifact repos, here's a handy cheat sheet:

### Install a dependency

```bash
npm i mypackage@myversion --save-dev

yarn workspace @stytch/vanilla-js add mypackage@myversion -D
# or
cd packages/vanilla-js && yarn add mypackage@myversion -D
```

### Remove a dependency

```bash
npm rm mypackage@myversion --save-dev

yarn workspace @stytch/vanilla-js remove mypackage@myversion -D
# or
cd packages/vanilla-js && yarn remove mypackage@myversion -D
```

### Vulnerability management

We use Dependabot and GitHub code scanning for automated vulnerability management.

## Contents

Where possible, all code is written in [TypeScript](https://www.typescriptlang.org/). For React Native, native code is written in Kotlin, Swift, and Objective-C.

The monorepo is organized as follows:

## Packages

Internal and external packages live inside `packages`.

### SDKs

Our SDK packages are published to npm and are consumed by external developers (i.e., Stytch customers) directly.

- [`vanilla-js`](./packages/vanilla-js): an SDK for frontend JavaScript projects. It includes a stateful headless client that integrates with browser features (such as cookies and local storage). It also includes prebuilt UI built using Preact and a framework-agnostic interface for integrating with arbitrary frontend frameworks.
- [`react`](./packages/react): React-specific bindings for `vanilla-js`. This package only supports client-side rendering.
- [`nextjs`](./packages/nextjs): Next.js specific bindings for `vanilla-js`. This package is compatible with server-side rendering, including React-based, non-Next.js frameworks.

### Helper packages

We use some helper packages to better organize code. Some of these packages are published to npm as dependencies of other packages, but they are not intended to be referenced directly by external developers.

- [`core`](./packages/core): a package containing constants, types, and most of the business logic around our different product offerings
  (EML, OTP, etc) as well as the logic for managing sessions (token refresh, etc), PKCE, and the Subscription Service which coordinates
  sharing User and Session data across services. This package is consumed directly by `vanilla-js`.

  It declares a template for the `StytchClient` (the main export of Stytch SDKs),
  and includes all the logic that is SDK target agnostic. The components that are specific to individual SDKs
  (`StorageClient` for handling persistent storage, `NetworkClient` for handling network calls/telemetry/metadata) are then implemented
  by individual SDK packages and used to create and export a `StytchClient` object,
  which is the export to be used by external developers leveraging Stytch SDKs for their own projects.

  This package is published to npm as a dependency of other packages (including `vanilla-js`), but it is not intended to be used directly by external developers.

- [`js-utils`](./packages/js-utils): a package containing utility functions used by other packages, including `vanilla-js`, `react`, and `nextjs`. This package is not published to npm; its contents are bundled into other packages as part of the build process.

### Internal packages

- [`eslint-config-custom`](./packages/eslint-config-custom): an internal package containing `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)

## Services

- [`clientside-services`](./services/clientside-services): static files that are loaded from Stytch servers at runtime rather than the client's own network.

  Today, this is used for:

  - Google One Tap's secure communication with the Stytch API using private cookies.
  - Phone number formatting, which is lazily loaded to avoid bloating our distributed bundle

- [`e2e-tests`](./services/e2e-tests): An internal set of end-to-end tests that run against the React demo applications using [Cypress](https://www.cypress.io/).
