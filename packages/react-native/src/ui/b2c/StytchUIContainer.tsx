import React, { JSX, useEffect, useState } from 'react';
import { Linking, View } from 'react-native';

import { LoadingDialog } from './components/LoadingDialog';
import { useGlobalReducer } from './ContextProvider';
import { useDeeplinkParser } from './hooks/useDeeplinkParser';
import { Screen } from './screens';
import { EMLConfirmationScreen } from './screens/EMLConfirmationScreen';
import { MainScreen } from './screens/MainScreen';
import { NewUserScreen } from './screens/NewUserScreen';
import { OTPConfirmationScreen } from './screens/OTPConfirmationScreen';
import { PasswordResetSentScreen } from './screens/PasswordResetSentScreen';
import { ReturningUserScreen } from './screens/ReturningUserScreen';
import { SetPasswordScreen } from './screens/SetPasswordScreen';
import { SuccessScreen } from './screens/SuccessScreen';

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
