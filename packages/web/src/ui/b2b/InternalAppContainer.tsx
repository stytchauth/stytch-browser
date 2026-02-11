import { AuthFlowType, RedirectURLType, StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useEffect, useMemo, useState } from 'react';
import { OverrideProperties } from 'type-fest';

import { messages } from '../../messages/b2b/en';
import { B2BSDKConfig, StytchB2BExtendedLoginConfig } from '../../types';
import { readB2BInternals } from '../../utils/internal';
import { I18nProviderWrapper } from '../components/atoms/I18nProviderWrapper';
import { PresentationContext, usePresentationWithDefault } from '../components/PresentationConfig';
import Container from './Container';
import { DEFAULT_STATE, GlobalContextProvider } from './GlobalContextProvider';
import { AppScreens } from './types/AppScreens';
import { AppState } from './types/AppState';

export type InternalSDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> = OverrideProperties<
  B2BSDKConfig<TProjectConfiguration>,
  { config: StytchB2BExtendedLoginConfig }
>;

export const InternalAppContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  presentation,
  callbacks,
  config,
  strings,
}: InternalSDKConfig<TProjectConfiguration>) => {
  /**
   * Read the watermark out of sync storage, then read it out of async storage
   */
  const [displayWatermark, setDisplayWatermark] = useState(() => {
    const { displayWatermark } = readB2BInternals(client).bootstrap.getSync();
    return displayWatermark;
  });

  useEffect(() => {
    readB2BInternals(client)
      .bootstrap.getAsync()
      .then((data) => {
        readB2BInternals(client).networkClient.logEvent({
          name: 'render_b2b_login_screen',
          details: { options: config, bootstrap: data },
        });
        setDisplayWatermark(data.displayWatermark);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- SDK-1354
  }, [client]);

  const getRedirectTypeFromUrl = () => {
    const url = new URL(window.location.href);
    const redirectType = url.searchParams.get('stytch_redirect_type');

    return redirectType;
  };

  const redirectType = getRedirectTypeFromUrl();
  const authFlowType =
    redirectType === RedirectURLType.ResetPassword ? AuthFlowType.PasswordReset : config.authFlowType;

  const initialState: AppState = {
    ...DEFAULT_STATE,
    screen: authFlowType === AuthFlowType.PasswordReset ? AppScreens.PasswordResetForm : AppScreens.Main,
    flowState: {
      ...DEFAULT_STATE.flowState,
      type: authFlowType,
    },
  };

  const configWithDefaults = useMemo(
    () => ({
      ...config,
      // While `sessionOptions` is required in the types, we still want to handle the error gracefully if it's not provided.
      // We set it to an empty object here so that future checks for `sessionOptions.sessionDurationMinutes` throw a `can't read property of undefined` error,
      // and instead throw an error regarding a missing `sessionDurationMinutes` error from the headless client.
      sessionOptions: config.sessionOptions ?? {},
    }),
    [config],
  );

  const presentationValue = usePresentationWithDefault(
    presentation,
    displayWatermark,
    configWithDefaults,
    'B2BProduct',
  );

  return (
    <GlobalContextProvider
      client={client}
      callbacks={callbacks}
      config={configWithDefaults}
      initialState={initialState}
    >
      <PresentationContext.Provider value={presentationValue}>
        <I18nProviderWrapper messages={messages} overrides={strings}>
          <Container />
        </I18nProviderWrapper>
      </PresentationContext.Provider>
    </GlobalContextProvider>
  );
};
