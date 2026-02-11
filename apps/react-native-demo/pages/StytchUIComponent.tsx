import React, { useEffect } from 'react';
import {
  useStytch,
  StytchUI,
  StytchUIConfig,
  useStytchUser,
  RNUIProducts,
  OTPMethods,
  OAuthProviders,
} from '@stytch/react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'StytchUI'>;
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
export const StytchUIComponent = ({ navigation }: Props) => {
  const stytch = useStytch();
  const { user } = useStytchUser();
  useEffect(() => {
    if (user) {
      navigation.navigate('Profile');
    }
  }, [user, navigation]);
  return <StytchUI client={stytch} config={config}></StytchUI>;
};
