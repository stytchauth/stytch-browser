import { Text, View } from 'react-native';
import {
  OAuthProviders,
  OTPMethods,
  RNUIProducts,
  StytchUI,
  StytchUIConfig,
  useStytch,
  useStytchUser,
} from '@stytch/react-native';
import { useEffect, useState } from 'react';

const config: StytchUIConfig = {
  productConfig: {
    products: [RNUIProducts.emailMagicLinks, RNUIProducts.otp, RNUIProducts.oauth],
    emailMagicLinksOptions: {},
    oAuthOptions: {
      providers: [
        { type: OAuthProviders.Google, provider_params: { prompt: 'select_account' } },
        { type: OAuthProviders.Apple },
        { type: OAuthProviders.Github },
      ],
    },
    otpOptions: {
      methods: [OTPMethods.SMS, OTPMethods.WhatsApp],
      expirationMinutes: 10,
    },
    sessionOptions: {
      sessionDurationMinutes: 30,
    },
    passwordOptions: {},
  },
};

export default function HomeScreen() {
  const stytch = useStytch();
  const { user } = useStytchUser();
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => setLoggedIn(!!user), [user, setLoggedIn]);

  if (!loggedIn) {
    return <StytchUI client={stytch} config={config}></StytchUI>;
  }

  return (
    <View>
      <Text>Canary in the coal mine</Text>
    </View>
  );
}
