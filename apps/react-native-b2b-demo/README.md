## React Native Demo

This is a demo app that uses the Stytch SDKs within React Native, using Expo Dev Client.

### Getting Started

[Create an Expo account](https://expo.dev/signup), and log in:

```bash
eas login
```

Ensure you have access to the [stytch](https://expo.dev/accounts/stytch) organization in Expo.

### Development

You will need to install [direnv](https://direnv.net/) and run `direnv allow` in this directory.

```bash
npm install -g eas-cli
cp .envrc.template .envrc
vi .envrc
```

Then create a development build:

```bash
eas build --profile development --platform android|ios|all
```

Start a local server for the app:

```bash
npx expo start --dev-client
```

Open the app by pressing 'a' for Android, or 'i' for iOS.

### Preview build

You can create a preview build for internal distribution. This is useful for testing.

First push the secrets/environment variables from your `.envrc`:

```bash
eas secret:push --scope project --env-file .envrc --force
```

Then create the preview build:

```bash
eas build --profile preview --platform android|ios|all
```
