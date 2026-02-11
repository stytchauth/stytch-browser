import type { ComponentType } from 'react';

import { IconNames } from '../b2c/components/Icons';
import type { IconRegistry } from '../components/IconRegistry';
import { B2BOneTapProps } from './components/B2BOneTap';
import { OauthB2BButtonProps } from './components/OAuthB2BButton';
import { SSOButtonProps } from './components/SSOButton';
import { AppScreens, ButtonComponent, MainScreenComponent } from './types/AppScreens';

export type ProductId = 'emailMagicLinks' | 'emailOtp' | 'sso' | 'passwords' | 'oauth';

export type StytchB2BProduct = {
  id: ProductId;

  screens: Partial<Record<AppScreens, ComponentType>>;
  mainScreen?: Partial<Record<MainScreenComponent, ComponentType>>;
  icons?: Partial<IconRegistry<IconNames>>;

  // SsoAndOAuthButtons has some special logic which makes it incompatible with mainScreen
  ssoAndOAuthButtons?: Partial<{
    SsoAndOAuthButtons: ComponentType<{ buttons: ButtonComponent[] }>;
    B2BGoogleOneTap: ComponentType<B2BOneTapProps>;
    OAuthB2BButton: ComponentType<OauthB2BButtonProps>;
    SSOButton: ComponentType<SSOButtonProps>;
  }>;
};
