import { OTPMethods, RNUIProductConfig, RNUIProducts, StytchProjectConfigurationInput } from '@stytch/core/public';
import merge from 'lodash.merge';
import React, { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

import { readB2CInternals } from '../../internals';
import StytchReactNativeModule from '../../native-module';
import { Platform } from '../../native-module/types';
import { StytchClient } from '../../StytchClient';
import { StytchTheme } from '../shared/config';
import { StytchUIInvalidConfiguration } from '../shared/Errors';
import { DEFAULT_UI_CONFIG, StytchUIConfig } from './config';
import { GlobalContextProvider } from './ContextProvider';
import { StytchUIContainer } from './StytchUIContainer';

export type StytchUIProps<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchClient<TProjectConfiguration>;
  config: StytchUIConfig;
};

const validateConfig = (config: RNUIProductConfig) => {
  const hasEML = config.products.includes(RNUIProducts.emailMagicLinks);
  const hasEmailOTP = config.otpOptions.methods.includes(OTPMethods.Email);
  if (hasEML && hasEmailOTP)
    throw new StytchUIInvalidConfiguration(
      'You cannot have both Email Magic Links and Email OTP configured at the same time',
    );
};

export const StytchUI = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  config,
}: StytchUIProps<TProjectConfiguration>) => {
  /**
   * Read the bootstrap data out of sync storage, then read it out of async storage
   */
  const [bootstrapData, setBootstrapData] = useState(() => {
    const bootstrapData = readB2CInternals(client).bootstrap.getSync();
    return bootstrapData;
  });
  const [platform, setPlatform] = useState<Platform | undefined>(undefined);
  useEffect(() => {
    validateConfig(config.productConfig);
    readB2CInternals(client)
      .bootstrap.getAsync()
      .then((bootstrapData) => {
        readB2CInternals(client).networkClient.logEvent({
          name: 'render_login_screen',
          details: { options: config.productConfig, bootstrap: bootstrapData },
        });
        setBootstrapData(bootstrapData);
      });
    const nativeModule = new StytchReactNativeModule();
    const deviceInfo = nativeModule.DeviceInfo.get();
    setPlatform(deviceInfo.platform);
  }, [client, config.productConfig, setBootstrapData, setPlatform]);
  const productConfig = merge({}, DEFAULT_UI_CONFIG.productConfig, config.productConfig);
  const styles = merge({}, DEFAULT_UI_CONFIG.styles, config.styles);
  let theme: StytchTheme;
  if (Appearance.getColorScheme() == 'dark') {
    theme = styles.darkTheme;
  } else {
    theme = styles.lightTheme;
  }
  return (
    <GlobalContextProvider
      client={client}
      config={productConfig}
      theme={theme}
      bootstrapData={bootstrapData}
      platform={platform}
    >
      <StytchUIContainer />
    </GlobalContextProvider>
  );
};
