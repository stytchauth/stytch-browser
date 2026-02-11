# File size testbed

This sample app is used to check and debug bundle sizes when Stytch SDK is used in realistic environments.
The app builds each test case found under `src/` using both Vite and Webpack using comparable configuration in production mode.
This approximates how we expect our customers to use our SDK.
Note when reviewing file sizes that there will be some additional overhead added by each bundler that can be ignored.
In general, you should focus on the `vanilla-js` package size with brotli compression selected in Sonda.

## Test case structure

Each test case is a single `.tsx` file exporting an `app` const. Do not import React in the test case.

```tsx
import { StytchLogin, StytchProvider, createStytchClient } from '@stytch/react';
import { Products, type StytchLoginConfig } from '@stytch/react';

const stytch = createStytchClient('');

const config: StytchLoginConfig = {
  products: [Products.emailMagicLinks],
};

// Each case must export a const called app
export const app = (
  <StytchProvider stytch={stytch}>
    <StytchLogin config={config} />
  </StytchProvider>
);

/* eslint-disable no-console */
// Side effect needed to avoid Vite from aggressively tree shaking most of this away
console.log(app);
```

## Package Structure

```text
├── src/                    # Test case files
│   └── ...
├── dist/                   # Build outputs
│   ├── vite/               # Vite build outputs per test case
│   │   └── ...
│   └── webpack/            # Webpack build outputs per test case
│       └── ...
├── scripts/                # Build and configuration scripts
│   ├── build.ts            # Build script to produce dist
│   └── preview.config.ts   # preview command configuration
└── preview/                # A simple application to support the preview command
```

## Commands

Here are a few useful commands:

```bash
# Rebuilds all test cases
yarn build

# Open the Sonda report for a specific case in your browser
# See https://www.sonda.dev/
open dist/<bundler>/<case>/sonda.html
# For example:
open dist/vite/emailMagicLink/sonda.html

# Preview a case to make sure it runs
# Note that currently most cases just result in an error since we've not yet set them up with public token config
VITE_APP=<case> yarn preview
# For example:
VITE_APP=emailMagicLink yarn preview

# Run size limit
yarn size-limit
```
