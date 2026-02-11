import { RNUIProductConfig, RNUIProducts } from '@stytch/core/public';
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, StytchStyles } from '../shared/config';

export type StytchUIConfig = {
  productConfig: RNUIProductConfig;
  styles?: StytchStyles;
};

export const DEFAULT_UI_CONFIG: StytchUIConfig = {
  productConfig: {
    products: [RNUIProducts.emailMagicLinks],
    emailMagicLinksOptions: {},
    oAuthOptions: {
      providers: [],
    },
    otpOptions: {
      methods: [],
      expirationMinutes: 2,
    },
    sessionOptions: {
      sessionDurationMinutes: 30,
    },
    passwordOptions: {},
  },
  styles: {
    darkTheme: DEFAULT_DARK_THEME,
    lightTheme: DEFAULT_LIGHT_THEME,
  },
};
