import { logger, RUN_IN_DEV } from '@stytch/core';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useEffect } from 'react';

import { messages } from '../../messages/en';
import { DeprecatedSDKConfig, IDPSDKConfig, StytchLoginConfig } from '../../types';
import { readB2CInternals } from '../../utils/internal';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';
import { IDPContextProvider } from '../components/organisms/IDPContextProvider';
import { PresentationContext, usePresentationWithDefault } from '../components/PresentationConfig';
import { DEFAULT_STATE, GlobalContextProvider } from './GlobalContextProvider';
import { IDPConsentScreen } from './screens/IdentityProvider/IDPConsent';

export const IDPContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  presentation,
  callbacks,
  strings,
  styles,
  getIDPConsentManifest,
  authTokenParams,
}: IDPSDKConfig<TProjectConfiguration> & DeprecatedSDKConfig) => {
  const presentationValue = usePresentationWithDefault(presentation, false, { products: [] });

  useEffect(() => {
    readB2CInternals(client)
      .bootstrap.getAsync()
      .then((data) => {
        readB2CInternals(client).networkClient.logEvent({
          name: 'render_idp_screen',
          details: { bootstrap: data },
        });
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

  return (
    <GlobalContextProvider
      client={client}
      config={{} as StytchLoginConfig}
      callbacks={callbacks}
      initialState={DEFAULT_STATE}
    >
      <IDPContextProvider consentManifestGenerator={getIDPConsentManifest} authTokenParams={authTokenParams}>
        <PresentationContext.Provider value={presentationValue}>
          <I18nProviderWrapper messages={messages} overrides={strings}>
            <IDPConsentScreen />
          </I18nProviderWrapper>
        </PresentationContext.Provider>
      </IDPContextProvider>
    </GlobalContextProvider>
  );
};
