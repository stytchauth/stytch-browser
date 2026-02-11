import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AuthFlowType,
  B2BOAuthProviders,
  B2BProducts,
  Callbacks,
  StytchB2BUI,
  StytchEventType,
  StytchRNB2BUIConfig,
} from '@stytch/react-native/';
import { useStytchB2BClient } from '@stytch/react-native/b2b';
import React from 'react';

import { RootStackParamList } from '../App';

export type B2BUIFlowType =
  | 'single_org_no_mfa'
  | 'single_org_with_mfa'
  | 'discovery'
  | 'org_passwords_only'
  | 'discovery_passwords_only';

type Props = NativeStackScreenProps<RootStackParamList, 'StytchB2BUIComponent'>;
const config_singleOrg_noMFA: StytchRNB2BUIConfig = {
  productConfig: {
    products: [
      B2BProducts.emailMagicLinks,
      B2BProducts.emailOtp,
      B2BProducts.oauth,
      B2BProducts.passwords,
      B2BProducts.sso,
    ],
    authFlowType: AuthFlowType.Organization,
    sessionOptions: { sessionDurationMinutes: 60 },
    oauthOptions: {
      providers: [B2BOAuthProviders.Google],
    },
  },
  organizationSlug: 'no-mfa',
};

const config_singleOrg_withMFA: StytchRNB2BUIConfig = {
  productConfig: {
    products: [
      B2BProducts.emailMagicLinks,
      B2BProducts.emailOtp,
      B2BProducts.oauth,
      B2BProducts.passwords,
      B2BProducts.sso,
    ],
    authFlowType: AuthFlowType.Organization,
    sessionOptions: { sessionDurationMinutes: 60 },
    oauthOptions: {
      providers: [B2BOAuthProviders.Google],
    },
  },
  organizationSlug: 'enforced-mfa',
};

const config_discovery: StytchRNB2BUIConfig = {
  productConfig: {
    products: [
      B2BProducts.emailMagicLinks,
      B2BProducts.emailOtp,
      B2BProducts.oauth,
      B2BProducts.passwords,
      B2BProducts.sso,
    ],
    authFlowType: AuthFlowType.Discovery,
    sessionOptions: { sessionDurationMinutes: 60 },
    oauthOptions: {
      providers: [B2BOAuthProviders.Google],
    },
  },
  organizationSlug: null,
};

const config_org_passwords_only: StytchRNB2BUIConfig = {
  productConfig: {
    products: [B2BProducts.passwords],
    authFlowType: AuthFlowType.Organization,
    sessionOptions: { sessionDurationMinutes: 60 },
  },
  organizationSlug: 'enforced-mfa',
};

const config_discovery_passwords_only: StytchRNB2BUIConfig = {
  productConfig: {
    products: [B2BProducts.passwords],
    authFlowType: AuthFlowType.Discovery,
    sessionOptions: { sessionDurationMinutes: 60 },
  },
  organizationSlug: null,
};

export const StytchB2BUIComponent = ({ navigation, route }: Props) => {
  const stytch = useStytchB2BClient();
  const callbacks: Callbacks = {
    onEvent(event) {
      // eslint-disable-next-line no-console
      console.log('onEvent called: ', event.type);
      if (event.type == StytchEventType.AuthenticateFlowComplete) {
        navigation.navigate('Welcome');
      }
    },
    onError(error) {
      // eslint-disable-next-line no-console
      console.log('onError called: ', error.message);
    },
  };
  let config = config_singleOrg_noMFA;
  if (route.params.type == 'single_org_with_mfa') {
    config = config_singleOrg_withMFA;
  } else if (route.params.type == 'discovery') {
    config = config_discovery;
  } else if (route.params.type == 'org_passwords_only') {
    config = config_org_passwords_only;
  } else if (route.params.type == 'discovery_passwords_only') {
    config = config_discovery_passwords_only;
  }
  return <StytchB2BUI client={stytch} config={config} callbacks={callbacks}></StytchB2BUI>;
};

export default StytchB2BUIComponent;
