import type { OTPMethods } from '@stytch/core/public';
import type { ComponentType } from 'react';

import type { Values } from '../../utils/types';
import type { IconRegistry } from '../components/IconRegistry';
import type { StartPasskeyAuth } from '../hooks/usePromptPasskey';
import type { IconNames } from './components/Icons';
import type { AppScreens } from './GlobalContextProvider';

export type ProductId =
  | 'emailMagicLinks'
  | 'oauth'
  | 'otp'
  | 'crypto'
  | 'passwords'
  | 'passkeys'
  | 'passkeyRegistration';

// tabs types
export const MagicLinkMethods = {
  Email: 'emailMagicLinks',
} as const;
export type MagicLinkMethods = Values<typeof MagicLinkMethods>;

export const PasswordMethods = {
  Email: 'passwords',
} as const;
export type PasswordMethods = Values<typeof PasswordMethods>;

export type TabMethods = OTPMethods | MagicLinkMethods | PasswordMethods;

// mainScreen types
export type MainScreenKey = 'oauth' | 'crypto' | 'login-form' | 'divider' | 'passkey-button';
export type MainScreenGroup = MainScreenKey | MainScreenKey[];

export type MainScreenChildProps = {
  startPasskeyAuth: StartPasskeyAuth;
};

export type StytchProduct = Readonly<{
  id: ProductId;

  screens: Partial<Record<AppScreens, ComponentType>>;
  tabs?: Partial<Record<TabMethods, ComponentType>>;
  mainScreen?: Partial<Record<MainScreenKey, ComponentType<MainScreenChildProps>>>;
  icons?: Partial<IconRegistry<IconNames>>;
}>;
