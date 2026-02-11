import React, { useState, useEffect } from 'react';
import { GlobalContextProvider } from './ContextProvider';
import { StytchB2BUIContainer } from './StytchB2BUIContainer';
import { readB2BInternals } from '../../internals';
import { StytchB2BClient } from '../../b2b/StytchB2BClient';
import { StytchRNB2BUIConfig, DEFAULT_UI_CONFIG } from './config';
import merge from 'lodash.merge';
import { StytchTheme } from '../shared/config';
import { useColorScheme } from 'react-native';
import StytchReactNativeModule from '../../native-module';
import { Platform } from '../../native-module/types';
import { DEFAULT_UI_STATE, UIState } from './states';
import { AuthFlowType, Callbacks } from '@stytch/core/public';

export type StytchB2BUIProps = {
  client: StytchB2BClient;
  config: StytchRNB2BUIConfig;
  callbacks?: Callbacks;
};

const flowTypeMap: Record<string, AuthFlowType> = {
  [AuthFlowType.Discovery]: AuthFlowType.Discovery,
  [AuthFlowType.Organization]: AuthFlowType.Organization,
  [AuthFlowType.PasswordReset]: AuthFlowType.PasswordReset,
};

export const StytchB2BUI = ({ client, config, callbacks }: StytchB2BUIProps) => {
  /**
   * Read the bootstrap data out of sync storage, then read it out of async storage
   */
  const [bootstrapData, setBootstrapData] = useState(() => {
    const bootstrapData = readB2BInternals(client).bootstrap.getSync();
    return bootstrapData;
  });

  const [platform, setPlatform] = useState<Platform | undefined>(undefined);

  useEffect(() => {
    readB2BInternals(client)
      .bootstrap.getAsync()
      .then((bootstrapData) => {
        readB2BInternals(client).networkClient.logEvent({
          name: 'render_b2b_login_screen',
          details: { options: config.productConfig, bootstrap: bootstrapData },
        });
        setBootstrapData(bootstrapData);
      });

    const nativeModule = new StytchReactNativeModule();
    const deviceInfo = nativeModule.DeviceInfo.get();

    setPlatform(deviceInfo.platform);
  }, [client, config.productConfig, setBootstrapData, setPlatform]);

  const productConfig = merge({}, DEFAULT_UI_CONFIG, config);
  const styles = merge({}, DEFAULT_UI_CONFIG.styles, config.styles);

  let theme: StytchTheme;
  if (useColorScheme() == 'dark') {
    theme = styles.darkTheme;
  } else {
    theme = styles.lightTheme;
  }

  const initialState: UIState = {
    ...DEFAULT_UI_STATE,
    authenticationState: {
      ...DEFAULT_UI_STATE.authenticationState,
      authFlowType: flowTypeMap[config.productConfig.authFlowType],
    },
  };

  return (
    <GlobalContextProvider
      client={client}
      config={productConfig}
      theme={theme}
      bootstrapData={bootstrapData}
      platform={platform}
      initialState={initialState}
      callbacks={callbacks}
    >
      <StytchB2BUIContainer />
    </GlobalContextProvider>
  );
};
