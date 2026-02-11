import { CommonB2BLoginConfig } from '@stytch/core';
import { AuthFlowType } from '@stytch/core/public';

import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, StytchStyles } from '../shared/config';

export enum B2BProducts {
  emailMagicLinks = 'emailMagicLinks',
  emailOtp = 'emailOtp',
  sso = 'sso',
  passwords = 'passwords',
  oauth = 'oauth',
}

export type StytchRNB2BUIConfig = {
  productConfig: CommonB2BLoginConfig & { products: B2BProducts[] };
  organizationSlug: string | null;
  styles?: StytchStyles;
};

export const DEFAULT_UI_CONFIG: StytchRNB2BUIConfig = {
  productConfig: {
    products: [B2BProducts.emailMagicLinks],
    authFlowType: AuthFlowType.Organization,
    sessionOptions: {
      // default to 5 since that's the minimum; anything higher _could_ conflict with project settings
      sessionDurationMinutes: 5,
    },
  },
  organizationSlug: null,
  styles: {
    darkTheme: DEFAULT_DARK_THEME,
    lightTheme: DEFAULT_LIGHT_THEME,
  },
};
