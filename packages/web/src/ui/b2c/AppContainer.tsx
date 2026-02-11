import { logger, RUN_IN_DEV } from '@stytch/core';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useEffect, useState } from 'react';

import { messages } from '../../messages/en';
import { DeprecatedSDKConfig, SDKConfig } from '../../types';
import { readB2CInternals } from '../../utils/internal';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';
import { PresentationContext, usePresentationWithDefault } from '../components/PresentationConfig';
import Container from './Container';
import { GlobalContextProvider } from './GlobalContextProvider';

export const AppContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  config,
  presentation,
  callbacks,
  strings,
  styles,
}: SDKConfig<TProjectConfiguration> & DeprecatedSDKConfig) => {
  // Read the watermark out of sync storage, then read it out of async storage
  const [displayWatermark, setDisplayWatermark] = useState(() => {
    const { displayWatermark } = readB2CInternals(client).bootstrap.getSync();
    return displayWatermark;
  });

  useEffect(() => {
    readB2CInternals(client)
      .bootstrap.getAsync()
      .then((data) => {
        readB2CInternals(client).networkClient.logEvent({
          name: 'render_login_screen',
          details: { options: config, bootstrap: data },
        });
        setDisplayWatermark(data.displayWatermark);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, [client]);

  RUN_IN_DEV(() => {
    if (styles) {
      logger.error(
        'styles is deprecated and has no effect. Use the presentation prop instead.\n' +
          'See https://stytch.com/docs/api-reference/consumer/frontend-sdks/react/upgrade-guide#step-by-step-guide',
      );
    }
  });

  const presentationValue = usePresentationWithDefault(presentation, displayWatermark, config, 'Products');

  return (
    <GlobalContextProvider client={client} config={config} callbacks={callbacks}>
      <PresentationContext.Provider value={presentationValue}>
        <I18nProviderWrapper messages={messages} overrides={strings}>
          <Container />
        </I18nProviderWrapper>
      </PresentationContext.Provider>
    </GlobalContextProvider>
  );
};
