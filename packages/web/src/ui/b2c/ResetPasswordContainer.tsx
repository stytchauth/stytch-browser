import { logger, RUN_IN_DEV } from '@stytch/core';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useEffect, useState } from 'react';

import { messages } from '../../messages/en';
import { DeprecatedSDKConfig, ResetPasswordSDKConfig } from '../../types';
import { readB2CInternals } from '../../utils/internal';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';
import { PresentationContext, usePresentationWithDefault } from '../components/PresentationConfig';
import Container from './Container';
import { AppScreens, AppState, DEFAULT_STATE, GlobalContextProvider } from './GlobalContextProvider';
import { passwords } from './Products';
import { addProduct } from './utils';

export const ResetPasswordContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  config: rawConfig,
  presentation,
  callbacks,
  strings,
  styles,
  passwordResetToken: rawToken,
}: ResetPasswordSDKConfig<TProjectConfiguration> & DeprecatedSDKConfig) => {
  const config = addProduct(rawConfig, passwords);

  // Default to reading token from URL if not provided
  let token = rawToken;
  if (!token) {
    const result = client.parseAuthenticateUrl();
    if (result?.tokenType === 'reset_password' || result?.tokenType === 'login') {
      token = result.token;
    }
  }

  // Read the watermark out of sync storage, then read it out of async storage
  const [displayWatermark, setDisplayWatermark] = useState(() => {
    const { displayWatermark } = readB2CInternals(client).bootstrap.getSync();
    return displayWatermark;
  });
  useEffect(() => {
    readB2CInternals(client)
      .bootstrap.getAsync()
      .then(({ displayWatermark }) => {
        setDisplayWatermark(displayWatermark);
      });
  }, [client]);

  RUN_IN_DEV(() => {
    if (styles) {
      logger.error(
        'styles is deprecated and has no effect. Use the presentation prop instead.\n' +
          'See https://stytch.com/docs/api-reference/consumer/frontend-sdks/react/upgrade-guide#step-by-step-guide',
      );
    }
  });

  const initialState: AppState = {
    ...DEFAULT_STATE,
    screen: AppScreens.PasswordResetForm,
    formState: {
      ...DEFAULT_STATE.formState,
      resetPasswordState: {
        token: token!,
      },
    },
  };

  const presentationValue = usePresentationWithDefault(presentation, displayWatermark, config, 'Products');

  return (
    <GlobalContextProvider client={client} config={config} callbacks={callbacks} initialState={initialState}>
      <PresentationContext.Provider value={presentationValue}>
        <I18nProviderWrapper messages={messages} overrides={strings}>
          <Container />
        </I18nProviderWrapper>
      </PresentationContext.Provider>
    </GlobalContextProvider>
  );
};
