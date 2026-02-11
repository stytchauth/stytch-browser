# Migrating from @stytch/stytch-react

If you are migrating from [@stytch/stytch-react](https://www.npmjs.com/package/@stytch/stytch-react), follow the steps below:

### Step 1: Install the new library

```shell
# NPM
npm install @stytch/react

# Yarn
yarn add @stytch/react
```

### Step 2: Remove the old SDK

- Remove the `@styth/stytch-react` package
- If you are explicitly loading the `stytch.js` script in the document header, remove it. It isn't needed anymore.

```shell
# NPM
npm rm @stytch/stytch-react
# Yarn
yarn remove @stytch/stytch-react
```

### Step 3: Initialize the client in your Application Root

- Determine if you need the Headless or UI client. If you plan to use the `<StytchLogin />` component in your application then you should use the the UI client. Otherwise use the Headless client to minimize application bundle size.
- To create the Stytch Headless client, use `createStytchHeadlessClient` from `@stytch/react/headless`
- To create the Stytch UI client, use `createStytchClient` from `@stytch/react`
- Pass it into `<StytchProvider />` component from `@stytch/react`

```jsx
import React from 'react';
import { createStytchClient, StytchProvider } from '@stytch/react';

const stytch = createStytchClient(process.env.REACT_APP_STYTCH_PUBLIC_TOKEN);

function WrappedApp() {
  return (
    <StytchProvider stytch={stytch}>
      <App />
    </StytchProvider>
  );
}

export default WrappedApp;
```

### Step 4: Update calls to `useStytchUser` , `useStytchSession`, and `useStytchLazy`

- `useStytchUser` and `useStytchSession` hooks now return envelope objects - `{ user, isCached }` and `{ session, isCached }` respectively.
  - On first render the SDK will read user/session out of persistent storage, and serve them with `isCached: true` - at this point you’re reading the stale-while-revalidating value
  - The SDK will make network requests to pull the most up-to-date user and session objects, and serve them with `isCached: false`
- `useStytchLazy` is no longer required - you may always call `useStytch` now

```jsx
import React, { useEffect } from 'react';
import { useStytchUser } from '@stytch/react';

export default function Profile() {
  const router = useRouter();
  const { user, isCached } = useStytchUser();

  return (
    <Layout>
      <h1>Your {isCached ? 'Cached' : null} Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  );
}
```

### Step 5: UI Naming Changes

We've made a number of small changes to our naming conventions to make the API cleaner and easier to understand.

- The `<Stytch />` login component is now called `<StytchLogin />`
- The `OAuthProvidersTypes` enum is now called `OAuthProviders`
- The `SDKProductTypes` enum is now called `Products`
- There are some additional changes to the `presentation` config documented [here](https://stytch.com/docs/sdks/javascript-sdk#resources_migration-guide_v-zero-five)
