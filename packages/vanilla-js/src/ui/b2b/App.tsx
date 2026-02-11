import { Messages } from '@lingui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { messages } from '../../messages/b2b/en';
import { I18nProviderWrapper } from '../components/I18nProviderWrapper';
import { CreateSSRSafeWebComponent } from '../CreateWebComponent';
import { DEFAULT_CONFIG, DEFAULT_STATE, GlobalContextProvider } from './GlobalContextProvider';
import { AppState } from './types/AppState';
import { AppScreens } from './types/AppScreens';
import { B2BIDPSDKConfig, B2BSDKConfig } from '../../types';
import { readB2BInternals } from '../../utils/internal';
import { useTheme } from '../theme';
import Container from './Container';
import { AuthFlowType, RedirectURLType, StytchProjectConfigurationInput } from '@stytch/core/public';
import { IDPContextProvider } from '../components/IDPContextProvider';

export const AppContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  styles,
  callbacks,
  config,
  strings,
}: B2BSDKConfig<TProjectConfiguration>) => {
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

  const theme = useTheme({ styles, displayWatermark });

  return (
    <GlobalContextProvider
      client={client}
      callbacks={callbacks}
      config={configWithDefaults}
      initialState={initialState}
    >
      <ThemeProvider theme={theme}>
        <I18nProviderWrapper messages={messages as unknown as Messages} overrides={strings}>
          <Container />
        </I18nProviderWrapper>
      </ThemeProvider>
    </GlobalContextProvider>
  );
};

export const B2BIDPContainer = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  client,
  styles,
  callbacks,
  strings,
  getIDPConsentManifest,
  trustedAuthTokenParams,
}: B2BIDPSDKConfig<TProjectConfiguration>) => {
  const initialState: AppState = {
    ...DEFAULT_STATE,
    screen: AppScreens.IDPConsent,
  };

  /**
   * Recreate the theme each time the styles config obj changes
   */
  const theme = useTheme({ styles, displayWatermark: false });

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

  return (
    <GlobalContextProvider client={client} config={DEFAULT_CONFIG} callbacks={callbacks} initialState={initialState}>
      <IDPContextProvider consentManifestGenerator={getIDPConsentManifest} authTokenParams={trustedAuthTokenParams}>
        <ThemeProvider theme={theme}>
          <I18nProviderWrapper messages={messages as unknown as Messages} overrides={strings}>
            <Container />
          </I18nProviderWrapper>
        </ThemeProvider>
      </IDPContextProvider>
    </GlobalContextProvider>
  );
};

export const B2B_UI_SCREEN_WEB_COMPONENT_NAME = 'stytch-b2b-ui';

export const B2BUILoginComponent = CreateSSRSafeWebComponent(AppContainer, B2B_UI_SCREEN_WEB_COMPONENT_NAME);

export const B2B_UI_IDP_WEB_COMPONENT_NAME = 'stytch-b2b-identity-provider';

export const B2BUIIdentityProviderComponent = CreateSSRSafeWebComponent(B2BIDPContainer, B2B_UI_IDP_WEB_COMPONENT_NAME);
