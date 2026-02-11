# Stytch Javascript SDK

[![Slack Link](https://img.shields.io/badge/chat-stytch.slack.com-FD4E43)](https://stytch.slack.com)

## Installation

```sh
npm install @stytch/vanilla-js --save
```

## Usage

The vanilla Stytch JavaScript SDK is built on open web standards and is compatible with all JavaScript frameworks.

### B2C UI components

The Stytch UI elements provides prebuilt components such as our login form.

```js
import { createStytchClient } from '@stytch/vanilla-js/b2b';

const stytch = createStytchClient('public-token-test-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

// Call Stytch APIs from the browser
stytch.magicLinks.email.loginOrCreate('charles.babbage@example.com');

// Register the custom element
customElements.define('stytch-ui', StytchUI);

// Pass in the StytchClient and config
const login = document.getElementById('stytch-ui');
login.render({
  client: stytch,
  config: {
    products: [Products.emailMagicLinks, Products.oauth],
    oauthOptions: {
      providers: [{ type: 'google' }],
    },
    sessionOptions: {
      sessionDurationMinutes: 60,
    },
  },
});
```

### B2C headless

Developers that don't use Stytch UI elements can use the headless entrypoint instead

```js
import { StytchClient } from '@stytch/vanilla-js/headless';

const stytch = new StytchClient('public-token-test-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

// Call Stytch APIs from the browser
stytch.magicLinks.email.loginOrCreate('charles.babbage@example.com');
```

### B2B UI components

The Stytch B2B UI elements provides prebuilt components such as our login form.

```js
import { createStytchB2BClient, StytchB2B } from '@stytch/vanilla-js/b2b';

const stytch = createStytchB2BClient('public-token-test-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

// Register the custom element
customElements.define('stytch-ui', StytchB2B);

// Pass in the StytchClient and config
const login = document.getElementById('stytch-ui');
login.render({
  client: stytch,
  config: {
    products: [Products.emailMagicLinks, Products.oauth],
    oauthOptions: {
      providers: [{ type: 'google' }],
    },
    sessionOptions: {
      sessionDurationMinutes: 60,
    },
  },
});
```

### B2B headless

Developers that don't use Stytch UI elements can use the headless entrypoint instead

```js
import { StytchB2BHeadlessClient } from '@stytch/vanilla-js/b2b/headless';

const stytch = new StytchB2BHeadlessClient('public-token-test-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

// Call Stytch APIs from the browser
stytch.magicLinks.email.loginOrSignup({
  email_address: 'charles.babbage@example.com',
  organization_id: 'organization-test-07971b06-ac8b-4cdb-9c15-63b17e653931',
});
```

For more information on how to use the Stytch SDK, please refer to the
[docs](https://stytch.com/docs/sdks).

## See Also

- For usage with React: see the [@stytch/react](https://www.npmjs.com/package/@stytch/react) library
  and [sample app](https://github.com/stytchauth/stytchjs-react-magic-links)
- For usage with Next.js: see the [@stytch/nextjs](https://www.npmjs.com/package/@stytch/nextjs) library
  and [sample app](https://github.com/stytchauth/stytch-nextjs-integration)
