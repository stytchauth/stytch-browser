'use client';

import React from 'react';

import { B2BGoogleOneTap } from './components/B2BOneTap';
import { emailIcons, oauthIcons, ssoIcons } from './components/Icons';
import { OAuthB2BButton } from './components/OAuthB2BButton';
import { SSOButton } from './components/SSOButton';
import { EmailConfirmation } from './screens/EmailConfirmation';
import { EmailDiscoveryForm, EmailForm } from './screens/EmailForm';
import { EmailMethodSelectionScreen } from './screens/EmailMethodSelectionScreen';
import { EmailOTPEntryScreen } from './screens/EmailOTPEntryScreen';
import { PasswordsAuthenticate } from './screens/PasswordAuthenticate';
import { PasswordsEmailForm } from './screens/PasswordEmailForm';
import { PasswordsForgotForm } from './screens/PasswordForgotForm';
import { PasswordResetConfirmation } from './screens/PasswordResetConfirmation';
import { PasswordResetForm } from './screens/PasswordResetForm';
import { PasswordSetNew } from './screens/PasswordSetNew';
import { SsoAndOAuthButtons } from './screens/SsoAndOAuthButtons';
import { SSODiscoveryEmail } from './screens/SSODiscoveryEmail';
import { SSODiscoveryFallback } from './screens/SSODiscoveryFallback';
import { SSODiscoveryMenu } from './screens/SSODiscoveryMenu';
import { StytchB2BProduct } from './StytchB2BProduct';
import { AppScreens, MainScreenComponent } from './types/AppScreens';

const EmailFormWithoutPassword = () => <EmailForm showPasswordButton={false} />;
const EmailFormWithPassword = () => <EmailForm showPasswordButton />;
const EmailDiscoveryFormWithoutPassword = () => <EmailDiscoveryForm showPasswordButton={false} />;
const EmailDiscoveryFormWithPassword = () => <EmailDiscoveryForm showPasswordButton />;

export const emailMagicLinks: StytchB2BProduct = {
  id: 'emailMagicLinks',
  screens: {
    [AppScreens.EmailConfirmation]: EmailConfirmation,
    [AppScreens.EmailMethodSelection]: EmailMethodSelectionScreen,
  },
  mainScreen: {
    [MainScreenComponent.EmailForm]: EmailFormWithoutPassword,
    [MainScreenComponent.EmailDiscoveryForm]: EmailDiscoveryFormWithoutPassword,
    [MainScreenComponent.PasswordEmailCombined]: EmailFormWithPassword,
    [MainScreenComponent.PasswordEmailCombinedDiscovery]: EmailDiscoveryFormWithPassword,
  },
  icons: emailIcons,
};

export const emailOtp: StytchB2BProduct = {
  id: 'emailOtp',
  screens: {
    [AppScreens.EmailOTPEntry]: EmailOTPEntryScreen,
    [AppScreens.EmailMethodSelection]: EmailMethodSelectionScreen,
    [AppScreens.EmailConfirmation]: EmailConfirmation,
  },
  mainScreen: {
    [MainScreenComponent.EmailForm]: EmailFormWithoutPassword,
    [MainScreenComponent.EmailDiscoveryForm]: EmailDiscoveryFormWithoutPassword,
    [MainScreenComponent.PasswordEmailCombined]: EmailFormWithPassword,
    [MainScreenComponent.PasswordEmailCombinedDiscovery]: EmailDiscoveryFormWithPassword,
  },
  icons: emailIcons,
};

export const sso: StytchB2BProduct = {
  id: 'sso',
  screens: {
    [AppScreens.SSODiscoveryEmail]: SSODiscoveryEmail,
    [AppScreens.SSODiscoveryMenu]: SSODiscoveryMenu,
    [AppScreens.SSODiscoveryFallback]: SSODiscoveryFallback,
  },
  ssoAndOAuthButtons: {
    SsoAndOAuthButtons,
    SSOButton,
  },
  icons: ssoIcons,
};

export const passwords: StytchB2BProduct = {
  id: 'passwords',
  screens: {
    [AppScreens.PasswordEmailForm]: PasswordsEmailForm,
    [AppScreens.PasswordAuthenticate]: PasswordsAuthenticate,
    [AppScreens.PasswordForgotForm]: PasswordsForgotForm,
    [AppScreens.PasswordSetNewConfirmation]: PasswordSetNew,
    [AppScreens.PasswordResetForm]: PasswordResetForm,
    [AppScreens.PasswordResetVerifyConfirmation]: PasswordResetConfirmation,
  },
  mainScreen: {
    [MainScreenComponent.PasswordsEmailForm]: PasswordsEmailForm,
    [MainScreenComponent.PasswordEmailCombined]: EmailFormWithPassword,
    [MainScreenComponent.PasswordEmailCombinedDiscovery]: EmailDiscoveryFormWithPassword,
  },
  icons: emailIcons,
};

export const oauth: StytchB2BProduct = {
  id: 'oauth',
  screens: {},
  ssoAndOAuthButtons: {
    SsoAndOAuthButtons,
    B2BGoogleOneTap,
    OAuthB2BButton,
  },
  icons: oauthIcons,
};
