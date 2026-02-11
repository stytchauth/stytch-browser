'use client';

import { OneTapPositions, OTPMethods } from '@stytch/core/public';
import React from 'react';

import { GoogleOneTap } from './components/GoogleOneTap';
import { cryptoIcons, emailIcons, oauthIcons } from './components/Icons';
import { AppScreens } from './GlobalContextProvider';
import { ConnectWallet } from './screens/Crypto/ConnectWallet';
import { Error } from './screens/Crypto/Error';
import { OtherCryptoWallets } from './screens/Crypto/OtherWallets';
import { SetupNewWallet } from './screens/Crypto/SetupNewWallet';
import { SignMessage } from './screens/Crypto/SignMessage';
import { Success } from './screens/Crypto/Success';
import { CryptoWalletButtons } from './screens/Crypto/WalletButtons';
import { LoginForm } from './screens/Main/LoginForm';
import { MagicLinkEmailForm } from './screens/Main/LoginForm/MagicLinkForm';
import { OTPEmailForm, PhoneForm } from './screens/Main/LoginForm/OTPForm';
import { PasskeyButton } from './screens/Main/LoginForm/PasskeyButton';
import { PasswordsEmailForm } from './screens/Main/LoginForm/PasswordForm';
import { OAuthButtons } from './screens/Main/OAuthButtons';
import { PasskeyConfirmation } from './screens/Passkey/PasskeyConfirmation';
import { PasskeyRegistrationStart } from './screens/Passkey/PasskeyRegistrationStart';
import { PasskeyRegistrationSuccess } from './screens/Passkey/PasskeyRegistrationSuccess';
import { PasswordBreached } from './screens/Password/PasswordBreached';
import { PasswordConfirmation } from './screens/Password/PasswordConfirmation';
import { PasswordDedupe } from './screens/Password/PasswordDedupe';
import { PasswordForgot } from './screens/Password/PasswordForgot';
import { PasswordSetNew } from './screens/Password/PasswordSetNew';
import { ResetPasswordScreen } from './screens/Password/ResetPasswordScreen';
import { EmailConfirmation } from './screens/Secondary/EmailConfirmation';
import { OTPAuthenticate } from './screens/Secondary/OTPAuthenticate';
import { OTPConfirmation } from './screens/Secondary/OTPConfirmation';
import { PasswordCreateAuthenticate } from './screens/Secondary/PasswordCreateAuthenticate';
import { MagicLinkMethods, PasswordMethods, StytchProduct } from './StytchProduct';

const PhoneFormSMS = () => <PhoneForm method={OTPMethods.SMS} />;
const PhoneFormWhatsApp = () => <PhoneForm method={OTPMethods.WhatsApp} />;
const MainWalletButtons = () => <CryptoWalletButtons type="main" />;
const FloatingOneTap = () => <GoogleOneTap position={OneTapPositions.floating} />;

export const emailMagicLinks: StytchProduct = {
  id: 'emailMagicLinks',
  screens: {
    [AppScreens.EmailConfirmation]: EmailConfirmation,
  },
  tabs: {
    [MagicLinkMethods.Email]: MagicLinkEmailForm,
  },
  mainScreen: {
    'login-form': LoginForm,
  },
  icons: emailIcons,
};

export const oauth: StytchProduct = {
  id: 'oauth',
  screens: {
    [AppScreens.FloatingOneTap]: FloatingOneTap,
  },
  mainScreen: {
    oauth: OAuthButtons,
  },
  icons: oauthIcons,
};

export const otp: StytchProduct = {
  id: 'otp',
  screens: {
    [AppScreens.OTPAuthenticate]: OTPAuthenticate,
    [AppScreens.OTPConfirmation]: OTPConfirmation,
  },
  tabs: {
    [OTPMethods.Email]: OTPEmailForm,
    [OTPMethods.SMS]: PhoneFormSMS,
    [OTPMethods.WhatsApp]: PhoneFormWhatsApp,
  },
  mainScreen: {
    'login-form': LoginForm,
  },
  icons: emailIcons,
};

export const passwords: StytchProduct = {
  id: 'passwords',
  screens: {
    [AppScreens.PasswordCreateOrLogin]: PasswordCreateAuthenticate,
    [AppScreens.PasswordResetForm]: ResetPasswordScreen,
    [AppScreens.PasswordForgot]: PasswordForgot,
    [AppScreens.PasswordBreached]: PasswordBreached,
    [AppScreens.PasswordSetNew]: PasswordSetNew,
    [AppScreens.PasswordDedupe]: PasswordDedupe,
    [AppScreens.PasswordConfirmation]: PasswordConfirmation,
  },
  tabs: {
    [PasswordMethods.Email]: PasswordsEmailForm,
  },
  mainScreen: {
    'login-form': LoginForm,
  },
  icons: emailIcons,
};

export const passkeys: StytchProduct = {
  id: 'passkeys',
  screens: {
    [AppScreens.PasskeyConfirmation]: PasskeyConfirmation,
  },
  mainScreen: {
    'passkey-button': PasskeyButton,
  },
};

export const passkeyRegistration: StytchProduct = {
  id: 'passkeyRegistration',
  screens: {
    [AppScreens.PasskeyRegistrationStart]: PasskeyRegistrationStart,
    [AppScreens.PasskeyRegistrationSuccess]: PasskeyRegistrationSuccess,
  },
};

export const crypto: StytchProduct = {
  id: 'crypto',
  screens: {
    [AppScreens.CryptoConnect]: ConnectWallet,
    [AppScreens.CryptoSignMessage]: SignMessage,
    [AppScreens.CryptoOtherScreen]: OtherCryptoWallets,
    [AppScreens.CryptoSetupWallet]: SetupNewWallet,
    [AppScreens.CryptoError]: Error,
    [AppScreens.CryptoConfirmation]: Success,
  },
  mainScreen: {
    crypto: MainWalletButtons,
  },
  icons: cryptoIcons,
};
