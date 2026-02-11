import React, { ReactNode } from 'react';

import Logo from '../components/atoms/Logo';
import MainContainer from '../components/molecules/MainContainer';
import { usePresentation } from '../components/PresentationConfig';
import { useIsOnlyFloatingOneTap } from '../hooks/useIsOnlyFloatingOneTap';
import { AppScreens, useConfig, useGlobalReducer } from './GlobalContextProvider';
import { MainScreen } from './screens/Main';
import { useProductComponents } from './utils';

const AppContainer: () => null | ReactNode = () => {
  const [state] = useGlobalReducer();
  const config = useConfig();
  const { displayWatermark, theme, options } = usePresentation();
  const isOnlyFloatingOneTap = useIsOnlyFloatingOneTap(config);
  const currentScreen = state.screen;

  const screenComponentMap = useProductComponents(config.products, 'screens');

  if (isOnlyFloatingOneTap) {
    const { FloatingOneTap } = screenComponentMap;
    return <FloatingOneTap />;
  }

  // MainScreen is omitted from StytchProduct since it's used by everything
  const ScreenComponent = currentScreen === AppScreens.Main ? MainScreen : screenComponentMap[currentScreen];
  return (
    <MainContainer theme={theme} displayWatermark={displayWatermark}>
      {options.logo && <Logo appLogo={options.logo} />}

      <ScreenComponent />
    </MainContainer>
  );
};

export default AppContainer;
