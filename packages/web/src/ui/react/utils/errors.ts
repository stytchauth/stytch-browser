// The strings in this file are only for developers
/* eslint-disable lingui/no-unlocalized-strings */

import { RUN_IN_DEV } from '@stytch/core';

export function serverRenderError(name: string) {
  RUN_IN_DEV(() => {
    if (typeof window === 'undefined') {
      throw new Error(
        `<${name} /> cannot be rendered on the server. If you are using Next.js, use the @stytch/nextjs package or 'use client' directives`,
      );
    }
  });
}

export const noProviderError = (item: string, provider = 'StytchProvider'): string =>
  `${item} can only be used inside <${provider}>.`;

export const providerMustBeUniqueError = 'You cannot render a <StytchProvider> inside another <StytchProvider>.';

export const cannotInvokeMethodOnServerError = (path: string) =>
  process.env.NODE_ENV === 'production'
    ? `[Stytch] Invalid server-side function call to ${path}`
    : `[Stytch] Invalid server-side function call to ${path}.
The Stytch JavaScript SDK is intended to only be used on the client side.
Make sure to wrap your API calls in a hook to ensure they are executed on the client.

\`\`\`
const myComponent = () => {
  const stytch = useStytch();
  // This will error out on the server.
  stytch.magicLinks.authenticate(...);
  useEffect(() => {
    // This will work well
    stytch.magicLinks.authenticate(...);
  }, []);
}
\`\`\`

If you want to make API calls from server environments, please use the Stytch Node Library
https://www.npmjs.com/package/stytch.`;
