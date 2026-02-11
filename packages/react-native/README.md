# Stytch React Native SDK

## Installation

With `npm`
`npm install @stytch/react-native @stytch/react-native-inappbrowser-reborn --save`

If your project uses a bare React Native workflow on iOS:
`cd ios && pod install && cd ..`

## Dependencies

The Stytch React Native SDK uses React v17+ and React Native v63+.

The Biometrics product depends on iOS 13+ and Android 6+. We only support Class 3 biometric sensors on Android. If you are testing biometrics on an iOS simulator or Android emulator, please ensure you are using one of the following versions: iOS 13 or 14, Android 11 or below. This should not be an issue on physical devices.

## Documentation

For full documentation please refer to [Stytch's React Native SDK documentation](https://stytch.com/docs/mobile-sdks).

You can find the changelog [here](https://stytch.com/docs/mobile-sdks/react-native-sdk/changelog).

## Example Usage

Check out our example app [here](https://github.com/stytchauth/stytch-react-native-integration).

## Testing

To test your integration of the Stytch React Native SDK, we recommend creating methods that take the StytchClient as a parameter when using the client to begin/complete authentication, and then stubbing the StytchClient when testing those methods.

For example, the following method uses the StytchClient to authenticate a magic link.

```javascript
export const authenticate = (
  token: string,
  stytch: StytchClient,
  onSuccess: (res: MagicLinksAuthenticateResponse) => void,
  onFailure: () => void,
) => {
  stytch.magicLinks
    .authenticate(token, { session_duration_minutes: 60 })
    .then((res) => {
      onSuccess(res);
    })
    .catch((e) => {
      onFailure();
    });
};
```

In order to test that this method passes the response into the `onSuccess` method, you could write the following test:

```javascript
import { authenticate } from '../EMLAuthenticateScreen';

const mockStytchClient = {
  magicLinks: {
    authenticate: jest.fn(() => Promise.resolve({ user_id: 'abc-123' })),
  },
};

describe('authenticate', () => {
  it('returns data on success', async () => {
    let userData;
    await authenticate(
      'mock_token',
      mockStytchClient,
      (res) => {
        userData = res;
      },
      () => console.log('success'),
    );
    expect(userData.user_id).toBe('abc-123');
  });
});
```

The above example asserts that your method handles a successful response as expected. You can use this system in order to test any potential successes (with `Promise.resolve` in the `mockStytchClient`) or failures (with `Promise.reject` in the `mockStytchClient`) that you might expect from Stytch.

If you need to exercise component functionality and cannot abstract the logic into its own function, you can also create mock StytchClients and return them from the useStytch hook like this.

```javascript
import { useStytch } from '@stytch/react-native';
import { MyComponent } from './MyComponent';

jest.mock('@stytch/react-native', () => ({
  useStytch: jest.fn(),
}));

describe('MyComponent', () => {
  it('Does something', () => {
    const mockStytchClient = {
      magicLinks: {
        email: {
          loginOrCreate: jest.fn(),
        },
      },
    };
    useStytch.mockReturnValue(mockStytchClient);

    const component = renderer.create(<MyComponent />);
    expect(mockStytchClient.magicLinks.email.loginOrCreate).toHaveBeenCalledWith('user@example.com');
  });
});
```

The above example tests that the `MyComponent` component calls the `StytchClient` method `magicLinks.email.loginOrCreate` with a specific input.

## Typescript Support

There are built in typescript definitions in the npm package.

## Get help and join the community

#### Stytch community Slack

Join the discussion, ask questions, and suggest new features in our ​[Slack community](https://stytch.com/docs/resources/support/overview)!

#### Need support?

Check out the [Stytch Forum](https://forum.stytch.com/) or email us at [support@stytch.com](mailto:support@stytch.com).
