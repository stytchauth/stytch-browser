import { logger, RUN_IN_DEV } from '@stytch/core';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useEffect } from 'react';

import { messages } from '../../messages/b2b/en';
import { B2BIDPSDKConfig, B2BSDKConfig, DeprecatedSDKConfig, StytchB2BExtendedLoginConfig } from '../../types';
import { readB2BInternals } from '../../utils/internal';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';
import { IDPContextProvider } from '../components/organisms/IDPContextProvider';
import { PresentationContext, usePresentationWithDefault } from '../components/PresentationConfig';
import * as B2BProducts from './B2BProducts';
import { DEFAULT_STATE, GlobalContextProvider } from './GlobalContextProvider';
import { InternalAppContainer } from './InternalAppContainer';
import { IDPConsentScreen } from './screens/IDPConsent';

/**
 * Wrapper to add default organizationProducts value. This is done to preserve the ability for a future
 * component that doesn't do this, allowing B2B products to be properly tree-shaken (which is also why this is currently
 * in a completely different file)
 */
export const AppContainer = ({
  config,
  styles,
  ...props
}: B2BSDKConfig<StytchProjectConfigurationInput> & DeprecatedSDKConfig) => {
  RUN_IN_DEV(() => {
    if (styles) {
      logger.error(
        'styles is deprecated and has no effect. Use the presentation prop instead.\n' +
          'See https://staging.stytch.com/docs/api-reference/b2b/frontend-sdks/react/upgrade-guide',
      );
    }
  });

  const internalConfig = {
    ...config,
    organizationProducts: Object.values(B2BProducts),
  };

  return <InternalAppContainer config={internalConfig} {...props}></InternalAppContainer>;
};

export const B2BIDPContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  presentation,
  callbacks,
  strings,
  getIDPConsentManifest,
  trustedAuthTokenParams,
  styles,
}: B2BIDPSDKConfig<TProjectConfiguration> & DeprecatedSDKConfig) => {
  const presentationValue = usePresentationWithDefault(presentation, false, { products: [] });

  useEffect(() => {
    readB2BInternals(client)
      .bootstrap.getAsync()
      .then((data) => {
        readB2BInternals(client).networkClient.logEvent({
          name: 'render_b2b_idp_screen',
          details: { bootstrap: data },
        });
      });
  }, [client]);

  RUN_IN_DEV(() => {
    if (styles) {
      logger.error(
        'styles is deprecated and has no effect. Use the presentation prop instead.\n' +
          'See https://staging.stytch.com/docs/api-reference/b2b/frontend-sdks/react/upgrade-guide',
      );
    }
  });

  return (
    <GlobalContextProvider
      client={client}
      config={{} as StytchB2BExtendedLoginConfig}
      callbacks={callbacks}
      initialState={DEFAULT_STATE}
    >
      <IDPContextProvider consentManifestGenerator={getIDPConsentManifest} authTokenParams={trustedAuthTokenParams}>
        <PresentationContext.Provider value={presentationValue}>
          <I18nProviderWrapper messages={messages} overrides={strings}>
            <IDPConsentScreen />
          </I18nProviderWrapper>
        </PresentationContext.Provider>
      </IDPContextProvider>
    </GlobalContextProvider>
  );
};
