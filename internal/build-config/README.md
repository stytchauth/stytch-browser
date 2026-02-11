# build-config

Shared Rollup config for published packages.

## Build output

This package is intended to provide a set of modern build outputs suitable for our target environments.

- `cjs`: CommonJS build output, suitable for Node.js. This output is bundled into fewer, larger files, which tends to make more sense for environments where CommonJS is typically used.
- `esm`: ES Modules build output, suitable for modern browsers. This output is left unbundled to allow for more efficient tree-shaking by downstream consumers.
- `cjs-dev`: like `cjs`, but intended for use in development environments.
- `esm-dev`: like `esm`, but intended for use in development environments.
- `cjs-legacy`: like `cjs`, but intended for use by legacy tools that do not understand the `exports` field in `package.json`. The main difference is the file extensions are `.js`, not `.cjs`. This output is intended for the `main` field in `package.json`.
- `esm-legacy`: like `esm`, but intended for use by legacy tools that do not understand the `exports` field in `package.json`. The main difference is the file extensions are `.js`, not `.mjs`. This output is intended for the `module` field in `package.json`.
