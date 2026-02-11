import React, { ReactNode } from 'react';
import { OneTapPositions } from '@stytch/core/public';
import { useTheme } from 'styled-components';
import { useGlobalReducer } from './GlobalContextProvider';
import { AppScreens } from './GlobalContextProvider';
import { EmailConfirmation } from './screens/Secondary/EmailConfirmation';
import { OTPConfirmation } from './screens/Secondary/OTPConfirmation';
import { MainScreen } from './screens/Main';
import { OTPAuthenticate } from './screens/Secondary/OTPAuthenticate';
import { Password } from './screens/Secondary/PasswordCreateAuthenticate';
import { ConnectWallet } from './screens/Crypto/ConnectWallet';
import { SignMessage } from './screens/Crypto/SignMessage';
import { SetupNewWallet } from './screens/Crypto/SetupNewWallet';
import { OtherCryptoWallets } from './screens/Crypto/OtherWallets';
import { Success } from './screens/Crypto/Success';
import { Error } from './screens/Crypto/Error';
import { GoogleOneTap } from '../components/GoogleOneTap';
import { PasswordForgot } from './screens/Password/PasswordForgot';
import { PasswordBreached } from './screens/Password/PasswordBreached';
import { PasswordSetNew } from './screens/Password/PasswordSetNew';
import { PasswordDedupe } from './screens/Password/PasswordDedupe';
import { ResetPasswordScreen } from './screens/Password/ResetPasswordScreen';
import { PasswordConfirmation } from './screens/Password/PasswordConfirmation';
import { useIsOnlyFloatingOneTap } from '../hooks/useIsOnlyFloatingOneTap';
import { PasskeyRegistrationStart } from './screens/Passkey/PasskeyRegistrationStart';
import { PasskeyRegistrationSuccess } from './screens/Passkey/PasskeyRegistrationSuccess';
import { PasskeyConfirmation } from './screens/Passkey/PasskeyConfirmation';
import { MainContainer } from '../components/MainContainer';
import { IDPConsentScreen } from './screens/IdentityProvider/IDPConsent';

const AppContainer: () => null | ReactNode = () => {
  const [state] = useGlobalReducer();
  const { displayWatermark } = useTheme();
  const isOnlyFloatingOneTap = useIsOnlyFloatingOneTap();
  const currentScreen = state.screen;

  const ScreenComponentMap: Record<AppScreens, ReactNode> = {
    [AppScreens.Main]: <MainScreen />,
    [AppScreens.PasskeyRegistrationStart]: <PasskeyRegistrationStart />,
    [AppScreens.PasskeyRegistrationSuccess]: <PasskeyRegistrationSuccess />,
    [AppScreens.PasskeyConfirmation]: <PasskeyConfirmation />,
    [AppScreens.PasswordResetForm]: <ResetPasswordScreen />,
    [AppScreens.PasswordCreateOrLogin]: <Password />,
    [AppScreens.PasswordForgot]: <PasswordForgot />,
    [AppScreens.PasswordBreached]: <PasswordBreached />,
    [AppScreens.PasswordSetNew]: <PasswordSetNew />,
    [AppScreens.PasswordDedupe]: <PasswordDedupe />,
    [AppScreens.PasswordConfirmation]: <PasswordConfirmation />,
    [AppScreens.EmailConfirmation]: <EmailConfirmation />,
    [AppScreens.OTPAuthenticate]: <OTPAuthenticate />,
    [AppScreens.OTPConfirmation]: <OTPConfirmation />,
    [AppScreens.CryptoConnect]: <ConnectWallet />,
    [AppScreens.CryptoSignMessage]: <SignMessage />,
    [AppScreens.CryptoOtherScreen]: <OtherCryptoWallets />,
    [AppScreens.CryptoSetupWallet]: <SetupNewWallet />,
    [AppScreens.CryptoError]: <Error />,
    [AppScreens.CryptoConfirmation]: <Success />,
    [AppScreens.IDPConsent]: <IDPConsentScreen />,
  };

  if (isOnlyFloatingOneTap) {
    return <GoogleOneTap position={OneTapPositions.floating} />;
  }

  return <MainContainer displayWatermark={displayWatermark}>{ScreenComponentMap[currentScreen]}</MainContainer>;
};

export default AppContainer;
