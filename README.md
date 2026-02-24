# Stytch JavaScript SDK monorepo

This repo contains Stytch JavaScript SDKs.

We welcome contributions from the community!

## Packages

This monorepo contains the following published npm packages:

- **[@stytch/vanilla-js](https://www.npmjs.com/package/@stytch/vanilla-js)** - Core JavaScript SDK for frontend projects
- **[@stytch/react](https://www.npmjs.com/package/@stytch/react)** - React-specific bindings for the JavaScript SDK
- **[@stytch/nextjs](https://www.npmjs.com/package/@stytch/nextjs)** - Next.js specific bindings with SSR support
- **[@stytch/react-native](https://www.npmjs.com/package/@stytch/react-native)** - React Native SDK

### Installation

See our [JS SDK Documentation](https://stytch.com/docs/sdks/installation) for complete instructions.

## Documentation

See example requests and responses for all the endpoints in the [Stytch JS SDK Reference](https://stytch.com/docs/sdks).

Our JS SDK also exposes in-line documentation in your IDE, just hover over a method to see it.

## Support

If you have questions, found a bug or want help troubleshooting, join us in [Slack](https://stytch.com/docs/resources/support/overview) or email support@stytch.com.

If you've found a security vulnerability, please follow our [responsible disclosure instructions](https://stytch.com/docs/resources/security-and-trust/security#:~:text=Responsible%20disclosure%20program).

## Example apps

You can find example apps that use our JS SDK here:

- [Consumer example apps](https://stytch.com/docs/quickstarts/frontend-example-apps)
- [B2B example apps](https://stytch.com/docs/b2b/quickstarts/frontend-example-apps)

### Workbench

We also offer several "workbench" apps, apps that let you explore all the available methods in the SDK without simulating a real login experience.

These are great for trying things out or quickly making example calls to see the response or testing changes to the code locally.

The following workbench apps are also available in Vercel:

- React Consumer Demo App - https://stytch-browser-react-demo.vercel.app/configure
- React B2B Demo App - https://stytch-browser-react-b2b-demo.vercel.app/configure

After building dependencies, you can also run demo apps from `/apps`.
There are a few ways to run a demo app:

1. Build all dependencies

   ```bash
   yarn build
   cd apps/react-demo
   ```

2. If this is the first time, set up configurations

   ```bash
   # You need a public token from your Stytch dashboard
   # For local development, you can test against the production backend
   # If you are a Stytch developer, you can also test against staging or your remote dev if you're testing backend changes
   cp .env.prod .env.local
   vi .env.local
   ```

3. Start the demo app and use Turborepo Pipelines to watch and recompile all dependencies together:

   ```bash
   yarn start

   # for react-demo
   yarn dev:react

   # for react-b2b-demo
   yarn dev:b2b:react

   # for next-demo
   yarn dev:next
   ```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to submit issues, pull requests, and contribute to the project.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md)

## Security

If you discover a security vulnerability, please report it to us at `security@stytch.com`. See our [Security Policy](SECURITY.md) for more details.

## Code of Conduct

Everyone interacting in Stytch codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).
