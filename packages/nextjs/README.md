# @stytch/nextjs

Stytch's Next.js Library

## Install

With `npm`:

```shell
npm install @stytch/nextjs --save
```

## Documentation

This package contains several entrypoints, depending on if you are using the B2B or B2C stytch product.

```javascript
// Stytch B2C Product
import { createStytchClient, StytchProvider } from '@stytch/nextjs';

// The headless entrypoint does not bundle UI elements, and is a much smaller package
import { createStytchClient } from '@stytch/nextjs/headless';

// Stytch B2B Product
import { createStytchB2BClient, StytchB2B } from '@stytch/nextjs/b2b';

// The headless entrypoint does not bundle UI elements, and is a much smaller package
import { createStytchB2BClient } from '@stytch/nextjs/b2b/headless';
```

For full documentation please refer to Stytch's JavaScript SDK documentation on https://stytch.com/docs/sdks.

## Example Usage

```javascript
import { createStytchClient, Products, StytchProvider } from '@stytch/nextjs';

const stytch = createStytchClient('public-token-<find yours in the stytch dashboard>');

// Wrap your App in the StytchProvider
const Root = () => (
  <StytchProvider stytch={stytch}>
    <App />
  </StytchProvider>
);

// Now use Stytch in your components
const App = () => {
  const config = {
    products: [Products.emailMagicLinks],
    emailMagicLinksOptions: {
      loginRedirectURL: 'https://example.com/authenticate',
      loginExpirationMinutes: 30,
      signupRedirectURL: 'https://example.com/authenticate',
      signupExpirationMinutes: 30,
      createUserAsPending: true,
    },
  };

  const presentation = {
    theme: { primary: '#0577CA' },
    options: {},
  };

  const callbacks = {
    onEvent: (message) => console.log(message),
    onError: (message) => console.log(message),
  };

  return (
    <div id="login">
      <StytchLogin config={config} presentation={presentation} callbacks={callbacks} />
    </div>
  );
};
```

## TypeScript Support

There are built in TypeScript definitions in the npm package.

## Migrating from @stytch/stytch-react

See [this migration guide](./docs/stytch-react-migration.md)
