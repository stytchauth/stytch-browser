import React, { JSX, useState, useEffect } from 'react';
import { useGlobalReducer } from './ContextProvider';
import { Screen } from './screens';
import { View, Linking } from 'react-native';
import { MainScreen } from './screens/MainScreen';
import { useDeeplinkParser } from './hooks/useDeeplinkParser';
import { LoadingDialog } from './components/LoadingDialog';
import { NewUserScreen } from './screens/NewUserScreen';
import { EMLConfirmationScreen } from './screens/EMLConfirmationScreen';
import { OTPConfirmationScreen } from './screens/OTPConfirmationScreen';
import { ReturningUserScreen } from './screens/ReturningUserScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { PasswordResetSentScreen } from './screens/PasswordResetSentScreen';
import { SetPasswordScreen } from './screens/SetPasswordScreen';

export const StytchUIContainer: () => JSX.Element = () => {
  const [state] = useGlobalReducer();
  const { parseDeeplink } = useDeeplinkParser();
  const [didParseDeeplink, setDidParseDeepLink] = useState(false);
  const currentScreen = state.screen;
  const ScreenComponentMap: Record<Screen, JSX.Element> = {
    [Screen.Main]: <MainScreen />,
    [Screen.OTPConfirmation]: <OTPConfirmationScreen />,
    [Screen.EMLConfirmation]: <EMLConfirmationScreen />,
    [Screen.NewUser]: <NewUserScreen />,
    [Screen.ReturningUser]: <ReturningUserScreen />,
    [Screen.PasswordResetSent]: <PasswordResetSentScreen />,
    [Screen.SetPassword]: <SetPasswordScreen />,
    [Screen.Success]: <SuccessScreen />,
  };
  useEffect(() => {
    Linking.addEventListener('url', ({ url }) => {
      if (url.startsWith('stytch-ui') && !didParseDeeplink) {
        setDidParseDeepLink(true);
        parseDeeplink(url);
      }
    });
  }, [parseDeeplink, didParseDeeplink, setDidParseDeepLink]);
  return (
    <>
      <View testID="StytchUI" style={{ height: '100%' }}>
        {ScreenComponentMap[currentScreen]}
      </View>
      {state.screenState.isSubmitting && <LoadingDialog />}
    </>
  );
};
