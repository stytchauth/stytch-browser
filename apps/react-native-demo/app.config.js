export default ({ config }) => {
  return {
    ...config,
    name: 'react-native-demo',
    slug: 'react-native-demo',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    newArchEnabled: true,
    assetBundlePatterns: ['**/*'],
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.stytch.sdk.rn.demo',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.stytch.sdk.rn.demo',
      associatedDomains: [`webcredentials:${process.env.STYTCH_WEBAUTHN_DOMAIN}`],
      infoPlist: {
        UIBackgroundModes: ['fetch'],
        NSFaceIDUsageDescription: 'Log in with Biometrics',
        ITSAppUsesNonExemptEncryption: false,
      },
      usesAppleSignIn: true,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    scheme: ['rndemo', `stytch-ui-${process.env.STYTCH_PUBLIC_TOKEN}`],
    owner: 'stytch',
    plugins: ['expo-apple-authentication', ['expo-build-properties', {}], "expo-font", "expo-image"],
    extra: {
      eas: {
        projectId: '0c10860c-9a1a-4cb9-a3ed-74283b219f54',
      },
      stytchPublicToken: process.env.STYTCH_PUBLIC_TOKEN,
      testAPIURL: process.env.STYTCH_TEST_API_URL,
      liveAPIURL: process.env.STYTCH_LIVE_API_URL,
      dfpBackendURL: process.env.STYTCH_DFP_BACKEND_URL,
      webAuthnDomain: process.env.STYTCH_WEBAUTHN_DOMAIN,
    },
  };
};
