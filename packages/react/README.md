# @stytch/react

Stytch's React Library

## Install

With `npm`:

```shell
npm install @stytch/react --save
```

## Documentation

For full documentation please refer to Stytch's JavaScript SDK documentation at https://stytch.com/docs/sdks.

## Example Usage

```javascript
import { createStytchClient, Products, StytchProvider } from '@stytch/react';

const stytch = createStytchClient('public-token-<find yours in the stytch dashboard>');

// Wrap your App in the StytchProvider
// (If you are using app router this need to be in a separate file with a 'use client' directive)
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
