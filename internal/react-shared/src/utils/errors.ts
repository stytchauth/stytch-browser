export const noProviderError = (item: string, provider = 'StytchProvider'): string =>
  `${item} can only be used inside <${provider}>.`;

export const providerMustBeUniqueError = 'You cannot render a <StytchProvider> inside another <StytchProvider>.';

export const noHeadlessClientError = `Tried to create a Stytch Login UI element using the Stytch Headless SDK.
You must use the UI SDK to use UI elements.
Please make sure you are using a Stytch UI client, not a Stytch Headless client.`;

export const cannotInvokeMethodOnServerError = (path: string) =>
  `[Stytch] Invalid serverside function call to ${path}.
The Stytch Javascript SDK is intended to ony be used on the client side.
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
https://www.npmjs.com/package/stytch.
`;
